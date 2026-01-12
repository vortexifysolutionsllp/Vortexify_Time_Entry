public class LeaveApplicationTriggerHandler {

    public static void sendLeaveEmails(List<Leave_Application__c> newLeaves){
        // Collect Contact IDs
        Set<Id> contactIds = new Set<Id>();
        for (Leave_Application__c leave : newLeaves) {
            if (leave.Employee__c != null) {
                contactIds.add(leave.Employee__c);
                System.debug('Added Contact Id → ' + leave.Employee__c);
            } else {
                System.debug('SKIPPED: Employee__c is NULL for leave → ' + leave.Id);
            }
        }

        // Query Contacts
        if (contactIds.isEmpty()) {
            System.debug('ERROR → No Contact Ids found. STOPPING EMAIL LOGIC.');
            return;
        }

        Map<Id, Contact> contactMap = new Map<Id, Contact>(
            [SELECT Id, Name, Vortexify_Email__c, ReportsToId,
                    ReportsTo.Name, ReportsTo.Vortexify_Email__c
             FROM Contact
             WHERE Id IN :contactIds]
        );

        // Prepare emails
        List<Messaging.SingleEmailMessage> emailsToSend = new List<Messaging.SingleEmailMessage>();
        for (Leave_Application__c leave : newLeaves) {
            Contact emp = contactMap.get(leave.Employee__c);
            if (emp == null) {
                System.debug('ERROR → Could not find Contact for Employee__c = ' + leave.Employee__c);
                continue;
            }

            // EMAIL TO REPORTING MANAGER
            
            if (emp.ReportsToId != null && emp.ReportsTo.Vortexify_Email__c != null) {

                Messaging.SingleEmailMessage mgrMail = new Messaging.SingleEmailMessage();

                // TEMPLATE
                mgrMail.setTemplateId('00XC40000036Scd');
                mgrMail.setTargetObjectId(emp.ReportsToId);
                mgrMail.setWhatId(leave.Id);
                mgrMail.setToAddresses(new String[]{emp.ReportsTo.Vortexify_Email__c});
                mgrMail.setSaveAsActivity(false);
                emailsToSend.add(mgrMail);
            }

            
            // EMAIL TO EMPLOYEE (SELF)

            if (emp.Vortexify_Email__c != null) {

                System.debug('Employee Email → ' + emp.Vortexify_Email__c);

                Messaging.SingleEmailMessage selfMail = new Messaging.SingleEmailMessage();

                selfMail.setTemplateId('00XC40000036Scc');
                selfMail.setTargetObjectId(emp.Id);
                selfMail.setWhatId(leave.Id);
                System.debug('Applied Template To Employee Email');
                selfMail.setToAddresses(new String[]{emp.Vortexify_Email__c});
                selfMail.setSaveAsActivity(false);

                System.debug('Adding Employee Email to list → ' + selfMail);
                emailsToSend.add(selfMail);

            } 
        }

        System.debug('STEP 5 → FINAL EMAIL LIST → ' + emailsToSend);

        //  Send emails
        if (!emailsToSend.isEmpty()) {
            System.debug('STEP 6 → Sending Emails Now...');

            try {
                Messaging.sendEmail(emailsToSend);
                System.debug('SUCCESS → Email sent successfully!');
            } catch (Exception e) {
                System.debug('ERROR SENDING EMAIL → ' + e.getMessage());
            }

        } else {
            System.debug('NO EMAILS TO SEND → emailsToSend list is empty.');
        }

        System.debug('STEP 7 → Handler End.');
    }
}