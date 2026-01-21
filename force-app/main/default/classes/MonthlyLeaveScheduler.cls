global class MonthlyLeaveScheduler implements Schedulable {

    global void execute(SchedulableContext sc) {
        Database.executeBatch(new MonthlyLeaveEntitlementBatch(), 200);
    }
}
