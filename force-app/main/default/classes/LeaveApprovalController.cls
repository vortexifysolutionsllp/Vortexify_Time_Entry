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
}