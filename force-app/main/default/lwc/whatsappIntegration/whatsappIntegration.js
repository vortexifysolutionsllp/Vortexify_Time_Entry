import { LightningElement, api } from 'lwc';
import sendTemplateMessage from '@salesforce/apex/WhatsAppIntegrationController.sendTemplateMessage';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class WhatsappIntegration extends LightningElement {
    @api recordId;

    handleSendClick() {
        sendTemplateMessage({ contactId: this.recordId })
            .then(result => {
                if (result) {
                    this.showToast('Success', 'Message sent to WhatsApp successfully!', 'success');
                } else {
                    this.showToast('Error', 'Failed to send message.', 'error');
                }
            })
            .catch(error => {
                console.error(error);
                this.showToast('Error', 'Exception occurred while sending.', 'error');
            });
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant
            })
        );
    }
}