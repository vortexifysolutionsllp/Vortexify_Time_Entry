global without sharing class taskOnCalenderController {
    @AuraEnabled
        public static List<Jira_Task__c> getjiratasksForContact(Id contactId) {
            system.debug('---Contact ID---'+contactId);
          return [
               SELECT Id, Name,	Task_Start_Date__c, Module_Name__c,Priority__c,Project_Name__c,Status__c,
                Task_Start_Date_Time__c,Task_End_Date_Time__c, Task_Description__c FROM Jira_Task__c where Team_Member__c =: contactId
            ];
        }
       // @AuraEnabled(cacheable=true)
       // public static Contact getContactDetails() {
       // return [
        //    SELECT Id, Name,
        //    (SELECT Id, Name, Visit_Date_Time__c, Visit_Status__c, Purpose_of_Visit__c, Site_Location__c,
         //       Checkout_Date_Time__c,Visit_Duration__c FROM Site_Visit__r)
          //  FROM Contact
        //    WHERE Id = '003C200000GhWWTIA3'
       //     LIMIT 1
       // ];
        //}
}