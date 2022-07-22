import DailyIframe, { DailyCallOptions } from '@daily-co/daily-js';

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

// parseCallConfig parses the given JSON-format call object config,
// validates that it consists of valid DailyCallOptions fields,
// and returns a DailyCallOptions object.
function parseCallConfig(callConfig: string): DailyCallOptions {
  try {
    const parsedConfig = JSON.parse(callConfig);
    const callOptions = <DailyCallOptions>parsedConfig;

    // Verify that every given key is a valid Daily call option
    const parsedConfigKeys = Object.keys(parsedConfig);
    
    for (let i = 0; i < parsedConfigKeys.length; i += 1) {
      const k = parsedConfigKeys[i];
      // If the given key is not in our call options instance,
      // throw an error. The caller misconfigured their request.
      if (!(k in callOptions)) {
        throw new Error(`invalid call option key provided: ${k}`);
      }
    }
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

// joinCall joins the given video call with the provided call configuration
export function joinCall(roomURL: string, callConfig: string = '{}') {
  console.log('callConfig:', callConfig);
  const container = getContainer();

  const callOptions = buildCallOptions(callConfig);
  console.log('final call options:', callOptions);

  const callFrame = DailyIframe.createFrame(container, callOptions);

  // Set up a couple of handlers to make it simpler to detect
  // when we're in from TestRTC
  callFrame
    .on('joined-meeting', () => {
      updateJoinedElement(roomURL);
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
