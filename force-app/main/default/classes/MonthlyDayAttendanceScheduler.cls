global class MonthlyDayAttendanceScheduler implements Schedulable {

    global void execute(SchedulableContext sc) {
        Database.executeBatch(new MonthlyDayAttendanceBatch(), 200);
    }
}