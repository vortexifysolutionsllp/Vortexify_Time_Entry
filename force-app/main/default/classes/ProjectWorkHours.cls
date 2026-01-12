public with sharing class ProjectWorkHours {
    @AuraEnabled(cacheable=true)
    public static Decimal getProjectMonthlyWorkHours(Id projectId, Integer month) {
        if(projectId == null || month == null) return 0;
        
        Date startOfMonth = Date.newInstance(Date.today().year(), month, 1);
        Date endOfMonth = startOfMonth.addMonths(1).addDays(-1);

        // Get all related Jira tasks via Project Resource Mapping
        List<Jira_Task__c> tasks = [
            SELECT Id, Actual_Task_Start_Time__c, Actual_Task_End_Time__c
                 , Project_Resource_Mapping__c, Project_Resource_Mapping__r.Project__c
            FROM Jira_Task__c
            WHERE Project_Resource_Mapping__r.Project__c = :projectId
              AND Actual_Task_Start_Time__c >= :startOfMonth
              AND Actual_Task_Start_Time__c <= :endOfMonth
              AND Actual_Task_End_Time__c != NULL
              AND Actual_Task_Start_Time__c != NULL
        ];

        Decimal totalHours = 0;
        for(Jira_Task__c task : tasks) {
            if(task.Actual_Task_Start_Time__c != null && task.Actual_Task_End_Time__c != null) {
                Long diffMillis = task.Actual_Task_End_Time__c.getTime() - task.Actual_Task_Start_Time__c.getTime();
                Decimal diffHours = (Decimal)diffMillis / (1000 * 60 * 60);
                totalHours += diffHours;
            }
        }
        return totalHours.setScale(2);
    }

    public class TaskWrapper {
    @AuraEnabled public Id id { get; set; }
    @AuraEnabled public String name { get; set; }
    @AuraEnabled public String status { get; set; }
}

@AuraEnabled(cacheable=true)
public static List<TaskWrapper> getTasks(Id projectId, Integer month) {
    if(projectId == null || month == null) 
        return new List<TaskWrapper>();

    Date startOfMonth = Date.newInstance(Date.today().year(), month, 1);
    Date endOfMonth = startOfMonth.addMonths(1).addDays(-1);

    List<Jira_Task__c> taskRecords = [
        SELECT Id, Name, Status__c, Actual_Task_Start_Time__c, Actual_Task_End_Time__c
        FROM Jira_Task__c
        WHERE Project_Resource_Mapping__r.Project__c = :projectId
          AND Actual_Task_Start_Time__c >= :startOfMonth
          AND Actual_Task_Start_Time__c <= :endOfMonth
          AND Actual_Task_End_Time__c != NULL
          AND Actual_Task_Start_Time__c != NULL
        ORDER BY Actual_Task_Start_Time__c DESC
    ];

    List<TaskWrapper> tasks = new List<TaskWrapper>();
    for (Jira_Task__c t : taskRecords) {
        TaskWrapper tw = new TaskWrapper();
        tw.id = t.Id;
        tw.name = t.Name;
        tw.status = t.Status__c;
        tasks.add(tw);
    }
    return tasks;
}

}