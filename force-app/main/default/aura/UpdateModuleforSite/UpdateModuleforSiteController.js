({    
    doInit: function (component, event, helper) {
        debugger;
    },
    
    viewRecord : function(component, event, helper){
        debugger;
        var recId = event.getParam('row').Id;
        var actionName = event.getParam('action').name;
        if ( actionName == 'Close') {
            alert('Close');
            var projectid=component.get("v.ProjectId");
            let action = component.get("c.UpdateModule");
            action.setParams({
                "Moduleid": recId,
                "Action":actionName
            });
            action.setCallback(this, function(response) {
                //get response status 
                var state = response.getState();
                if (state === "SUCCESS") {
                    
                    // window.location.reload()
                    
                }
            }); 
            $A.enqueueAction(action);
            
        } if(actionName == 'Delete'){
            alert('Delete');
            var projectid=component.get("v.ProjectId");
            let action = component.get("c.UpdateModule");
            action.setParams({
                "Moduleid": recId,
                "Action":actionName
            });
            action.setCallback(this, function(response) {
                //get response status 
                var state = response.getState();
                if (state === "SUCCESS") {
                    // window.location.reload()
                }
            }); 
            $A.enqueueAction(action);
            
        }
    },
    
    handleCloseAccount: function(component, event, helper){
        debugger;
        var recId = event.getSource().get("v.name");
        alert("You clicked: " + event.getSource().get("v.name"));
        let action = component.get("c.UpdateModuless");
        action.setParams({
            "Moduleid": recId
        });
        action.setCallback(this, function(response) {
            //get response status 
            var state = response.getState();
            if (state === "SUCCESS") {
                
                //window.location.reload()
                
            }
        }); 
        $A.enqueueAction(action);
    },
    handleDeleteAccount: function(component, event, helper){
        debugger;
        var recId = event.getSource().get("v.name");
        var ModuleList =component.get("v.data");
        for(var i=0; i< ModuleList.length(); i++){
            if(ModuleList[i].Id ==recId){
                var AcntipatedValue =ModuleList[i].Anticipated_Hours__c;
                
            }
        }
        alert("You clicked: " + event.getSource().get("v.name"));
        let action = component.get("c.UpdateModules");
        action.setParams({
            "Moduleid": recId
        });
        action.setCallback(this, function(response) {
            //get response status 
            var state = response.getState();
            if (state === "SUCCESS") {
                
                // window.location.reload()
                
            }
        }); 
        $A.enqueueAction(action);
    },
    closeModel : function(component, event, helper){
        debugger;
        component.set("v.isModalOpen",false);
    },
    handleProductChange: function(component, event, helper) {
        console.log("Welcome");
        var recordId = event.getParam("recordId");
        var recordName = event.getParam("recordName");
        console.log("Selected Product ID:", recordId);
        console.log("Selected Product Name:", recordName);
        
        
        component.set("v.ProjectId", recordId); // Set selected Project ID
        
        // Automatically call your existing method to fetch data
        helper.fetchModulesFromProject(component);
    },
    
    saveChangesRecord: function(component, event) {
        debugger;
        console.log('---In Save Method----');
        var ModuleListt = component.get("v.data");
        console.log('----modulelist----', JSON.stringify(ModuleListt));
        
        // Prepare the data for saving
        debugger;
        let action = component.get("c.saveModuleLIst");
        var newModuleListt = [];
        console.log('----modulelist111----', newModuleListt);
        debugger;
        // Ensure we have all necessary data before sending it to the Apex controller
        for (var i = 0; i < ModuleListt.length; i++) {
            if (ModuleListt[i].Name && ModuleListt[i].Description && ModuleListt[i].Actual_Hours) {
                newModuleListt.push({
                    'Name': ModuleListt[i].Name,
                    'Id': ModuleListt[i].Id,
                    'Module_Description__c': ModuleListt[i].Description,
                    'Actual_Estimated_Efforts__c': ModuleListt[i].Actual_Hours,
                    'Anticipated_Hours__c': ModuleListt[i].Anticipated_Hours,
                    'Is_Completed__c': ModuleListt[i].Status,
                    'Project__c': ModuleListt[i].Project__c,
                    'Project_Resource_Mapping__c': ModuleListt[i].Project_Resource_Mapping__c
                });
            } else {
                alert('Some mandatory fields are missing');
                return; // Exit the function if any required field is missing
            }
        }
        
        // Send the prepared list of modules to Apex for saving
        action.setParams({
            "mddList": newModuleListt
        });
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var returnValue = response.getReturnValue();
                if (returnValue) {
                    alert('Modules updated successfully!');
                    component.set("v.isModalOpen", false); // Close the modal after successful save
                    // Optionally, refresh the data or reload the page
                    // window.location.reload(); 
                }
            } else if (state === "ERROR") {
                var errors = response.getError();
                console.error(errors);
                alert('An error occurred while saving the data.');
            }
        });
        
        $A.enqueueAction(action);
    }, 
    EditableInput:function(component,event,helper){
        debugger;
        var moduleList = component.get("v.data");
        var selId = event.getSource().get("v.name");
        //Get the target object
        //Get the selected item index
        
        for(var i=0; i< moduleList.length; i++){
            if(moduleList[i].Id == selId ){
                if(moduleList[i].is_Disabled = true){
                    moduleList[i].is_Disabled = false;
                }
                else if (moduleList[i].is_Disabled = false){
                    moduleList[i].is_Disabled = true
                }
                
            }
        }
        //Remove single record from account list
        
        //Set modified account list
        component.set("v.data", moduleList);        
    },
    addRow: function(component, event, helper) {
        debugger; 
        var moduleList = component.get("v.data");
        var projectID = component.get("v.ProjectId");
        var PRM = component.get("v.data[0].PRM");
        //Add New Account Record
        moduleList.push({
            //'sobjectType': 'Milestone__c',
            'Name':'',
            'Project_Resource_Mapping__c':PRM,
            'Project__c':projectID,
            'Actual_Estimated_Efforts__c':'',
            'Anticipated_Hours__c':'',
            'Is_Completed__c':'',
            'Module_Start_Date__c':'',
            'Total_Estimated_Effort__c':'',
            
        });
        
        component.set("v.data", moduleList);
    }
})