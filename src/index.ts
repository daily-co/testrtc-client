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

// setTileSize will dictate dimensions of
// the participants' video tiles.
function setTileSize(sizeData: string) {
  const root = document.documentElement;
  type Size = {
    width: string;
    height: string;
  };

  const tileSize = <Size>JSON.parse(sizeData);
  if (!tileSize.width || !tileSize.height) {
    throw new Error('given tile size must contain width and height');
  }

  root.style.setProperty('--video-width', tileSize.width);
  root.style.setProperty('--video-height', tileSize.height);
}

// When the DOM is loaded, init room join
window.addEventListener('DOMContentLoaded', () => {
  const usp = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(usp.entries());

  if (params.tileSize) {
    try {
      setTileSize(params.tileSize);
    } catch (e) {
      console.error('failed to set tile size:', e);
    }
  }

  // If room URL is provided, just join the call
  if (params.roomURL) {
    joinCall(
      params.roomURL,
      params.callConfig,
      params.setBandwidth,
      params.codec
    );
    return;
  }

  // If room URL is not provided, create a room
  createRoom(params.roomParams)
    .then((url) => {
      joinCall(url, params.callConfig, params.setBandwidth, params.codec);
    })
    .catch((e) => {
      throw new Error(`failed to create a Daily room for the test: ${e}`);
    });
});
