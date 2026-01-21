global class TimeEntryMonthlyScheduler implements Schedulable {

    global void execute(SchedulableContext sc) {
        Database.executeBatch(new MonthlyDayAttendanceBatch(), 50);
        Database.executeBatch(new MonthlyLeaveEntitlementBatch(), 50);
    }
}