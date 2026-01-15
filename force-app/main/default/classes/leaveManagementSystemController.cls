global without sharing class leaveManagementSystemController {

    @AuraEnabled(cacheable=true)
    public static Contact getEmployee(String contactId){
        return [
            SELECT Id, Name, ReportsToId
            FROM Contact 
            WHERE Id = :contactId
            LIMIT 1
        ];
    }

    @AuraEnabled(cacheable=true)
    public static List<String> getLeaveTypes() {
        List<String> result = new List<String>();
        Schema.DescribeFieldResult f = Leave_Application__c.Leave_Type__c.getDescribe();

        for (Schema.PicklistEntry p : f.getPicklistValues()) {
            result.add(p.getValue());
        }
        return result;
    }

    @AuraEnabled(cacheable=true)
    public static List<Leave_Application__c> getLeaves(String contactId){
        return [
                SELECT Id,
                    Name,
                    Start_Date__c,
                    End_Date__c,
                    Leave_Type__c,
                    Status__c,
                    Reason_for_Leave__c,
                    Employee__c,
                    Employee__r.Name
                FROM Leave_Application__c
                WHERE Employee__c = :contactId
                ORDER BY CreatedDate DESC
];

    }

    @AuraEnabled
    public static String createLeave(Map<String, Object> req){

        Leave_Application__c rec = new Leave_Application__c();

      //  rec.Name = (String)req.get('Name');
        rec.Status__c = (String)req.get('Status'); 
        rec.Employee__c = (String)req.get('EmployeeId');
        rec.Leave_Type__c = (String)req.get('LeaveType');
        rec.Start_Date__c = Date.valueOf((String)req.get('StartDate'));
        rec.End_Date__c = Date.valueOf((String)req.get('EndDate'));
        rec.Days__c = Integer.valueOf(req.get('Days'));
        rec.Reason_for_Leave__c = (String)req.get('Reason');
        rec.Approver__c = (String)req.get('ReportingManager');

        insert rec;

        return 'SUCCESS';
    }
}