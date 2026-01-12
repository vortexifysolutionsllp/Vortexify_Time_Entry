import { LightningElement, track } from 'lwc';
import scheduleMeet from '@salesforce/apex/GoogleMeetController.createGoogleMeet';
//import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class GoogleMeetService extends LightningElement {
    
    @track meetUrl;
    @track isModalOpen = false;
    @track startTime = '';
    @track endTime = '';
    @track subject = '';

    handleCreateMeet() {
        scheduleMeet({ 
            startTime: new Date(this.startTime).toISOString(), 
            endTime: new Date(this.endTime).toISOString(), 
            subject: this.subject 
        })
        .then(result => {
            this.meetUrl = result;
        })
        .catch(error => {
            console.error('Error scheduling Google Meet:', error);
        });
    }
    // Open Modal
    handleOpen() {
        this.isModalOpen = true;
    }

    // Close Modal
    handleClose() {
        this.isModalOpen = false;
    }

    // Handle Start Time Change
    handleStartTimeChange(event) {
        this.startTime = event.target.value;
    }
// Handle Start Time Change
handleEndTimeChange(event) {
    this.endTime = event.target.value;
}
    // Handle EventT itle Change
    handleChange(event) {
        //console.log('Event Triggered:', event.detail.value);
        this.subject = event.target.value;
    }
   
}