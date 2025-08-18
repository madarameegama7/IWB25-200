const BASE_URL = "http://localhost:8083"; // Ballerina backend

export const fetchSchedules = async () => {
  const res = await fetch(`${BASE_URL}/schedules`);
  if (!res.ok) throw new Error("Failed to fetch schedules");
  return res.json();
};

export const fetchPredictions = async () => {
  const res = await fetch(`${BASE_URL}/predictions`);
  if (!res.ok) throw new Error("Failed to fetch predictions");
  return res.json();
};

export const fetchAlerts = async () => {
  const res = await fetch(`${BASE_URL}/alerts`);
  if (!res.ok) throw new Error("Failed to fetch alerts");
  return res.json();
};
