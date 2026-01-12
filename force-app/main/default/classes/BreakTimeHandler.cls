global without sharing class BreakTimeHandler {
    
    @AuraEnabled
    Public static id createBreak(String Description,String JiraTaskID){
        system.debug('Description::'+Description);
        system.debug('jtTAskIs'+JiraTaskID);
        BreakTime__c insRec = new BreakTime__c();
        insRec.Description__c=Description;
        insRec.Jira_Task__c=JiraTaskID;
        //insRec.Jira_Task__c.Is_BreakStart__c=true;
        insRec.Start_Break__c=System.now();
        insert insRec;
        return insRec.Id;
    }
    
    @AuraEnabled(cacheable=true)
    Public static BreakTime__c getUnStoppedBreakLast(String JiraTaskID ){
        system.debug('JiraTaskID--'+JiraTaskID);
        //list<BreakTime__c> getBreaks =[SELECT id,BreakTime__c,Description__c,End_Break__c,Jira_Task__c,Start_Break__c FROM BreakTime__c WHERE Jira_Task__c =:JiraTaskID AND End_Break__c =nULL];
        BreakTime__c getBreak=[SELECT id,BreakTime__c,Description__c,End_Break__c,Jira_Task__c,Start_Break__c FROM BreakTime__c WHERE Jira_Task__c =:JiraTaskID AND End_Break__c = NULL];
        system.debug('getBreak--'+getBreak);
        return getBreak;
    }
    
    @AuraEnabled
    Public Static void EndBreack(String breakRecId){
        system.debug('JiraTaskID--'+breakRecId);
        BreakTime__c getBreak=[SELECT id,BreakTime__c,Description__c,End_Break__c,Jira_Task__c,Start_Break__c FROM BreakTime__c WHERE id =:breakRecId AND End_Break__c = NULL ];
        system.debug('getBreak--'+getBreak);
        BreakTime__c insRec = new BreakTime__c();
        insRec.Id=getBreak.Id;
        insRec.End_Break__c=System.now();
        system.debug('insRec--'+insRec);
        update insRec; 
        //return getBreak;
    }
}