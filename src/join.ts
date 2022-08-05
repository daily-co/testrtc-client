import DailyIframe, {
  DailyCall,
  DailyCallOptions,
  DailyEventObjectFatalError,
  DailyEventObjectNonFatalError,
  DailyEventObjectParticipant,
  DailyEventObjectParticipants,
  DailyParticipant,
} from '@daily-co/daily-js';
import merge from 'lodash.merge';

// No chance of idx out of range exception here, as it
// will not transpile if we index into a nonexistent pos
type Bandwidth = Parameters<DailyCall['setBandwidth']>[0];

function getContainer(): HTMLDivElement {
  return <HTMLDivElement>document.getElementById('container');
}

function getVideoID(sessionID: string): string {
  return `video-${sessionID}`;
}

// updateJoinedElement updates the relevant DOM element
// with the joined room URL. This can then be used to
// broadcast the room URL to other TestRTC agents.
function updateJoinedElement(roomURL: string = '') {
  const inCall = document.getElementById('inCall');
  if (!inCall) {
    throw new Error('failed to find inCall element in DOM');
  }
  const c = 'hidden';
  if (roomURL) {
    inCall.innerText = roomURL;
    inCall.classList.remove(c);
    return;
  }
  inCall.innerText = '';
  inCall.classList.add(c);
}

function updateVideoDOM(p: DailyParticipant): MediaStream {
  const tracks: Array<MediaStreamTrack> = [];
  if (!p.local && p.audioTrack) {
    tracks.push(p.audioTrack);
  }
  if (p.videoTrack) {
    tracks.push(p.videoTrack);
  }
  return new MediaStream(tracks);
}

// addParticipant adds a video element for the given participant
function addParticipant(p: DailyParticipant) {
  let v = <HTMLVideoElement>document.getElementById(getVideoID(p.session_id));
  if (!v) {
    v = document.createElement('video');
  }
  v.id = getVideoID(p.session_id);
  v.autoplay = true;
  const stream = updateVideoDOM(p);
  v.srcObject = stream;
  const c = getContainer();
  c.appendChild(v);
}

// removeParticipant removes a video element for the given participant
function removeParticipant(p: DailyParticipant) {
  const v = document.getElementById(getVideoID(p.session_id));
  if (v) {
    v.remove();
  }
}

// updateParticipant updates a given participant's video tracks.
// Currently, it updates them unconditionally on any update,
// regardless of whether it is the tracks that triggered the event.
function updateParticipant(p: DailyParticipant) {
  const v = <HTMLVideoElement>document.getElementById(getVideoID(p.session_id));
  if (!v) {
    addParticipant(p);
    return;
  }
  const stream = updateVideoDOM(p);
  v.srcObject = stream;
}

// parseCallConfig parses the given JSON-format call object config
// and returns a DailyCallOptions object.
function parseCallConfig(callConfig: string): DailyCallOptions {
  try {
    const parsedConfig = JSON.parse(callConfig);
    const callOptions = <DailyCallOptions>parsedConfig;
    return callOptions;
  } catch (e) {
    throw new Error(
      `failed to parse supplied call config. Did you supply valid JSON?: ${e}`
    );
  }
}

// buildCallOptions takes a call config JSON string
// and returns an associated instance of DailyCallOptions
function buildCallOptions(callConfig: string): DailyCallOptions {
  const callOptions = parseCallConfig(callConfig);

  const defaultCallOptions = <DailyCallOptions>{
    dailyConfig: {
      avoidEval: true,
      modifyRemoteSdpHook: (rtcSDP: any) => {
        let newSdp = rtcSDP.sdp.replace(
          /a=rtcp-rsize/g,
          'a=rtcp-rsize\n
          a=rtpmap:98 VP9/90000\n
          a=rtcp-fb:98 goog-remb\n
          a=rtcp-fb:98 transport-cc\n
          a=rtcp-fb:98 ccm fir\n
          a=rtcp-fb:98 nack\n
          a=rtcp-fb:98 nack pli\n
          a=fmtp:98 profile-id=0\n'
        );
        console.log("new SDP:", newSdp);
        return newSdp;
      },
    },
  };
  const merged = merge(defaultCallOptions, callOptions);
  return merged;
}

// createCallObject creates a Daily call object with the given
// configuration and returns it in the form of a DailyCall
function createCallObject(callConfig: string): DailyCall {
  const callOptions = buildCallOptions(callConfig);
  const co = DailyIframe.createCallObject(callOptions);
  return co;
}

function getBandwidth(bandwidthConfig: string): Bandwidth {
  try {
    const parsedConfig = JSON.parse(bandwidthConfig);
    const bandwidth = <Bandwidth>parsedConfig;

    // Some very rudimentary validation, since
    // Daily doesn't seem to throw an error if this
    // is bad like it does with call object creation
    const { kbs } = bandwidth;
    if (kbs && typeof kbs !== 'number' && kbs !== 'NO_CAP') {
      throw new Error(`invalid kbs value: ${kbs}`);
    }
    return bandwidth;
  } catch (e) {
    throw new Error(
      `failed to parse supplied bandwidth configuration. Did you supply valid JSON?: ${e}`
    );
  }
}

// joinCall joins the given video call with the provided call configuration
export function joinCall(
  roomURL: string,
  callConfig: string = '{}',
  bandwidthConfig: string = ''
) {
  const call = createCallObject(callConfig);
  // Set up a couple of handlers to make it simpler to detect
  // when we're in from TestRTC
  call
    .on('joined-meeting', (e: DailyEventObjectParticipants) => {
      if (bandwidthConfig) {
        const bandwidth = getBandwidth(bandwidthConfig);
        try {
          call.setBandwidth(bandwidth);
        } catch (err) {
          console.error('failed to set bandwidth:', err);
        }
      }
      updateJoinedElement(roomURL);
      addParticipant(e.participants.local);
    })
    .on('left-meeting', () => {
      updateJoinedElement();
    })
    .on('participant-updated', (e: DailyEventObjectParticipant) => {
      updateParticipant(e.participant);
    })
    .on('participant-joined', (e: DailyEventObjectParticipant) => {
      addParticipant(e.participant);
    })
    .on('participant-left', (e: DailyEventObjectParticipant) => {
      removeParticipant(e.participant);
    })
    .on('error', (e: DailyEventObjectFatalError) => {
      console.error('fatal error:', e);
    })
    .on('nonfatal-error', (e: DailyEventObjectNonFatalError) => {
      console.error('nonfatal error:', e);
    });

  // Join!
  try {
    call.join({
      url: roomURL,
      userName: 'Robot',
    });
  } catch (e) {
    console.error('failed to join meeting', e);
  }
}

// testExports are only to be used for unit tests.
// They will throw an exception if used in production.
const errMsgNotPermitted = 'not permitted outside of test environment';

export const testExports = {
  buildCallOptions: (callConfig: string): DailyCallOptions => {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error(errMsgNotPermitted);
    }
    return buildCallOptions(callConfig);
  },
  getBandwidth: (bandwidthConfig: string): Bandwidth => {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error(errMsgNotPermitted);
    }
    return getBandwidth(bandwidthConfig);
  },
  createCallObject: (callOptions: string): DailyCall => {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error(errMsgNotPermitted);
    }
    return createCallObject(callOptions);
  },
};
