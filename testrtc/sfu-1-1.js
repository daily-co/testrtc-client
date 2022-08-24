const agentName = process.env.RTC_AGENT_NAME;
const agentType = Number(process.env.RTC_IN_SESSION_ID);
const sec = 1000;
const baseURL = process.env.RTC_SERVICE_URL;

// Resolution to get from the camera. 
const videoWidthMin = 320;
const videoHeightMin = 180;
const videoWidthIdeal = 1280;
const videoHeightIdeal = 720;
const videoWidthMax = 3840;
const videoHeightMax = 2160;

// SFU mode only
const maxScale = 1;
const maxFramerate = 30;
const maxBitrate = 1700 * 1000;
const midScale = 2;
const midFramerate = 15;
const midBitrate = 200 * 1000;
const minScale = 4;
const minFramerate = 10;
const minBitrate = 80 * 1000;
// In SFU mode, this limits above layers. In P2P mode, this is the bandwidth cap
const setBandwidth = "NO_CAP";
// When to switch to SFU mode
const sfuSwitchover = 0.5;

const roomProps = {
    sfu_switchover: sfuSwitchover,
};

const setBandwidthProps = {
    kbs: setBandwidth,
};

const callConfigProps = {
    dailyConfig: {
        camSimulcastEncodings: [{
                maxBitrate: minBitrate,
                scaleResolutionDownBy: minScale,
                maxFramerate: minFramerate
            },
            {
                maxBitrate: midBitrate,
                scaleResolutionDownBy: midScale,
                maxFramerate: midFramerate
            },

            {
                maxBitrate: maxBitrate,
                scaleResolutionDownBy: maxScale,
                maxFramerate: maxFramerate
            }
        ],
        userMediaVideoConstraints: {
            width: {
                "min": videoWidthMin,
                "ideal": videoWidthIdeal,
                "max": videoWidthMax
            },
            height: {
                "min": videoHeightMin,
                "ideal": videoHeightIdeal,
                "max": videoHeightMax
            }
        },
        userMediaAudioConstraints: {
            autoGainControl: true,
            echoCancellation: true,
            noiseSuppression: true
        }
    }
}

const roomPropsData = JSON.stringify(roomProps);
const callConfigData = JSON.stringify(callConfigProps);
const setBandwidthData = JSON.stringify(setBandwidthProps);

// Creates a room and joins it
if (agentType === 1) {
    createAndJoinRoom();
    return;
}

// Waits for agent 1 to provide a room URL
client
    .rtcWaitForSessionValue('roomURL', function(url) {
        joinRoom(agentName, url);
    }, 30 * sec);


function createAndJoinRoom(agentName) {
    setExpectations();
    const clientURL = new URL(baseURL);
    const params = clientURL.searchParams;
    params.append("roomParams", roomPropsData);
    params.append("callConfig", callConfigData);
    params.append("setBandwidth", setBandwidthData);
    const url = clientURL.toString();

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
            client.rtcInfo('Sending Room URL %s', roomURL)
                .rtcProgress("Waiting @ " + roomURL)
                .rtcSetSessionValue("roomURL", roomURL);
        })
        .pause(5000)
        .rtcProgress("Starting to test " + url)
        // Give some time to collect media stats
        .pause(60 * sec)
        .rtcScreenshot('Mid-call')
        .pause(60 * sec)
        .rtcProgress("Done!");
}

function joinRoom(agentName, roomURL) {
    setExpectations();

    const clientURL = new URL(baseURL);
    const params = clientURL.searchParams;
    params.append("roomURL", roomURL);
    params.append("callConfig", callConfigData);
    params.append("setBandwidth", setBandwidthData);
    const url = clientURL.toString();

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
        .rtcScreenshot('Mid-call')
        .pause(60 * sec)
        .rtcProgress("Done!");
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