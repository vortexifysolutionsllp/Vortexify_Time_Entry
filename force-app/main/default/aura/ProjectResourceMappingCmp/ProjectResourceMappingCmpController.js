({
    doInit: function(component, event, helper) {
        debugger;
        var prmList = component.get("v.prmList");
        
        prmList.push({
            'sobjectType': 'Project_Resource_Mapping__c',
            'Project__c': '',
            'Contact__c': '',
            'Type__c': ''
        });
        component.set("v.prmList", prmList);
    },
    
    handleAddRow : function(component, event, helper){
        debugger;
        
        var prmList = component.get("v.prmList");
        
        prmList.push({
            'sobjectType': 'Project_Resource_Mapping__c',
            'Project__c': '',
            'Contact__c': '',
            'Type__c': ''
        });
        component.set("v.prmList", prmList);
    },
    
    removeRecord : function(component, event, helper){
        //  alert("Remove Record");
        // getting the jiraTaskList
        var prmList = component.get("v.prmList");
        // getting the target object
        var selectedItem = event.currentTarget;
        // getting the selected item index
        var index = selectedItem.dataset.record;
        // remove single record from account List
        prmList.splice(index, 1);
        // set modified account list
        component.set("v.prmList", prmList);
    },
    
    Save: function(component, event, helper) {
        debugger;
        var prmList = component.get("v.prmList") ;
        
        for (let i = 0; i < prmList.length; i++) {
            prmList[i].Contact__c = prmList[i].Contact__c.Id;
        }
        
        if (helper.validateRequired(component, event)) {
            var action = component.get("c.saveProjectResourceMapping");
            action.setParams({
                'prmList' : component.get("v.prmList") 
            });
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    if(response.getReturnValue() == null){
                        alert('This Team Member is already Working on this Project..');
                    }else{
                        component.set("v.prmList",response.getReturnValue());
                        alert('Team Member Added');    
                    }
                    
                }
            });
            $A.enqueueAction(action);
        }
    },
    
    addNewRow: function(component, event, helper) {        
        helper.createObjectData(component, event);
    },
    
    removeDeletedRow: function(component, event, helper) { 
        var index = event.getParam("indexVar");   
        var AllRowsList = component.get("v.prmList");
        AllRowsList.splice(index, 1);
        component.set("v.prmList", AllRowsList);
    },
    openModel: function(component, event, helper) {
        // Set isModalOpen attribute to true
        component.set("v.isModalOpen", true);
    },
    
    closeModel: function(component, event, helper) {
        // Set isModalOpen attribute to false  
        component.set("v.isModalOpen", false);
    },
      handleComponentEvent : function(component, event, helper) {
     
    // get the selected Account record from the COMPONETN event 	 
       var selectedAccountGetFromEvent = event.getParam("accountByEvent");
	   
	   component.set("v.selectedRecord" , selectedAccountGetFromEvent); 
       console.log('selectedAccountGetFromEvent',selectedAccountGetFromEvent);
      
	},
})