({
    doInit : function(component, event, helper) {
        debugger;
        var recordId = component.get('v.recordId');
        console.log('-----r-test--1---' + recordId);

        var action = component.get("c.getConDetails");
        action.setParams({
            "ConId": recordId
        });

        action.setCallback(this, function(response){
            var state = response.getState();
            if (state === "SUCCESS") {

                component.set("v.recordData", response.getReturnValue());

                if(response.getReturnValue().conDetails){
                    component.set("v.conDetails", response.getReturnValue().conDetails);

                    var role = response.getReturnValue().conDetails.Role__c;

                    /* ================= DASHBOARD ROLE LOGIC (EXISTING) ================= */

                    if(role === 'Team Lead'){
                        component.set("v.ShowResTasks", false);    
                        component.set("v.ShowManDashboard", false);
                        component.set("v.ShowTLDashboard", false);
                        component.set("v.ShowResDashboard", false);
                    }
                    else if(role === 'Developer' || role === 'UI/UX Designer'){
                        component.set("v.ShowResTasks", false);    
                        component.set("v.ShowTLDashboard", true);
                        component.set("v.ShowResDashboard", false);
                    }
                    else if(role === 'Project Manager'){
                        component.set("v.ShowResTasks", false);    
                        component.set("v.ShowManDashboard", false);
                        component.set("v.ShowTLDashboard", false);
                        component.set("v.ShowResDashboard", false);
                    }

                    /* ================= DAILY TASK VIEW ACCESS CONTROL (NEW) ================= */

                    // ❌ Hide Daily Task View for Student & Developer
                    if(role === 'student' || role === 'Developer'){
                        component.set("v.ShowDailyTaskTab", false);
                        component.set("v.ShowTaskOnDTV", false);
                    } 
                    // ✅ Show for all other roles
                    else {
                        component.set("v.ShowDailyTaskTab", true);
                    }
                }

                var title = 'Welcome ' + response.getReturnValue().conDetails.Name + ' 😊😊';
                component.set("v.titleName", title);
                component.set("v.ShowProgress", true);
            }
        });
        $A.enqueueAction(action);
    },

    showModel : function(component) {
        component.set("v.isModalOpen", true);
    },

    showUploadComp : function(component) {
        component.set("v.isUploadOpen", true);
    },

    showCaseComp : function(component) {
        component.set("v.isCaseOpen", true);
    },

    ShowResource : function(component) {
        component.set("v.ShowAvaiableResource", true);
    },

    tagTeamMember : function(component) {
        component.set("v.addMember", true);
    },

    showHolidayss : function(component) {
        component.set("v.showHolidays", true);
    },

    createHolidayss : function(component) {
        component.set("v.createHolidays", true);
    },

    OpenGraphModal : function(component) {
        component.set("v.isOpenGraph", true);      
    },

    closeModal : function(component) {
        component.set("v.isOpenGraph", false);
    },

    showModuleUpdate : function(component) {
        component.set("v.isModuleUpdateOpen", true);
    },

    falsecalender : function(component, event) {
        let myData = event.getParam('data');
        if(myData === 'Success'){
            component.set("v.showHolidays", false);
            component.set("v.createHolidays", false);
        }
    },

    showChatsComp : function(component) {
        component.set("v.showAvailComp", true);
    },

   /* handleCheckIn : function(component, event, helper) {
        var action = component.get("c.checkInAttendance");
        console.log('-----r-action--1---' + JSON.stringify(action));
        action.setParams({ contactId: component.get("v.recordId") });

        action.setCallback(this, function(response) 
                           
            if (response.getState() === "SUCCESS") {
                helper.showSuccessAlert(component, response.getReturnValue());
                   component.set("v.isCheckInDisabled", true);
                  component.set("v.isCheckOutDisabled", false);
            } else {
                helper.showErrorAlert(component, "Failed to check in.");
            }
        });
        $A.enqueueAction(action);
    },*/


    handleCheckIn : function(component, event, helper) {
        var action = component.get("c.checkInAttendance");

        // ✅ Proper logging
        console.log('Check-in action:', action);

        action.setParams({
            contactId: component.get("v.recordId")
        });

        action.setCallback(this, function(response) {
            var state = response.getState();
            console.log('Check-in state:', state);

            if (state === "SUCCESS") {
                console.log('Check-in result:', response.getReturnValue());

                helper.showSuccessAlert(component, response.getReturnValue());
                component.set("v.isCheckInDisabled", true);
                component.set("v.isCheckOutDisabled", false);

            } else if (state === "ERROR") {
                var errors = response.getError();
                console.error('Check-in error:', errors);

                helper.showErrorAlert(component,
                    errors && errors[0] && errors[0].message
                    ? errors[0].message
                    : "Failed to check in."
                );
            }
        });

        $A.enqueueAction(action);
    },
    handleCheckOut : function(component, event, helper) {
        var action = component.get("c.checkOutAttendance");
        action.setParams({ contactId: component.get("v.recordId") });

        action.setCallback(this, function(response) {
            if (response.getState() === "SUCCESS") {
                helper.showSuccessAlert1(component, response.getReturnValue());
                component.set("v.isCheckOutDisabled", true);
                component.set("v.isCheckInDisabled", false);
            } else {
                helper.showErrorAlert1(component, "Failed to check out.");
            }
        });
        $A.enqueueAction(action);
    },

    /* ================= TAB HANDLERS ================= */

    handleShowTasksOnCalender : function(component) {
        component.set("v.ShowResTasks", false);
        component.set("v.ShowTLDashboard", false);
        component.set("v.ShowResDashboard", false);
        component.set("v.ShowTaskOnCalender", true);
        component.set("v.ShowLeaveManagement", false);
        component.set("v.ShowTaskOnDTV", false);
        component.set("v.ShowAttendanceManagement", false);
    },

    handleShowTasks : function(component) {
        component.set("v.ShowResTasks", true);
        component.set("v.ShowTLDashboard", false);
        component.set("v.ShowResDashboard", false);
        component.set("v.ShowTaskOnCalender", false);
        component.set("v.ShowLeaveManagement", false);
        component.set("v.ShowTaskOnDTV", false);
        component.set("v.ShowAttendanceManagement", false);
    },

    handleShowLeaveManagement: function(component, event, helper) {

    component.set("v.ShowResTasks", false);
    component.set("v.ShowTLDashboard", false);
    component.set("v.ShowResDashboard", false);
    component.set("v.ShowTaskOnCalender", false);
    component.set("v.ShowTaskOnDTV", false);
    component.set("v.ShowLeaveManagement", true);
    component.set("v.ShowAttendanceManagement", false);
 },

    handleShowTLDashboard : function(component) {
        component.set("v.ShowResTasks", false);
        component.set("v.ShowTLDashboard", true);
        component.set("v.ShowResDashboard", false);
        component.set("v.ShowTaskOnCalender", false);
        component.set("v.ShowLeaveManagement", false);
        component.set("v.ShowTaskOnDTV", false);
        component.set("v.ShowAttendanceManagement", false);
    },

    handleShowResDashboard : function(component) {
        component.set("v.ShowResTasks", false);
        component.set("v.ShowTLDashboard", false);
        component.set("v.ShowResDashboard", true);
        component.set("v.ShowTaskOnCalender", false);
        component.set("v.ShowLeaveManagement", false);
        component.set("v.ShowTaskOnDTV", false);
        component.set("v.ShowAttendanceManagement", false);
    },

    handleShowDTVDashboard : function(component) {

        // ❌ Safety check: Student & Developer blocked
        if (!component.get("v.ShowDailyTaskTab")) {
            return;
        }

        component.set("v.ShowResTasks", false);
        component.set("v.ShowTLDashboard", false);
        component.set("v.ShowResDashboard", false);
        component.set("v.ShowTaskOnCalender", false);
        component.set("v.ShowLeaveManagement", false);
        component.set("v.ShowAttendanceManagement", false);
        component.set("v.ShowTaskOnDTV", true);
    },
        handleShowAttendanceManagement: function(component, event, helper) {
        component.set("v.ShowResTasks", false);
        component.set("v.ShowTLDashboard", false);
        component.set("v.ShowResDashboard", false);
        component.set("v.ShowTaskOnCalender", false);
        component.set("v.ShowTaskOnDTV", false);
        component.set("v.ShowLeaveManagement", false);
         component.set("v.ShowAttendanceManagement", true);
    },

    handleLogout : function() {
        window.location.href = 'https://vortexifysolutionsllp--timeentry--c.sandbox.vf.force.com/apex/CustomerLoginPage';
    },

    refreshTaskPage : function() {
        location.reload();
    }
})