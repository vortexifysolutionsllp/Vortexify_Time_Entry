import { LightningElement, api, wire } from 'lwc';
import getApprovalRequests from '@salesforce/apex/LeaveApprovalController.getApprovalRequests';
import { refreshApex } from '@salesforce/apex';

export default class ApprovalList extends LightningElement {
    @api status;
    @api recordId;

    leaveRequests = [];
    wfhRequests = [];
    wiredResult;

    @wire(getApprovalRequests, { approverId: '$recordId', status: '$status' })
    wiredGetApprovalRequests(result,error) {
        this.wiredResult = result;
        if (result.data) {
            this.leaveRequests = result.data.leaveRequests || [];
            this.wfhRequests = result.data.wfh || [];
        }
    }

    handleRefresh(event) {
        const { recordId, status } = event.detail;
        this.leaveRequests = this.leaveRequests.filter(r => r.Id !== recordId);
        this.wfhRequests = this.wfhRequests.filter(r => r.Id !== recordId);
        this.dispatchEvent(
        new CustomEvent('showtoast', {
            detail: {
                message: `Request ${status} successfully`
            },
            bubbles: true,
            composed: true
        })
    );
        refreshApex(this.wiredResult);
    }
}
