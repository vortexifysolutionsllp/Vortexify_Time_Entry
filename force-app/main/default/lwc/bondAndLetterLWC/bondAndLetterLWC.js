import { LightningElement, api } from 'lwc';
import sendEmploymentBond from '@salesforce/apex/EmploymentBondService.sendEmploymentBond';
import sendLetterOfAppointment from '@salesforce/apex/EmploymentBondService.LetterOfAppointment';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CloseActionScreenEvent } from 'lightning/actions';

export default class EmploymentBond extends LightningElement {
    @api recordId;
    @api isBond;
    isLoading = false;

    connectedCallback() {
        this.isLoading = true;
        setTimeout(() => {
            console.log('----isBond----', this.isBond);

            // choose method based on isBond
            let action = this.isBond ? sendEmploymentBond : sendLetterOfAppointment;

            action({ contactId: this.recordId })
                .then(() => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: this.isBond
                                ? 'Employment Bond PDF saved in Files.'
                                : 'Letter of Appointment PDF saved in Files.',
                            variant: 'success'
                        })
                    );
                })
                .catch(error => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
                            message: error.body.message,
                            variant: 'error'
                        })
                    );
                })
                .finally(() => {
                    this.isLoading = false;
                    this.closeQuickAction();
                });
        }, 6000); // delay in ms
    }

    closeQuickAction() {
        this.dispatchEvent(new CloseActionScreenEvent());
    }
}