global without sharing class UserAccessController {

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