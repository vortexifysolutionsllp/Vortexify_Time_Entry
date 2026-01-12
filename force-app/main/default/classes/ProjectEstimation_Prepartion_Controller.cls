public class ProjectEstimation_Prepartion_Controller {

        //JIRA Related Progress
        @AuraEnabled
        Public static List<projectWrapper> getProjectDetails(){
        List<projectWrapper> pwlist                                                    = new List<projectWrapper>();
        Map<Id,List<Jira_Task__c>> ProjectIdRelatedModule                              = new Map<Id,List<Jira_Task__c>>();
        Map<Id,Decimal> ProjectIdRelated_JiraTask_EstimatedEfforthours_onPercent       = new Map<Id,Decimal>();
        Map<Id,Decimal> ProjectIdRelated_JiraTask_EstimatedEfforthours                 = new Map<Id,Decimal>();
        Map<Id,Module__c> ActiveProject_ModuleList                                     = new Map<Id,Module__c>();
        List<Jira_Task__c> Module_RelatedJiraTask                                      = new List<Jira_Task__c>();    

        Map<Id,Project__c> IdRelatedProjects = new Map<Id,Project__c>([Select Id,Name,Percentage_Level__c,Allocated_Hour__c From Project__c Where Active__c=true AND Allocated_Hour__c!=null]);
        System.debug('IdRelatedProjects--'+IdRelatedProjects);
            if(!IdRelatedProjects.isEmpty()){
                ActiveProject_ModuleList= new Map<Id,Module__c>([Select Id,Project__c From Module__c Where Project__c=:IdRelatedProjects.keyset()]);
            }
            System.debug('ActiveProject_ModuleList--'+ActiveProject_ModuleList);
            if(!ActiveProject_ModuleList.isEmpty()){
                Module_RelatedJiraTask=[Select Id,Estimated_Efforts__c,Total_Utilised_Time__c,Module__c,Module__r.Project__c from Jira_Task__c Where Module__c=:ActiveProject_ModuleList.keyset()];
            }
            System.debug('Module_RelatedJiraTask--'+Module_RelatedJiraTask);
            System.debug('Module_RelatedJiraTask size--'+Module_RelatedJiraTask.size());
            if(!Module_RelatedJiraTask.isEmpty()){
                for(Jira_Task__c JT:Module_RelatedJiraTask){
                        if(ProjectIdRelatedModule.containsKey(JT.Module__r.Project__c)){
                            ProjectIdRelatedModule.get(JT.Module__r.Project__c).add(JT);
                        }else{
                            ProjectIdRelatedModule.put(JT.Module__r.Project__c,new List<Jira_Task__c>{JT});
                        }  
                }
            }
            System.debug('ProjectIdRelatedModule--'+ProjectIdRelatedModule);
            System.debug('ProjectIdRelatedModule.size()--'+ProjectIdRelatedModule.size());
            if(!ProjectIdRelatedModule.IsEmpty()){
                    for(Id projectid:IdRelatedProjects.keyset()){
                         if(ProjectIdRelatedModule.containskey(projectid)){
                             System.debug('ProjectIdRelatedModule.containskey(projectid)--'+ProjectIdRelatedModule.containskey(projectid));
                             list<Jira_Task__c> jtlist=ProjectIdRelatedModule.get(projectid);
                             System.debug('jtlist'+jtlist);
                             Decimal calculate_total_Estimated_effort=0;
                             if(jtlist!=null && !jtlist.isEmpty()){
                                
                                    for(Jira_Task__c JT:jtlist){
                                        if(JT.Estimated_Efforts__c!=null){
                                           calculate_total_Estimated_effort=calculate_total_Estimated_effort+JT.Estimated_Efforts__c; 
                                        }
                                    }
                                  System.debug('calculate_total_Estimated_effort'+calculate_total_Estimated_effort);
                                    ProjectIdRelated_JiraTask_EstimatedEfforthours.put(projectid,calculate_total_Estimated_effort);
                                 System.debug('IdRelatedProjects.get(projectid).Allocated_Hour__c'+IdRelatedProjects.get(projectid).Allocated_Hour__c);
                                     if(calculate_total_Estimated_effort!=null && IdRelatedProjects.get(projectid).Allocated_Hour__c!=null){
                                         
                                         Decimal hours_progress_percent=(calculate_total_Estimated_effort/IdRelatedProjects.get(projectid).Allocated_Hour__c)*100;
                                         System.debug('hours_progress_percent'+hours_progress_percent);
                                         ProjectIdRelated_JiraTask_EstimatedEfforthours_onPercent.put(projectid,Math.round(hours_progress_percent));
                                     }
                             }
                         }
                    }
            }
             System.debug('ProjectIdRelated_JiraTask_EstimatedEfforthours--'+ProjectIdRelated_JiraTask_EstimatedEfforthours);
            System.debug('ProjectIdRelated_JiraTask_EstimatedEfforthours_onPercent--'+ProjectIdRelated_JiraTask_EstimatedEfforthours_onPercent);
            
            if(!ProjectIdRelated_JiraTask_EstimatedEfforthours_onPercent.isEmpty()){
                for(String projectId:ProjectIdRelated_JiraTask_EstimatedEfforthours_onPercent.keyset()){
                      projectWrapper PW=new projectWrapper();
                      PW.projectName=IdRelatedProjects.get(projectId).Name;
                      PW.Allocated_Hours=IdRelatedProjects.get(projectId).Allocated_Hour__c;
                      PW.Total_JiraTask_Created_hours=ProjectIdRelated_JiraTask_EstimatedEfforthours.get(projectId);
                      PW.Total_JiraTask_hours_onPercent=ProjectIdRelated_JiraTask_EstimatedEfforthours_onPercent.get(projectId);
                      pwlist.add(PW);
                }
            }
            system.debug('pwlist--'+pwlist);
            system.debug('pwlist.size()--'+pwlist.size());
            
        return pwlist;

        }

        Public class projectWrapper{
            @AuraEnabled
            Public string  projectName{get;set;}
            @AuraEnabled
            Public Decimal Allocated_Hours{get;set;}
            @AuraEnabled
            Public Decimal Total_JiraTask_Created_hours{get;set;}
            @AuraEnabled
            Public Decimal Total_JiraTask_hours_onPercent{get;set;} 
        }


       //Module Related Progress
        
        @AuraEnabled(cacheable=true)
        Public static Project_Module_Resource_Wrapper getSelectedProjectProgress(String ProjectId){

        Project_Module_Resource_Wrapper PMRWData=new Project_Module_Resource_Wrapper();

        List<Project_Module_ProgressWrapper> moduleProgress     =new List<Project_Module_ProgressWrapper>();
        List<Resource_Hours_on_project>      RHPList            =new List<Resource_Hours_on_project>();
        Map<Id,List<Jira_Task__c>> ModuleId_Related_JiraTask    =new Map<Id,List<Jira_Task__c>>();
        Map<Id,Decimal> ModuleId_Total_Jira_hours               =new Map<Id,Decimal>();
        Map<Id,Decimal> TeamMember_Related_Estimated_Efforts =new Map<Id,Decimal>();
            
            Project__c PrDetails=new Project__c();
            Map<Id,Module__c> ActiveProject_ModuleList=new Map<Id,Module__c>();
            List<Jira_Task__c> Module_RelatedJiraTask=new List<Jira_Task__c> (); 
         
        if(ProjectId!=null){
            PrDetails=[Select Id,Name,Project_Start_Date__c,Project_End_Date__c,Allocated_Hour__c From Project__c Where Id=:ProjectId];
            System.debug('PrDetails--'+PrDetails);   
        }    
            if(PrDetails.Id!=null){
                ActiveProject_ModuleList=new Map<Id,Module__c>([Select Id,Name,Actual_Estimated_Efforts__c,Anticipated_Hours__c,Total_Estimated_Effort__c,Total_Utilised_Time__c,Project__c,Project_Name__c From Module__c WHERE Project__c=:ProjectId]);
                System.debug('ActiveProject_ModuleList--'+ActiveProject_ModuleList);
            }
            
            if(!ActiveProject_ModuleList.isEmpty()){
                Module_RelatedJiraTask=[Select Id,Estimated_Efforts__c,Team_Member__c,Total_Utilised_Time__c,Module__c,Module__r.Project__c,Module__r.Actual_Estimated_Efforts__c from Jira_Task__c Where Module__c=:ActiveProject_ModuleList.keyset()];
                System.debug('Module_RelatedJiraTask--'+Module_RelatedJiraTask);
            }
        /*if(!Module_RelatedJiraTask.isEmpty()){
            for(Jira_Task__c JT:Module_RelatedJiraTask){
                if(ModuleId_Related_JiraTask.containsKey(JT.Module__c)){
                     ModuleId_Related_JiraTask.get(JT.Module__c).add(JT);
                }else{
                     ModuleId_Related_JiraTask.put(JT.Module__c,new List<Jira_Task__c>{JT});
                }

                if(TeamMember_Related_Estimated_Efforts.containsKey(JT.Team_Member__c)){
                   TeamMember_Related_Estimated_Efforts.put(JT.Team_Member__c,TeamMember_Related_Estimated_Efforts.get(JT.Team_Member__c)+JT.Estimated_Efforts__c);
                }else{
                  JT.Estimated_Efforts__c = JT.Estimated_Efforts__c!=null ? JT.Estimated_Efforts__c:0;  
                  TeamMember_Related_Estimated_Efforts.put(JT.Team_Member__c,JT.Estimated_Efforts__c);
                }
            }
        }*/
            if (!Module_RelatedJiraTask.isEmpty()) {
    for (Jira_Task__c JT : Module_RelatedJiraTask) {
        
        // Ensure Module__c is not null
        if (JT.Module__c != null) {
            if (ModuleId_Related_JiraTask.containsKey(JT.Module__c)) {
                List<Jira_Task__c> taskList = ModuleId_Related_JiraTask.get(JT.Module__c);
                if (taskList != null) {
                    taskList.add(JT);
                } else {
                    ModuleId_Related_JiraTask.put(JT.Module__c, new List<Jira_Task__c>{JT});
                }
            } else {
                ModuleId_Related_JiraTask.put(JT.Module__c, new List<Jira_Task__c>{JT});
            }
        }

        // Ensure Team_Member__c is not null
        if (JT.Team_Member__c != null) {
            Decimal estEffort = JT.Estimated_Efforts__c != null ? JT.Estimated_Efforts__c : 0;

            if (TeamMember_Related_Estimated_Efforts.containsKey(JT.Team_Member__c)) {
                Decimal existingEffort = TeamMember_Related_Estimated_Efforts.get(JT.Team_Member__c);
                TeamMember_Related_Estimated_Efforts.put(JT.Team_Member__c, existingEffort + estEffort);
            } else {
                TeamMember_Related_Estimated_Efforts.put(JT.Team_Member__c, estEffort);
            }
        }
    }
}

        System.debug('ModuleId_Related_JiraTask--'+ModuleId_Related_JiraTask);
        System.debug('TeamMember_Related_Estimated_Efforts--'+TeamMember_Related_Estimated_Efforts);
        if(!ModuleId_Related_JiraTask.isEmpty()){
            for(Id moduleId:ActiveProject_ModuleList.keyset()){
                list<Jira_Task__c> jtlist=ModuleId_Related_JiraTask.get(moduleId);
                 Decimal calculate_total_Estimated_effort=0;
                system.debug('jtlist--'+jtlist);
                 if(jtlist!=null){
                                for(Jira_Task__c JT:jtlist){
                                    if(JT.Estimated_Efforts__c!=null){
                                       calculate_total_Estimated_effort=calculate_total_Estimated_effort+JT.Estimated_Efforts__c; 
                                    }
                                }
                                ModuleId_Total_Jira_hours.put(moduleId,calculate_total_Estimated_effort);   
                    }
            }
        }
        System.debug('ModuleId_Total_Jira_hours--'+ModuleId_Total_Jira_hours);
        if(!ModuleId_Total_Jira_hours.isEmpty()){
            for(Id moduleId:ModuleId_Total_Jira_hours.keyset()){
                 Project_Module_ProgressWrapper PMPW=new Project_Module_ProgressWrapper();
                 PMPW.Module_Name=ActiveProject_ModuleList.get(moduleId).Name;
                 PMPW.Module_Allocated_hours=ActiveProject_ModuleList.get(moduleId).Actual_Estimated_Efforts__c!=null ? ActiveProject_ModuleList.get(moduleId).Actual_Estimated_Efforts__c:0;
                 PMPW.Total_JiraTask_Created_hours=ModuleId_Total_Jira_hours.get(moduleId)!=null ? ModuleId_Total_Jira_hours.get(moduleId):0;
                 moduleProgress.add(PMPW);
            }
        }

        if(!TeamMember_Related_Estimated_Efforts.isEmpty()){
             Map<Id,Contact> contactList=new Map<Id,Contact>([Select Id,Name From Contact Where Id=:TeamMember_Related_Estimated_Efforts.keyset()]);
             for(Id teamMemberId:TeamMember_Related_Estimated_Efforts.keyset()){
                 Resource_Hours_on_project RHP=new Resource_Hours_on_project();
                 RHP.Resource_Name=contactList.get(teamMemberId).Name;
                 RHP.Resource_Spend_hours=TeamMember_Related_Estimated_Efforts.get(teamMemberId);
                 RHPList.add(RHP);
             }
        }
        System.debug('moduleProgress--'+moduleProgress);
        System.debug('RHPList--'+RHPList);

        PMRWData.PMPWList=moduleProgress;
        PMRWData.RHOPList=RHPList;
        PMRWData.ProjectRecord=PrDetails;    
        return PMRWData;
    }

    Public class Project_Module_Resource_Wrapper{
        
        @AuraEnabled
        Public Project__c ProjectRecord{get;set;}

        @AuraEnabled
        Public List<Project_Module_ProgressWrapper> PMPWList{get;set;}

        @AuraEnabled
        Public List<Resource_Hours_on_project> RHOPList{get;set;}
    }

        Public class Project_Module_ProgressWrapper{
             @AuraEnabled
             Public String Module_Name{get;set;}
             @AuraEnabled
             Public Decimal Module_Allocated_hours{get;set;}
             @AuraEnabled
             Public Decimal Total_JiraTask_Created_hours{get;set;}
        }

        Public class Resource_Hours_on_project{
            @AuraEnabled
            Public String Resource_Name{get;set;}
             @AuraEnabled
            Public Decimal Resource_Spend_hours{get;set;}
        }

}