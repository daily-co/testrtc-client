import DailyIframe, { DailyCall, DailyCallOptions } from '@daily-co/daily-js';

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

  const defaultCallOptions = {
    showLeaveButton: true,
    activeSpeakerMode: false,
    layoutConfig: {
      grid: {
        maxTilesPerPage: 2,
      },
    },
    iframeStyle: {
      position: 'fixed',
      width: 'calc(100% - 1rem)',
      height: 'calc(100% - 5rem)',
    },
  };

  return { ...defaultCallOptions, ...callOptions };
}

function createCallFrame(callConfig: string): DailyCall {
  const container = getContainer();
  const callOptions = buildCallOptions(callConfig);
  const callFrame = DailyIframe.createFrame(container, callOptions);
  return callFrame;
}

// joinCall joins the given video call with the provided call configuration
export function joinCall(roomURL: string, callConfig: string = '{}') {
  const callFrame = createCallFrame(callConfig);
  // Set up a couple of handlers to make it simpler to detect
  // when we're in from TestRTC
  callFrame
    .on('joined-meeting', () => {
      updateJoinedElement(roomURL);
      callFrame.setBandwidth({kbs: 2000});
    })
    .on('left-meeting', () => {
      updateJoinedElement();
    });

  // Join!
  callFrame.join({
    url: roomURL,
    userName: 'Robot',
  });
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
  createCallFrame: (callOptions: string): DailyCall => {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error(errMsgNotPermitted);
    }
    return createCallFrame(callOptions);
  },
};
