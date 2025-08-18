public function getPredictions() returns json {
    // Mock predictions
    json predictions = [
        {"route":"Bus 120","predictedArrival":"08:45"},
        {"route":"Train A","predictedArrival":"09:50"}
    ];
    return predictions;
}
