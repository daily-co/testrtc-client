// buildRequest takes default properties supplied by user and returns
// a new room creation request.
function buildRequest(roomParams: string = '{}'): RequestInit {
  const defaultExp = Math.floor(Date.now() / 1000) + 60 * 60; // default to 1 hour

  let properties;
  try {
    properties = JSON.parse(roomParams ?? '{}');
  } catch (e) {
    if (roomParams) {
      throw new Error(
        `failed to parse supplied room creation properties. Did you supply valid JSON?: ${e}`
      );
    }
    throw e;
  }

  const reqBody = {
    properties,
  };

  // If no properties are included by original caller,
  // make a new properties object
  const props = reqBody.properties;
  if (!props) {
    reqBody.properties = {
      exp: defaultExp,
      enable_prejoin_ui: false,
    };
  } else {
    // Validate expiry and override if needed
    if (!props.exp) {
      reqBody.properties.exp = defaultExp;
    }
    // Validate enable_prejoin_ui and override if needed
    if (props.enable_prejoin_ui === undefined) {
      props.enable_prejoin_ui = false;
    }
  }

  const data = JSON.stringify(reqBody);
  const req = <RequestInit>{
    method: 'POST',
    body: data,
  };
  return req;
}

// createRoom creates a new Daily room with the given (or default)
// parameters
export async function createRoom(roomParams: string): Promise<string> {
  const url = `/api/rooms/`;

  const req = buildRequest(roomParams);
  const errMsg = 'failed to create room';
  try {
    const res = await fetch(url, req);
    const resBody = await res.json();
    if (res.status !== 200) {
      throw new Error(
        `${errMsg}; unexpected status: ${res.status}; ${JSON.stringify(
          resBody
        )}`
      );
    }
    const roomURL = resBody.url;
    return roomURL;
  } catch (error) {
    throw new Error(`${errMsg}: ${error}`);
  }
}

// testExports are only to be used for unit tests.
// They will throw an exception if used in production.
export const testExports = {
  buildRequest: (roomProps: string = '{}'): RequestInit => {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('not permitted outside of test environment');
    }
    return buildRequest(roomProps);
  },
};
