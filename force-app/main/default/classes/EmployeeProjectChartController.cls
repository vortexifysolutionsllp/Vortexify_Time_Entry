/*public class EmployeeProjectChartController {
    @AuraEnabled(cacheable=true)
    public static List<Project__c> getProjectsForContact(Id contactId) {
        List<Project__c> result = [
            SELECT Id, Name
            FROM Project__c
            WHERE Id IN (
                SELECT Project__c
                FROM Project_Resource_Mapping__c
                WHERE Contact__c = :contactId
            ) And Active__c = TRUE 
        ];
		System.debug('msg '+ result);
        return result;
    }
}*/
public class EmployeeProjectChartController {
    
    public class ProjectWrapper {
        @AuraEnabled public Id projectId {get; set;}
        @AuraEnabled public String projectName {get; set;}
        @AuraEnabled public Datetime mappingCreatedDate {get; set;}
    }

    @AuraEnabled(cacheable=true)
    public static List<ProjectWrapper> getProjectsForContact(Id contactId) {
        List<ProjectWrapper> results = new List<ProjectWrapper>();

        List<Project_Resource_Mapping__c> mappings = [
            SELECT Id, CreatedDate, Project__c, Project__r.Name
            FROM Project_Resource_Mapping__c
            WHERE Contact__c = :contactId
            AND Project__r.Active__c = TRUE ORDER BY CreatedDate DESC
        ];

        for(Project_Resource_Mapping__c prm : mappings){
            ProjectWrapper pw = new ProjectWrapper();
            pw.projectId = prm.Project__c;
            pw.projectName = prm.Project__r.Name;
            pw.mappingCreatedDate = prm.CreatedDate;
            results.add(pw);
        }
        
        System.debug('msg ' + results);
        return results;
    }
}