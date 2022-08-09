import * as join from '../join';

beforeEach(() => {
  document.body.innerHTML = '<div id="container"></div>';
});

describe('Valid config call option building tests', () => {
  test('No extra call config provided', () => {
    const gotFrame = join.testExports.createCallFrame('{}');
    expect(gotFrame).toBeTruthy();
  });

  test('Basic valid call config provided', () => {
    const callConfig = `{"showLeaveButton": false}`;
    const callOptions = join.testExports.buildCallOptions(callConfig);
    expect(callOptions.showLeaveButton).toBe(false);
    const gotFrame = join.testExports.createCallFrame(callConfig);
    expect(gotFrame).toBeTruthy();
  });

  test('Nested valid call config provided', () => {
    const callConfig = `{"layoutConfig": {
            	    "grid": {
            	      "minTilesPerPage": 3,
            	      "maxTilesPerPage": 36
            	    }
            	  }}`;
    const callOptions = join.testExports.buildCallOptions(callConfig);

    const gotGrid = callOptions.layoutConfig?.grid;
    expect(gotGrid?.minTilesPerPage).toBe(3);
    expect(gotGrid?.maxTilesPerPage).toBe(36);

    const gotFrame = join.testExports.createCallFrame(callConfig);
    expect(gotFrame).toBeTruthy();
  });
});

describe('Invalid config call option building tests', () => {
  test('Invalid JSON call config provided', () => {
    const callConfig = `{"hi:34}`;
    expect(() => {
      join.testExports.createCallFrame(callConfig);
    }).toThrowError();
  });

  test('Nested invalid call config provided', () => {
    const callConfig = `{"layoutConfigs": {"grid": {"minTilesPerPage": 3,"maxTilesPerPage": 36}}}`;
    expect(() => {
      join.testExports.createCallFrame(callConfig);
    }).toThrowError();
  });
});
