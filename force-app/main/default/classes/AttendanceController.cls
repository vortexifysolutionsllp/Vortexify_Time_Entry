global without sharing  class AttendanceController {
    @AuraEnabled(cacheable=true)
    public static List<DayAttendance__c> getAttendance(Date fromDate, Date toDate ,String contactId) {
        return [
            SELECT Id, Date__c, Day_Status__c, FirstCheckIn__c, CheckinCount__c,
                   Employee__r.Name FROM DayAttendance__c WHERE Date__c >= :fromDate AND Date__c <= :toDate AND Employee__r.Status__c = 'Available' AND Employee__c = :contactId ORDER BY Date__c ASC
        ];
    }

        @AuraEnabled(cacheable=true)
    public static Contact getEmployee(String contactId){
        // return [
        //     SELECT Id,Role__c 
        //     FROM Contact 
        //     WHERE Id = :contactId
        //     LIMIT 1
        // ];
        String queryStr = 'SELECT Id,Role__c FROM Contact WHERE Id = \''+contactId+'\' LIMIT 1';
        System.debug('queryStr--> ' + queryStr);
        List<Contact> conList = database.query(queryStr);
        Contact conRec = new Contact();
        if(conList?.size()>0){
            conRec = conList[0];
        }
        return conRec;
    }
}