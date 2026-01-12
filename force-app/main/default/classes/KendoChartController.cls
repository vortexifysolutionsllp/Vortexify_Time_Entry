global without sharing class KendoChartController {
    
    /*@RemoteAction
    global static List<ProjectData> getProjectData() {
        List<ProjectData> projectData = new List<ProjectData>();
        // Sample data, replace this with actual data fetching logic
        projectData.add(new ProjectData('Symega', 5, 19, 10, 9, 19, 10));
        projectData.add(new ProjectData('Swagelok', 32, 25, 32, 30, 20, 34));
        projectData.add(new ProjectData('ExcelR', 34, 21, 34, 34, 21, 38));
        projectData.add(new ProjectData('Trevi', 36, 26, 36, 36, 26, 41));
        projectData.add(new ProjectData('Ondonte', 45, 28, 45, 45, 28, 45));
        projectData.add(new ProjectData('BeepKart', 33, 31, 33, 33, 31, 33));
        projectData.add(new ProjectData('Kult', 34, 35, 34, 34, 35, 34));
        return projectData;
    }
    
    global class ProjectData {
        public String category;
        public Integer brd2021;
        public Integer dev2021;
        public Integer uat2021;
        public Integer brd2020;
        public Integer dev2020;
        public Integer uat2020;
        
        public ProjectData(String category, Integer brd2021, Integer dev2021, Integer uat2021,
                           Integer brd2020, Integer dev2020, Integer uat2020) {
                               this.category = category;
                               this.brd2021 = brd2021;
                               this.dev2021 = dev2021;
                               this.uat2021 = uat2021;
                               this.brd2020 = brd2020;
                               this.dev2020 = dev2020;
                               this.uat2020 = uat2020;
                           }
    }*/

    @RemoteAction
    global static List<ProjectData> getProjectData() {
        List<ProjectData> projectDataList = new List<ProjectData>();

        List<Project__c> projRecList = [SELECT Id, Name, (SELECT Id, Name__c, Expected_Start_Date__c, Expected_End_Date__c, Actual_Start_Date__c, Actual_End_Date__c FROM Milestones__r WHERE Expected_Start_Date__c != null AND Expected_End_Date__c != null) 
                                        FROM Project__c];
        
        for(Project__c proj : projRecList){

            if(!proj.Milestones__r.isEmpty()){
                ProjectData pjData = new ProjectData();
                pjData.category = proj.Name;

                List<Milestone> milestonesWrapList = new List<Milestone>();
                for(Milestone__c mStone : proj.Milestones__r){
                    Integer expectedDay = mStone.Expected_Start_Date__c.daysBetween(mStone.Expected_End_Date__c);
                    Integer actualDay = mStone.Actual_Start_Date__c != null && mStone.Actual_End_Date__c != null ? mStone.Actual_Start_Date__c.daysBetween(mStone.Actual_End_Date__c) : 0;

                    String exp_date = mStone.Expected_Start_Date__c.day() + '/' + mStone.Expected_Start_Date__c.month() + '/' + mStone.Expected_Start_Date__c.year() + '-' + mStone.Expected_End_Date__c.day() + '/' + mStone.Expected_End_Date__c.month() + '/' + mStone.Expected_End_Date__c.year();
                    String actual_date = mStone.Expected_Start_Date__c.day() + '/' + mStone.Expected_Start_Date__c.month() + '/' + mStone.Expected_Start_Date__c.year() + '-' + mStone.Expected_End_Date__c.day() + '/' + mStone.Expected_End_Date__c.month() + '/' + mStone.Expected_End_Date__c.year();

                    if(mStone.Name__c.containsIgnoreCase('requirement')){
                        pjData.req_exp = expectedDay;
                        pjData.req_actual = actualDay;
                        pjData.req_exp_date = exp_date;
                        pjData.req_actual_date = actual_date;

                    }
                    else if(mStone.Name__c.containsIgnoreCase('brd')){
                        pjData.brd_exp = expectedDay;
                        pjData.brd_actual = actualDay;
                        pjData.brd_exp_date = exp_date;
                        pjData.brd_actual_date = actual_date;
                    }
                    else if(mStone.Name__c.containsIgnoreCase('development')){
                        pjData.dev_exp = expectedDay;
                        pjData.dev_actual = actualDay;
                        pjData.dev_exp_date = exp_date;
                        pjData.dev_actual_date = actual_date;
                    }
                    else if(mStone.Name__c.containsIgnoreCase('uat')){
                        pjData.uat_exp = expectedDay;
                        pjData.uat_actual = actualDay;
                        pjData.uat_exp_date = exp_date;
                        pjData.uat_actual_date = actual_date;
                    }
                    else if(mStone.Name__c.containsIgnoreCase('deployment') || mStone.Name__c.containsIgnoreCase('migration')){
                        pjData.deploy_exp = pjData.deploy_exp != null ? pjData.deploy_exp + expectedDay : expectedDay;
                        pjData.deploy_actual = pjData.deploy_actual != null ? pjData.deploy_actual + actualDay : actualDay;
                        pjData.deploy_exp_date = exp_date;
                        pjData.deploy_actual_date = actual_date;
                    }
                    // else if(mStone.Name__c.containsIgnoreCase('migration')){
                    //     pjData.migration_exp = expectedDay;
                    //     pjData.migration_actual = actualDay;
                    // }                    
                }
                projectDataList.add(pjData);
            }
        }
        system.debug('projectDataList -- >> ' + projectDataList);
        return projectDataList;
    }
    
    global class ProjectData {
        public String category;

        public Integer req_exp;
        public Integer brd_exp;
        public Integer dev_exp;
        public Integer uat_exp;
        public Integer deploy_exp;
        public Integer migration_exp;

        public Integer req_actual;
        public Integer brd_actual;
        public Integer dev_actual;
        public Integer uat_actual;
        public Integer deploy_actual;
        public Integer migration_actual;

        public String req_exp_date;
        public String brd_exp_date;
        public String dev_exp_date;
        public String uat_exp_date;
        public String deploy_exp_date;

        public String req_actual_date;
        public String brd_actual_date;
        public String dev_actual_date;
        public String uat_actual_date;
        public String deploy_actual_date;
    }
    
    @RemoteAction
    global static List<Project> getProjectsData() {
        List<Project> projWrapList = new List<Project>();
        List<Project__c> projRecList = [SELECT Id, Name, (SELECT Id, Name__c, Expected_Start_Date__c, Expected_End_Date__c, Actual_Start_Date__c, Actual_End_Date__c FROM Milestones__r WHERE Expected_Start_Date__c != null AND Expected_End_Date__c != null AND Actual_Start_Date__c != null AND Actual_End_Date__c != null LIMIT 5) 
                                        FROM Project__c LIMIT 10];
        
        for(Project__c proj : projRecList){
            List<Milestone> milestonesWrapList = new List<Milestone>();
            for(Milestone__c mStone : proj.Milestones__r){
                Integer expectedDay = mStone.Expected_Start_Date__c.daysBetween(mStone.Expected_End_Date__c);
                Integer actualDay = mStone.Actual_Start_Date__c.daysBetween(mStone.Actual_End_Date__c);
                milestonesWrapList.add(new Milestone(mStone.Name__c, expectedDay, actualDay));
            }

            projWrapList.add(new Project(proj.Name, milestonesWrapList));
        }
        return projWrapList;
    }
    
    
    global class Project {
        global String name { get; set; }
        global List<Milestone> milestones { get; set; }
        
        global Project(String name, List<Milestone> milestones) {
            this.name = name;
            this.milestones = milestones;
        }
    }
    
    
    global class Milestone {
        public String name { get; set; }
        public Integer expectedDay { get; set; }
        public Integer actualDay { get; set; }
        
        global Milestone(String name, Integer expectedDay, Integer actualDay) {
            this.name = name;
            this.expectedDay = expectedDay;
            this.actualDay = actualDay;
        }
    }    
    
}