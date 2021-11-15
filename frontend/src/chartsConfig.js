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

function createChart(id, datasets) {
  const ctx = document.getElementById(id).getContext("2d");
  return new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: datasets.map((dataset) => {
        return {
          label: dataset.label,
          data: [],
          fill: true,
          borderColor: dataset.borderColor,
          tension: dataset.tension,
        };
      }),
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
}
