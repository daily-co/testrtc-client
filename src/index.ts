import './env';
import DailyIframe from '@daily-co/daily-js';

// These imports ensure relevant assets are bundled
// with the rest of the build
import './html/index.html';
import './css/style.css';
import './assets/daily.svg';
import './assets/favicon.ico';
import './assets/github.png';
import './assets/new-tab-icon.png';
import { createRoom } from './create';

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

// Join the video call
function joinCall(roomURL: string) {
  const container = getContainer();

  // Update the following as desired to optimize for perf tests
  const callFrame = DailyIframe.createFrame(container, {
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
  });

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

// When the DOM is loaded, init room join
window.addEventListener('DOMContentLoaded', () => {
  const usp = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(usp.entries());

  // If room URL is provided, just join the call
  if (params.roomURL) {
    joinCall(params.roomURL);
    return;
  }

  // If room URL is not provided, create a room
  createRoom(params.roomParams)
    .then((url) => {
      joinCall(url);
    })
    .catch((e) => {
      throw new Error(`failed to create a Daily room for the test: ${e}`);
    });
});
