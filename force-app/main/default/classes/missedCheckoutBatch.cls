public class missedCheckoutBatch implements Database.Batchable<sObject> {

    public Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator(
            'SELECT Id, FirstCheckIn__c, Day_Status__c, LastCheckOut__c, Missed_Checkout__c ' +
            'FROM DayAttendance__c ' +
            'WHERE Date__c = TODAY ' +
            'AND FirstCheckIn__c != NULL ' +
            'AND Day_Status__c = \'Present\' ' +
            'AND LastCheckOut__c = NULL'
        );
    }

    public void execute(Database.BatchableContext bc, List<DayAttendance__c> scope) {
        for (DayAttendance__c da : scope) {
            da.Missed_Checkout__c = true;
            da.LastCheckOut__c = System.now();
        }

        if (!scope.isEmpty()) {
            update scope;
        }
    }

    public void finish(Database.BatchableContext bc) {
        System.debug('MissedCheckoutBatch finished successfully');
    }
}
