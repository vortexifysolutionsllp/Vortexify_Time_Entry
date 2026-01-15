import { LightningElement, api } from 'lwc';
import approveRequest from '@salesforce/apex/LeaveApprovalController.approveRequest';
import rejectRequest from '@salesforce/apex/LeaveApprovalController.rejectRequest';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ApprovalCard extends LightningElement {
    @api request;
    @api status;
    @api recordId;

    get isPending() {
        return this.status === 'Pending';
    }

    get statusClass() {
        return `badge ${this.status.toLowerCase()}`;
    }

    async approve() {
        await this.handleAction(approveRequest, 'Approved');
    }

    async reject() {
        await this.handleAction(rejectRequest, 'Rejected');
    }

    async handleAction(apexMethod, actionLabel) {
        try {
            const result = await apexMethod({ recordId: this.request.Id });

            if (result && result.toUpperCase().includes('SUCCESS')) {
                this.dispatchEvent(
                    new CustomEvent('refresh', {
                        detail: {recordId: this.request.Id,
                            status: actionLabel
                         },
                        bubbles: true,
                        composed: true
                    })
                );
            }
        } catch (error) {
            
        }
    }
}
