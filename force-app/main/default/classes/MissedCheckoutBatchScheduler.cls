public class MissedCheckoutBatchScheduler implements Schedulable {

    public void execute(SchedulableContext sc) {
        missedCheckoutBatch batchJob = new missedCheckoutBatch();
        Database.executeBatch(batchJob, 50);
    }
}
