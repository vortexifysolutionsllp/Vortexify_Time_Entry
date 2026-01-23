({
     showSuccessAlert: function(cmp, message) {
         this.LightningAlert.open({
             message: message,
             theme: 'success',
             label: 'Check-In',
         }).then(function() {
             console.log('alert is closed');
         });
     },

     showErrorAlert: function(cmp, message) {
         this.LightningAlert.open({
             message: message,
             theme: 'error',
             label: 'Error',
         }).then(function() {
             console.log('alert is closed');
         });
     },
     showSuccessAlert1: function(cmp, message) {
         this.LightningAlert.open({
             message: message,
             theme: 'error',
             label: 'Check-Out',
         }).then(function() {
             console.log('alert is closed');
         });
     },

     showErrorAlert1: function(cmp, message) {
         this.LightningAlert.open({
             message: message,
             theme: 'error',
             label: 'Error in Check-Out!!',
         }).then(function() {
             console.log('alert is closed');
         });
     },
     showmeSuccessAlert: function(cmp, message) {
         this.LightningAlert.open({
             message: message,
             theme: 'success',
             label: 'Available',
         }).then(function() {
             console.log('alert is closed');
         });
     },

     showmeErrorAlert: function(cmp, message) {
         this.LightningAlert.open({
             message: message,
             theme: 'error',
             label: 'You got an Error!!',
         }).then(function() {
             console.log('alert is closed');
         });
     },

     proceedCheckIn : function(component) {
        var action = component.get("c.checkInAttendance");
        action.setParams({
            contactId: component.get("v.recordId")
        });

        action.setCallback(this, function(response) {
            if (response.getState() === "SUCCESS") {
                if (response.getReturnValue().includes('not allowed')) {
                    component.set("v.isLoading", false);
                    this.showErrorAlert(component, response.getReturnValue());
                } else {
                    component.set("v.isLoading", false);
                    this.showSuccessAlert(component, response.getReturnValue());
                    component.set("v.isCheckInDisabled", true);
                    component.set("v.isCheckOutDisabled", false);
                }
            } else {
                component.set("v.isLoading", false);
                this.showErrorAlert(component, 'Failed to check in.');
            }
        });
        $A.enqueueAction(action);
    },

    proceedCheckOut : function(component) {
        var action = component.get("c.checkOutAttendance");
        action.setParams({
            contactId: component.get("v.recordId")
        });

        action.setCallback(this, function(response) {
            if (response.getState() === "SUCCESS") {
                component.set("v.isLoading", false);
                this.showSuccessAlert1(component, response.getReturnValue());
                component.set("v.isCheckOutDisabled", true);
                component.set("v.isCheckInDisabled", true);
            } else {
                component.set("v.isLoading", false);
                this.showErrorAlert1(component, 'Failed to check out.');
            }
        });
        $A.enqueueAction(action);
    },

    getDistanceInMeters : function(lat1, lon1, lat2, lon2) {
        var R = 6371000;
        var dLat = this.toRadians(lat2 - lat1);
        var dLon = this.toRadians(lon2 - lon1);

        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) *
            Math.cos(this.toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    },

    toRadians : function(deg) {
        return deg * (Math.PI / 180);
    },

    checkLocationAndProceed : function(component, actionType, helper) {
        component.set("v.isLoading", true);
        if (!navigator.geolocation) {
            helper.showErrorAlert(component, 'Geolocation is not supported.');
            component.set("v.isLoading", false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            function(position) {

                var userLat = position.coords.latitude;
                var userLng = position.coords.longitude;

                var targetLat = 28.62136950025061;
                var targetLng = 77.37895850994343;

                // var targetLat = 28.6271;
                // var targetLng = 77.3733;

                var distance = helper.getDistanceInMeters(
                    userLat, userLng,
                    targetLat, targetLng
                );

                if (distance <= 200) {
                    console.log("Distance:", distance)
                    if (actionType === 'CHECKIN') {
                        helper.proceedCheckIn(component);
                    } else if (actionType === 'CHECKOUT') {
                        helper.proceedCheckOut(component);
                    }
                } else {
                    console.log("Distance:", distance)
                    component.set("v.isLoading", false);
                    helper.showErrorAlert(
                        component,
                        'You must be within 100 meters of the office location to perform this action.'
                    );
                }
            },
            
            function() {
                helper.showErrorAlert(component, 'Unable to fetch your current location.');
            }
        );
    }
     
 })