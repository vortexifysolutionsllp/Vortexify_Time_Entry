({
    openModel: function(component, event, helper) {
      // Set isModalOpen attribute to true
      component.set("v.isModalOpen", true);
   },
  
   closeModel: function(component, event, helper) {
      // Set isModalOpen attribute to false  
      component.set("v.isModalOpen", false);
   },

    submitCase : function(component, event, helper) {
        debugger;
        var action = component.get("c.createCase");
        action.setParams({
            description: component.get("v.filledDescription"),
            contactId: component.get("v.recordId")
        });
       action.setCallback(this, function(response){
    var state = response.getState();
           console.log('Apex response state:'+state);
    if(state === "SUCCESS"){
        var toastEvent = $A.get("e.force:showToast");
        if (toastEvent) {	
            toastEvent.setParams({
                title: "Success",
                message: "Your case has been submitted.",
                type: "success",
                mode: "dismissible"
            });
            toastEvent.fire();
        }
        component.set("v.isModalOpen", false);
        component.set("v.filledDescription", "");
        
    } else if (state === "ERROR") {
        var errors = response.getError();
        console.error(errors);
        var toastEvent = $A.get("e.force:showToast");
        if (toastEvent) {
            toastEvent.setParams({
                title: "Error",
                message: errors && errors[0] && errors[0].message ? errors[0].message : "Something went wrong!",
                type: "error"
            });
            toastEvent.fire();	
        }
    }
           else {
                console.warn('Unexpected state: ' + state);
            }
});

        $A.enqueueAction(action);
    }
})