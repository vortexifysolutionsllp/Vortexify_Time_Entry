global without sharing class TaskCreationController {

    @AuraEnabled
public static string createJiraTask(ID projectId,ID moduleId, ID contactId, String priority, DateTime startDateTime, DateTime endDateTime, String description) {
    try {
        List<Jira_Task__c> existingTaskForSimilarTime = [SELECT Id FROM Jira_Task__c WHERE Project_Resource_Mapping__c = :projectId AND Module__c = :moduleId AND Team_Member__c = :contactId AND ((Task_Start_Date_Time__c >= :startDateTime AND Task_Start_Date_Time__c <= :endDateTime) OR (Task_End_Date_Time__c >= :startDateTime AND Task_End_Date_Time__c <= :endDateTime))];
        if(existingTaskForSimilarTime?.size()>0){
            return 'Task has already been created for this time slot';
        }
        Jira_Task__c task = new Jira_Task__c();
        task.Project_Resource_Mapping__c = projectId;
        task.Module__c = moduleId;
        task.Team_Member__c = contactId;
        task.Priority__c = priority;
        task.Assigned_By__c = contactId;
        task.Task_Start_Date_Time__c = DateTime.valueOf(startDateTime); // Format: "yyyy-MM-dd HH:mm:ss"
        task.Task_End_Date_Time__c = DateTime.valueOf(endDateTime);

        task.Task_Description__c = description;
        insert task;
        return 'Task Successfully Created';
    } catch (Exception e) {
        throw new AuraHandledException('Error creating task: ' + e.getMessage());
    }
}
    @AuraEnabled
public static Id getProjectResourceMappingId(Id projectId, Id candidateId) {
    	Project_Resource_Mapping__c mapping = [
        SELECT Id
        FROM 	Project_Resource_Mapping__c
        WHERE Project__c = :projectId AND Contact__c = :candidateId
        LIMIT 1
    ];
    system.debug('---test---'+mapping.Id);
    return mapping.Id;
}



    @AuraEnabled
    public static void deleteJiraTask(Id taskId) {
        try {
            delete [SELECT Id FROM Jira_Task__c WHERE Id = :taskId];
        } catch (Exception e) {
            throw new AuraHandledException('Error deleting task: ' + e.getMessage());
        }
    }

   /* @AuraEnabled
    public static List<Jira_Task__c> getJiraTasks(Id contactid) {
        try {
            return [
                SELECT Task_End_Date__c, Id, Name, Priority__c, Status__c, Assigned_By__c, 
                       Task_Description__c, Module__c,Module__r.Name, Project_Resource_Mapping__c, 
                       Task_End_Date_Time__c, Task_Start_Date_Time__c, Team_Member__c, 
                       Assigned_By_Name__c, Module_Name__c, Project_Name__c, 
                       Task_Start_Date__c, Task_Start_Time__c, Team_Member_Name__c,
                 Project_Resource_Mapping__r.Project__r.Name,
               Project_Resource_Mapping__r.Contact__r.Name
                FROM Jira_Task__c
                WHERE Team_Member__c = :contactid 
                ORDER BY CreatedDate DESC
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching tasks: ' + e.getMessage());
        }
    }*/
    
    @AuraEnabled
public static List<Jira_Task__c> getJiraTasks(Id contactid) {
    try {
        List<Jira_Task__c> tasks = [
            SELECT Task_End_Date__c, Id, Name, Priority__c, Status__c, Assigned_By__c, 
                   Task_Description__c, Module__c, Module__r.Name, Project_Resource_Mapping__c, 
                   Task_End_Date_Time__c, Task_Start_Date_Time__c, Team_Member__c, 
                   Assigned_By_Name__c, Module_Name__c, Project_Name__c, 
                   Task_Start_Date__c, Task_Start_Time__c, Team_Member_Name__c,
                   Project_Resource_Mapping__r.Project__r.Name,
                   Project_Resource_Mapping__r.Contact__r.Name
            FROM Jira_Task__c
            WHERE Team_Member__c = :contactid 
            ORDER BY CreatedDate DESC
        ];

        // Add 330 minutes (5.5 hours) to each task's start/end datetime
        for (Jira_Task__c task : tasks) {
            if (task.Task_Start_Date_Time__c != null) {
                task.Task_Start_Date_Time__c = task.Task_Start_Date_Time__c;
            }
            if (task.Task_End_Date_Time__c != null) {
                task.Task_End_Date_Time__c = task.Task_End_Date_Time__c;
            }
        }

        return tasks;

    } catch (Exception e) {
        throw new AuraHandledException('Error fetching tasks: ' + e.getMessage());
    }
}


@AuraEnabled
public static void updateJiraTask(
    Id taskId,
    String priority,
    DateTime startDateTime,
    DateTime endDateTime,
    String description
) {
    try {
        Jira_Task__c task = [SELECT Id FROM Jira_Task__c WHERE Id = :taskId LIMIT 1];

        //if (projectId != null) task.Project_Resource_Mapping__c = projectId;
        //if (moduleId != null) task.Module__c = moduleId;
        //if (contactId != null) task.Team_Member__c = contactId;
        if (priority != null) task.Priority__c = priority;
        if (startDateTime != null) task.Task_Start_Date_Time__c = DateTime.valueOf(startDateTime.addminutes(-330));
        if (endDateTime != null) task.Task_End_Date_Time__c = DateTime.valueOf(endDateTime.addminutes(-330));
        if (description != null) task.Task_Description__c = description;

        update task;
    } catch (Exception e) {
        throw new AuraHandledException('Error updating task: ' + e.getMessage());
    }
}

}