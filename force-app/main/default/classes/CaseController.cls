public with sharing class CaseController {
     @AuraEnabled(cacheable=true)
    public static List<Case> getCasesByContactId(String contactId) {
        List<Case> relatedCases = [SELECT Description, CaseNumber, Subject, Status, CreatedDate, ClosedDate, Source__c, Owner.Name FROM Case  WHERE ContactId = :contactId];
        System.debug('Contact relatedCases'+relatedCases);
        return relatedCases;
        
    }
    //Method2. TO get the Status Field picklist values of case object
    @AuraEnabled(cacheable=true)
public static List<wrapper> getstatusandsourcespicklist() {
    List<wrapper> wraplist = new List<wrapper>();
    wrapper wrap = new wrapper();
    
    List<String> getPickliststatusValues = new List<String>();
    
    Schema.DescribeFieldResult fieldResult = Case.Status.getDescribe();
    List<Schema.PicklistEntry> picklistValues = fieldResult.getPicklistValues();
    
    for (Schema.PicklistEntry picklistEntry : picklistValues) {
        getPickliststatusValues.add(picklistEntry.getValue());
    }
    wrap.status = getPickliststatusValues;
    wraplist.add(wrap);
    
    List<String> getPicklistSourceValues = new List<String>();
    Schema.DescribeFieldResult fieldResultB = Case.Source__c.getDescribe();
    List<Schema.PicklistEntry> picklistValuesB = fieldResultB.getPicklistValues();
    
    for (Schema.PicklistEntry picklistEntry : picklistValuesB) {
        getPicklistSourceValues.add(picklistEntry.getValue());
    }
    
    wrap.sources = getPicklistSourceValues;
    wraplist.add(wrap);
    System.debug('wraplist msg'+wraplist);
    return wraplist;

}

public class wrapper {
    @AuraEnabled
    public List<String> sources;
    @AuraEnabled
    public List<String> status;
}

//socialMediaCards
@AuraEnabled(cacheable=true)
public static List<Case> getCasesDetailByContactId(Id contactId) {
    return [SELECT Id, Description,CreatedDate, Origin,Post_Id__c, util_sl_common_Post_Id__c,Created_DateTime__c FROM Case WHERE ContactId = :contactId];
}


}