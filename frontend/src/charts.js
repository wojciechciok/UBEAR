function addData(chart, label, data, maxY) {
  chart.data.labels.push(label);
  for (let i = 0; i < data.length; i++) {
    chart.data.datasets[i].data.push(data[i]);
  }
  if (maxY !== undefined) chart.options.scales.y.max = maxY;
  chart.update();
}

function resetChart(chart) {
  chart.data.datasets.forEach((dataset) => {
    dataset.data = [];
  });
  chart.data.labels = [];
}

Chart.defaults.color = "#fff";
const ctx = document.getElementById("chart").getContext("2d");
const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Total distance traveled by the UBEAR vehicles",
        data: [],
        fill: true,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
      {
        label: "Total distance traveled by the UBEAR passengers",
        data: [],
        fill: true,
        borderColor: "rgb(182, 101, 122)",
        tension: 0.1,
      },
    ],
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      tooltip: {
        enabled: false,
      },
    },
    animation: false,
    radius: 0,
  },
});

const taxiCtx = document.getElementById("taxiChart").getContext("2d");
const taxiChart = new Chart(taxiCtx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Total distance traveled by the taxi vehicles",
        data: [],
        fill: true,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
      {
        label: "Total distance traveled by the taxi passengers",
        data: [],
        fill: true,
        borderColor: "rgb(182, 101, 122)",
        tension: 0.1,
      },
    ],
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      tooltip: {
        enabled: false,
      },
    },
    animation: false,
    radius: 0,
  },
});
