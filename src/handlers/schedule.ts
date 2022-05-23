import {CfRequest} from "../data";

class NumericSummarizer {
  _mean_sum = 0;
  _mean_count = 0;

  max = 0;
  min = 10000;

  add_value(n: number): void {
    this._mean_sum += n;
    this._mean_count += 1;

    if (n > this.max) {
      this.max = n;
    }

    if (n < this.min) {
      this.min = n;
    }
  }

  get mean() {
    return this._mean_sum / this._mean_count;
  }
}


class VersionsSummarizer {
  _dict = new Map<string, Map<string, number>>();

  add_value(data: JSON): void {
    data.forEach((e) => {

      if (this._dict.has(e.component)) {
        // the component has already been seen
        let existing_component_dict = this._dict.get(e.component);

        if (existing_component_dict.has(e.version)) {
          // the component and version have been observed, so let's increment its count
          const existing_count = existing_component_dict.get(e.version);
          existing_component_dict.set(e.version, existing_count + 1)
        } else {
          // the version has not been seen, set its count to 1
          existing_component_dict.set(e.version, 1);
        }
      } else {
        // the component has not been seen
        let new_component_dict = new Map<string, number>()  // create the new component dict
        new_component_dict.set(e.version, 1);  // mark the current version as being seen once
        this._dict.set(e.component, new_component_dict);
      }

    });
  }

  get dict() {
    return this._dict;
  }
}


async function write_data_point(key: string, data: string | number): Promise<void> {
  console.log(`writing ${key} with new value ${JSON.stringify(data)}`);
  let existing_value = await SUMMARY.get(key, "json");
  let new_data_point = [Date.now(), data];
  if (existing_value === null) {
    console.log(`creating new data entry ${JSON.stringify(new_data_point)}`);
    existing_value = [new_data_point]
  } else {
    console.log('appending to existing data entry');

    const last_item = existing_value[existing_value.length - 1];  // hack to simulate a summary per day
    new_data_point[0] = last_item[0] + 86400000;  // hack to simulate a summary per day

    existing_value.push(new_data_point);
  }

  await SUMMARY.put(key, JSON.stringify(existing_value));
  console.log(`written_value = ${existing_value}`);
}


export async function handleSchedule(): Promise<Response> {
  const list = await RAW.list();

  console.log('Keys found are: ');
  list.keys.forEach((e) => {
    console.log(e);
  });

  let content_app_processes = new NumericSummarizer;
  let content_app_hosts = new NumericSummarizer;

  let worker_processes = new NumericSummarizer;
  let worker_hosts = new NumericSummarizer;

  let versions = new VersionsSummarizer;

  for(var i = 0; i<list.keys.length; i++) {

    const value = await RAW.get(list.keys[i].name, "json");
    console.log(`\nkey = ${list.keys[i].name}, value = ${JSON.stringify(value)}\n`);

    await content_app_processes.add_value(value.online_content_apps.processes);
    await content_app_hosts.add_value(value.online_content_apps.hosts);

    await worker_processes.add_value(value.online_workers.processes);
    await worker_hosts.add_value(value.online_workers.hosts);

    await versions.add_value(value.versions);
  }

  await write_data_point('online_content_apps__processes__mean', content_app_processes.mean);
  await write_data_point('online_content_apps__processes__max', content_app_processes.max);
  await write_data_point('online_content_apps__processes__min', content_app_processes.min);

  await write_data_point('online_content_apps__hosts__mean', content_app_hosts.mean);
  await write_data_point('online_content_apps__hosts__max', content_app_hosts.max);
  await write_data_point('online_content_apps__hosts__min', content_app_hosts.min);

  await write_data_point('online_workers__processes__mean', worker_processes.mean);
  await write_data_point('online_workers__processes__max', worker_processes.max);
  await write_data_point('online_workers__processes__min', worker_processes.min);

  await write_data_point('online_workers__hosts__mean', worker_hosts.mean);
  await write_data_point('online_workers__hosts__max', worker_hosts.max);
  await write_data_point('online_workers__hosts__min', worker_hosts.min);

  for (const [component, component_version_map] of versions.dict) {
    for (const [version_str, count] of component_version_map) {
      const version_component_key = `versions__${component}__${version_str}`;
      await write_data_point(version_component_key, count);
    }
  }

  return new Response();
}
