public function getSchedules() returns json {
    // Mock schedule data
    json schedules = [
        {"route":"Bus 120","departure":"08:30","arrival":"09:00"},
        {"route":"Train A","departure":"09:00","arrival":"09:45"}
    ];
    return schedules;
}
