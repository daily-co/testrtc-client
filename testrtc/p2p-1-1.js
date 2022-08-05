const agentName = process.env.RTC_AGENT_NAME;
const agentType = Number(process.env.RTC_IN_SESSION_ID);
const agentSessionName = process.env.RTC_SESSION_NAME;
const agentNumber = process.env.RTC_AGENT_NUM;
const sec = 1000;
const baseURL = process.env.RTC_SERVICE_URL;

const setBandwidthProps = {
    kbs: "NO_CAP",
};

const setBandwidthData = JSON.stringify(setBandwidthProps);

// Resolution to get from the camera. 
const videoWidthMin =　320;
const videoHeightMin = 180;
const videoWidthIdeal =　1280;
const videoHeightIdeal = 720;
const videoWidthMax =　3840;
const videoHeightMax = 2160;

const callConfigProps = {
    dailyConfig: {
        userMediaVideoConstraints: {
            width: {"min":videoWidthMin,"ideal":videoWidthIdeal,"max":videoWidthMax},
            height: {"min":videoHeightMin,"ideal":videoHeightIdeal,"max":videoHeightMax}
        },
    }
}
const callConfigData = JSON.stringify(callConfigProps);

if (agentType === 1) {
    createAndJoinRoom();
    return;
}

client
    .rtcWaitForSessionValue('roomURL', function(url) {
        joinRoom(agentName, url);
    }, 30 * sec);


function createAndJoinRoom(agentName) {
    setExpectations();
    const url = `${baseURL}?setBandwidth=${setBandwidthData}&callConfig=${callConfigData}`
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
    const url = `${baseURL}?roomURL=${roomURL}&setBandwidth=${setBandwidthData}&callConfig=${callConfigData}`
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
        .resizeWindow(1280, 720)
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