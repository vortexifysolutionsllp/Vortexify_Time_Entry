global  without sharing class  PRMCmpController {
    @AuraEnabled
    public static List<Project_Resource_Mapping__c> saveProjectResourceMapping(List<Project_Resource_Mapping__c> prmList){
        system.debug('prmList'+ prmList);
        List<Id> projectIds = new List<Id>();
        for(Project_Resource_Mapping__c prm : prmList){
            projectIds.add(prm.Project__c);
        }
        system.debug('projectIds'+projectIds);
        map<String,List<String>> MembersByProject = new map<String,List<String>>();
        List<Project_Resource_Mapping__c> existingPrmList = [Select id, Contact__c , Project__c , Project_Name__c , Team_Member_Name__c , Type__c from Project_Resource_Mapping__c where Project__c in : projectIds ];
        for(Project_Resource_Mapping__c prm : existingPrmList){
            if(MembersByProject.containsKey(prm.Project__c)){
                system.debug('MembersByProject'+MembersByProject);
                MembersByProject.get(prm.Project__c).add(prm.Contact__c);
            }else{
                system.debug('MembersByProject'+MembersByProject);
                List<String> ContactIds = new List<String>();
                ContactIds.add(prm.Contact__c);
                MembersByProject.put(prm.Project__c,ContactIds);
            }
        }
        system.debug('MembersByProject'+MembersByProject);
        Boolean alreadyExisting = false;
        for(Project_Resource_Mapping__c prm : prmList){
            if(MembersByProject.containsKey(prm.Project__c) && MembersByProject.get(prm.Project__c).contains(prm.Contact__c)){
                system.debug('MembersByProject.get(prm.Project__c)'+MembersByProject.get(prm.Project__c));
                alreadyExisting = true;
            }else{
                system.debug('Existing One not Found'); 
            }
        }
        system.debug('alreadyExisting'+alreadyExisting);
        if(alreadyExisting == true){
            system.debug('Existing One Found');
            return null;
        }else{
            upsert prmList;
            prmList = [Select id, Contact__c , Project__c , Project_Name__c , Team_Member_Name__c , Type__c from Project_Resource_Mapping__c where id in : prmList ];
            system.debug('prmList'+prmList);
            return prmList; 
        }
    }
    
    @AuraEnabled
    public static List<sObject> getContacts(String searchTerm, List<sObject> selectedOptions) {
        List<String> Ids = new List<String>();
        
        
        /*for(sObject c : selectedOptions){
            Ids.add(c.Id);
        }*/
        for (sObject c : selectedOptions == null ? new List<sObject>() : selectedOptions) {
    if (c != null) {
        Ids.add(c.Id);
    }
}

        system.debug('selectedOptions:::'+selectedOptions);
        system.debug('Ids:::'+Ids);
        if(selectedOptions != NULL ){
            List<sObject> conList = [Select Id, Name from Contact Where Name Like  : ('%'+searchTerm+'%') AND (Id != : Ids) LIMIT  5];
            system.debug('conList:::'+conList);
            return conList;
        }else{
            List<sObject> conList = [Select Id, Name from Contact Where Name Like  : ('%'+searchTerm+'%') LIMIT  5];
            system.debug('conList:::'+conList);
            return conList;    
        }
    }
    
    @AuraEnabled
    public static List<sObject> searchProjects(String searchTerm, List<sObject> selectedOptions) {
        List<String> Ids = new List<String>();
        
        /*for(sObject c : selectedOptions){
            Ids.add(c.Id);
        }*/
        for (sObject c : selectedOptions == null ? new List<sObject>() : selectedOptions) {
    if (c != null) {
        Ids.add(c.Id);
    }
}

        
        if(selectedOptions != NULL){
            List<sObject> conList = [Select Id, Name from Project__c Where Name Like  : ('%'+searchTerm+'%') AND (Id != : Ids) LIMIT  5];
            system.debug('conList:::'+conList);
            return conList;
        }else{
            List<sObject> conList = [Select Id, Name from Project__c Where Name Like  : ('%'+searchTerm+'%') LIMIT  5];
            system.debug('conList:::'+conList);
            return conList;    
        }
    }
    
    
}