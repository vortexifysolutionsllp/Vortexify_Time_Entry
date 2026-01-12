trigger LeaveApplicationTrigger on Leave_Application__c (After insert) {
   if(Trigger.isAfter && Trigger.isInsert){
        LeaveApplicationTriggerHandler.sendLeaveEmails(Trigger.new);
    }
}