import { useEffect, useState } from "react";
import { fetchPredictions } from "../services/api";

export default function Predictions() {
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    fetchPredictions()
      .then(setPredictions)
      .catch(console.error);
  }, []);

  return (
    <div>
      <h2>Predictions</h2>
      <ul>
        {predictions.map((item, idx) => (
          <li key={idx}>
            {item.route}: Predicted arrival → {item.predictedArrival}
          </li>
        ))}
      </ul>
    </div>
  );
}
