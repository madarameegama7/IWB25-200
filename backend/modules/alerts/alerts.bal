public function getAlerts() returns json {
    // Mock alerts
    json alerts = [
        {"route":"Bus 120","message":"Delayed by 15 mins"},
        {"route":"Train A","message":"On time"}
    ];
    return alerts;
}
