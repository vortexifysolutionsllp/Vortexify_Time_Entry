global  without sharing class AddModuleButtonHelper {
    @AuraEnabled
    Public Static List<DefaulModuleName__mdt> addModule(){
        List<DefaulModuleName__mdt> AutomateMpdulesList = new List<DefaulModuleName__mdt>();
        AutomateMpdulesList=[select id,DeveloperName,MasterLabel,Estimate_Time__c from DefaulModuleName__mdt];
        system.debug('AutomateMpdulesList::'+AutomateMpdulesList);
        return AutomateMpdulesList;
        
    }
    
    
    @AuraEnabled
    public static List<Module__c> saveModuleLIst(List<Module__c> mddList){
        system.debug('mddList -- ' + mddList);
        String projectId = mddList[0].project__c;
        system.debug('projectId -- ' + projectId);
        // String DevMilestoneId = [Select id , Name__c from milestone__C where Name__c = 'Development' and project__c = :projectId limit 1].Id;
        // system.debug('DevMilestoneId -- ' + DevMilestoneId);
        // Map<ID, Milestone__c> milestoneRecById = new Map<ID, Milestone__c>([Select id , Name__c from Milestone__c where project__c = :projectId]);
        // map<String,String> milestoneIdByName = new Map<String,String>(); 
        
        // for(Milestone__c ms : milestoneRecById.values()){
        //     milestoneIdByName.put(ms.Name__c , ms.Id);
        // }
        // system.debug('milestoneIdByName===>>>>'+milestoneIdByName);
        
        // for(Module__c mod : mddList){
        //     if( String.isNotBlank(mod.Project__c)){
        //         if(milestoneIdByName.ContainsKey(mod.Name)){
        //             mod.Milestone__c = milestoneIdByName.get(mod.Name);
        //         }else{
        //             mod.Milestone__c = DevMilestoneId;
        //         }
        //     }
        // }
        system.debug('mddList last ::'+mddList);
        upsert mddList;
        return mddList;
    }
    
    @AuraEnabled
    Public Static  List<Module__c> allRelatedModule(String ProjectID ){
        system.debug('ProjectID::'+ProjectID);
        List<Module__c> createdModuleList =[select id,name,Milestone__c,Module_Description__c,Module_End_Time__c,Module_Start_Date__c,Actual_Estimated_Efforts__c,Total_Estimated_Effort__c from Module__c where Project__c =:ProjectID ];
        system.debug('createdModuleList::'+createdModuleList);
        return createdModuleList;
    }
    
    @AuraEnabled
    Public Static List<Milestone__c> getMilesstones(string projectiD){
        List<Milestone__c> MilestoneList=[select id,name,name__c,project__c,project__r.name,Closed_the_Milesstone__c,Actual_End_Date__c,Actual_Start_Date__c,Precentage__c,Description__c,Expected_Start_Date__c,Expected_End_Date__c,Account__c from Milestone__c  where project__c =:projectiD];
        return MilestoneList;
    }
    @AuraEnabled
    Public Static void UpdateMilesstones(List<Milestone__c> milstoneListTobeUpdate){
        system.debug('milstoneListTobeUpdate::'+milstoneListTobeUpdate);
        UPSERT milstoneListTobeUpdate;
        
    }
    
    @AuraEnabled
    Public Static   list<Module__c>  UpdateMilesstonesfromsite(String projID){
        String ProjectID=projID;
        system.debug('ProjectID::'+ProjectID);
        list<Module__c> ModuleList=[select id,name,Milestone__c,Module_Description__c,Module_End_Time__c,Module_Start_Date__c,Actual_Estimated_Efforts__c,Total_Estimated_Effort__c,Is_Completed__c,Anticipated_Hours__c,Project__c,Project_Resource_Mapping__c	 from Module__c where Project__c=:ProjectID];
        List<ModuleDataWrapper> dataToBeReturned = new List<ModuleDataWrapper>();
        for(Module__c mod : ModuleList){
            
        }
        system.debug('ModuleList::'+ModuleList);
        system.debug('dataToBeReturned'+dataToBeReturned);
        return ModuleList;
    }
    
    
    ///using in UpdateModuleForSite
    @AuraEnabled
    Public Static String UpdateModule(String Moduleid,String Action){
        String Actions=Action;
        if(Actions=='Delete'){
            Module__c Record =[select id,name from Module__c where id =:Moduleid];
            Delete Record;
        }else if(Actions=='Close'){
            Module__c Record =[select id,name,Is_Completed__c from Module__c where id =:Moduleid];
            if(Record.Is_Completed__c==false){
                Record.Is_Completed__c=True;
            }else if(Record.Is_Completed__c==true){
                Record.Is_Completed__c=false;
            }
            
            update Record;
        }
        
        return 'Success';
    }
    @AuraEnabled
    Public Static void UpdateModules(String Moduleid){
        Module__c Record =[select id,name from Module__c where id =:Moduleid];
        Delete Record;
    }
    @AuraEnabled
    Public Static void UpdateModuless(String Moduleid){
        Module__c Record =[select id,name,Is_Completed__c from Module__c where id =:Moduleid];
        if(Record.Is_Completed__c==false){
            Record.Is_Completed__c=True;
        }else if(Record.Is_Completed__c==true){
            Record.Is_Completed__c=false;
        }
        
        update Record;
    }
    
    @AuraEnabled
    Public Static void saveChangesRecordd(List<Module__c> ModuleList){
        system.debug('ModuleList::'+ModuleList);
        upsert ModuleList;
    }
    
    @AuraEnabled
    Public Static list<Project__c> getAllprojects(){
        list<Project__c> projects =[select id,name From Project__c ];
        return projects;
    }
    //To create the single project record 
    @AuraEnabled
    Public Static Project__c createProjectmethod(Project__c singleproject){
        System.debug('Single project Record to create: ' + singleproject);
        try{
            if (singleproject.Id != null) {
                upsert singleproject;
            } else {
                // If the record does not have an Id, perform an insert
                insert singleproject;
            }
            
        }catch(Exception e){
            System.debug('error ' +e); 
        }
        return singleproject;
    }
    
    @AuraEnabled(cacheable=true)
    public static list<Project__c> getAllRelatedProjects(String accId){
        list<Project__c> lsproject = [select Id,Name,Project_Start_Date__c,Project_End_Date__c,Salesforce_Products__c from Project__c where Account__c =: accId];
        System.debug('lsproject====>'+lsproject);
        return lsproject;
    }
    
    @AuraEnabled(cacheable=true)
    Public static projectDetailsWrapper appprojectDataWithDetails(){
        projectDetailsWrapper projectdata = new projectDetailsWrapper();
        projectdata.projects=[SELECT Id,Name,Account__c,Active__c,Number_Of_Weeks__c,Percentage_Level__c,Project_End_Date__c,
                              Project_Start_Date__c,Resource_Price_Rate__c,Salesforce_Products__c,Type__c,(SELECT Account__c,Actual_End_Date__c,Actual_Start_Date__c,Anticipated_End_Date__c,Anticipated_Hours__c,
                                                                                                           Closed_the_Milesstone__c,CreatedById,CreatedDate,Description__c,Expected_End_Date__c,Expected_Start_Date__c,Id,IsDeleted,
                                                                                                           Is_Collected__c,LastActivityDate,Milestone_Weightage_Rs__c,
                                                                                                           Milestone_Weightage__c,Name,Name__c,Opportunity__c,Precentage__c,Project__c,RecordTypeId,Stages__c,SystemModstamp,Tentative_Date_of_Payment__c,
                                                                                                           Total_Utilised_Time__c FROM Milestones__r) FROM project__c where Active__c=TRUE];
        projectdata.milestones=[SELECT Account__c,Actual_End_Date__c,Actual_Start_Date__c,Anticipated_End_Date__c,Anticipated_Hours__c,
                                Closed_the_Milesstone__c,CreatedById,CreatedDate,Description__c,Expected_End_Date__c,Expected_Start_Date__c,Id,IsDeleted,
                                Is_Collected__c,LastActivityDate,Milestone_Weightage_Rs__c,
                                Milestone_Weightage__c,Name,Name__c,Opportunity__c,Precentage__c,Project__c,RecordTypeId,Stages__c,SystemModstamp,Tentative_Date_of_Payment__c,
                                Total_Utilised_Time__c FROM Milestone__c];
        projectdata.modules=[SELECT Actual_Estimated_Efforts__c,Anticipated_End_Date__c,Anticipated_Hours__c,Conga_Auth__c,CreatedById,CreatedDate,
                             Id,IsDeleted,Is_Completed__c,Milestones_Name__c,Milestone__c,
                             Module_Completed_Formula__c,Module_Description__c,Module_End_Time__c,Module_Start_Date__c,Name,OwnerId,Percentage_Level__c,Project_Name__c,
                             Project_Resource_Mapping__c,Project__c,Stand_By_Resource__c,SystemModstamp,Total_Estimated_Effort__c,Total_Utilised_Time__c FROM Module__c  limit 5];
        projectdata.jiratasks=[SELECT Actual_Efforts__c,Actual_Hours_Utilised__c,Actual_Task_End_Time__c,Actual_Task_Start_Time__c,Assigned_By_Name__c,
                               Assigned_By__c,Break_End_Time__c,Break_Start_Time__c,CreatedById,CreatedDate,Current_Time__c,Description__c,Estimated_Efforts_in_hour__c,
                               Estimated_Efforts__c,Estimated_End_Date__c,Estimated_Start_Date__c,Extension_Reason__c,Id,IsDeleted,Is_BreakStart__c,Is_Overdue__c,Module_Name__c,Module__c,Name,OwnerId,Priority__c,Project_Name__c,Project_Resource_Mapping__c,
                               Real_Task_End_Time__c,Real_Task_Start_Time__c,Solution_Details_if_any__c,Stand_By_Resource_Name__c,Stand_By_Resource__c,Status__c,SystemModstamp,
                               system_now__c,Task_End_Date_Time__c,Task_End_Date__c,Task_Start_Date_Time__c,Task_Start_Date__c,Task_Start_Time__c,Team_Lead__c,Team_Member_Name__c,
                               Team_Member__c,Testing_Flow__c,Total_Break_Time__c,Total_Utilised_Time__c FROM Jira_Task__c limit 5];
        return projectdata;
        
    }
    
    
    public class projectDetailsWrapper{
        @AuraEnabled
        public list<project__c> projects;
        @AuraEnabled
        public list<milestone__c> milestones;
        @AuraEnabled
        public list<Module__c> modules;
        @AuraEnabled
        public list<Jira_Task__c> jiratasks;
        
    }
}