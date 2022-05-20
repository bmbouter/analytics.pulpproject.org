// Receive data from Pulp installation

import { CfRequest } from "../data";

const expirationTtl = 5184000;


export async function handlePost(
  request: CfRequest,
): Promise<Response> {

  const request_json = await request.json<Record<string, any>>();

  console.log(`request_json = ${request_json}`);

  const stringifiedPayload = JSON.stringify(request_json);
  const storageKey = `${request_json.system_id}`;
  const currentTimestamp = new Date().getTime();

  console.log(`stringifiedPayload = ${stringifiedPayload}`);
  console.log(`storageKey = ${storageKey}`);
  console.log(`currentTimestamp = ${currentTimestamp}`);

  const existing_data = await RAW.get(storageKey)
  console.log(`existing_data = ${existing_data}`);

  await RAW.put(storageKey, stringifiedPayload, {
    expirationTtl,
  });
  console.log(`wrote key=${storageKey} with value=${stringifiedPayload}`)

  return new Response();
}
