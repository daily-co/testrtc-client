import * as join from '../join';

const mockGetUserMedia = jest.fn(
  () =>
    new Promise<void>((resolve) => {
      resolve();
    })
);

Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia,
  },
});

beforeEach(() => {
  document.body.innerHTML = '<div id="container"></div>';
});

describe('Valid config call option building tests', () => {
  test('No extra call config provided', () => {
    const gotCallObject = join.testExports.createCallObject('{}');
    expect(gotCallObject).toBeTruthy();
  });

  test('Basic valid call config provided', () => {
    const callConfig = `{"subscribeToTracksAutomatically": true}`;
    const callOptions = join.testExports.buildCallOptions(callConfig);
    expect(callOptions.subscribeToTracksAutomatically).toBe(true);
    const gotCallObject = join.testExports.createCallObject(callConfig);
    expect(gotCallObject).toBeTruthy();
  });

  test('Nested valid call config provided', () => {
    const callConfig = `{"dailyConfig": {"experimentalChromeVideoMuteLightOff": true}}`;
    const callOptions = join.testExports.buildCallOptions(callConfig);

    expect(callOptions.dailyConfig?.avoidEval).toBe(true);
    expect(callOptions.dailyConfig?.experimentalChromeVideoMuteLightOff).toBe(
      true
    );
    const gotCallObject = join.testExports.createCallObject(callConfig);
    expect(gotCallObject).toBeTruthy();
  });
});

describe('Invalid config call option building tests', () => {
  test('Invalid JSON call config provided', () => {
    const callConfig = `{"hi:34}`;
    expect(() => {
      join.testExports.createCallObject(callConfig);
    }).toThrowError();
  });

  test('Nested invalid call config provided', () => {
    const callConfig = `{"dailyConfigs": {"avoidEval": true}}`;
    expect(() => {
      join.testExports.createCallObject(callConfig);
    }).toThrowError();
  });
});

describe('setBandwidth tests', () => {
  test('basic valid setBandwidth config', () => {
    const wantBandwidth = {
      kbs: 20,
      trackConstraints: { width: 64, height: 64, frameRate: 3 },
    };
    const bandwidthConfig = JSON.stringify(wantBandwidth);
    const gotBandwidth = join.testExports.getBandwidth(bandwidthConfig);
    expect(gotBandwidth).toStrictEqual(wantBandwidth);
  });

  test('valid setBandwidth config with NO_CAP', () => {
    const wantBandwidth = {
      kbs: 'NO_CAP',
    };
    const bandwidthConfig = JSON.stringify(wantBandwidth);
    const gotBandwidth = join.testExports.getBandwidth(bandwidthConfig);
    expect(gotBandwidth).toStrictEqual(wantBandwidth);
  });

  test('invalid setBandwidth config', () => {
    const wantBandwidth = {
      kbs: 'NO-CAP',
    };
    const bandwidthConfig = JSON.stringify(wantBandwidth);
    expect(() => {
      join.testExports.getBandwidth(bandwidthConfig);
    }).toThrowError();
  });
});

describe('getModifySdpHook tests', () => {
  test('valid codecs', () => {
    const codecs = ['vp9', 'VP9', 'vp8', 'VP8', 'H264', 'h264'];
    for (let i = 0; i < codecs.length; i += 1) {
      const c = codecs[i];
      const gotHook = join.testExports.getModifySdpHook(c);
      expect(gotHook).toBeTruthy();
    }
  });

  test('invalid codecs', () => {
    const codecs = ['someCodec'];
    for (let i = 0; i < codecs.length; i += 1) {
      const c = codecs[i];
      expect(() => {
        join.testExports.getModifySdpHook(c);
      }).toThrow();
    }
  });
});
