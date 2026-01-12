public class ProjectHomeController {

   

    @AuraEnabled
    public static wraperProject getProjectRecords(){
        wraperProject wp = new wraperProject();
         List<Project__c> projHDL;
         List<Project__c> proj1WK;
         List<Project__c> proj2WK;
        Date weekLate = Date.today().addDays(-7);

      //  Date weekLate = Date.today().addDays(-7);
        try{
        
        Date todayDate = Date.today();
        Date weekStart = todayDate.toStartOfWeek();
        Date weekEnd = weekStart.addDays(6);
        Date week2Late = todayDate.addDays(-14); 
        projHDL = [SELECT Id,Name, Project_End_Date__c FROM Project__c /*WHERE Project_End_Date__c >= :weekStart AND Project_End_Date__c <= :weekEnd */ LIMIT 3];
        System.debug('Projects ending this week: ' + projHDL);
        wp.projHittingDeadLine = projHDL;

        proj1WK = [SELECT Id,Name,Project_End_Date__c FROM Project__c /*Where Project_End_Date__c =:weekLate */ Limit 3];
        System.debug('proj1WK ' + proj1WK);
        wp.project1weekLate = proj1WK;
        proj2WK = [SELECT Id,Name,Project_End_Date__c FROM Project__c /*Where Project_End_Date__c =:week2Late */ LIMIT 3];
        wp.project2weekLate = proj2WK;
        System.debug('proj2WK ' + proj2WK);

        }catch(Exception e){
            system.debug('Exception Message-->'+e.getMessage());
            system.debug('Exception Line Number-->'+e.getLineNumber());
        }
        return wp;
    }

    @AuraEnabled
    public static List<Milestone__c> getmilestone(){
             
            List<Milestone__c> mileList;
            Date todayDate = Date.today();
            Date weekStart = todayDate.toStartOfWeek();
            Date weekEnd = weekStart.addDays(6);

            try {
                mileList = [SELECT ID, Name__c, Project__c, Project__r.Name  FROM Milestone__c  WHERE Project__c != null  /*AND  Expected_End_Date__c >= :weekStart AND Expected_End_Date__c <= :weekEnd */ ];
                
                // Use a map to group by Project__c
                Map<Id, Milestone__c> projectMap = new Map<Id, Milestone__c>();
                for (Milestone__c milestone : mileList) {
                    if (!projectMap.containsKey(milestone.Project__c)) {
                        projectMap.put(milestone.Project__c, milestone);
                    }
                    if (projectMap.size() >= 3) {
                        break;
                    }
                }

                // Get the list of distinct projects limited to 3
                mileList = new List<Milestone__c>(projectMap.values());

            } catch (Exception e) {
                System.debug('Exception: ' + e.getMessage());
            }

            // Output the result
            System.debug('Milestones ending this week (distinct projects, limited to 3): ' + mileList);

        return mileList;
    }

     @AuraEnabled
    public static List<Milestone__c> getUnchangedStageHistoryRecords() {
        List<Id> MileIdList = new List<Id>();
        
        List<Milestone__History> historyRecords = [SELECT Id, IsDeleted, ParentId, CreatedById, CreatedDate, Field, DataType, OldValue, NewValue
                                                    FROM Milestone__History
                                                    WHERE Field = 'Stage__c'
                                                    AND CreatedDate = LAST_N_DAYS:7];
        
        System.debug('historyRecords-->'+historyRecords);
        for (Milestone__History record : historyRecords) {
            if (record.OldValue == record.NewValue) {
                MileIdList.add(record.ParentId);
            }
        }
         System.debug('MileIdList-->'+MileIdList);

        List<Milestone__c> mileList = [SELECT Id,Name ,Project__c ,Project__r.Name FROM Milestone__c WHERE Id =:MileIdList limit 3];
        system.debug('mileList-->'+mileList);
       return mileList;
    }

    @AuraEnabled
     public static  List<String>  ProjResMapp() {
           List<String> projectsWithoutJiraTasks = new List<String>();
    try {
        
        List<Project_Resource_Mapping__c> resMapList = [ SELECT Id, Project__c, Project__r.Name  FROM Project_Resource_Mapping__c  WHERE Project__c != null];

        Map<Id, String> prmMap = new Map<Id, String>();
        for (Project_Resource_Mapping__c prm : resMapList) {
            prmMap.put(prm.Id, prm.Project__r.Name);
        }

        List<Jira_Task__c> jtList = [ SELECT Id, Project_Resource_Mapping__c   FROM Jira_Task__c  WHERE Project_Resource_Mapping__c IN :prmMap.keySet()];

        Set<Id> prmWithJiraTasks = new Set<Id>();
        for (Jira_Task__c jt : jtList) {
            prmWithJiraTasks.add(jt.Project_Resource_Mapping__c);
        } 

           Integer projectsFound = 0;
        for (Id prmId : prmMap.keySet()) {
            if (!prmWithJiraTasks.contains(prmId)) {
                projectsWithoutJiraTasks.add(prmMap.get(prmId));

                projectsFound++;
                if (projectsFound >= 3) {
                    break; 
                }
            }
        }
        System.debug('Projects without Jira Tasks: ' + projectsWithoutJiraTasks);

    } catch (Exception e) {
        System.debug('Exception Message-->' + e.getMessage());
        System.debug('Exception Line Number-->' + e.getLineNumber());
    }
    return projectsWithoutJiraTasks;
}


@AuraEnabled
public static List<Milestone__c> getAllMileStoneRecords(){
     List<Milestone__c> mileList;
    try{

     mileList = [SELECT ID,Name__c,Project__c,Project__r.Name,Actual_Start_Date__c,Actual_End_Date__c,Expected_Start_Date__c,Expected_End_Date__c FROM Milestone__c WHERE Project__c != null];
        

    }catch(Exception e){
        System.debug('Exception Message-->' + e.getMessage());
        System.debug('Exception Line Number-->' + e.getLineNumber());
    }
    return mileList;
}



    public class wraperProject{
        @AuraEnabled
      public  List<Project__c> projHittingDeadLine;
        @AuraEnabled
      public  List<Project__c> project1weekLate;
          @AuraEnabled
      public  List<Project__c> project2weekLate;
    }
}