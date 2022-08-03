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
