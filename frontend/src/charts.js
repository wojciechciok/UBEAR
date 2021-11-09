function addData(chart, label, data) {
  chart.data.labels.push(label);
  for (let i = 0; i < data.length; i++) {
    chart.data.datasets[i].data.push(data[i]);
  }
  chart.update();
}

function resetChart(chart) {
  chart.data.datasets.forEach((dataset) => {
    dataset.data = [];
  });
  chart.data.labels = [];
}
Chart.defaults.color = "#fff";
const ctx = document.getElementById("taxiChart").getContext("2d");
const taxiChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Total distance traveled by the vehicles",
        data: [],
        fill: true,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
      {
        label: "Total distance traveled by the passengers",
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
