export default async function createRoom(roomProps: string): Promise<string> {
  const url = `/api/rooms/`;

  const req = buildProps(roomProps);
  try {
    const res = await fetch(url, req);
    const resBody = await res.json();
    const roomURL = resBody.url;
    return roomURL;
  } catch (error) {
    throw new Error(`failed to create room: ${error}`);
  }
}

// buildProps takes default properties supplied by user
// and
function buildProps(roomProps: string) {
  const defaultExp = Math.floor(Date.now() / 1000) + 60 * 60; // default to 1 hour

  let properties;
  try {
    properties = JSON.parse(roomProps ?? null);
  } catch (e) {
    if (roomProps) {
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
