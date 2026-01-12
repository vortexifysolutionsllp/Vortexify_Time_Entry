public with sharing class ContactWorkHour {
    @AuraEnabled(cacheable=true)
    public static Decimal getMonthlyWorkHours(Id contactId, Integer month) {
        if(contactId == null || month == null) return 0;
        
        Date startOfMonth = Date.newInstance(Date.today().year(), month, 1);
        Date endOfMonth = startOfMonth.addMonths(1).addDays(-1);

        List<Jira_Task__c> tasks = [
            SELECT Id, Actual_Task_Start_Time__c, Actual_Task_End_Time__c
            FROM Jira_Task__c
            WHERE Team_Member__c = :contactId
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
}