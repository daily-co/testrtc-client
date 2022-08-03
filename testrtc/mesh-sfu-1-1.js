const agentName = process.env.RTC_AGENT_NAME;
const agentType = Number(process.env.RTC_IN_SESSION_ID);
const agentSessionName = process.env.RTC_SESSION_NAME;
const agentNumber = process.env.RTC_AGENT_NUM;
const sec = 1000;
const baseURL = "[YOUR-DEPLOYMENT-URL]";

if (agentType === 1) {
    console.log("creating room", agentName)
    createAndJoinRoom();
    return;
}
console.log("waiting for room URL", agentName)
client
    .rtcWaitForSessionValue('roomURL', function(url) {
        console.log("joining room", agentType, agentName, url)
        joinRoom(agentName, url);
    }, 30 * sec);


function createAndJoinRoom(agentName) {
    setExpectations();
    const url = `${baseURL}?roomParams={"enable_mesh_sfu":true}`
    client
        .rtcInfo("testRTC agent start - agent: %s", agentName)
        .pause((500 * agentType) + 10)
        .rtcProgress("Creating call " + url)
        .url(url)
        .waitForElementVisible('#inCall', 120 * sec)
        .rtcProgress("Broadcasting room URL to other agents")
        .getText('#inCall', function(result) {
            // Remove whitespace
            const roomURL = result.value.replace(/\s+/g, '');
            client.rtcInfo('Sending Room url %s', roomURL)
                .rtcProgress("Waiting @ " + roomURL)
                .rtcSetSessionValue("roomURL", roomURL);
        })
        .pause(5000)
        .rtcProgress("Starting to test " + url)
        // Give some time to collect media stats
        .pause(60 * sec)
        .rtcScreenshot('mid-call')
        .pause(60 * sec)
        .rtcProgress("done!");
}

function joinRoom(agentName, roomURL) {
    setExpectations();
    const url = `${baseURL}?roomURL=${roomURL}`
    client
        .rtcInfo("testRTC agent start - agent: %s room: %s", agentName, roomURL)
        .pause((500 * agentType) + 10)
        .rtcProgress("Joining " + url)
        .url(url)
        .waitForElementVisible('#inCall', 120 * sec)
        .pause(5000)
        .rtcProgress("In " + url)

        // Give some time to collect media stats
        .pause(60 * sec)
        .rtcScreenshot('mid-call')
        .pause(60 * sec)
        .rtcProgress("done!");
}

function setExpectations() {
    client
        .rtcSetTestExpectation("audio.in >= 1")
        .rtcSetTestExpectation("audio.out >= 1")
        .rtcSetTestExpectation("video.in >= 1")
        .rtcSetTestExpectation("video.out >= 1")
        .rtcSetTestExpectation("audio.in.bitrate > 0")
        .rtcSetTestExpectation("audio.out.bitrate > 0")
        .rtcSetTestExpectation("video.in.bitrate > 0")
        .rtcSetTestExpectation("video.out.bitrate > 0")
        .rtcIgnoreErrorContains("AudioContext was not allowed to start");
}