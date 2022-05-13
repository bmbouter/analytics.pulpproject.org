export interface IncomingPayload {
  system_id: string;
  online_content_apps?: {processes: number, hosts: number};
  online_workers?: {processes: number, hosts: number};
}

export interface CfRequest extends Request {
  cf?: IncomingRequestCfProperties;
}
