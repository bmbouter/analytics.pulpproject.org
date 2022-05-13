// Receive data from Pulp installation

import { createIncomingPayload } from "../utils/validate";
import { CfRequest } from "../data";

const expirationTtl = 5184000;


export async function handlePost(
  request: CfRequest,
): Promise<Response> {
  let incomingPayload;

  const request_json = await request.json<Record<string, any>>();

  console.log(`request_json = ${request_json}`);

  try {
    incomingPayload = createIncomingPayload(request_json);
  } catch (e) {
    return new Response(null, {status: 400});
  }

  const stringifiedPayload = JSON.stringify(incomingPayload);
  const storageKey = `${incomingPayload.system_id}`;
  const currentTimestamp = new Date().getTime();

  console.log(`stringifiedPayload = ${stringifiedPayload}`);
  console.log(`storageKey = ${storageKey}`);
  console.log(`currentTimestamp = ${currentTimestamp}`);

  // const stored: {
  //   value?: IncomingPayload | null;
  //   metadata?: UuidMetadata | null;
  // } = await KV.getWithMetadata(storageKey, "json");

  const existing_data = await KV.get(storageKey)

  console.log(`existing_data = ${existing_data}`);
  await KV.put(storageKey, stringifiedPayload, {
    expirationTtl,
  });
  console.log(`wrote key=${storageKey} with value=${stringifiedPayload}`)

  return new Response();
}
