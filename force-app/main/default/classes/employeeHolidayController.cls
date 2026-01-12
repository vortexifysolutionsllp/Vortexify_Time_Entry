/**
* @File Name : employeeHolidayController.cls
* @Description :
* @Author :
* @Last Modified By :
* @Last Modified On : August 24, 2025
* @Modification Log :
*==============================================================================
* Ver | Date | Author | Modification
*==============================================================================
* 1.0 | August 24, 2025 |   | Initial Version
**/

public class employeeHolidayController {
/*	@AuraEnabled(cacheable=true)
	public static List<Holiday__c> employeeHolidayMethod(Id conID, Integer MonthNumber){
		 List<Holiday__c> empHolidayList = [SELECT Id, Contact__c,End_Date__c,Type__c,Reason__c,Start_Date__c,Holiday_Name__c, Status__c FROM Holiday__c 
		 									Where Contact__c =: conID];
        
        List<Holiday__c> empListOfHoliday = new List<Holiday__c>();
        
		 for(Holiday__c empHoliDay : empHolidayList) {
			Holiday__c newHoliday = new Holiday__c ();
			if(empHoliDay.Start_Date__c != null){
				Integer monthVal = empHoliDay.Start_Date__c.month();
				if(monthVal == MonthNumber){
					newHoliday.Holiday_Name__c = empHoliDay.Holiday_Name__c;
                    newHoliday.Contact__c = empHoliDay.Contact__c;
                    newHoliday.Reason__c = empHoliDay.Reason__c;
                    newHoliday.Status__c = empHoliDay.Status__c;
                    newHoliday.Start_Date__c = empHoliDay.Start_Date__c;
                    newHoliday.End_Date__c = empHoliDay.End_Date__c;
                   // newHoliday.Name = empHoliDay.Name;
                   // newHoliday.Number_of_days__c = empHoliDay.Number_of_days__c;
                    newHoliday.Type__c = empHoliDay.Type__c;
                    empListOfHoliday.Add(newHoliday);
				}
			}
		 }
		 return empListOfHoliday;								
	}*/

@AuraEnabled(cacheable=true)
public static List<Holiday__c> employeeHolidayMethod(Id conID, Integer MonthNumber){
    List<Holiday__c> empHolidayList = [
        SELECT Id, Holiday_Name__c, Contact__c, End_Date__c, Type__c, 
               Reason__c, Status__c, Start_Date__c
        FROM Holiday__c 
        WHERE Contact__c = :conID
    ];

    List<Holiday__c> empListOfHoliday = new List<Holiday__c>();

    for(Holiday__c empHoliDay : empHolidayList) {
        if(empHoliDay.Start_Date__c != null && empHoliDay.Start_Date__c.month() == MonthNumber){
            empListOfHoliday.add(empHoliDay);
        }
    }
    return empListOfHoliday;								
}
}