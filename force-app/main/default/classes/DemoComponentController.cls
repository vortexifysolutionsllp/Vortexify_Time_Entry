public with sharing class DemoComponentController {
    

    /**
     * 
     */
    @AuraEnabled(cacheable = true)
    public static Wrapper getPageLoadMessage(String accId){
        try {
            Wrapper wrp = new Wrapper();
            wrp.contactList = [SELECT Id FROM Contact WHERE AccountId =:accId];
            wrp.oppList = [SELECT Id FROM Opportunity WHERE AccountId =:accId];
            return wrp;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    public class Wrapper {
        @AuraEnabled
        public List<Contact> contactList;
        @AuraEnabled
        public List<Opportunity> oppList;
    }

}