import * as create from '../create';

const fakeNow = new Date('2020-01-01');

describe('Room creation tests', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(fakeNow);
  });

  test('Create request with no params specified', () => {
    const gotReq = create.testExports.buildRequest(null);
    const wantBody = {
      properties: {
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
        enable_prejoin_ui: false,
      },
    };
    const wantReq = <RequestInit>{
      method: 'POST',
      body: JSON.stringify(wantBody),
    };
    expect(gotReq).toStrictEqual(wantReq);
  });

  test('Create request with expiry time specified', () => {
    const exp = Math.floor(Date.now() / 1000) + 60 * 10;
    const gotReq = create.testExports.buildRequest(`{"exp":${exp}}`);
    const wantBody = {
      properties: {
        exp,
        enable_prejoin_ui: false,
      },
    };
    const wantReq = <RequestInit>{
      method: 'POST',
      body: JSON.stringify(wantBody),
    };
    expect(gotReq).toStrictEqual(wantReq);
  });

  test('Create request with max participants specified', () => {
    const gotReq = create.testExports.buildRequest(`{"max_participants":2}`);
    const wantBody = {
      properties: {
        max_participants: 2,
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
        enable_prejoin_ui: false,
      },
    };
    const wantReq = <RequestInit>{
      method: 'POST',
      body: JSON.stringify(wantBody),
    };

    expect(gotReq).toStrictEqual(wantReq);
  });

  test('Fail to create request due to invalid JSON', () => {
    expect(() => {
      create.testExports.buildRequest(`"exp":32`);
    }).toThrow();
  });
});
