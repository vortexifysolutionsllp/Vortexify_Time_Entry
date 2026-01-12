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
             label: 'Error in Check-IN!!',
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
     
 })