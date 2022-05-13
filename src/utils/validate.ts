import {
  array,
  boolean,
  coerce,
  create,
  define,
  is,
  nullable,
  number,
  object,
  optional,
  size,
  string,
  StructError,
} from "superstruct";

import { IncomingPayload } from "../data";


class ValidationError extends Error {
  constructor(error: StructError) {
    super(error.message);
    this.name = `ValidationError - ${error.message}`;
    console.log(this.name);
  }
}


export const IncomingPayloadStruct = object({
  system_id: size(string(), 36, 36),
  online_content_apps: optional(object({"processes": number(), "hosts": number()})),
  online_workers: optional(object({"processes": number(), "hosts": number()})),
  versions: optional(
      array(
          object({
            "component": string(),
            "version": string()
        })
      )
  )}
);


export const createIncomingPayload = (data: unknown): IncomingPayload => {
  try {
    return create(data, IncomingPayloadStruct);
  } catch (e) {
    throw new ValidationError(e);
  }
};
