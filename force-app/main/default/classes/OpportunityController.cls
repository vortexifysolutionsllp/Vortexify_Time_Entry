public class OpportunityController {

    @AuraEnabled(cacheable=true)
    public static  OppValuesWrap fetchMilestone(String recordid){
         System.debug('recordid--'+recordid);
        OppValuesWrap ovwrap = new OppValuesWrap();
        // Milestone__c milRec = [Select Id,Name,Opportunity__c,Amount,(SELECT Id, Name,Opportunity__c FROM Milestones__r) From Opportunity Where id =: recordid];
           list<Milestone__c> relatedMilstones =[SELECT Id, Name,Name__c,Milestone_Weightage__c,Tentative_Date_of_Payment__c,Opportunity__r.Name,Opportunity__r.Amount,Opportunity__r.AccountId FROM Milestone__c Where Opportunity__c =:recordid];
         System.debug('relatedMilstones--'+relatedMilstones);
         Opportunity opp = [Select id,Name,AccountId,Amount From Opportunity Where Id =: recordid LIMIT 1];
         ovwrap.mileList = relatedMilstones;
         ovwrap.opportunityId = recordid;
         ovwrap.opportunityAmount = opp.Amount;
         ovwrap.oppApplicantId = opp.AccountId;
         ovwrap.opportunityName = opp.Name;

        return ovwrap;
    }

    @AuraEnabled
    public static string createMilestone(list<Milestone__c> milstonesList){
        
        System.debug('milstonesList---'+milstonesList);
        if(milstonesList.size() > 0){
             upsert milstonesList;
             return 'success';
        }
        return '';
        
        
    }

    @AuraEnabled
    public static void deleteMilestone(Milestone__c milestone){
        
        System.debug('milestone---'+milestone);
       
             delete milestone;       
    }

    
    public class OppValuesWrap{
        @AuraEnabled
        public string opportunityId{get;set;}
        @AuraEnabled
        public string oppApplicantId{get;set;}
        @AuraEnabled
        public List<Milestone__c>  mileList {get;set;}
        @AuraEnabled
        public Decimal opportunityAmount {get;set;}
        @AuraEnabled
        public string opportunityName {get;set;}
    }

}