({
    fetchTaskMap : function(component, event, helper) {
        debugger;
        component.set("v.showSpinner", true);
        var conId = component.get("v.recordId");
        var action = component.get("c.getTaskListByResources");
        action.setParams({
            conId : conId
        });
        action.setCallback(this, function(response){
            var state = response.getState();
            if (state === "SUCCESS") {
                var contact = [];
                var result = response.getReturnValue();
                for(var key in result){
                    contact.push({key:key , value:result[key]});
                }
                component.set("v.conList",contact);         
                component.set("v.showSpinner", false);
                component.set("v.showComp", true);
            }
        });
        $A.enqueueAction(action);
    },
    
    navigatingToTask : function (component, event, helper) {
        debugger;
        
        var TaskName =  event.target.getAttribute('data-recid');
        var AssingedBy =  event.target.getAttribute('data-giver');
        var ModuleName =  event.target.getAttribute('data-modulename');
        var TaskProjectName = event.target.getAttribute('data-projectname');
        var Descrption = event.currentTarget.id; 
        component.set("v.TaskProjectName", TaskProjectName);
        component.set("v.jiraTaskName", TaskName);
        component.set("v.filledDescription", Descrption);
        component.set("v.AssingedBy", AssingedBy);
        component.set("v.ModuleName", ModuleName);
        component.set("v.showTaskInfo", true);
        /*var recordid = event.target.getAttribute('data-recid'); 
        var navEvt = $A.get("e.force:navigateToSObject");
        navEvt.setParams({
            "recordId": recordid,
            "slideDevName": "related"
        });
        navEvt.fire();
        */
    }, 
    
    refreshBoard : function (component, event, helper) {
        debugger;
        component.set("v.showComp", false);
        component.set("v.showSpinner", true);
        var conId = component.get("v.recordId");
        var action = component.get("c.getTaskListByResources");
        action.setParams({
            conId : conId
        });
        action.setCallback(this, function(response){
            var state = response.getState();
            if (state === "SUCCESS") {
                var contact = [];
                var result = response.getReturnValue();
                for(var key in result){
                    contact.push({key:key , value:result[key]});
                }
                component.set("v.conList",contact);         
                component.set("v.showSpinner", false);
                helper.successAlert(component , event , 'Task-List Updated!!😊');
                component.set("v.showComp", true);
            }
        });
        $A.enqueueAction(action);
        
    },    
})