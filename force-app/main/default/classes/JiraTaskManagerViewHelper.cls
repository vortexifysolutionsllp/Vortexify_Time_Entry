global  without sharing class JiraTaskManagerViewHelper{
   
    @AuraEnabled
public static String checkInAttendance(Id contactId) {
    try {
        Date today = date.today();
        System.debug('today--> ' + today);
        // 1. Fetch today's DayAttendance record
        DayAttendance__c dayAtt = [
            SELECT Id,
                   Day_Status__c,
                   FirstCheckIn__c,
                   CheckinCount__c,
                   IsHoliday__c,
                   IsWeekend__c
            FROM DayAttendance__c
            WHERE Employee__c = :contactId
            AND Date__c = :today
            LIMIT 1
        ];

        // 2. Do not allow check-in on Holiday / Weekend
        if (dayAtt.IsHoliday__c) {
            return 'Today is a holiday. Check-in not allowed.';
        }
        if (dayAtt.IsWeekend__c) {
            return 'Today is a weekend. Check-in not allowed.';
        }

        // 3. Create Checkin record

        Checkin__c checkin = new Checkin__c();
        checkin.Employee__c = contactId;
        checkin.DayAttendance__c = dayAtt.Id;
        checkin.Checkin_Time__c = System.now();

        insert checkin;

        // 4. Update DayAttendance
        if (dayAtt.FirstCheckIn__c == null) {
            dayAtt.FirstCheckIn__c = checkin.Checkin_Time__c;
        }

        dayAtt.Day_Status__c = 'Present';
        dayAtt.CheckinCount__c =
            (dayAtt.CheckinCount__c == null ? 1 : dayAtt.CheckinCount__c + 1);

        update dayAtt;

        return 'Check-in successful.';
    }
    catch (QueryException qe) {
        return 'Attendance record not found for today. Please contact HR.';
    }
    catch (Exception e) {
        throw new AuraHandledException('Error during check-in: ' + e.getMessage());
    }
}


@AuraEnabled
public static String checkOutAttendance(Id contactId) {
    try {
        Date today = Date.today();
        List<DayAttendance__c> dayAtt = [
            SELECT Id,
                   Day_Status__c,
                   FirstCheckIn__c,
                   CheckinCount__c,
                   LastCheckOut__c,
                   IsHoliday__c,
                   IsWeekend__c
            FROM DayAttendance__c
            WHERE Employee__c = :contactId
            AND Date__c = :today
            LIMIT 1
        ];

        if (dayAtt.isEmpty()) {
            return 'No check-in found for today. Please check in first.';
        }

        DayAttendance__c att = dayAtt[0];

        if (att.LastCheckOut__c != null) {
            return 'You have already checked out today.';
        }

        // Perform check-out
        att.LastCheckOut__c =  System.now();
        update att;
        return 'Check-out successful.';
    } catch (Exception e) {
        throw new AuraHandledException('Error during check-out: ' + e.getMessage());
    }
}
    @AuraEnabled
    public static List<RecordsData> fetchRecords(String objectName, String filterField, String searchString, String value, string contactType){
        try{
            system.debug('objectName-->' + objectName);
            system.debug('filterField-->' + filterField);
            system.debug('searchString-->' + searchString);
            system.debug('value-->' + value);
            system.debug('contactType-->' + contactType);
            List<RecordsData> recordsDataList = new List<RecordsData>();
            String query = 'SELECT Id, ' + filterField + ' FROM ' + objectName;
            if (String.isNotBlank(value)){
                query += ' WHERE Id = \'' + value + '\'  AND  ' + filterField + 
                    ' LIKE ' + '\'' + String.escapeSingleQuotes(searchString.trim()) + '%\' LIMIT 49999';
            } else if (String.isNotBlank(contactType) && string.isNotEmpty(contactType) && contactType == 'teamLead'){
                query += ' WHERE Role__c = \'Team Lead\'  AND  ' + filterField + 
                    ' LIKE ' + '\'' + String.escapeSingleQuotes(searchString.trim()) + '%\' LIMIT 49999';   
            } else if (String.isNotBlank(contactType) && string.isNotEmpty(contactType) && contactType != 'teamLead'){
                system.debug('Coming Here @ 17');
                query += ' WHERE (Role__c = \'Developer\' or Role__c = \'Quality Analyst\' or Role__c = \'Team Lead\')  AND  ' + filterField + 
                    ' LIKE ' + '\'' + String.escapeSingleQuotes(searchString.trim()) + '%\' LIMIT 49999';   
            } else{
                system.debug('Coming Here @ 20');
                if(objectName == 'Contact'){
                    query += ' WHERE recordtypeId = \'0122v000001SwBrAAK\' AND  ' + filterField + 
                        ' LIKE ' + '\'' + String.escapeSingleQuotes(searchString.trim()) + '%\' LIMIT 49999';    
                }else{
                    query += ' WHERE ' + filterField + 
                        ' LIKE ' + '\'' + String.escapeSingleQuotes(searchString.trim()) + '%\' LIMIT 49999';    
                }
            }
            system.debug('query'+query);
            for (SObject s : Database.query(query)){
                recordsDataList.add(new RecordsData((String) s.get(filterField), (String) s.get('id')));
            }
            return recordsDataList;
        } catch (Exception err){
            if (String.isNotBlank(err.getMessage()) && err.getMessage().contains('error:')){
                throw new AuraHandledException(err.getMessage().split('error:')[1].split(':')[0] + '.');
            } else{
                throw new AuraHandledException(err.getMessage());
            }
        }
    }
    
    @AuraEnabled
    public static List<Contact> fetchTeamMember(String searchString,String projectId){
        try{
            system.debug('running'+projectId);
            List<Contact> ConList = new List<Contact>();
            //projectID = 'a1L6D000001XhETUA0';
            List<String> contactIds = new List<String>();
            if(projectId != null){
                List<Project_Resource_Mapping__c> PRMlist = [SELECT Contact__c FROM Project_Resource_Mapping__c WHERE Project__c = :projectId];
                for(Project_Resource_Mapping__c prm:PRMlist){
                    contactIds.add(prm.Contact__c);
                }  
                ConList  = [SELECT Id,Name FROM Contact WHERE Id IN :contactIds AND Name Like :searchString+'%' LIMIT 4999];
            }else{
                ConList = [SELECT Id,Name FROM Contact WHERE Name Like :searchString+'%' LIMIT 4999];
            }
            
            
            system.debug('ConList'+ConList);
            return ConList;
        } catch (Exception err){
            if (String.isNotBlank(err.getMessage()) && err.getMessage().contains('error:')){
                throw new AuraHandledException(err.getMessage().split('error:')[1].split(':')[0] + '.');
            } else{
                throw new AuraHandledException(err.getMessage());
            }
        }
    }
    
    @AuraEnabled
    public static List<RecordsData> fetchModulesFromProjName(String objectName, String filterField, String searchString, String value, string contactType){
        try{
            
            //value = 'a1L6D000001WFaGUAW';
            List<RecordsData> recordsDataList = new List<RecordsData>();
            String query = '';
            
            if (objectName == 'Module__c'){
                query = 'SELECT Id  ,' + filterField + ' FROM ' + objectName;
                
                query += ' WHERE ' + filterField + 
                    ' LIKE ' + '\'' + String.escapeSingleQuotes(searchString.trim()) + '%\' AND Project__c = :value LIMIT 49999';
                
                system.debug('Query is ' + query);
                
                for (SObject s : Database.query(query)){
                    recordsDataList.add(new RecordsData((String) s.get('Name'), (String) s.get('id')));
                }
            } else{
                query = 'SELECT Id  ,' + filterField + ' FROM ' + objectName;
                if (String.isNotBlank(value)){
                    query += ' WHERE Id = \'' + value + '\' LIMIT 49999';
                } else{
                    query += ' WHERE ' + filterField + 
                        ' LIKE ' + '\'' + String.escapeSingleQuotes(searchString.trim()) + '%\' LIMIT 49999';
                }
                system.debug('Query is ' + query);
                
                for (SObject s : Database.query(query)){
                    recordsDataList.add(new RecordsData((String) s.get(filterField), (String) s.get('id')));
                }
            }
            system.debug(recordsDataList);
            return recordsDataList;
        } catch (Exception err){
            system.debug('Exception is ' + err.getMessage() + '@ line' + err.getLineNumber());
            if (String.isNotBlank(err.getMessage()) && err.getMessage().contains('error:')){
                throw new AuraHandledException(err.getMessage().split('error:')[1].split(':')[0] + '.');
            } else{
                throw new AuraHandledException(err.getMessage());
            }
        }
    }
    
    @AuraEnabled
    public static List<Jira_Task__c> getTaskData(string projectid, string employee, Date endDate, Date StartDate, string teamLeadId, Integer pageSize, Integer pageNumber , String ConId , Boolean pageLoadData){
        system.debug('ConId'+ConId);
        system.debug('employee-->'+employee);
        Contact ConRec = [Select Id,Contact_Role__c,Role__c from contact where id = :ConId];
        List<Jira_Task__c> jiraTaskList = new List<Jira_Task__c>();
        Map<String, string> idByValueMap = new Map<string, string>();
        string whereClause ='';
        string query ='';
        Integer offset = (pageNumber - 1) * pageSize;
        system.debug('offset'+offset);
        
        if(String.isNotBlank(projectid)){
            idByValueMap.put(projectid, 'Module__r.Project__c');
        }
        if(String.isNotBlank(employee)){
            idByValueMap.put(employee, 'Team_Member__c');
        }
        if(endDate != null){
            idByValueMap.put(string.valueOf(endDate), 'Task_End_Date__c');
        }
        if(StartDate != null){
            idByValueMap.put(string.valueOf(StartDate), 'Task_Start_Date__c');
        }
        if(String.isNotBlank(teamLeadId)){
            idByValueMap.put(teamLeadId, 'Assigned_By__c');
        }
        system.debug('idByValueMap-->'+idByValueMap);
        if(!idByValueMap.isEmpty()){
            for(string keys : idByValueMap.keyset()){
                if(idByValueMap.get(keys) == 'Task_Start_Date__c' || idByValueMap.get(keys) == 'Task_End_Date__c'){
                    whereClause += idByValueMap.get(keys)+' = '+keys+' AND ';
                }/*else if(keys == system.label.All_Project_Id){
                    
                }else if(idByValueMap.get(keys) == 'Team_Member__c'){
system.debug('Inside Team Member-->'+idByValueMap.get(keys));
whereClause += idByValueMap.get(keys)+' = '+keys+' OR Stand_By_Resource__c = '+keys;
}*/else{
    whereClause += idByValueMap.get(keys)+' =\''+keys+'\' AND ';
}
            }
        }
        system.debug('idByValueMap::size('+idByValueMap.size());
        system.debug('whereClause-->'+whereClause);
        if(pageLoadData == false){
            if(!string.isEmpty(whereClause)){
                whereClause = whereClause.removeEnd('AND');
                whereClause = whereClause.substring(0, whereClause.length() - 4);
                system.debug('whereClause-->'+whereClause);
                
                if(ConRec.Role__c != 'Project Manager'){
                    whereClause = whereClause + ' AND Assigned_By__c = :ConId ';
                    query = 'SELECT Actual_Efforts__c,Estimated_Start_Date__c,Project_Name__c,Stand_By_Resource_Name__c,Task_Start_Time__c,Total_Utilised_Time__c,Team_Member_Name__c,Module_Name__c,CreatedById,Team_Member__r.Name,CreatedDate,Description__c,Estimated_Efforts__c,Extension_Reason__c,Id,IsDeleted,LastModifiedById,LastModifiedDate,LastReferencedDate,LastViewedDate,Module__c,Is_Overdue__c,Assigned_By_Name__c,Name,OwnerId,Priority__c,Project_Resource_Mapping__c,Solution_Details_if_any__c,Status__c,SystemModstamp,Task_End_Date_Time__c,Task_Start_Date_Time__c,Task_Start_Date__c,Task_End_Date__c,Team_Member__c FROM Jira_Task__c where ' + whereClause+'ORDER BY Task_Start_Date__c DESC Nulls Last LIMIT :pageSize OFFSET :offset';
                }else{
                    query = 'SELECT Actual_Efforts__c,Project_Name__c,Estimated_Start_Date__c,Total_Utilised_Time__c,Task_Start_Time__c,Stand_By_Resource_Name__c,Team_Member_Name__c,Module_Name__c,CreatedById,Team_Member__r.Name,CreatedDate,Description__c,Estimated_Efforts__c,Extension_Reason__c,Id,IsDeleted,LastModifiedById,LastModifiedDate,LastReferencedDate,LastViewedDate,Module__c,Is_Overdue__c,Assigned_By_Name__c,Name,OwnerId,Priority__c,Project_Resource_Mapping__c,Solution_Details_if_any__c,Status__c,SystemModstamp,Task_End_Date_Time__c,Task_Start_Date_Time__c,Task_Start_Date__c,Task_End_Date__c,Team_Member__c FROM Jira_Task__c where ' + whereClause+'ORDER BY Task_Start_Date__c DESC Nulls Last LIMIT :pageSize OFFSET :offset';
                }
                
            }else{
                if(ConRec.Role__c != 'Project Manager'){
                    query = 'SELECT Actual_Efforts__c,Project_Name__c,Estimated_Start_Date__c,Total_Utilised_Time__c,Task_Start_Time__c,Team_Member_Name__c,Module_Name__c,Stand_By_Resource_Name__c,CreatedById,Team_Member__r.Name,CreatedDate,Description__c,Estimated_Efforts__c,Extension_Reason__c,Id,IsDeleted,LastModifiedById,LastModifiedDate,LastReferencedDate,LastViewedDate,Module__c,Is_Overdue__c,Assigned_By_Name__c,Name,OwnerId,Priority__c,Project_Resource_Mapping__c,Solution_Details_if_any__c,Status__c,SystemModstamp,Task_End_Date_Time__c,Task_Start_Date_Time__c,Task_Start_Date__c,Task_End_Date__c,Team_Member__c FROM Jira_Task__c where Assigned_By__c = :ConId ORDER BY Task_Start_Date__c DESC Nulls Last LIMIT :pageSize OFFSET :offset';
                }else{
                    query = 'SELECT Actual_Efforts__c,Project_Name__c,Estimated_Start_Date__c,Total_Utilised_Time__c,Task_Start_Time__c,Team_Member_Name__c,Module_Name__c,Stand_By_Resource_Name__c,CreatedById,Team_Member__r.Name,CreatedDate,Description__c,Estimated_Efforts__c,Extension_Reason__c,Id,IsDeleted,LastModifiedById,LastModifiedDate,LastReferencedDate,LastViewedDate,Module__c,Is_Overdue__c,Assigned_By_Name__c,Name,OwnerId,Priority__c,Project_Resource_Mapping__c,Solution_Details_if_any__c,Status__c,SystemModstamp,Task_End_Date_Time__c,Task_Start_Date_Time__c,Task_Start_Date__c,Task_End_Date__c,Team_Member__c FROM Jira_Task__c ORDER BY Task_Start_Date__c DESC Nulls Last LIMIT :pageSize OFFSET :offset';   
                }
                
            }
        }else{
            system.debug('Coming here @ 186');
            String status = 'In Progress';
            if(ConRec.Role__c != 'Project Manager'){
                query = 'SELECT Actual_Efforts__c,Project_Name__c,Estimated_Start_Date__c,Total_Utilised_Time__c,Task_Start_Time__c,Team_Member_Name__c,Module_Name__c,Stand_By_Resource_Name__c,CreatedById,Team_Member__r.Name,CreatedDate,Description__c,Estimated_Efforts__c,Extension_Reason__c,Id,IsDeleted,LastModifiedById,LastModifiedDate,LastReferencedDate,LastViewedDate,Module__c,Is_Overdue__c,Assigned_By_Name__c,Name,OwnerId,Priority__c,Project_Resource_Mapping__c,Solution_Details_if_any__c,Status__c,SystemModstamp,Task_End_Date_Time__c,Task_Start_Date_Time__c,Task_Start_Date__c,Task_End_Date__c,Team_Member__c FROM Jira_Task__c where Assigned_By__c = :ConId ORDER BY Task_Start_Date__c DESC Nulls Last LIMIT :pageSize OFFSET :offset';
            }else{
                query = 'SELECT Actual_Efforts__c,Project_Name__c,Estimated_Start_Date__c,Total_Utilised_Time__c,Task_Start_Time__c,Team_Member_Name__c,Module_Name__c,Stand_By_Resource_Name__c,CreatedById,Team_Member__r.Name,CreatedDate,Description__c,Estimated_Efforts__c,Extension_Reason__c,Id,IsDeleted,LastModifiedById,LastModifiedDate,LastReferencedDate,LastViewedDate,Module__c,Is_Overdue__c,Assigned_By_Name__c,Name,OwnerId,Priority__c,Project_Resource_Mapping__c,Solution_Details_if_any__c,Status__c,SystemModstamp,Task_End_Date_Time__c,Task_Start_Date_Time__c,Task_Start_Date__c,Task_End_Date__c,Team_Member__c FROM Jira_Task__c ORDER BY Task_Start_Date__c DESC Nulls Last LIMIT :pageSize OFFSET :offset';   
            }
        }
        
        system.debug('query-->'+query);
        jiraTaskList = database.query(query);
        return jiraTaskList;
    }
    
    @AuraEnabled
    public static list<ProjectTaskListWrapper> getTaskDetails(string projectid, string employee, Date endDate, Date StartDate, string teamLeadId){
        //CreateProjectTaskList.getDetails(projectid, employee, endDate, StartDate, teamLeadId)
        system.debug('Project Id ====> ' + ProjectId);
        system.debug('Project Lead Id ====> ' + teamLeadId);
        system.debug('Project TeamMate Id ====> ' + employee);
        system.debug('Start date ====> ' + StartDate);
        system.debug('End date ====> ' + EndDate);
        Map<Id, Jira_Task__c> jiraTaskByJiraIdMap = new Map<Id, Jira_Task__c>();
        Map<id, Time_Entry_Line_Items__c> timeEntryRecByJiraIdMap = new Map<id, Time_Entry_Line_Items__c>();
        list<Jira_Task__c> jiraTaskList = new list<Jira_Task__c>();
        list<ProjectTaskListWrapper> wrapperlist = new list<ProjectTaskListWrapper>();
        List<Time_Entry_Line_Items__c> timeEntryLineItemList = new List<Time_Entry_Line_Items__c>();
        
        timeEntryLineItemList = [Select id, Project__c, Jira_Task__c, Status__c, Project_Resource_Mapping__r.Contact__c, Is_Over_Due__c, Allocated_Hours__c, Consumed_Hours__c, Project_Resource_Mapping__r.Project__c, Time_Entry_Daily_Card__r.Time_Entry_Weekly_Card__r.Time_Entry_Monthly_Card__r.Company_Employee__c
                                 from Time_Entry_Line_Items__c where Time_Entry_Daily_Card__r.Time_Entry_Weekly_Card__r.Time_Entry_Monthly_Card__r.Company_Employee__c = :employee];
        
        
        jiraTaskList = [Select id, Module__c, Priority__c, Description__c, Estimated_Efforts__c, Actual_Efforts__c, Module__r.Project__c, Module__r.Project__r.Name, Task_Start_Date_Time__c, Task_End_Date_Time__c, Name
                        from Jira_Task__c
                        where Module__r.Project__c = :projectid AND Task_Start_Date_Time__c > :StartDate AND Task_End_Date_Time__c < :endDate];
        
        if (!timeEntryLineItemList.isEmpty()){
            for (Time_Entry_Line_Items__c telm : timeEntryLineItemList){
                timeEntryRecByJiraIdMap.put(telm.Jira_Task__c, telm);
            }
        }
        if (!jiraTaskList.isEmpty()){
            for (Jira_Task__c jt : jiraTaskList){
                jiraTaskByJiraIdMap.put(jt.id, jt);
            }
        }
        if (!timeEntryRecByJiraIdMap.isEmpty()){
            for (Jira_Task__c jt : jiraTaskByJiraIdMap.values()){
                ProjectTaskListWrapper wr = new ProjectTaskListWrapper();
                wr.JiraId = jt.name;
                wr.ModuleName = jt.Module__c;
                wr.TaskDescription = jt.Description__c;
                if (timeEntryRecByJiraIdMap.containsKey(jt.Id))
                    wr.TeamMember = timeEntryRecByJiraIdMap.get(jt.Id).Project_Resource_Mapping__r.Contact__c;
                wr.ProjectName = jt.Module__r.Project__r.Name;
                if (timeEntryRecByJiraIdMap.containsKey(jt.Id)){
                    wr.EstimatedEffort = timeEntryRecByJiraIdMap.get(jt.Id).Allocated_Hours__c;
                    if (timeEntryRecByJiraIdMap.get(jt.Id).Consumed_Hours__c != null)
                        // In above line we are checking if consumed houre not null then we go further
                        wr.ActualEfforts = timeEntryRecByJiraIdMap.get(jt.Id).Consumed_Hours__c;
                    wr.IsOverDue = timeEntryRecByJiraIdMap.get(jt.Id).Is_Over_Due__c;
                    wr.Status = timeEntryRecByJiraIdMap.get(jt.Id).Status__c;
                }
                wrapperlist.add(wr);
                
            }
            system.debug('Actual Record is ===>>' + wrapperlist);
            system.debug('Actual Record is ===>>' + jiraTaskList);
        }
        return wrapperlist;
    }
    
    @AuraEnabled
    public static void getJiraTaskDetails(string projectid, string projectleadid, string teammateid, List<Jira_Task__c> jiraTaskList){
        system.debug('Project Id ====> ' + projectid);
        system.debug('Project Lead Id ====> ' + projectleadid);
        system.debug('Team Mate Id ====> ' + teammateid);
        system.debug('Jira Task Id ====> ' + jiraTaskList);
    }
    
    @AuraEnabled
    public static void displayContacts(){
        List<Contact> con = [Select id, name, Course__c, Role__c
                             from Contact];
        for (Contact c : con){
            if (con.size() > 1){
                System.debug('hii' + c.Course__c);
            }
        }
    }
    
    @AuraEnabled
    public Static List<String> getPicklitValueFromSobject(Sobject objObject, String fieldName){
        system.debug('objObject --->' + objObject);
        system.debug('fieldName --->' + fieldName);
        try{
            List<String> allPickValues = new List<String>();
            Schema.SObjectType SobjType = objObject.getSObjectType();
            Schema.DescribeSObjectResult objDescribe = SobjType.getDescribe();
            Map<String, Schema.SObjectField> fieldMap = objDescribe.fields.getMap();
            List<Schema.PicklistEntry> pickListValues = fieldMap.get(fieldName).getDescribe().getPickListValues();
            for (Schema.PicklistEntry pic : pickListValues){
                allPickValues.add(pic.getValue());
            }
            System.debug('allPickValues ::' + allPickValues);
            allPickValues.sort ();
            return allPickValues;
        } catch (Exception e){
            System.debug('The Error Message ::' + e.getMessage() + '# AND The Error Line ::' + e.getLineNumber());
        }
        return null;
    }
    
    @AuraEnabled
    public Static List<Jira_Task__c> SaveRecordJira(String ProjectId, String TeamLeadId, String TeamMateId, List<Jira_Task__c> jiraTaskListRec,List<Jira_Task__c> updatedjiraTaskList){
        //projectId : Get all the related PRM
        //tag the PRM Id corresponding to the Team Member in the Jira task..
        system.debug('updatedjiraTaskList'+updatedjiraTaskList);
        
        for(Jira_Task__c jt : updatedjiraTaskList){
            jt.Task_Start_Date_Time__c = roundToNextHour(jt.Task_Start_Date_Time__c).addMinutes(0);
            jt.Task_End_Date_Time__c = roundToNextHour(jt.Task_End_Date_Time__c).addMinutes(0);
            Long hours = updateRelateTime(jt.Task_End_Date_Time__c,jt.Task_Start_Date_Time__c);
            if(hours > 10 ){
                if( hours/24 > 1){
                    Integer numberOfTasks = integer.valueOf(hours/24);
                    hours = hours - 24*(14);
                }
            }
            
            jt.Estimated_Efforts__c =  hours ; 
        }
        update updatedjiraTaskList;
        
        system.debug('PRM - Id'+jiraTaskListRec);
        List<Jira_Task__c> newjiraTaskListRec = new List<Jira_Task__c>();
        for(Jira_Task__c jt : jiraTaskListRec){
            if(jt.Id == null){
                newjiraTaskListRec.add(jt);    
            }
        }
        map<String,List<Project_Resource_Mapping__c>> PRMIdsByProjectIDs = new map<String,List<Project_Resource_Mapping__c>>();
        List<String> ModuleIds = new List<String>();
        List<String> ProjectIds = new List<String>();
        map<String,String> projectIDsBymoduleIds = new map<String,String>();
        map<String,map<String,String>> PrmIdByConIDByProjectID = new map<String,map<String,String>>();
        map<Id, Id> PRMIdByModuleId = new map<Id, ID>();
        for (Jira_Task__c jt : newjiraTaskListRec){
            ModuleIds.add(jt.Module__c);
        }
        
        List<Module__c> ModuleList = [Select id, Name, Project_Resource_Mapping__c,Project__c from Module__c where Id IN:ModuleIds];
        for(Module__c md : ModuleList){
            ProjectIds.add(md.Project__c);
            projectIDsBymoduleIds.put(md.Id,md.Project__c);
        }
        
        List<Project__c> ProjectData = [SELECT Id,(SELECT Contact__c,Id,Name,Project__c,Type__c FROM Project_Resource_Mapping__r) FROM Project__c where Id IN :ProjectIds]; 
        for(Project__c prj:ProjectData){
            for(Project_Resource_Mapping__c prm :prj.Project_Resource_Mapping__r){
                
                if(PrmIdByConIDByProjectID.containskey(prj.Id)){
                    PrmIdByConIDByProjectID.get(prj.Id).put(prm.Contact__c , prm.Id);
                }else{
                    map<String,String> newmap = new map<String,String>();
                    newmap.put(prm.Contact__c , prm.Id);
                    PrmIdByConIDByProjectID.put(prj.Id,newmap);
                }
            }
        }
        
        for (Jira_Task__c jt : newjiraTaskListRec){
            if(jt.Team_Member__c != null && String.isNotBlank(jt.Team_Member__c)){
                jt.Project_Resource_Mapping__c = PrmIdByConIDByProjectID.get(projectIDsBymoduleIds.get(jt.Module__c)).get(jt.Team_Member__c);    
            }
        }
        system.debug(newjiraTaskListRec);
        upsert newjiraTaskListRec;
        
        newjiraTaskListRec = [Select id ,Task_Start_Date_Time__c , Task_End_Date_Time__c , Project_Name__c ,Stand_By_Resource_Name__c,Estimated_Start_Date__c, name ,Solution_Details_if_any__c,Description__c, Assigned_By_Name__c , Module_Name__c , Estimated_Efforts__c ,Team_Member_Name__c , Priority__c from Jira_Task__c where id in :jiraTaskListRec];
        
        for(Jira_Task__c jt : newjiraTaskListRec){
            jt.Task_Start_Date_Time__c = jt.Task_Start_Date_Time__c.addMinutes(0);
            jt.Task_End_Date_Time__c = jt.Task_End_Date_Time__c.addMinutes(0);
        }
        return newjiraTaskListRec;
    }
    
    public Static DateTime roundToNextHour(DateTime dt) {
        if (dt == null) {
        // Handle null input safely – return current datetime or throw a meaningful exception
        return DateTime.now(); // or: throw new NullPointerException('Input datetime is null');
    }

        system.debug('dt'+dt.minute());
        if(dt.minute() == 15){
            return dt.addHours(1).addMinutes(-15);
        }else if(dt.minute() == 30){
            return dt.addHours(1).addMinutes(-30);
        }else if(dt.minute() == 45){
            return dt.addHours(1).addMinutes(+15);
        }else{
            return dt;
        }
    }
    
    @AuraEnabled
    public static List<Jira_Task__c> fetchJiraTasks(Id assigneeId , date DateValue){
        if(DateValue == null){
            DateValue = system.today();
        }
        List<Jira_Task__c> newjiraTaskListRec = [Select id ,Task_Start_Date_Time__c ,Status__c, Task_End_Date_Time__c , Project_Name__c ,Stand_By_Resource_Name__c,Estimated_Start_Date__c, name ,Solution_Details_if_any__c,Description__c, Assigned_By_Name__c , Module_Name__c , Estimated_Efforts__c ,Team_Member_Name__c , Priority__c from Jira_Task__c where Assigned_By__c = :assigneeId AND Task_Start_Date__c = :DateValue];
        for(Jira_Task__c jt : newjiraTaskListRec){
            jt.Task_Start_Date_Time__c = jt.Task_Start_Date_Time__c.addMinutes(330);
            jt.Task_End_Date_Time__c = jt.Task_End_Date_Time__c.addMinutes(330);
        }
        
        return  newjiraTaskListRec;
    }
    
    @AuraEnabled
    public static Id SaveFiletoJira(Id parentId, String fileName, String base64Data, String contentType){
        system.debug('parentId' + parentId + 'fileName' + fileName);
        base64Data = EncodingUtil.urlDecode(base64Data, 'UTF-8');
        Attachment attach = new Attachment();
        attach.parentId = parentId;
        attach.Body = EncodingUtil.base64Decode(base64Data);
        attach.Name = fileName;
        attach.ContentType = contentType;
        Insert attach;
        return attach.Id;
    }
    
    Public static Long updateRelateTime(dateTime dt1 , datetime dt2){
        
        Long dt1Long = dt1.getTime();
        Long dt2Long = dt2.getTime();
        Long milliseconds =  dt1Long - dt2Long;
        Long seconds = milliseconds / 1000;
        Long minutes = seconds / 60;
        Long hours = minutes / 60;
        system.debug('hours'+hours);
        return hours;
        //Long days = hours / 24;
        
    }
    
    @AuraEnabled
    public static mainCompData getConDetails(String ConId){
        system.debug('ConId' + ConId );
        Date today = Date.today();

        // 1. Fetch today's DayAttendance record
        List<DayAttendance__c> dayAtt = [
            SELECT Id,
                   Day_Status__c,
                   FirstCheckIn__c,
                   CheckinCount__c,
                   LastCheckOut__c,
                   IsHoliday__c,
                   IsWeekend__c
            FROM DayAttendance__c
            WHERE Employee__c = :ConId
            AND Date__c = :today
            AND FirstCheckIn__c != null
            LIMIT 1
        ];
        Contact ConDetails = [Select id ,Contact_Role__c ,Role__c,  name from Contact where id = :ConId ];
        //Project Data
        List<Project__c> projectList = [SELECT Id,Active__c FROM Project__c];
        List<Project__c> ActiveProjectList = [SELECT Id,Active__c FROM Project__c where Active__c = true];
        
        //Contact Data
        List<Contact> totalResources = [SELECT Id FROM Contact where RecordTypeId = '0126D000002gYqAQAU'];
        List<Contact> ActiveResources = [SELECT Id FROM Contact where RecordTypeId = '0126D000002gYqAQAU' And Is_Resource_Available__c = true];
        
        //Jira Task 
        List<Jira_Task__c> totalJiraTasks = [SELECT Id FROM Jira_Task__c WHERE Estimated_Start_Date__c =:System.today()];
        List<Jira_Task__c> totalOverDueJiraTasks = [SELECT Id FROM Jira_Task__c where Is_Overdue__c = true];
        List<Jira_Task__c> HighPriorityJiraTasks = [SELECT Priority__c FROM Jira_Task__c where Priority__c = 'High' AND Estimated_Start_Date__c =:System.today()];
        List<Jira_Task__c> DevCompletedJiraTasks  = [SELECT Status__c FROM Jira_Task__c where Status__c = 'Dev Completed'];
        
        //Bugs & Dependency
        List<Dependency__c> dependencyList = [SELECT Id FROM Dependency__c];
        List<Bug__c> Buglist = [SELECT Id FROM Bug__c];
        
        //individual Report 
        List<Jira_Task__c> totalHoursTodayTask = [SELECT Actual_Efforts__c,Actual_Hours_Utilised__c,Estimated_Efforts__c,Estimated_Efforts_in_hour__c,Id FROM Jira_Task__c WHERE Estimated_Start_Date__c =:System.today()];
        List<Project_Resource_Mapping__c> individualProjects = [SELECT Id FROM Project_Resource_Mapping__c WHERE Contact__c = :ConId];
        List<Jira_Task__c> totalIndividualhighPriorityTasks = [SELECT Id,Priority__c FROM Jira_Task__c where Priority__c = 'High' AND Team_Member__c = :ConId];
        List<Jira_Task__c> totalcompletedHoursTask = [SELECT Actual_Efforts__c,Actual_Hours_Utilised__c,Id FROM Jira_Task__c WHERE Status__c = 'Dev Completed' ];
        List<Jira_Task__c> totalIndividualTasks = [SELECT Id,Priority__c,Estimated_Efforts__c,Actual_Hours_Utilised__c FROM Jira_Task__c where  Team_Member__c = :ConId];
        List<Bug__c> IndividualBuglist = [SELECT Id FROM Bug__c where Jira_Task__c In:totalIndividualTasks];
        List<Dependency__c> IndividualDependencylist = [SELECT Id,name,Depends_on__c FROM Dependency__c where Depends_on__c = :ConId];
        List<Dependency__c> TotalDependencylist = [SELECT Id,name,Depends_on__c FROM Dependency__c ];
        decimal totalHoursworked = 0;
        if(totalcompletedHoursTask.size() > 0){
            for(Jira_Task__c jt : totalcompletedHoursTask){
                if(jt.Actual_Hours_Utilised__c != null){
                    totalHoursworked = totalHoursworked + jt.Actual_Hours_Utilised__c;    
                }
            }
        }
        system.debug('totalIndividualTasks'+totalIndividualTasks);
        decimal totalIndHoursworked = 0;
        
        if(totalIndividualTasks.size() > 0){
            for(Jira_Task__c jt : totalIndividualTasks){
                if(jt.Estimated_Efforts__c != null){
                    system.debug('jt.Estimated_Efforts__c'+jt.Estimated_Efforts__c);
                    totalIndHoursworked = totalIndHoursworked + jt.Estimated_Efforts__c;    
                }
            }
        }
        
        //ADDED BY SHIVA
        Decimal TodaysTaskEstimationHours =0;
        if(totalHoursTodayTask.size() > 0){
            for(Jira_Task__c  jtk:totalHoursTodayTask){
                if(jtk.Estimated_Efforts_in_hour__c != null){
                    system.debug('jtk.Estimated_Efforts__c'+jtk.Estimated_Efforts_in_hour__c);
                    TodaysTaskEstimationHours = TodaysTaskEstimationHours + jtk.Estimated_Efforts_in_hour__c;    
                }
            }
            
        }
        
        system.debug('totalIndHoursworked'+totalIndHoursworked);
        mainCompData mcd = new mainCompData();
        mcd.totalProjects = projectList.size();
        mcd.activeProjects = ActiveProjectList.size();
        mcd.totalResources = totalResources.size();
        mcd.activeResources = ActiveResources.size();
        mcd.TotalTasks = totalJiraTasks.size();
        mcd.overDueTask = totalOverDueJiraTasks.size();
        mcd.highPriorityTask = HighPriorityJiraTasks.size();
        mcd.completedTask = DevCompletedJiraTasks.size();
        mcd.totalBugs = Buglist.size();
        mcd.totalDependency = dependencyList.size();
        mcd.conDetails = conDetails;
        mcd.individualProjects = individualProjects.size();
        mcd.individualTasks = totalIndividualTasks.size();
        mcd.individualBugs = IndividualBuglist.size();
        mcd.individualHighPriorityTasks = totalIndividualhighPriorityTasks.size();
        mcd.individualDependency = IndividualDependencylist.size();
        mcd.totalWorkingHours = totalHoursworked;
        mcd.individualWorkingHours = totalIndHoursworked;
        mcd.totalWorkingToday=TodaysTaskEstimationHours;
        mcd.isCheckedIn = dayAtt?.size()>0;
        mcd.isCheckedOut = ((dayAtt?.size()>0 && dayAtt[0].LastCheckOut__c !=null) || dayAtt.size() == 0);
        system.debug('mcd'+mcd);
        return mcd;
        
    }
    
     @AuraEnabled
    public static void sendNotification(string raisedbyId){

        Availability_Notification__c createNoti= new  Availability_Notification__c();
        createNoti.Raised_By__c=raisedbyId;
        createNoti.Raised_Time__c=System.now();
        insert createNoti;

    }
    
    // wrapper class with @AuraEnabled and {get;set;} properties 
    public class mainCompData{
        
        @AuraEnabled
        public Integer individualProjects{get;set;}
        
        @AuraEnabled
        public Integer individualHighPriorityTasks{get;set;}
        
        @AuraEnabled
        public Decimal individualWorkingHours{get;set;}
        
        @AuraEnabled
        public Integer individualTasks{get;set;}
        
        @AuraEnabled
        public Integer individualBugs{get;set;}
        
        @AuraEnabled
        public Integer individualDependency{get;set;}
        
        
        @AuraEnabled
        public Contact conDetails{get;set;}
        
        @AuraEnabled
        public Integer totalProjects{get;set;}
        
        @AuraEnabled
        public Integer totalResources{get;set;}
        
        @AuraEnabled
        public Integer activeResources{get;set;}
        
        @AuraEnabled
        public Integer resourcesEffort{get;set;}
        
        @AuraEnabled
        public Integer resourcesWithNoTask{get;set;}
        
        @AuraEnabled
        public Integer TotalTasks{get;set;}
        
        @AuraEnabled
        public Integer overDueTask{get;set;}
        
        @AuraEnabled
        public Integer highPriorityTask{get;set;}
        
        @AuraEnabled
        public Integer completedTask{get;set;}
        
        @AuraEnabled
        public Integer totalBugs{get;set;}
        
        @AuraEnabled
        public Integer totalDependency{get;set;}
        
        @AuraEnabled
        public Integer activeProjects{get;set;}
        
        @AuraEnabled
        public Decimal totalWorkingHours{get;set;}
        
        @AuraEnabled
        public Decimal totalWorkingToday{get;set;}

        @AuraEnabled
        public Boolean isCheckedIn{get;set;}

        @AuraEnabled
        public Boolean isCheckedOut{get;set;}
        
    }   
    
    public class ProjectTaskListWrapper{
        @AuraEnabled
        public String JiraId{ get; set; }
        
        @AuraEnabled
        public String TeamMember{ get; set; }
        
        @AuraEnabled
        public String ProjectName{ get; set; }
        
        @AuraEnabled
        public String ModuleName{ get; set; }
        
        @AuraEnabled
        public String TaskDescription{ get; set; }
        
        @AuraEnabled
        public Decimal EstimatedEffort{ get; set; }
        
        @AuraEnabled
        public Decimal ActualEfforts{ get; set; }
        
        @AuraEnabled
        public String IsOverDue{ get; set; }
        
        @AuraEnabled
        public String Status{ get; set; }
        
    }
    
    public class RecordsData{
        @AuraEnabled
        public String label;
        @AuraEnabled
        public String value;
        public RecordsData(String label, String value){
            this.label = label;
            this.value = value;
        }
        
    }
    @AuraEnabled
    Public Static Void DeleteTskFromManagerDashboard(String Recid){
        system.debug('Recid::'+Recid);
        Jira_Task__c deleTask = new Jira_Task__c();
        deleTask.Id=Recid;
        delete deleTask; 
    }
    
    @AuraEnabled
    Public Static void updateJtList(List<Jira_Task__c> jtList){
        update jtList;
    }
    
    
    //update jiratsk  description from managerdashbord button
    @AuraEnabled
    Public Static void updateJtDescription(String recordId,String Description,String Sollution){
        system.debug('recordId--'+recordId);
        system.debug('Description--'+Description);
        system.debug('Sollution--'+Sollution);
        if(String.isEmpty(Sollution)){
            Jira_Task__c jtDes = new Jira_Task__c();
            jtDes.Id=recordId;
            jtDes.Description__c=Description;
            update jtDes;
            
        }
        
        Jira_Task__c jtDes = new Jira_Task__c();
        jtDes.Id=recordId;
        jtDes.Description__c=Description;
        jtDes.Solution_Details_if_any__c=Sollution;
        update jtDes;
        
    }
    
}