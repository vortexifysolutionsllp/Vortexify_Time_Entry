public class ProjectEmployeeController {
	@AuraEnabled(cacheable=true)
	public static List<Contact> getProjectEmployee(Id projectID){
		List<Contact> contList = [select Id, Name from Contact 
		Where Id in (SELECT Contact__c
                FROM Project_Resource_Mapping__c
                WHERE Project__c =:projectID)];

		return contList;
	}
}