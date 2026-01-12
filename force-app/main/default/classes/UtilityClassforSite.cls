global without sharing class UtilityClassforSite {
    @AuraEnabled(cacheable=true)
    public static List<sObject> searchRecords(String objectApiName, String searchKey) {
        if (String.isBlank(searchKey)) return new List<sObject>();
        String query = 'SELECT Id, Name FROM ' + objectApiName + 
                       ' WHERE Name LIKE \'%' + String.escapeSingleQuotes(searchKey) + '%\' LIMIT 10';
        return Database.query(query);
    }
    
            @AuraEnabled
        public static List<Module__c> getModulesByProject(Id projectId) {
            return [SELECT Id, Name FROM Module__c WHERE Project__c = :projectId];
        }
        
            @AuraEnabled
        public static List<Contact> getContactsByProject(Id projectId) {
            return [
                SELECT Id, Name 
                FROM Contact 
                WHERE Id IN (
                    SELECT Contact__c 
                    FROM Project_Resource_Mapping__c 
                    WHERE Project__c = :projectId
                )
            ];
        }

}