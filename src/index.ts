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

function getContainer(): HTMLDivElement {
  return <HTMLDivElement>document.getElementById('container');
}

function updateJoinedElement(isVisible: boolean) {
  const inCall = document.getElementById('inCall');
  const c = 'hidden';
  if (isVisible) {
    inCall.classList.remove(c);
    return;
  }
  inCall.classList.add(c);
}

// Join the video call
function joinCall(roomURL: string) {
  const container = getContainer();

  // Update the following as required to optimize for perf tests
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
      updateJoinedElement(true);
    })
    .on('left-meeting', () => {
      updateJoinedElement(false);
    });

  // Join!
  callFrame.join({
    url: roomURL,
    userName: 'Robot',
  });
}

// When the DOM is loaded, init room join
window.addEventListener('DOMContentLoaded', () => {
  // Grab room URL from query string
  const usp = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(usp.entries());

  if (!params.roomURL) {
    const c = getContainer();
    c.innerText = 'room URL not provided';
    return;
  }
  joinCall(params.roomURL);
});
