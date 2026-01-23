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

    @AuraEnabled(cacheable=true)
    public static String getRemainingAndUsedLeaves(String employeeId){
        try{
            List<Leave_Entitlement__c> leaveEntitlementList = [SELECT Id, Casual_Leaves_Remaining__c, Casual_Leaves_Used__c, Earned_Leaves_Remaining__c, Earned_Leaves_Used__c, Floater_Leaves_Remaining__c, Floater_Leaves_Used__c, Sick_Leaves_Remaining__c, Sick_Leaves_Used__c FROM Leave_Entitlement__c WHERE Employee__c =: employeeId AND Is_Current_Year__c = true LIMIT 1];
            List<Holiday__c> holidayList = [SELECT Id, Name, Date__c FROM Holiday__c WHERE Date__c = THIS_YEAR];
            List<Holiday__c> elapsedHolidayList = [SELECT Id, Name, Date__c FROM Holiday__c WHERE Date__c = THIS_YEAR AND Date__c <= TODAY];
            String result = '';
            if(leaveEntitlementList?.size()>0){
                Map<String, Object> response = new Map<String, Object>();
                response.put('Holidays', new Map<String, Decimal>{
                    'used' => elapsedHolidayList.size(),
                    'remaining' => holidayList.size() - elapsedHolidayList.size()
                });
                
                response.put('Sick Leave', new Map<String, Decimal>{
                    'used' => leaveEntitlementList[0].Sick_Leaves_Used__c,
                    'remaining' => leaveEntitlementList[0].Sick_Leaves_Remaining__c
                });

                response.put('Casual Leave', new Map<String, Decimal>{
                    'used' => leaveEntitlementList[0].Casual_Leaves_Used__c,
                    'remaining' => leaveEntitlementList[0].Casual_Leaves_Remaining__c
                });

                /*response.put('Earned Leave', new Map<String, Decimal>{
                    'used' => leaveEntitlementList[0].Earned_Leaves_Used__c,
                    'remaining' => leaveEntitlementList[0].Earned_Leaves_Remaining__c
                });*/
                System.debug('response--> ' + response);
                return JSON.serialize(response);
            }
            return result;
        }catch(exception e){
            return null;
        }
    }

    @AuraEnabled
    public static String createLeave(Map<String, Object> req){
        List<Leave_Entitlement__c> leaveEntitlementList = [SELECT Id FROM Leave_Entitlement__c WHERE Employee__c = :(String)req.get('EmployeeId') AND Is_Current_Year__c = true LIMIT 1];
        if(leaveEntitlementList?.size()==0){
            return 'No Leave Entitlement Found';
        }

        List<Leave_Application__c> existingLeaveApplications = [SELECT Id FROM Leave_Application__c WHERE Employee__c = :(String)req.get('EmployeeId') AND Status__c != 'Rejected' AND ((Start_Date__c  <=: Date.valueOf((String)req.get('StartDate')) AND End_Date__c >=: Date.valueOf((String)req.get('StartDate'))) OR ((Start_Date__c  <=: Date.valueOf((String)req.get('EndDate')) AND End_Date__c >=: Date.valueOf((String)req.get('EndDate')))))];

        if(existingLeaveApplications?.size()>0){
            return 'Leave Application Already Exists for the given date range';
        }

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
        rec.Leave_Entitlement__c = leaveEntitlementList[0].Id;

        insert rec;

        return 'SUCCESS';
    }
}