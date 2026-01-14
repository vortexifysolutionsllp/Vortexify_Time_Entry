global  without sharing class JiraTaskReportHelper {
    
    @AuraEnabled
    public static Map<String, List<jiraTaskWrapper>> getTaskListByResources(String conId){
        system.debug('conId'+conId);
        Contact ConRec = [Select Id,Contact_Role__c,Role__c from contact where id = :ConId];
        
        map<String,Integer> slotsBySequence = getTimeSlots();
        Map<String, List<Jira_Task__c>> taskMap = new Map<String, List<Jira_Task__c>>();
        Map<String, List<jiraTaskWrapper>> jiraTaskWrapperMap = new Map<String, List<jiraTaskWrapper>>(); 
        
        List<Jira_Task__c> taskList = [Select id, Name, Task_Start_Date_Time__c, Estimated_Efforts_in_hour__c ,Task_Start_Time__c, Task_End_Date_Time__c, Solution_Details_if_any__c, 
                                       Team_Member__c,Description__c, Task_Start_Date__c,Project_Name__c,Status__c,Assigned_By_Name__c,Module_Name__c  from Jira_Task__c where Task_Start_Date__c  =: system.today()];
        
        List<Contact> conList = new List<Contact>();
        system.debug('taskList'+taskList);
        
        if(ConRec.Role__c != 'Project Manager'){
            conList =  [Select Id, Name from Contact where  Id = :conId and Status__c = 'Available'];
        }else{
            conList =  [Select Id, Name from Contact  where Status__c = 'Available' order by Name ASC];
        }
        system.debug('conList'+conList);
        for(Contact con : conList){
            List<Jira_Task__c> JiraTaskList = new List<Jira_Task__c>();  
            
            for(Jira_Task__c task : taskList){
                if(task.Team_Member__c == con.Id){
                    if(taskMap.containsKey(con.Name)){
                        taskMap.get(con.Name).add(task);
                    }else{
                        JiraTaskList.add(task);
                        taskMap.put(con.Name,JiraTaskList);    
                    }
                }else{
                    taskMap.put(con.Name,JiraTaskList);   
                }
            } 
        }
        system.debug('conList'+conList);
        system.debug('taskMap'+taskMap);
        for(Contact con : conList){
            map<Integer,Integer> missedCount = new map<Integer,Integer>();
            List<jiraTaskWrapper> JiraTaskWrapperList = new List<jiraTaskWrapper>();  
            
            if(taskMap.size() > 0){
                if(taskMap.get(con.Name).size() > 0){
                    //If jira tasks are there check there Slots..
                    integer totalTasks = 12;
                    system.debug('slotsBySequence.get(taskMap.get(con.Name)'+slotsBySequence);
                    for(Integer i=0 ; i < taskMap.get(con.Name).size() ; i++){
                        missedCount.put(slotsBySequence.get(taskMap.get(con.Name)[i].Task_Start_Time__c.left(5)),i);
                    }
                    
                    for(Integer i=0 ; i <= 11 ; i++){
                        jiraTaskWrapper jt = new jiraTaskWrapper();
                        jt.TaskName = '';
                        JiraTaskWrapperList.add(jt); 
                    }
                    system.debug('missedCount.keySet()'+missedCount.keySet());
                    if(missedCount.keySet().size() > 0){
                        for(Integer intValue : missedCount.keySet()){ 
                            if(intValue != null && intValue > 0){
                                system.debug('Duration'+taskMap.get(con.Name)[missedCount.get(intValue)].Estimated_Efforts_in_hour__c);
                                
                                for(Integer i = 0 ; i < taskMap.get(con.Name)[missedCount.get(intValue)].Estimated_Efforts_in_hour__c ; i++){
                                    if(taskMap.get(con.Name)[missedCount.get(intValue)].Name != null){
                                        system.debug('intValue'+intValue);
                                        system.debug('JiraTaskWrapperList[intValue+i].TaskName++++++++++++'+JiraTaskWrapperList);
                                        if((intValue + i) < 12){
                                            system.debug('intValue'+intValue+'i---->'+i);
                                            
                                            JiraTaskWrapperList[intValue+i].TaskName = taskMap.get(con.Name)[missedCount.get(intValue)].Name;
                                            JiraTaskWrapperList[intValue+i].TaskId = taskMap.get(con.Name)[missedCount.get(intValue)].Id;
                                            JiraTaskWrapperList[intValue+i].Description = taskMap.get(con.Name)[missedCount.get(intValue)].Description__c;
                                            JiraTaskWrapperList[intValue+i].TaskProjectName = taskMap.get(con.Name)[missedCount.get(intValue)].Project_Name__c;
                                            JiraTaskWrapperList[intValue+i].TaskStatus = taskMap.get(con.Name)[missedCount.get(intValue)].Status__c;
                                            JiraTaskWrapperList[intValue+i].ModuleName = taskMap.get(con.Name)[missedCount.get(intValue)].Module_Name__c;
                                            JiraTaskWrapperList[intValue+i].AssingedBy = taskMap.get(con.Name)[missedCount.get(intValue)].Assigned_By_Name__c;
                                            
                                            
                                            
                                        }else{
                                            system.debug('intValue'+intValue);
                                            JiraTaskWrapperList[intValue].TaskName = taskMap.get(con.Name)[missedCount.get(intValue)].Name;
                                            JiraTaskWrapperList[intValue].TaskId = taskMap.get(con.Name)[missedCount.get(intValue)].Id; 
                                            JiraTaskWrapperList[intValue+i].Description = taskMap.get(con.Name)[missedCount.get(intValue)].Description__c;
                                            JiraTaskWrapperList[intValue+i].TaskProjectName = taskMap.get(con.Name)[missedCount.get(intValue)].Project_Name__c;
                                            JiraTaskWrapperList[intValue+i].TaskStatus = taskMap.get(con.Name)[missedCount.get(intValue)].Status__c;
                                            JiraTaskWrapperList[intValue+i].ModuleName = taskMap.get(con.Name)[missedCount.get(intValue)].Module_Name__c;
                                            JiraTaskWrapperList[intValue+i].AssingedBy = taskMap.get(con.Name)[missedCount.get(intValue)].Assigned_By_Name__c;
                                            
                                            
                                        }
                                        
                                    }else{
                                        JiraTaskWrapperList[intValue+i].TaskName = 'Testing the Whole Flow';
                                    }
                                    
                                }   
                            }
                        }    
                    }else{
                        
                    }
                }else{
                    //if no jira tasks are there for individuals create 12 empty Tasks..
                    for(Integer i=0 ; i <= 11 ; i++){
                        jiraTaskWrapper jt = new jiraTaskWrapper();
                        jt.TaskName = '';
                        JiraTaskWrapperList.add(jt); 
                    }
                }
            }else{
                for(Integer i=0 ; i <= 11 ; i++){
                    jiraTaskWrapper jt = new jiraTaskWrapper();
                    jt.TaskName = '';
                    JiraTaskWrapperList.add(jt); 
                }
            }
            
            jiraTaskWrapperMap.put(con.Name,JiraTaskWrapperList);
            
        }
        system.debug('taskMap'+taskMap);
        system.debug('jiraTaskWrapperMap'+jiraTaskWrapperMap.get('Shubham Kumar'));
        system.debug('jiraTaskWrapperMap'+jiraTaskWrapperMap.size());
        system.debug('taskMap'+taskMap.size());
        return jiraTaskWrapperMap; 
    }
    
    public Static Map<String,Integer> getTimeSlots(){
        map<String,Integer> slotsBySequence = new map<String,Integer>();
        slotsBySequence.put('09:00',0);
        slotsBySequence.put('10:00',1);
        slotsBySequence.put('11:00',2);
        slotsBySequence.put('12:00',3);
        slotsBySequence.put('13:00',4);
        slotsBySequence.put('14:00',5);
        slotsBySequence.put('15:00',6);
        slotsBySequence.put('16:00',7);
        slotsBySequence.put('17:00',8);
        slotsBySequence.put('18:00',9);
        slotsBySequence.put('19:00',10);
        slotsBySequence.put('20:00',11);
        return slotsBySequence;
    }
    
    public class jiraTaskWrapper{
        @AuraEnabled
        public String TaskName{get; set;}
        @AuraEnabled
        public String TaskStartDateTime {get; set;}
        @AuraEnabled
        public String TaskEndDateTime {get; set;}
        @AuraEnabled
        public String TeamMemberName {get; set;}
        @AuraEnabled
        public String TaskId {get; set;}
        @AuraEnabled
        public Integer SpanLength {get; set;}
        @AuraEnabled
        public String Description  {get; set;}
        @AuraEnabled
        public String DescriptionFree {get; set;}
        @AuraEnabled
        public String TaskProjectName {get; set;}
        @AuraEnabled
        public String TaskStatus {get; set;}
        @AuraEnabled
        public String AssingedBy {get; set;}
        @AuraEnabled
        public String ModuleName {get; set;}
    }
    
}