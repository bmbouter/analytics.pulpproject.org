# analytics.pulpproject.org

This is a PoC; it is not yet live.

This repository contains the source of the https://analytics.pulpproject.org website and the
[CloudFlare worker](https://workers.cloudflare.com/) that recieves the payload from the
[`telemetry` task](https://github.com/pulp/pulpcore/pull/2118/files#diff-31fb2172b3a11147c650144cb19c27d85455ff0792c9fed3f74c4f448dda4a65R31)

## Worker

The Cloudflare Worker code has 3 responsibilities:

1. Receive telemetry data and saves it to the KV store. This is posted as JSON by the pulpcore
   [`telemetry` task](https://github.com/pulp/pulpcore/pull/2118/files#diff-31fb2172b3a11147c650144cb19c27d85455ff0792c9fed3f74c4f448dda4a65R31).
2. Summarizes that data daily.
3. Serve static html and the summarized data in the form of charts.

Workers respond to the following requests to `/`:

| Method | Description                                                                    |
|--------|------------------------------------------------------------------------------- |
| `GET`  | Receive the HTML page displaying the charts.                                   |
| `POST` | Receive a payload from a Pulp system and write it to the KV store named `RAW`. |
| `PUT`  | Trigger a manual schedule call. This is only available in development modes.   |

### Schedule

There is one summarization task designed to run at midnight (UTC). This uses the [Cloudflare Cron
Trigger](https://developers.cloudflare.com/workers/platform/cron-triggers) which is configured in
the [`wrangler.toml`](https://github.com/bmbouter/analytics.pulpproject.org/blob/main/wrangler.toml#L5-L6)

### KV Usage

The raw data and the summarized data are kept in separate [Cloudflare KV instances](https://www.cloudflare.com/products/workers-kv/).
The raw data is kept in `RAW` and summarized data in `SUMMARY`. The raw data is keyed on system ID 
the uuid string) and is the unmodified payload. It is also saved with a 60 day TTL causing the data
to only be stored for 60 days.

The SUMMARY data is all stored as individual keys with the value typically a 2-gram Javascript Array
that has the millisecond epoch time as the first item and the value, e.g. a number for the second.

## Development

To do local development of the website first clone the repository and install and configure
`wrangler`. After logging in with `wrangler` you can:

Run the local worker code with `wrangler dev src/index.ts --port 29439 --env dev`.
Push the code to the hosted dev environment with `wrangler publish --env dev`.
Show the cloudflare logs with `wrangler tail --env dev`.

## Sites

| Environment | URL                                                            |
| ----------- |----------------------------------------------------------------|
| Production  | https://analytics-pulpproject-org.pulpproject.workers.dev/     |
| Dev         | https://dev-analytics-pulpproject-org.pulpproject.workers.dev/ |
