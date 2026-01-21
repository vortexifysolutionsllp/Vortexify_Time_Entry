//shivam kumar mishra
public class LeaveApprovalController {

    public Leave_Application__c leaveRecord { get; set; }
    public Boolean isValid { get; set; }

    public LeaveApprovalController() {
        isValid = false;

        Id recId = ApexPages.currentPage().getParameters().get('id');

        if (recId != null) {
            try {
                leaveRecord = [
                    SELECT Id, Status__c, Employee__r.Name, Employee__c,
                           Start_Date__c, End_Date__c, Days__c, Leave_Type__c,
                           Reason_for_Leave__c,
                           Employee__r.Vortexify_Email__c,
                           Employee__r.ReportsToId,
                           Employee__r.ReportsTo.Vortexify_Email__c,
                           Employee__r.ReportsTo.Name
                    FROM Leave_Application__c
                    WHERE Id = :recId
                    LIMIT 1
                ];
                isValid = true;
            } catch (Exception e) {
                isValid = false;
            }
        }
    }

    // NEW METHOD → Sends confirmation email after Approve/Reject
private void sendStatusEmail(String actionType) {

    List<Messaging.SingleEmailMessage> mails = new List<Messaging.SingleEmailMessage>();

    String empEmail = leaveRecord.Employee__r.Vortexify_Email__c;
    String mgrEmail = leaveRecord.Employee__r.ReportsTo.Vortexify_Email__c;

    // EMAIL TO EMPLOYEE (HTML)
    if (empEmail != null) {
        Messaging.SingleEmailMessage empMail = new Messaging.SingleEmailMessage();
        empMail.setToAddresses(new String[]{empEmail});
        empMail.setUseSignature(false);

        if (actionType == 'Approved') {
            empMail.setSubject('Your Leave Request Has Been Approved');

            String empHtml =
            '<html><body style="font-family:Arial; font-size:14px; color:#333;">' +
            '<div style="max-width:600px; margin:auto; padding:20px; border:1px solid #eee; border-radius:8px;">' +
            '<h2 style="color:#28a745; text-align:center;">Leave Request Approved</h2>' +

            'Hello <b>' + leaveRecord.Employee__r.Name + '</b>,<br/><br/>' +
            'Your leave request has been <b style="color:#28a745;">approved</b>.<br/><br/>' +

            '<table style="width:100%; border-collapse:collapse;">' +
            row('Leave Type', leaveRecord.Leave_Type__c) +
            row('From', String.valueOf(leaveRecord.Start_Date__c)) +
            row('To', String.valueOf(leaveRecord.End_Date__c)) +
            row('Total Days', String.valueOf(leaveRecord.Days__c)) +
            '</table><br/>' +

            'Please ensure proper handover of your tasks before proceeding on leave.<br/><br/>' +
            'Regards,<br/><b>Human Resources</b>' +
            '</div></body></html>';

            empMail.setHtmlBody(empHtml);

        } else {

            empMail.setSubject('Your Leave Request Has Been Rejected');

            String empHtml =
            '<html><body style="font-family:Arial; font-size:14px; color:#333;">' +
            '<div style="max-width:600px; margin:auto; padding:20px; border:1px solid #eee; border-radius:8px;">' +
            '<h2 style="color:#d9534f; text-align:center;">Leave Request Not Approved</h2>' +

            'Hello <b>' + leaveRecord.Employee__r.Name + '</b>,<br/><br/>' +
            'Unfortunately, your leave request could not be <b style="color:#d9534f;">approved</b>.<br/><br/>' +

            '<table style="width:100%; border-collapse:collapse;">' +
            row('Leave Type', leaveRecord.Leave_Type__c) +
            row('From', String.valueOf(leaveRecord.Start_Date__c)) +
            row('To', String.valueOf(leaveRecord.End_Date__c)) +
            row('Total Days', String.valueOf(leaveRecord.Days__c)) +
            '</table><br/>' +

            '<b>Reason:</b><br/>' +
            '<div style="background:#f9f9f9; padding:10px; border-left:4px solid #d9534f;">' +
            leaveRecord.Reason_for_Leave__c +
            '</div><br/>' +

            'Feel free to contact your reporting manager for clarification.<br/><br/>' +
            'Regards,<br/><b>Human Resources</b>' +
            '</div></body></html>';

            empMail.setHtmlBody(empHtml);
        }

        mails.add(empMail);
    }

    // EMAIL TO MANAGER (HTML)
    if (mgrEmail != null) {
        Messaging.SingleEmailMessage mgrMail = new Messaging.SingleEmailMessage();
        mgrMail.setToAddresses(new String[]{mgrEmail});
        mgrMail.setUseSignature(false);

        mgrMail.setSubject('Leave ' + actionType + ' Confirmation');

        String mgrHtml =
        '<html><body style="font-family:Arial; font-size:14px; color:#333;">' +
        '<div style="max-width:600px; margin:auto; padding:20px; border:1px solid #eee; border-radius:8px;">' +
        '<h2 style="color:#007bff; text-align:center;">Leave Request ' + actionType + ' Confirmation</h2>' +

        'Hello <b>' + leaveRecord.Employee__r.ReportsTo.Name + '</b>,<br/><br/>' +
        'You have successfully <b>' + actionType + '</b> the leave request for:<br/><br/>' +

        '<table style="width:100%; border-collapse:collapse;">' +
        row('Employee', leaveRecord.Employee__r.Name) +
        row('Leave Type', leaveRecord.Leave_Type__c) +
        row('From', String.valueOf(leaveRecord.Start_Date__c)) +
        row('To', String.valueOf(leaveRecord.End_Date__c)) +
        row('Total Days', String.valueOf(leaveRecord.Days__c)) +
        '</table><br/>' +

        'Thank you for your timely action.<br/><br/>' +
        'Regards,<br/><b>HR System Notification</b>' +
        '</div></body></html>';

        mgrMail.setHtmlBody(mgrHtml);
        mails.add(mgrMail);
    }

    if (!mails.isEmpty()) {
        Messaging.sendEmail(mails);
    }
}

// Helper method to generate table rows
private static String row(String label, String value) {
    return '<tr>' +
           '<td style="padding:8px; border:1px solid #ddd;"><b>' + label + '</b></td>' +
           '<td style="padding:8px; border:1px solid #ddd;">' + value + '</td>' +
           '</tr>';
}



    public PageReference approve() {
        leaveRecord.Status__c = 'Approved';
        update leaveRecord;

        List<DayAttendance__c> dayAttendanceList = [SELECT Id, Date__c, Day_Status__c, Employee__c, Approved_Leave__c FROM DayAttendance__c WHERE Employee__c = :leaveRecord.Employee__c AND Date__c >= :leaveRecord.Start_Date__c AND Date__c <= :leaveRecord.End_Date__c];
        System.debug('dayAttendanceList--->'+dayAttendanceList);
        if(dayAttendanceList?.size()>0){
            for(DayAttendance__c dayAttendance : dayAttendanceList){
                dayAttendance.Day_Status__c = 'Approved Leave';
                dayAttendance.Approved_Leave__c = leaveRecord.Id;
            }
            update dayAttendanceList;
        }else{
            ApexPages.addMessage(
                new ApexPages.Message(ApexPages.Severity.CONFIRM, 'No Leave Application Records Found')
            );
            return null;
        }

        /* CALL NEW METHOD */
        sendStatusEmail('Approved');

        ApexPages.addMessage(
            new ApexPages.Message(ApexPages.Severity.CONFIRM, 'Leave Approved Successfully.')
        );
        return null;
    }

    public PageReference reject() {
        leaveRecord.Status__c = 'Rejected';
        update leaveRecord;

        /* CALL NEW METHOD */
        sendStatusEmail('Rejected');

        ApexPages.addMessage(
            new ApexPages.Message(ApexPages.Severity.CONFIRM, 'Leave Rejected Successfully.')
        );
        return null;
    }

    @AuraEnabled (cacheable=true)
    public static appovalList getApprovalRequests(String approverId, String status){
        try{
            appovalList result = new appovalList();
            System.debug('approverId--->'+approverId);
            System.debug('status--->'+status);
            List<Leave_Application__c> leaveApplicationList = [SELECT Id, Name, Start_Date__c, End_Date__c, Reason_for_Leave__c, Status__c, Employee__r.Name, Employee__c, Leave_Type__c, Days__c FROM Leave_Application__c WHERE Approver__c = :approverId AND Status__c = :status ORDER BY Start_Date__c DESC];
            result.leaveRequests = leaveApplicationList;
            return result;
        }catch(exception e){
            throw new AuraHandledException('Error fetching Leave Application: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static String approveRequest(String recordId){
        try{
            appovalList result = new appovalList();
            List<Leave_Application__c> leaveApplicationList = [SELECT Id, Name, Start_Date__c, End_Date__c, Status__c, Employee__r.Name, Employee__c, Approver__c, Approved_By__c FROM Leave_Application__c WHERE Id = :recordId];
            if(leaveApplicationList?.size()>0){
                leaveApplicationList[0].Status__c = 'Approved';
                leaveApplicationList[0].Approved_By__c = leaveApplicationList[0].Approver__c;
                leaveApplicationList[0].Approved_On__c = System.now();
                update leaveApplicationList[0];
                List<DayAttendance__c> dayAttendanceList = [SELECT Id, Date__c, Day_Status__c, Employee__c, Approved_Leave__c FROM DayAttendance__c WHERE Employee__c = :leaveApplicationList[0].Employee__c AND Date__c >= :leaveApplicationList[0].Start_Date__c AND Date__c <= :leaveApplicationList[0].End_Date__c];
                System.debug('dayAttendanceList--->'+dayAttendanceList);
                if(dayAttendanceList?.size()>0){
                    for(DayAttendance__c dayAttendance : dayAttendanceList){
                        dayAttendance.Day_Status__c = 'Approved Leave';
                        dayAttendance.Approved_Leave__c = leaveApplicationList[0].Id;
                    }
                    update dayAttendanceList;
                }
                return  'Leave Approved Successfully.';
            }
            return 'No Leave Application Records Found';
        }catch(exception e){
            throw new AuraHandledException('Error fetching Leave Application: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static String rejectRequest(String recordId){
        try{
            appovalList result = new appovalList();
            List<Leave_Application__c> leaveApplicationList = [SELECT Id, Name, Start_Date__c, End_Date__c, Status__c, Employee__r.Name, Employee__c, Approver__c, Approved_By__c, Approved_On__c FROM Leave_Application__c WHERE Id = :recordId];
            if(leaveApplicationList?.size()>0){
                leaveApplicationList[0].Status__c = 'Rejected';
                leaveApplicationList[0].Approved_By__c = leaveApplicationList[0].Approver__c;
                leaveApplicationList[0].Approved_On__c = System.now();
                update leaveApplicationList[0];
                return 'Leave Rejected Successfully.';
                // List<DayAttendance__c> dayAttendanceList = [SELECT Id, Date__c, Day_Status__c, Employee__c, Approved_Leave__c FROM DayAttendance__c WHERE Employee__c = :leaveApplicationList[0].Employee__c AND Date__c >= :leaveApplicationList[0].Start_Date__c AND Date__c <= :leaveApplicationList[0].End_Date__c];
                // System.debug('dayAttendanceList--->'+dayAttendanceList);
                // if(dayAttendanceList?.size()>0){
                //     for(DayAttendance__c dayAttendance : dayAttendanceList){
                //         dayAttendance.Day_Status__c = 'Approved Leave';
                //         dayAttendance.Approved_Leave__c = leaveRecord.Id;
                //     }
                //     update dayAttendanceList;
                // }
            }
            return 'No Leave Application Records Found';
        }catch(exception e){
            throw new AuraHandledException('Error fetching Leave Application: ' + e.getMessage());
        }
    }

    public class appovalList{
        @AuraEnabled
        public List<Leave_Application__c> leaveRequests {get; set;}
    }

}