import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import SWEETALERT from '@salesforce/resourceUrl/sweetalert2';

export default class ApprovalManagement extends LightningElement {
    @track activeMainTab = 'Pending';
    @api recordId;

    handleMainTab(event) {
        this.activeMainTab = event.target.value;
    }

        sweetAlertInitialized = false;

    renderedCallback() {
    if (this.sweetAlertInitialized) {
        return;
    }
    this.sweetAlertInitialized = true;

    Promise.all([
        loadScript(this, SWEETALERT + '/sweetalert2.all.min.js'),
        loadStyle(this, SWEETALERT + '/sweetalert2.min.css')
    ])
        .then(() => {
        console.log('SweetAlert2 loaded');
        if (typeof Swal !== 'undefined') {
            window.Swal = Swal; // make it globally accessible if needed
        }
        })
        .catch(error => {
        console.error('Error loading SweetAlert2:', error);
        });
    }

    handleShowToast(event) {
        const message = event.detail.message;
        this.showSwalAlert('Success', message, 'success');
    }

    showSwalAlert(title, message, icon) {
        if (window.Swal) {
          Swal.fire({
            title: title,
            text: message,
            icon: icon, // 'success', 'error', 'warning', 'info', 'question'
            confirmButtonText: 'OK',
            position: 'center',
            backdrop: true,
            allowOutsideClick: false,

          });
        } else {
          console.error('Swal not loaded');
        }
      }
}
