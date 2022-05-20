import {CfRequest} from "../data";


async function makeXYData(summary_data): Promise<Array> {
    return summary_data.map(item => {return {x: item[0], y: item[1]}});
}


export async function handleGet(
  request: CfRequest,
): Promise<Response> {
    let online_content_apps__processes__mean = await SUMMARY.get("online_content_apps__processes__mean", "json");
    online_content_apps__processes__mean = await makeXYData(online_content_apps__processes__mean);

    let online_content_apps__hosts__mean = await SUMMARY.get("online_content_apps__hosts__mean", "json");
    online_content_apps__hosts__mean = await makeXYData(online_content_apps__hosts__mean);

    let online_workers__processes__mean = await SUMMARY.get("online_workers__processes__mean", "json");
    online_workers__processes__mean = await makeXYData(online_workers__processes__mean);

    let online_workers__hosts__mean = await SUMMARY.get("online_workers__hosts__mean", "json");
    online_workers__hosts__mean = await makeXYData(online_workers__hosts__mean);

    let core_versions = new Array;
    let core_version_keys = await SUMMARY.list({prefix: "versions__core"});

    for (var key of core_version_keys.keys) {
        let data = await SUMMARY.get(key.name, "json");
        data = await makeXYData(data)
        // console.log(`key.name = ${key.name} and value = ${value}`);

        core_versions.push({label: key.name, data: data})
    }

      let html = `
<html>
<head>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.7.1/chart.min.js" integrity="sha512-QSkVNOCYLtj73J4hbmVoOV6KVZuMluZlioC+trLpewV8qMjsWqlIQvkn1KGX2StWvPMdWGBqim1xlC8krl1EKQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns/dist/chartjs-adapter-date-fns.bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-autocolors"></script>
</head>
<style>

.wrapper{
  height: 600px;
  width: 800px;
}

</style>
<body>
<div class="wrapper">
  <canvas id="worker"></canvas>
  <canvas id="content-app"></canvas>
  <canvas id="core-versions"></canvas>
  <canvas id="file-versions"></canvas>
  <canvas id="rpm-versions"></canvas>
</div>

<script>

// Add autocolor support
const autocolors = window['chartjs-plugin-autocolors'];
Chart.register(autocolors);

// Worker Chart
const worker_element = document.getElementById("worker");
const worker_chart = new Chart(worker_element, {
    type: 'line',
    data: {
        datasets: [{
            label: "Mean Processes per Installation",
            data: ${JSON.stringify(online_content_apps__processes__mean)}
        }, {
            label: "Mean Hosts per Installation",
            data: ${JSON.stringify(online_content_apps__hosts__mean)}
        }]
    },
    options: {
        plugins: {
            title: {
                display: true,
              text: "Online Content App"
            }
        },
        scales: {
            x: { type: 'time' }
        }
    }
});

// Content App Chart
const content_app_element = document.getElementById("content-app");
const content_app_chart = new Chart(content_app_element, {
    type: 'line',
    data: {
        datasets: [{
            label: "Mean Worker Processes per Installation",
            data: ${JSON.stringify(online_workers__processes__mean)}
        }, {
            label: "Mean Worker Hosts per Installation",
            data: ${JSON.stringify(online_workers__hosts__mean)}
        }]
    },
    options: {
        plugins: {
            title: {
                display: true,
              text: "Online Workers"
            }
        },
        scales: {
            x: { type: 'time' }
        }
    }
});


// Core Versions
const core_versions_element = document.getElementById("core-versions");
const core_versions_chart = new Chart(core_versions_element, {
    type: 'line',
    data: {
        datasets: ${JSON.stringify(core_versions)}
    },
    options: {
        plugins: {
            title: {
                display: true,
              text: "Core Versions"
            }
        },
        scales: {
            x: { type: 'time' }
        }
    }
});


</script>

</body>
</html>
`;

      return new Response(html, {
          headers: {
              'content-type': 'text/html;charset=UTF-8',
          },
      });
}
