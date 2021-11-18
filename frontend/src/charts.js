const chart = createChart("chart", [
  {
    label: "Total distance travelled by the UBEAR vehicles",
    borderColor: "rgb(75, 192, 192)",
    tension: 0.1,
  },
  {
    label: "Total distance travelled by the UBEAR passengers",
    borderColor: "rgb(182, 101, 122)",
    tension: 0.1,
  },
]);

const taxiChart = createChart("taxiChart", [
  {
    label: "Total distance travelled by the taxi vehicles",
    borderColor: "rgb(75, 192, 192)",
    tension: 0.1,
  },
  {
    label: "Total distance travelled by the taxi passengers",
    borderColor: "rgb(182, 101, 122)",
    tension: 0.1,
  },
]);

const passengersServedChart = createChart("passengersServedChart", [
  {
    label: "Number of passengers served by UBEAR",
    borderColor: "rgb(75, 192, 192)",
    tension: 0.3,
  },
  {
    label: "Number of passengers served with taxis",
    borderColor: "rgb(182, 101, 122)",
    tension: 0.3,
  },
]);

const passengersWaitingStatsChart = createChart("passengersWaitingStatsChart", [
  {
    label: "Total waiting time for served UBEAR passengers",
    borderColor: "rgb(75, 192, 192)",
    tension: 0.1,
  },
  {
    label: "Total waiting time for served taxi passengers",
    borderColor: "rgb(182, 101, 122)",
    tension: 0.1,
  },
]);

const passengersTravelTimeChart = createChart("passengersTravelTimeChart", [
  {
    label: "Total travel time for served UBEAR passengers",
    borderColor: "rgb(75, 192, 192)",
    tension: 0.1,
  },
  {
    label: "Total travel time for served taxi passengers",
    borderColor: "rgb(182, 101, 122)",
    tension: 0.1,
  },
]);

const passengersTimeSavedChart = createChart("passengersTimeSavedChart", [
  {
    label: "Total difference in trip time between models",
    borderColor: "rgb(75, 192, 192)",
    tension: 0.1,
  },
]);
