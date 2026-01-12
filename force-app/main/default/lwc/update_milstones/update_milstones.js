import { LightningElement, api, track } from 'lwc';
import getMilesstones from '@salesforce/apex/AddModuleButtonHelper.getMilesstones';
import UpdateMilesstones from '@salesforce/apex/AddModuleButtonHelper.UpdateMilesstones';

export default class Update_milstones extends LightningElement {
    @api recordId='';
    @track MilestoneList = [];
    @track porjectTitlewithName = 'Shiav';

    connectedCallback() {
        this.doInit();
    }

    doInit() {
        debugger;
        let projectId = this.recordId;
        getMilesstones({ projectiD: projectId })
            .then(result => {
                debugger;
                this.MilestoneList = result;
                if (this.MilestoneList.length > 0) {
                    var projectName = this.MilestoneList[0].Project__r.Name;
                    this.porjectTitlewithName = `Update Miles stones for ${projectName}`;
                }
            })
            .catch(error => {
                console.error('Error retrieving milestones: ', error);
            });
    }

    updateMilestones() {
        debugger;
        let projectId = this.recordId;
        let milstList = this.MilestoneList;
        if (milstList.length > 0) {
            milstList = milstList.map(milestone => {
                milestone.Project__c = projectId;
                return milestone;
            });
            this.MilestoneList = milstList;
        }

        UpdateMilesstones({ milstoneListTobeUpdate: milstList })
            .then(result => {
                debugger;
                this.MilestoneList = result;
                this.showToast('This milestones has been added successfully', 'success');
                this.dispatchEvent(new CustomEvent('refreshview'));
            })
            .catch(error => {
                console.error('Error updating milestones: ', error);
                this.showToast('An error occurred while updating milestones', 'error');
            });
    }

    removeRecord(event) {
        debugger;
        let index = event.currentTarget.dataset.record;
        this.MilestoneList = this.MilestoneList.filter((_, i) => i !== parseInt(index, 10));
    }

    addRow() {
        debugger;
        let AccountId = this.MilestoneList.length > 0 ? this.MilestoneList[0].Account__c : '';

        this.MilestoneList = [...this.MilestoneList, {
            Name__c: '',
            Description__c: '',
            Expected_Start_Date__c: '',
            Expected_End_Date__c: '',
            Account__c: AccountId
        }];
    }

    showToast(message, variant) {
        const event = new ShowToastEvent({
            title: 'Success',
            message: message,
            variant: variant,
        });
        this.dispatchEvent(event);
    }
}