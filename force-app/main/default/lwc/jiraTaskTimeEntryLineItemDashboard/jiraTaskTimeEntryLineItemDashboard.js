import { LightningElement, track, wire, api } from 'lwc';
import getJiraTaskRecords from '@salesforce/apex/ProjectDashboardController.getJiraTaskRecords';

export default class JiraTaskList extends LightningElement {
    @track error;
    @track jiraTasks = [];
    @track currentJiraListToDisplay = [];

    @api moduleId = 'a1R6D000001WfTiUAK';
    @api teamMemberId = '0036D00000Te4HpQAJ';

    @wire(getJiraTaskRecords, { ModuleId: '$moduleId', TeamMemberId: '$teamMemberId' })
    wiredJiraTasks({ error, data }) {
        if (data) {
            this.jiraTasks = data.map((task, index) => ({
                ...task,
                rowNumber: index + 1,
                showChildRecords: false,
                Time_Entry_Line_Items__r: task.Time_Entry_Line_Items__r ? task.Time_Entry_Line_Items__r.map((timeEntry, timeIndex) => ({
                    ...timeEntry,
                    rowNumber: timeIndex + 1
                })) : [],
                actualEffortsClass: task.Actual_Hours_Utilised__c > task.Estimated_Efforts__c ? 'actual-efforts-over' : ''
            }));
            setTimeout(() => this.template.querySelector('c-custom-pagination').setPagination(5));
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.jiraTasks = undefined;
        }
    }

    get teamMemberName() {
        return this.jiraTasks && this.jiraTasks.length > 0 ? this.jiraTasks[0].Team_Member_Name__c : '';
    }

    handleToggle(event) {
        const taskId = event.target.getAttribute('data-id');
        this.jiraTasks = this.jiraTasks.map(task => {
            if (task.Id === taskId) {
                return { ...task, showChildRecords: !task.showChildRecords };
            }
            return task;
        });
    }

    renderedCallback() {
        if (this.jiraTasks) {
            this.jiraTasks.forEach(task => {
                const spanElement = this.template.querySelector(`span[data-description-id="${task.Id}"]`);
                if (spanElement) {
                    spanElement.innerHTML = task.Description__c;
                }
            });
        }
    }

    jobPaginationCallback(event) {
        this.currentJiraListToDisplay = event.detail.recordToDisplay;
    }
}