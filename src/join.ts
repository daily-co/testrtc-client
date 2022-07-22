import DailyIframe, {
  DailyCall,
  DailyCallOptions,
  DailyEventObjectFatalError,
  DailyEventObjectNonFatalError,
  DailyEventObjectParticipant,
  DailyEventObjectParticipants,
  DailyParticipant,
} from '@daily-co/daily-js';

function getContainer(): HTMLDivElement {
  return <HTMLDivElement>document.getElementById('container');
}

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

function getVideoID(sessionID: string): string {
  return `video-${sessionID}`;
}
function addParticipant(p: DailyParticipant) {
  let v = <HTMLVideoElement>document.getElementById(getVideoID(p.session_id));
  if (!v) {
    v = document.createElement('video');
  }
  v.id = getVideoID(p.session_id);
  v.autoplay = true;
  const tracks: Array<MediaStreamTrack> = [];
  if (p.audioTrack) {
    tracks.push(p.audioTrack);
  }
  if (p.videoTrack) {
    tracks.push(p.videoTrack);
  }
  v.srcObject = new MediaStream(tracks);
  const c = getContainer();
  c.appendChild(v);
}

function removeParticipant(p: DailyParticipant) {
  const v = document.getElementById(getVideoID(p.session_id));
  if (v) {
    v.remove();
  }
}

function updateParticipant(p: DailyParticipant) {
  const v = <HTMLVideoElement>document.getElementById(getVideoID(p.session_id));
  if (!v) {
    addParticipant(p);
    return;
  }
  const tracks: Array<MediaStreamTrack> = [];
  if (p.audioTrack) {
    tracks.push(p.audioTrack);
  }
  if (p.videoTrack) {
    tracks.push(p.videoTrack);
  }
  v.srcObject = new MediaStream(tracks);
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
    },
  };

  return { ...defaultCallOptions, ...callOptions };
}

function createCallObject(callConfig: string): DailyCall {
  const callOptions = buildCallOptions(callConfig);
  const callFrame = DailyIframe.createCallObject(callOptions);
  return callFrame;
}

// joinCall joins the given video call with the provided call configuration
export function joinCall(roomURL: string, callConfig: string = '{}') {
  const callFrame = createCallObject(callConfig);
  // Set up a couple of handlers to make it simpler to detect
  // when we're in from TestRTC
  callFrame
    .on('joined-meeting', (e: DailyEventObjectParticipants) => {
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
    callFrame.join({
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
  createCallObject: (callOptions: string): DailyCall => {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error(errMsgNotPermitted);
    }
    return createCallObject(callOptions);
  },
};
