global  without sharing class CSV_Controller {
    
    @AuraEnabled
    public static void processData(String fileData,String sobjectName,List<String> fields) 
    {
        System.debug('fileData:::'+filedata);
        System.debug('sobjectName:::'+sobjectName);
        System.debug('fields:::'+fields);
        map<String,String> ConIdByName = new  map<String,String>();
        map<string,String> apiNameByLabelName = new map<String,String>();
        map<string,String> moduleIdByProjectName = new map<String,String>();
        map<string,String> moduleIdByModuleName = new map<String,String>();
        
        List<Module__c> moduleList = [SELECT Id,Name,Project_Name__c  FROM Module__c];
        for(Module__c Mod : moduleList){
            moduleIdByProjectName.put(Mod.Project_Name__c , Mod.Id);
            moduleIdByModuleName.put(Mod.Name , Mod.Id);
        }
        
        List<Contact> ConList = [SELECT Id,name , RecordType.name FROM Contact where RecordType.name = 'Resource'];
        for(Contact Con : ConList){
            ConIdByName.put(Con.name , con.Id);
        }
        system.debug('ConIdByName'+ConIdByName);
        List<Jira_Tasks_Fields__c> jtFields = [SELECT API_Name__c,Name FROM Jira_Tasks_Fields__c];
        
        for(Jira_Tasks_Fields__c jtf : jtFields){
            apiNameByLabelName.put(jtf.Name , jtf.API_Name__c);
        }
        
        Jira_Task__c jt = new Jira_Task__c();
        List<Jira_Task__c> accts = new List<Jira_Task__c>();
        
        List<sObject> myList = new List<sObject>();
        
        Schema.SObjectType targetType = Schema.getGlobalDescribe().get(sobjectName);
        
        try{
            if(fileData!=null) { 
                String[] fileLines = new String[]{};
                    fileLines = fileData.split('\n');
                //for content
                
                for (Integer i=1,j=fileLines.size();i<j;i++){
                    String[] inputvalues = new String[]{};
                        inputvalues = fileLines[i].split(',');
                    sObject obj = targetType.newSObject();
                    integer rowsize=inputvalues.size();
                    for(integer l=0;l<rowsize;l++){ 
                        system.debug('l'+fields.get(l));
                        if (fields.get(l) == 'Project Name' || fields.get(l) == 'Module Name' ) { 
                            String value= inputvalues[l].length()>255 ? inputvalues[l].substring(0,254) : inputvalues[l];
                            if(moduleIdByModuleName.get(value) != null){
                                system.debug('moduleIdByProjectName'+moduleIdByModuleName);
                                system.debug('moduleIdByProjectName'+moduleIdByModuleName.get(value));
                                obj.put('Module__c',moduleIdByModuleName.get(value));
                            }else{
                                system.debug('moduleIdByProjectName'+moduleIdByProjectName);
                                system.debug('moduleIdByProjectName'+moduleIdByProjectName.get(value));
                                obj.put('Module__c',moduleIdByProjectName.get(value));
                            }
                            
                        }else if (fields.get(l) == 'Team Member' || fields.get(l) == 'Stand By Resource' || fields.get(l) == 'Assigned By') { 
                            if(String.isNotBlank(inputvalues[l]) )
                            {
                                String value= inputvalues[l].length()>255 ? inputvalues[l].substring(0,254) : inputvalues[l];
                                obj.put(apiNameByLabelName.get(fields.get(l)),ConIdByName.get(value));
                                
                                system.debug('ConIdByName.get(value) ' + ConIdByName.get(value));
                               
                            }else{
                                obj.put(fields.get(l),'');
                            }
                        }else if(fields.get(l) == 'Estimated Efforts' ){
                            String value= inputvalues[l].length()>255 ? inputvalues[l].substring(0,254) : inputvalues[l];
                            obj.put(apiNameByLabelName.get(fields.get(l)),Decimal.valueOf(value));
                        }else if(fields.get(l) == 'Estimated Start Date' ){
                            String value= inputvalues[l].length()>255 ? inputvalues[l].substring(0,254) : inputvalues[l];
                            obj.put(apiNameByLabelName.get(fields.get(l)),date.valueOf(value));
                        }else{
                            if(String.isNotBlank(inputvalues[l]) )
                            {
                                String value= inputvalues[l].length()>255 ? inputvalues[l].substring(0,254) : inputvalues[l];
                                obj.put(apiNameByLabelName.get(fields.get(l)),value);
                                system.debug('field name: ' + apiNameByLabelName.get(fields.get(l)));
                                //system.debug('Field name Value ' + value);
                            }else{
                                obj.put(fields.get(l),'');
                            }
                        }
                    }
                    //   System.debug('Obj::::'+obj);
                    myList.add(obj);
                    
                }
                
                //
            }
            if (myList.size() > 0) { 
                System.debug('myList::::'+myList);
                insert myList;
                system.debug('myList after insert'+myList);
            }
        }catch(Exception e){
            System.debug('exception'+e);   
        }
        
    }
}