import './env';

// These imports ensure relevant assets are bundled
// with the rest of the build
import './html/index.html';
import './css/style.css';
import './assets/daily.svg';
import './assets/favicon.ico';
import './assets/github.png';
import './assets/new-tab-icon.png';
import { createRoom } from './create';
import { joinCall } from './join';

// When the DOM is loaded, init room join
window.addEventListener('DOMContentLoaded', () => {
  const usp = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(usp.entries());

  // If room URL is provided, just join the call
  if (params.roomURL) {
    joinCall(params.roomURL, params.callConfig);
    return;
  }

  // If room URL is not provided, create a room
  createRoom(params.roomParams)
    .then((url) => {
      joinCall(url, params.callConfig);
    })
    .catch((e) => {
      throw new Error(`failed to create a Daily room for the test: ${e}`);
    });
});
