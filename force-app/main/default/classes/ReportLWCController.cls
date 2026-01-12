public without sharing class ReportLWCController {
    @AuraEnabled(cacheable=true)
    public static string getDailyReport(){
        try {
            return null;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static String getMonthlyReport(){
        try {
            Map<String,List<MonthlyEffortsWrapper>> memberEffortsMap = new Map<String,List<MonthlyEffortsWrapper>>();

            Date todayDate = Date.today();
            Integer numberOfDays = Date.daysInMonth(todayDate.year(), todayDate.month());  //30,31,28,29

            Date startDate = Date.newInstance(todayDate.year(),todayDate.month(),1);
            Date monthEndDate = Date.newInstance(todayDate.year(),todayDate.month(),numberOfDays);
            
            List<Jira_Task__c> jTasks = [select Id,Project_Name__c,Project_Resource_Mapping__c,Estimated_Start_Date__c,Task_End_Date__c,Team_Member__c,Team_Member__r.Name,Estimated_Efforts__c from Jira_Task__c where Estimated_Start_Date__c >= :startDate and Estimated_Start_Date__c <= :monthEndDate]; 
            
            Map<String,Map<String,Decimal>> numberOfHoursPerDayMap = new Map<String,Map<String,Decimal>>();

            for(Jira_Task__c j:jTasks){
                String key = j.Team_Member__r.Name;
                String dateKey = String.ValueOf(j.Estimated_Start_Date__c);

                if(numberOfHoursPerDayMap.containsKey(key)){
                    Map<String,Decimal> numOfHoursPerDayOfAResource = numberOfHoursPerDayMap.get(key);
                    
                    if(numOfHoursPerDayOfAResource.containsKey(dateKey)){
                        numOfHoursPerDayOfAResource.put(dateKey,numOfHoursPerDayOfAResource.get(dateKey) + j.Estimated_Efforts__c);
                    }else{
                        numOfHoursPerDayOfAResource.put(dateKey,j.Estimated_Efforts__c);
                    }
                }else{
                    Map<String,Decimal> numOfHoursPerDayOfAResource = new Map<String,Decimal>();
                    numOfHoursPerDayOfAResource.put(dateKey,j.Estimated_Efforts__c);
                    numberOfHoursPerDayMap.put(key,numOfHoursPerDayOfAResource);
                }
            }

            
            for(integer i=1;i<=numberOfDays;i++){
                Date currentDate =  Date.newInstance(todayDate.year(),todayDate.month(),i); 
                String dateKey = String.ValueOf(currentDate);
                    
                for(String key :numberOfHoursPerDayMap.keySet()){
                    Map<String,Decimal> hoursMap = numberOfHoursPerDayMap.get(key);

                    if(hoursMap.containsKey(dateKey)){
                        MonthlyEffortsWrapper mWrapper = new MonthlyEffortsWrapper();
                        mWrapper.day = dateKey;
                        mWrapper.hours = hoursMap.get(dateKey);

                        if(memberEffortsMap.containsKey(key)){
                            memberEffortsMap.get(key).add(mWrapper);
                        }else{
                            memberEffortsMap.put(key,new List<MonthlyEffortsWrapper>{mWrapper});
                        }

                    }
                }
            } 
            return JSON.serialize(memberEffortsMap);
        }
        catch (Exception e) 
        {
            throw new AuraHandledException(e.getMessage());
        }
           
    }

    @AuraEnabled(cacheable=true)
    public static List<ResourceProjectEffortsWrapper> getResourceReport(){
        try {
            List<ResourceProjectEffortsWrapper> resourceProjectEffortsWrappers = new List<ResourceProjectEffortsWrapper>();

            Date todayDate = Date.today();
            Date startDate = Date.newInstance(todayDate.year(),todayDate.month(),1);

            Integer numberOfDays = Date.daysInMonth(todayDate.year(), todayDate.month());
            Date monthEndDate = Date.newInstance(todayDate.year(),todayDate.month(),numberOfDays);

            List<Jira_Task__c> jTasks = [select Id,Project_Name__c,Project_Resource_Mapping__c,Project_Resource_Mapping__r.Project__r.Name,Estimated_Start_Date__c,Task_End_Date__c,Team_Member__c,Team_Member__r.Name,Estimated_Efforts__c from Jira_Task__c where Estimated_Start_Date__c >= :startDate and Estimated_Start_Date__c <= :monthEndDate]; 


            
            // Map<String,Map<String,ProjectEffortsWrapper>> projectEffortsMap = new Map<String,Map<String,ProjectEffortsWrapper>>();
            // Map<String,

            // for(Jira_Task__c jTask : jTasks){
            //     String nameKey = jTask.Team_Member__r.Name;
            //     if(map.containsKey(nameKey)){
                    
            //     }
            // }

            return resourceProjectEffortsWrappers;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    public class MonthlyEffortsWrapper{
        public String day;
        public Decimal hours;
    }

    public class ResourceProjectEffortsWrapper{
        public String name;
        public List<ProjectEffortsWrapper> ProjectEffortsWrappers;
        
    }

    public class ProjectEffortsWrapper{
        String projectName;
        String taskDate;
        String efforts;
    }

    
}