import { LightningElement, api, track } from 'lwc';
import approveRequest from '@salesforce/apex/LeaveApprovalController.approveRequest';
import rejectRequest from '@salesforce/apex/LeaveApprovalController.rejectRequest';

export default class ApprovalCard extends LightningElement {
    @api request;
    @api status;
    @api recordId;
    @track showRejectReason = false;
    @track rejectReason = '';

    handleRejectClick() {
        if (!this.showRejectReason) {
            this.showRejectReason = true;
            return;
        }

        if (!this.rejectReason || this.rejectReason.trim().length === 0) {
            this.showToast('Error', 'Please enter a reason for rejection', 'error');
            return;
        }

        this.reject();
    }

    handleRejectReasonChange(event) {
        this.rejectReason = event.target.value;
    }

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
            const result = await apexMethod({ recordId: this.request.Id , rejectionReason: this.rejectReason});

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
