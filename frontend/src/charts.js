const chart = createChart("chart", [
  {
    label: "Total distance traveled by the UBEAR vehicles",
    borderColor: "rgb(75, 192, 192)",
    tension: 0.1,
  },
  {
    label: "Total distance traveled by the UBEAR passengers",
    borderColor: "rgb(182, 101, 122)",
    tension: 0.1,
  },
]);

const taxiChart = createChart("taxiChart", [
  {
    label: "Total distance traveled by the taxi vehicles",
    borderColor: "rgb(75, 192, 192)",
    tension: 0.1,
  },
  {
    label: "Total distance traveled by the taxi passengers",
    borderColor: "rgb(182, 101, 122)",
    tension: 0.1,
  },
]);

const passengersServedChart = createChart("passengersServed", [
  {
    label: "Number of passengers served by UBEAR",
    borderColor: "rgb(75, 192, 192)",
    tension: 0.4,
  },
  {
    label: "Number of passengers served with taxis",
    borderColor: "rgb(182, 101, 122)",
    tension: 0.4,
  },
]);
