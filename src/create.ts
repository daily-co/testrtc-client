export default async function createRoom(roomProps: string): Promise<string> {
  const url = `/api/rooms/`;

  const defaultExp = Math.floor(Date.now() / 1000) + 60 * 60; // default to 1 hour
  const reqBody = JSON.parse(roomProps ?? '{}');

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

  try {
    const res = await fetch(url, req);
    const resBody = await res.json();
    const roomURL = resBody.url;
    return roomURL;
  } catch (error) {
    throw new Error(`failed to create room: ${error}`);
  }
}
