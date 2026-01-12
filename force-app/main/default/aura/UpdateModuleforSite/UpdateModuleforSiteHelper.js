({
    fetchModulesFromProject: function(component) {
        var moduleData = [];
        var projectid = component.get("v.ProjectId");

        var action = component.get("c.UpdateMilesstonesfromsite");
        action.setParams({ "projID": projectid });

        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var responseData = response.getReturnValue();
                if (responseData.length > 0) {
                    for (let i = 0; i < responseData.length; i++) {
                        moduleData.push({
                            'Name': responseData[i].Name,
                            'Id': responseData[i].Id,
                            'Description': responseData[i].Module_Description__c,
                            'Actual_Hours': responseData[i].Actual_Estimated_Efforts__c,
                            'Aniticipated_Hours': responseData[i].Anticipated_Hours__c,
                            'Status': responseData[i].Is_Completed__c,
                            'is_Updated': false,
                            'is_Disabled': true,
                            'ProjectID': responseData[i].Project__c,
                            'PRM': responseData[i].Project_Resource_Mapping__c,
                        });
                    }
                }
                component.set("v.data", moduleData);
                component.set("v.truthy", true);
            }
        });

        $A.enqueueAction(action);
    },

     saveEdition: function (component, draftValues) {
        var self = this;
        // simulates a call to the server, similar to an apex controller.
        this
            .server
            .updateOpportunities(draftValues)
            .then($A.getCallback(function (response) {
                var state = response.state;

                if (state === "SUCCESS") {
                    var returnValue = response.returnValue;

                    if (Object.keys(returnValue.errors).length > 0) {
                        // the draft values have some errors, setting them will show it on the table
                        component.set('v.errors', returnValue.errors);
                    } else {
                        // Yay! success, initialize everything back
                        component.set('v.errors', []);
                        component.set('v.draftValues', []);
                        self.fetchData(component);
                    }
                } else if (state === "ERROR") {
                    var errors = response.error;
                    console.error(errors);
                }
            }));
    },
})