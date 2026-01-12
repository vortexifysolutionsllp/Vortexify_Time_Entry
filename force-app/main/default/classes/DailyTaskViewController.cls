public without sharing class DailyTaskViewController {

    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getDailyTaskData(Date selectedDate) {

        // Selected date (default = today)
        Date targetDate = selectedDate != null ? selectedDate : Date.today();

        // Get all Jira Tasks created on selected date
        List<Jira_Task__c> tasks = [
            SELECT Id, Name, Assigned_By__c, Assigned_By__r.Name,
                   Description__c, Status__c, CreatedDate, Team_Member__c,
           Team_Member__r.Name,
           Team_Member__r.Reports_To_Name__c,
                   OwnerId, CreatedById
            FROM Jira_Task__c
            WHERE DAY_ONLY(CreatedDate) = :targetDate
        ];

        // Collect Contact IDs who created/own tasks
        Set<Id> contactsWithTasks = new Set<Id>();
        for (Jira_Task__c t : tasks) {

            // Assigned By contact
            if (t.Assigned_By__c != null) {
                contactsWithTasks.add(t.Assigned_By__c);
            }

            // Owner is a Contact
            if (t.OwnerId != null && String.valueOf(t.OwnerId).startsWith('003')) {
                contactsWithTasks.add(t.OwnerId);
            }

            // CreatedBy is a Contact
            if (t.CreatedById != null && String.valueOf(t.CreatedById).startsWith('003')) {
                contactsWithTasks.add(t.CreatedById);
            }
        }

        // Fetch Available employees (Contacts) excluding Managers
        List<Contact> availableEmployees = [
            SELECT Id, Name, Status__c, RecordType.Name,ReportsToId, ReportsTo.Name
            FROM Contact
            WHERE Status__c = 'Available'
            AND RecordType.Name != 'Manager'
        ];


        // Employees who did NOT create any task today
        List<Contact> employeesWithoutTask = new List<Contact>();
        for (Contact c : availableEmployees) {
            if (!contactsWithTasks.contains(c.Id)) {
                employeesWithoutTask.add(c);
            }
        }

        // Return response to LWC
        Map<String, Object> result = new Map<String, Object>();
        result.put('tasks', tasks);
        result.put('employeesWithoutTask', employeesWithoutTask);

        return result;
    }

     @AuraEnabled(cacheable=true)
    public static Jira_Task__c getTaskById(Id taskId) {
        if (taskId == null) return null;

        Jira_Task__c task = [
            // SELECT Id, Name, Task_Description__c, Status__c, Assigned_By__c, Assigned_By__r.Name, CreatedDate
            // FROM Jira_Task__c
            // WHERE Id = :taskId
            // LIMIT 1

            SELECT Id, Name, Task_Description__c, Status__c, Team_Member__c,Team_Member__r.Name, CreatedDate, Team_Member__r.Reports_To_Name__c from Jira_Task__c 
            where Id = :taskId
            Limit 1
            
        ];

        return task;
    }
}