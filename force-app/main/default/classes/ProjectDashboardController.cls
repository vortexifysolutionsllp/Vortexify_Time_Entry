public class ProjectDashboardController {
    
    
    @AuraEnabled(cacheable=true)
    Public static projecDetailsWrapper AllprojectsData(){
        projecDetailsWrapper projectWrapperData = new projecDetailsWrapper();
        map<Id,Project__c> Allprojects= new map<Id,Project__c>([
            SELECT Account__c,Active__c,Allocated_Hour__c,CreatedById,CreatedDate,Id,IsDeleted,LastModifiedById,LastModifiedDate,LastReferencedDate,
            LastViewedDate,Name,Number_Of_Weeks__c,Percentage_Level__c,Project_End_Date__c,Project_Start_Date__c,Resource_Price_Rate__c,
            Salesforce_Products__c,SystemModstamp,Type__c FROM Project__c WHERE NAME !=null]);
        projectWrapperData.Allprojects=Allprojects.values();
        Set<id>allOrojectIds = new Set<id>();
        allOrojectIds.addAll(Allprojects.KeySet());
        list<id> newPIds= new list<id>();
        newPIds.addAll(allOrojectIds);
        projectWrapperData.projectWrapperData=getProjectData(newPIds);
        return projectWrapperData;
        
    }
    
    @AuraEnabled(cacheable=true)
    public static List<projectHealthDataFlag> getProjectData(List<Id> projectIds) {
        List<projectHealthDataFlag> projectHealthList = new List<projectHealthDataFlag>();
        // Retrieve all milestones and related modules for the given project IDs in a single query
        Map<String, Date> weekDates = getWeekStartAndEndDate(system.today());
        Date StartDateOfweek=weekDates.get('startDate');
        Date EndDateOfweek=weekDates.get('endDate');
        List<Milestone__c> allMilestonesWithModules = [
            SELECT Id, Project__c,Project__r.Name,Expected_Start_Date__c,Expected_End_Date__c,Actual_End_Date__c,Actual_Start_Date__c,Name,Name__c,
            (SELECT Id, Is_Completed__c, Module_Start_Date__c, Actual_Estimated_Efforts__c, Total_Utilised_Time__c,Project__r.Name
             FROM Modules__r WHERE Project__c !=NULL)
            FROM Milestone__c
            WHERE Project__c IN :projectIds AND Project__c !=NULL
        ];
        
        
        // Group milestones by project
        Map<Id, List<Milestone__c>> milestonesByProject = new Map<Id, List<Milestone__c>>();
        for (Milestone__c milestone : allMilestonesWithModules) {
            if (!milestonesByProject.containsKey(milestone.Project__c)) {
                milestonesByProject.put(milestone.Project__c, new List<Milestone__c>());
            }
            milestonesByProject.get(milestone.Project__c).add(milestone);
        }
        
        // Iterate over each project ID and calculate the values
        for (Id projectId : milestonesByProject.keySet()) {
            projectHealthDataFlag proHealthWrapper = new projectHealthDataFlag();
            proHealthWrapper.projectId = projectId;
            proHealthWrapper.LastJiraTask =new list<jira_Task__c>{lastTaskCreatedDate(projectId)};
                proHealthWrapper.LastEmail =lastConversation(projectId);
            list<Milestone__c> relatedMiles=milestonesByProject.get(projectId);
            if(!relatedMiles.isEmpty()){
                for(Milestone__c mls:relatedMiles){
                    if(mls.Expected_Start_Date__c!=null && mls.Expected_Start_Date__c>StartDateOfweek || mls.Expected_Start_Date__c<EndDateOfweek){
                        proHealthWrapper.MilesstoneTobeOpen=new list<Milestone__c>{mls};
                            system.debug('proHealthWrapper.MilesstoneTobeOpen---'+proHealthWrapper.MilesstoneTobeOpen);
                    } if(mls.Expected_End_Date__c!=null && mls.Expected_End_Date__c>StartDateOfweek || mls.Expected_End_Date__c<EndDateOfweek){
                        proHealthWrapper.MilesstoneTobeClose=new list<Milestone__c>{mls};
                            system.debug('proHealthWrapper.MilesstoneTobeClose---'+proHealthWrapper.MilesstoneTobeClose);
                    } if(mls.Actual_Start_Date__c!=null && mls.Actual_End_Date__c ==null){
                        proHealthWrapper.currentMilesStone=new list<Milestone__c>{mls};
                            system.debug('proHealthWrapper.MilesstoneTobeClose---'+proHealthWrapper.MilesstoneTobeClose);
                    }
                }
            }
            
            List<Milestone__c> projectMilestones = milestonesByProject.get(projectId);
            if (projectMilestones != null) {
                Integer totalModules = 0;
                Integer totalOpenModules = 0;
                Integer totalClosedModules = 0;
                Integer totalDelayedModules = 0;
                //proHealthWrapper.delayRateFlagColor='Blue'
                for (Milestone__c milestone : projectMilestones) {
                    for (Module__c module : milestone.Modules__r) {
                        proHealthWrapper.projectName=module.Project__r.Name;
                        totalModules++;
                        
                        if (!module.Is_Completed__c && module.Module_Start_Date__c != null) {
                            totalOpenModules++;
                        } else if (module.Is_Completed__c && module.Module_Start_Date__c != null) {
                            totalClosedModules++;
                        }
                        
                        if (!module.Is_Completed__c && module.Module_Start_Date__c != null && module.Actual_Estimated_Efforts__c < module.Total_Utilised_Time__c) {
                            totalDelayedModules++;
                        }
                    }
                }
                
                Decimal delayRate = totalModules > 0 ? (Decimal) totalDelayedModules / totalModules * 100 : 0;
                proHealthWrapper.totalModules = totalModules;
                proHealthWrapper.totalOpenModules = totalOpenModules;
                proHealthWrapper.totalClosedModules = totalClosedModules;
                proHealthWrapper.totalDelayedModules = totalDelayedModules;
                proHealthWrapper.delayRate = delayRate;
                proHealthWrapper.delayRateFlagColor = flagGeneratorMethod(delayRate);
                
                projectHealthList.add(proHealthWrapper);
            } else {
                // Handle projects with no milestones
                proHealthWrapper.totalModules = 0;
                proHealthWrapper.totalOpenModules = 0;
                proHealthWrapper.totalClosedModules = 0;
                proHealthWrapper.totalDelayedModules = 0;
                proHealthWrapper.delayRate = 0;
                proHealthWrapper.delayRateFlagColor = 'green';
                
                projectHealthList.add(proHealthWrapper);
            }
        }
        
        return projectHealthList;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<sObject> allProjectsDataCheck(Id recordId) {
        // Get the SObject name from the ID
        String sObjectName = getObjectApiName(recordId);
        System.debug('sObjectName---' + sObjectName);
        if (sObjectName == null) {
            System.debug('Unable to determine SObject name from the given record ID.');
        }
        // Append __c if it's a custom object
        if (!sObjectName.endsWith('__c')) {
            sObjectName += '__c';
        }
        // Construct the dynamic SOQL query
        String escapedRecordId = String.escapeSingleQuotes(recordId);
        String whereClause = ' WHERE ' + sObjectName + ' = \'' + escapedRecordId + '\'';
        String soqlQuery = 'SELECT Card_Created__c, Contact__c, CreatedById, CreatedDate, Id, IsDeleted, LastModifiedById, LastModifiedDate, ' +
            'LastReferencedDate, LastViewedDate, Name, OwnerId, Project_Name__c, Project__c, SystemModstamp, Team_Member_Name__c, ' +
            'Type__c FROM Project_Resource_Mapping__c' + whereClause;
        System.debug('SOQL Query---' + soqlQuery);
        List<sObject> sobjList = Database.query(soqlQuery);
        System.debug('sobjList---' + sobjList);
        return sobjList;
    }
    
    @AuraEnabled
    public static String getObjectApiName(Id recordId) {
        String objectApiName;
        try {
            // Get the SObjectType of the record Id
            Schema.SObjectType sObjectType = recordId.getSObjectType();
            if (sObjectType != null) {
                // Get the API name of the object
                objectApiName = sObjectType.getDescribe().getName();
            }
        } catch (Exception e) {
            // Handle any exceptions
            objectApiName = 'Error: ' + e.getMessage();
        }
        return objectApiName;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<ModulesHealthWrapper> prepareModulesData(String projectId) {
        List<ModulesHealthWrapper> moduleHealthWrapperList = new List<ModulesHealthWrapper>();
        
        // Retrieve all milestones and related modules in a single query
        // 
        List<Milestone__c> allMilestonesWithModules = [
            SELECT Id, Project__c, 
            (SELECT Id, Is_Completed__c,Name, Module_Start_Date__c, Actual_Estimated_Efforts__c, Total_Utilised_Time__c, Milestone__c, Milestone__r.Name__c, Project__c 
             FROM Modules__r)
            FROM Milestone__c 
            WHERE Project__c = :projectId
        ];
        
        // Iterate over the milestones and calculate the values
        for (Milestone__c milestone : allMilestonesWithModules) {
            for (Module__c module : milestone.Modules__r) {
                ModulesHealthWrapper moduleHealthWrapper = new ModulesHealthWrapper();
                moduleHealthWrapper.projectId = module.Project__c;
                moduleHealthWrapper.milestoneId = module.Milestone__c;
                moduleHealthWrapper.moduleId = module.Id;
                moduleHealthWrapper.milestoneName = module.Milestone__r.Name__c;
                moduleHealthWrapper.moduleName=module.Name;
                
                if (!module.Is_Completed__c && module.Module_Start_Date__c == null) {
                    moduleHealthWrapper.moduleStage = 'New';
                } else if (!module.Is_Completed__c && module.Module_Start_Date__c != null) {
                    moduleHealthWrapper.moduleStage = 'Open';
                    // moduleHealthWrapper.delayRate = module.Actual_Estimated_Efforts__c > 0 ? (Decimal) module.Total_Utilised_Time__c / module.Actual_Estimated_Efforts__c * 100 : 0;
                    moduleHealthWrapper.delayRate =(Decimal) module.Total_Utilised_Time__c / module.Actual_Estimated_Efforts__c * 100;
                    moduleHealthWrapper.delayRateFlagColor = flagGeneratorMethod(moduleHealthWrapper.delayRate);
                    
                } else if (module.Is_Completed__c && module.Module_Start_Date__c != null) {
                    moduleHealthWrapper.moduleStage = 'Completed';
                    moduleHealthWrapper.delayRate =(Decimal) module.Total_Utilised_Time__c / module.Actual_Estimated_Efforts__c * 100;
                    //moduleHealthWrapper.delayRate = module.Actual_Estimated_Efforts__c > 0 ? (Decimal) module.Total_Utilised_Time__c / module.Actual_Estimated_Efforts__c * 100 : 0;
                    moduleHealthWrapper.delayRateFlagColor = flagGeneratorMethod(moduleHealthWrapper.delayRate);
                    
                }
                
                if (!module.Is_Completed__c && module.Module_Start_Date__c != null && module.Actual_Estimated_Efforts__c < module.Total_Utilised_Time__c) {
                    moduleHealthWrapper.moduleStage = 'Delayed';
                    moduleHealthWrapper.delayRate =(Decimal) module.Total_Utilised_Time__c / module.Actual_Estimated_Efforts__c * 100;
                    //moduleHealthWrapper.delayRate =(Decimal) module.Total_Utilised_Time__c / module.Actual_Estimated_Efforts__c * 100;
                    moduleHealthWrapper.delayRateFlagColor = flagGeneratorMethod(moduleHealthWrapper.delayRate);
                }
                
                moduleHealthWrapper.expectedHours = module.Actual_Estimated_Efforts__c;
                moduleHealthWrapper.consumedHours = module.Total_Utilised_Time__c;
                //System.debug('moduleHealthWrapper---::' + moduleHealthWrapper);
                moduleHealthWrapperList.add(moduleHealthWrapper);
            }
        }
        
        System.debug('moduleHealthWrapperList---' + moduleHealthWrapperList);
        return moduleHealthWrapperList;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<jiraTaskDetailsWrapper> prepareJiraTaskRecords(Id ModuleId) {
        // Fetch Jira tasks for the given module
        system.debug('ModuleId---'+ModuleId);
        List<Jira_Task__c> jiraTaskList = [
            SELECT Id, Module__c, Priority__c, Description__c, Estimated_Efforts__c, Actual_Efforts__c, 
            Module__r.Project__c, Module__r.Project__r.Name, Task_Start_Date_Time__c, Task_End_Date_Time__c,Module__r.Name,Status__c, 
            Name, Assigned_By__c, Team_Member__c, Team_Member_Name__c, Assigned_By_Name__c,Estimated_Efforts_in_hour__c,Actual_Hours_Utilised__c
            FROM Jira_Task__c
            WHERE Module__c = :ModuleId
        ];
        
        // Group tasks by Team_Member_Name__c
        Map<String, jiraTaskDetailsWrapper> taskMap = new Map<String, jiraTaskDetailsWrapper>();
        
        for (Jira_Task__c task : jiraTaskList) {
            String teamMemberName = task.Team_Member_Name__c;
            if (!taskMap.containsKey(teamMemberName)) {
                jiraTaskDetailsWrapper wrapper = new jiraTaskDetailsWrapper();
                wrapper.projectId = task.Module__r.Project__c;
                wrapper.moduleId = task.Module__c;
                wrapper.moduleName = task.Module__r.Name;
                wrapper.JiraNumber = task.Name;
                wrapper.assignedTo = teamMemberName;
                wrapper.assignedBy = task.Assigned_By_Name__c;
                wrapper.assignedToId = task.Team_Member__c;
                wrapper.assignedById = task.Assigned_By__c;
                wrapper.Status = task.Status__c;
                wrapper.Description = task.Description__c;
                wrapper.Priority = task.Priority__c;
                wrapper.ExpectedHours = task.Estimated_Efforts_in_hour__c;
                wrapper.ConsumedHours = task.Actual_Hours_Utilised__c;
                wrapper.JiraTaskCount=1;
                taskMap.put(teamMemberName, wrapper);
                system.debug('wrapper---'+wrapper);
            } else {
                jiraTaskDetailsWrapper existingWrapper = taskMap.get(teamMemberName);
                existingWrapper.ExpectedHours += task.Estimated_Efforts_in_hour__c;
                existingWrapper.ConsumedHours += task.Actual_Hours_Utilised__c;
                existingWrapper.JiraTaskCount +=1;
                system.debug('existingWrapper---'+existingWrapper);
            }
        }
        system.debug('jiraTaskDetailsWrapper---'+new List<jiraTaskDetailsWrapper>(taskMap.values()));
        return new List<jiraTaskDetailsWrapper>(taskMap.values());
    }
    
    public Static string flagGeneratorMethod(decimal delayRate){
        if (delayRate <= 110) {
            return 'green'; // Low delay rate
        } else if (delayRate <= 120) {
            return 'yellow'; // Moderate delay rate
        } else if (delayRate <= 130) {
            return 'orange'; // High delay rate
        } else {
            return 'red'; // Very high delay rate
        }
    }
    
    //Created by Umesh
    @AuraEnabled(cacheable=true)
    public static List<Jira_Task__c> getJiraTaskRecords(Id ModuleId, Id TeamMemberId) {
        // Base query string
        String queryString = 'SELECT Id, Module__c, Priority__c, Description__c, Estimated_Efforts__c, Actual_Efforts__c, ' +
            'Module__r.Project__c, Module__r.Project__r.Name, Task_Start_Date_Time__c, Task_End_Date_Time__c, Module__r.Name, ' +
            'Status__c, Name, Assigned_By__c, Team_Member__c, Team_Member_Name__c, Assigned_By_Name__c, Estimated_Efforts_in_hour__c, ' +
            'Actual_Hours_Utilised__c, (SELECT Id, Name,Allocated_Hours__c, Consumed_Hours__c, Project__c, Project__r.Name, Jira_Task__c, Jira_Task__r.Name, Status__c, Stat_Time_date__c, End_Time_Date__c FROM Time_Entry_Line_Items__r ) FROM Jira_Task__c WHERE ';
        
        // Conditions
        List<String> conditions = new List<String>();
        
        if (ModuleId != null) {
            conditions.add('Module__c = \'' + ModuleId + '\'');
        }
        
        if (TeamMemberId != null) {
            conditions.add('Team_Member__c = \'' + TeamMemberId + '\'');
        }
        
        queryString += String.join(conditions, ' AND ');
        System.debug('queryString---' + queryString);
        // Execute query
        List<Jira_Task__c> jiraTaskList = Database.query(queryString);
        System.debug('jiraTaskList---' + jiraTaskList);
        return jiraTaskList;
    }
    @AuraEnabled(cacheable=true)
    public static Jira_Task__c lastTaskCreatedDate(Id ProjectId) {
        Jira_Task__c lastTaskCreationdate;
        try {
            List<Jira_Task__c> taskList = [SELECT Id, CreatedDate, Module__c, Module__r.Project__c, Module__r.Project__r.Name,Module_Name__c,
                                           Priority__c, Description__c, Estimated_Efforts__c, Actual_Efforts__c, Task_Start_Date_Time__c,Team_Member_Name__c,
                                           Task_End_Date_Time__c, Name,Team_Member__c,Team_Lead__c,Estimated_Start_Date__c
                                           FROM Jira_Task__c WHERE Module__r.Project__c = :ProjectId ORDER BY CreatedDate DESC LIMIT 1];
            if (!taskList.isEmpty()) {
                lastTaskCreationdate = taskList[0];
            } else {
                lastTaskCreationdate = null;
            }
        } catch (Exception e) {
            system.debug('Exception in lastTaskCreatedDate: ' + e.getMessage());
            lastTaskCreationdate = null;
        }
        system.debug('lastTaskCreationdate---' + lastTaskCreationdate);
        return lastTaskCreationdate;
    }
    @AuraEnabled
    public static EmailMessage lastConversation(Id ProjectId) {
        EmailMessage lastEmail;
        try {
            List<EmailMessage> emailList = [SELECT Id, Subject, FromAddress, ToAddress, CcAddress, TextBody, MessageDate 
                                            FROM EmailMessage WHERE RelatedToId = :ProjectId ORDER BY CreatedDate DESC LIMIT 1];
            if (!emailList.isEmpty()) {
                lastEmail = emailList[0];
            } else {
                lastEmail = null;
            }
        } catch (Exception e) {
            system.debug('Exception in lastConversation: ' + e.getMessage());
            lastEmail = null;
        }
        system.debug('lastEmail---' + lastEmail);
        return lastEmail;
    }
    
    @AuraEnabled(cacheable=true)
    public static list<SObject> getreports(){
        list<SObject> querydata;
        querydata=[SELECT Account__c,Active__c,Allocated_Hour__c,CreatedById,CreatedDate,Id,IsDeleted,LastModifiedById,LastModifiedDate,LastReferencedDate,
                   LastViewedDate,Name,Number_Of_Weeks__c,Percentage_Level__c,Project_End_Date__c,Project_Start_Date__c,Resource_Price_Rate__c,
                   Salesforce_Products__c,SystemModstamp,Type__c FROM Project__c WHERE NAME !=null];
        
        return querydata;
    }
    
    //Created by Vamsi
    @AuraEnabled(cacheable=true)
    public static Map<Id, List<Dependency__c>> getDependencies(){
        Map<Id, List<Dependency__c>> getRelatedModulesOfProject = new Map<Id, List<Dependency__c>>();
        List<Dependency__c> dependencyRecords = [select id,Module__c, Module__r.Project__c,Cleared_Date__c,Name,Depends_on__c,Description__c,Nature_of_Dependency__c,No_of_days__c from Dependency__c];
        for (Dependency__c dependRecord : dependencyRecords) {
            if(dependRecord.Module__r.Project__c != null){
                if (!getRelatedModulesOfProject.containsKey(dependRecord.Module__r.Project__c)) {
                    getRelatedModulesOfProject.put(dependRecord.Module__r.Project__c, new List<Dependency__c>());
                }
                getRelatedModulesOfProject.get(dependRecord.Module__r.Project__c).add(dependRecord);
                
            }
            
        }
        return getRelatedModulesOfProject;
    }
    
    //Created by Umesh
    @AuraEnabled(cacheable=true)
    public static list<SObject> getDependencyreports(Id recordId){
        list<SObject> querydata;
        querydata=[select id,Module__c, Module__r.Project__c,Cleared_Date__c,Name,Depends_on__c,Description__c,Nature_of_Dependency__c,No_of_days__c from Dependency__c Where Module__r.Project__c =: recordId ];
        
        return querydata;
    }
    
    //Created by Umesh
    @AuraEnabled(cacheable=true)
    public static list<Milestone__c> getMilston(ID projectId){
        list<Milestone__c> querydata;
        querydata=[SELECT Id,Name__c, Project__c,Project__r.Name,Expected_Start_Date__c,Expected_End_Date__c,Actual_End_Date__c,Actual_Start_Date__c,
                   (SELECT Id, Is_Completed__c, Module_Start_Date__c, Actual_Estimated_Efforts__c, Total_Utilised_Time__c,Project__r.Name
                    FROM Modules__r )
                   FROM Milestone__c WHERE Project__c =:projectId];
        
        return querydata;
    }
    
    //Created by Umesh
    @AuraEnabled(cacheable=true)
    public static list<projectUpdateReport> getPrepareProjectUpdateReports(){
        list<project__C> ALLpRJ= new list<project__C> ();
        list<projectUpdateReport> prepareWrapperlist = new list<projectUpdateReport>();
        //Map<Id, List<Module__c>> getRelatedModulesOfProject = getDependencyModules();
        Map<Id, List<Dependency__c>> getDependencyOfModules = getDependencies();
        Date fourDaysAfter = Date.today().addDays(3);
        Date fourDaysBefor = Date.today().addDays(-3);
        ALLpRJ=getreports();
        for(Project__c prj:ALLpRJ){
            projectUpdateReport prepareWrapper = new projectUpdateReport();
            prepareWrapper.projectId=prj.Id;
            prepareWrapper.projectName=prj.Name;
            prepareWrapper.projectStartDate=prj.Project_Start_Date__c;
            prepareWrapper.projectEndDate=prj.Project_End_Date__c;
            
            Integer totalModule = 0;
            Integer completedModule = 0;
            String moduleComplitedCont = '0/0';
            
            for(Milestone__c mil:getMilston(prj.Id)){
                if(mil.Expected_Start_Date__c >=fourDaysAfter || mil.Expected_Start_Date__c >=fourDaysBefor){
                    prepareWrapper.expectedStatus = mil.Name__c;
                } 
                if(mil.Actual_Start_Date__c >=fourDaysAfter || mil.Actual_Start_Date__c >=fourDaysBefor){
                    prepareWrapper.currentStatus = mil.Name__c;
                }
                if(mil.Modules__r != null){
                    for(Module__c mdl:mil.Modules__r){
                        totalModule++;
                        if(mdl.Is_Completed__c){
                            completedModule++;
                        }
                    }
                }
            }
            if (totalModule > 0) {
                moduleComplitedCont = completedModule + '/' + totalModule;
            }
            prepareWrapper.completedModule = moduleComplitedCont;
            
            Integer TotalDependencies = 0;
            Integer CompletedDependencies = 0;
            if(getDependencyOfModules.get(prj.Id) != null){
                for(Dependency__c dependency :getDependencyOfModules.get(prj.Id)){
                    TotalDependencies += 1;
                    
                    if(dependency.Cleared_Date__c != null){
                        CompletedDependencies += 1;
                    }
                }
                String finalDependency;
                if (TotalDependencies > 0) {
                    finalDependency = CompletedDependencies + '/' + TotalDependencies;
                }
                prepareWrapper.noOfDependencies = finalDependency;
            }
            
            prepareWrapperlist.add(prepareWrapper);
        }
        System.debug('prepareWrapperlist==>'+prepareWrapperlist);
        return prepareWrapperlist;
    }
    
    public static Map<String, Date> getWeekStartAndEndDate(Date givenDate) {
        // Get the day of the week for the given date (Sunday = 1, Saturday = 7)
        Integer dayOfWeek = givenDate.toStartOfWeek().day() - givenDate.day();
        
        // Calculate the start date (Sunday) and end date (Saturday) of the week
        Date startDate = givenDate.addDays(-dayOfWeek);
        Date endDate = startDate.addDays(6);
        
        // Create a map to hold the start and end dates
        Map<String, Date> weekDates = new Map<String, Date>();
        weekDates.put('startDate', startDate);
        weekDates.put('endDate', endDate);
        return weekDates;
    }
    
    Public class projecDetailsWrapper{
        @AuraEnabled
        Public list<Project__c> Allprojects{get;set;}
        @AuraEnabled
        Public list<Milestone__c> allMilestonesWithModules{get;set;}
        @AuraEnabled
        Public list<Jira_Task__c> allJiraTaks{get;set;}
        @AuraEnabled
        Public list<projectHealthDataFlag> projectWrapperData{get;set;}
        
    }
    
    //Created by Umesh
    public class projectUpdateReport{
        @AuraEnabled
        Public Id projectId{get;set;}
        @AuraEnabled
        Public String projectName{get;set;}
        @AuraEnabled
        Public Date projectStartDate{get;set;}
        @AuraEnabled
        Public Date projectEndDate{get;set;}
        @AuraEnabled
        Public String expectedStatus{get;set;}
        @AuraEnabled
        Public String currentStatus{get;set;}
        @AuraEnabled
        Public String completedModule{get;set;}
        @AuraEnabled
        Public String noOfDependencies{get;set;}
        
    }
    
    public class projectHealthDataFlag{
        @AuraEnabled
        Public Id projectId{get;set;}
        @AuraEnabled
        Public String projectName{get;set;}
        @AuraEnabled
        Public integer totalModules{get;set;}
        @AuraEnabled
        Public integer totalOPenModules{get;set;}
        @AuraEnabled
        Public integer totalClosedModules{get;set;}
        @AuraEnabled
        Public integer totalDelayedModules{get;set;}
        @AuraEnabled
        Public String projectStatus{get;set;}
        @AuraEnabled
        Public integer projectFlag{get;set;}
        @AuraEnabled
        Public String delayRateFlagColor{get;set;}
        @AuraEnabled
        Public Double delayRate{get;set;}
        @AuraEnabled
        Public list<Milestone__c> MilesstoneTobeClose{get;set;}
        @AuraEnabled
        Public list<Milestone__c> MilesstoneTobeOpen{get;set;}
        @AuraEnabled
        Public list<Milestone__c> currentMilesStone{get;set;}
        @AuraEnabled
        Public list<Jira_Task__c> LastJiraTask{get;set;}  
        @AuraEnabled
        Public EmailMessage LastEmail{get;set;} 
        
    }
    
    public class modulesHealthWrapper{
        @AuraEnabled
        Public Id projectId{get;set;}  
        @AuraEnabled
        Public Id moduleId{get;set;}
        @AuraEnabled
        Public Id mileStoneId{get;set;}  
        @AuraEnabled
        Public String MileStoneName{get;set;}
        @AuraEnabled
        Public String moduleName{get;set;}  
        @AuraEnabled
        Public String moduleStage{get;set;}
        @AuraEnabled
        Public String moduleFlag{get;set;}
        @AuraEnabled
        Public String delayRateFlagColor{get;set;}
        @AuraEnabled
        Public Double delayRate{get;set;}
        @AuraEnabled
        Public Double ExpectedHours{get;set;}
        @AuraEnabled
        Public Double ConsumedHours{get;set;}
        
    }
    
    public class jiraTaskDetailsWrapper{
        @AuraEnabled
        Public Id projectId{get;set;}  
        @AuraEnabled
        Public Id moduleId{get;set;}
        @AuraEnabled
        Public Double ConsumedHours{get;set;}
        @AuraEnabled
        Public Double delayRate{get;set;}
        @AuraEnabled
        Public Double ExpectedHours{get;set;}
        @AuraEnabled
        Public String moduleName{get;set;}    
        @AuraEnabled
        Public String assignedTo{get;set;}  
        @AuraEnabled
        Public String assignedBy{get;set;} 
        @AuraEnabled
        Public Id assignedToId{get;set;}  
        @AuraEnabled
        Public Id assignedById{get;set;}  
        @AuraEnabled
        Public String Status{get;set;}  
        @AuraEnabled
        Public String Priority{get;set;} 
        @AuraEnabled
        Public String JiraNumber{get;set;} 
        @AuraEnabled
        Public String Description{get;set;}
        @AuraEnabled
        Public integer JiraTaskCount{get;set;}
        
    }
    
    
}