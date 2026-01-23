({
    doInit : function(component, event, helper) {
        debugger;
        var recordId = component.get('v.recordId');

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
                    component.set("v.isCheckInDisabled", response.getReturnValue().isCheckedIn);
                    component.set("v.isCheckOutDisabled", response.getReturnValue().isCheckedOut);

                    var role = response.getReturnValue().conDetails.Role__c;

                    /* ================= DASHBOARD ROLE LOGIC (EXISTING) ================= */

                    if(role === 'Team Lead'){
                        component.set("v.ShowResTasks", false);    
                        component.set("v.ShowManDashboard", false);
                        component.set("v.ShowTLDashboard", true);
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
                        component.set("v.ShowTLDashboard", true);
                        component.set("v.ShowResDashboard", false);
                    }

                    /* ================= DAILY TASK VIEW ACCESS CONTROL (NEW) ================= */

                    // ❌ Hide Daily Task View for Student & Developer
                    if(role === 'Student' || role === 'Developer' || role === 'Quality Analyst' || role === 'Consultant'){
                        component.set("v.ShowDailyTaskTab", false);
                        component.set("v.ShowTaskOnDTV", false);
                    }
                    else {
                        component.set("v.ShowDailyTaskTab", true);
                    }
                }

                var title = 'Welcome ' + response.getReturnValue().conDetails.Name;
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


    // handleCheckIn : function(component, event, helper) {
    //     var action = component.get("c.checkInAttendance");

    //     action.setParams({
    //         contactId: component.get("v.recordId")
    //     });

    //     action.setCallback(this, function(response) {
    //         var state = response.getState();
    //         if (state === "SUCCESS") {
    //             console.log('Check-in result:', response.getReturnValue());
    //             if(response.getReturnValue().includes('not allowed')){
    //                 helper.showErrorAlert(component,response.getReturnValue());
    //             }else{
    //                 helper.showSuccessAlert(component, response.getReturnValue());
    //                 component.set("v.isCheckInDisabled", true);
    //                 component.set("v.isCheckOutDisabled", false);
    //             }
    //         } else if (state === "ERROR") {
    //             var errors = response.getError();
    //             console.error('Check-in error:', errors);

    //             helper.showErrorAlert(component,
    //                 errors && errors[0] && errors[0].message
    //                 ? errors[0].message
    //                 : "Failed to check in."
    //             );
    //         }
    //     });

    //     $A.enqueueAction(action);
    // },
    // handleCheckOut : function(component, event, helper) {
    //     var action = component.get("c.checkOutAttendance");
    //     action.setParams({ contactId: component.get("v.recordId") });

    //     action.setCallback(this, function(response) {
    //         if (response.getState() === "SUCCESS") {
    //             helper.showSuccessAlert1(component, response.getReturnValue());
    //             component.set("v.isCheckOutDisabled", true);
    //             component.set("v.isCheckInDisabled", true);
    //         } else {
    //             helper.showErrorAlert1(component, "Failed to check out.");
    //         }
    //     });
    //     $A.enqueueAction(action);
    // },

    handleCheckIn : function(component, event, helper) {
        helper.checkLocationAndProceed(component, 'CHECKIN', helper);
    },

    handleCheckOut : function(component, event, helper) {
        helper.checkLocationAndProceed(component, 'CHECKOUT', helper);
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
        component.set("v.ShowLeaveApproval", false);
    },

    handleShowTasks : function(component) {
        component.set("v.ShowResTasks", true);
        component.set("v.ShowTLDashboard", false);
        component.set("v.ShowResDashboard", false);
        component.set("v.ShowTaskOnCalender", false);
        component.set("v.ShowLeaveManagement", false);
        component.set("v.ShowTaskOnDTV", false);
        component.set("v.ShowAttendanceManagement", false);
        component.set("v.ShowLeaveApproval", false);
    },

    handleShowLeaveManagement: function(component, event, helper) {

    component.set("v.ShowResTasks", false);
    component.set("v.ShowTLDashboard", false);
    component.set("v.ShowResDashboard", false);
    component.set("v.ShowTaskOnCalender", false);
    component.set("v.ShowTaskOnDTV", false);
    component.set("v.ShowLeaveManagement", true);
    component.set("v.ShowAttendanceManagement", false);
    component.set("v.ShowLeaveApproval", false);
 },

    handleShowTLDashboard : function(component) {
        component.set("v.ShowResTasks", false);
        component.set("v.ShowTLDashboard", true);
        component.set("v.ShowResDashboard", false);
        component.set("v.ShowTaskOnCalender", false);
        component.set("v.ShowLeaveManagement", false);
        component.set("v.ShowTaskOnDTV", false);
        component.set("v.ShowAttendanceManagement", false);
        component.set("v.ShowLeaveApproval", false);
    },

    handleShowResDashboard : function(component) {
        component.set("v.ShowResTasks", false);
        component.set("v.ShowTLDashboard", false);
        component.set("v.ShowResDashboard", true);
        component.set("v.ShowTaskOnCalender", false);
        component.set("v.ShowLeaveManagement", false);
        component.set("v.ShowTaskOnDTV", false);
        component.set("v.ShowAttendanceManagement", false);
        component.set("v.ShowLeaveApproval", false);
    },

    handleShowDTVDashboard : function(component) {

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
        component.set("v.ShowLeaveApproval", false);
    },
    handleShowLeaveApproval : function(component) {

        if (!component.get("v.ShowDailyTaskTab")) {
            return;
        }

        component.set("v.ShowResTasks", false);
        component.set("v.ShowTLDashboard", false);
        component.set("v.ShowResDashboard", false);
        component.set("v.ShowTaskOnCalender", false);
        component.set("v.ShowLeaveManagement", false);
        component.set("v.ShowAttendanceManagement", false);
        component.set("v.ShowTaskOnDTV", false);
        component.set("v.ShowLeaveApproval", true);
    },
        handleShowAttendanceManagement: function(component, event, helper) {
        component.set("v.ShowResTasks", false);
        component.set("v.ShowTLDashboard", false);
        component.set("v.ShowResDashboard", false);
        component.set("v.ShowTaskOnCalender", false);
        component.set("v.ShowTaskOnDTV", false);
        component.set("v.ShowLeaveManagement", false);
         component.set("v.ShowAttendanceManagement", true);
         component.set("v.ShowLeaveApproval", false);
    },

    handleLogout : function() {
        window.location.href = 'https://vortexifysolutionsllp--timeentry--c.sandbox.vf.force.com/apex/CustomerLoginPage';
    },

    refreshTaskPage : function() {
        location.reload();
    },

})