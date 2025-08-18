import { useEffect, useState } from "react";
import { fetchSchedules } from "../services/api";

export default function Schedules() {
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    fetchSchedules()
      .then(setSchedules)
      .catch(console.error);
  }, []);

  return (
    <div>
      <h2>Schedules</h2>
      <ul>
        {schedules.map((item, idx) => (
          <li key={idx}>
            {item.route}: {item.departure} → {item.arrival}
          </li>
        ))}
      </ul>
    </div>
  );
}
