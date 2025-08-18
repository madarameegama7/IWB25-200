import { useEffect, useState } from "react";
import { fetchAlerts } from "../services/api";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchAlerts()
      .then(setAlerts)
      .catch(console.error);
  }, []);

  return (
    <div>
      <h2>Alerts</h2>
      <ul>
        {alerts.map((item, idx) => (
          <li key={idx}>
            {item.route}: {item.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
