import { LightningElement, api, track } from 'lwc';
import getProjectMonthlyWorkHours from '@salesforce/apex/ProjectWorkHours.getProjectMonthlyWorkHours';
import getTasks from '@salesforce/apex/ProjectWorkHours.getTasks';

export default class ProjectMonthlyWorkHours extends LightningElement {
    @api recordId; // Project Id from record page
    @track selectedMonth;
    @track totalHours;
    @track loading = false;
    @track tasks = [];
    @track taskCount = 0;

    connectedCallback() {
        const today = new Date();
        this.selectedMonth = (today.getMonth() + 1).toString(); // 1 = Jan, 12 = Dec
        this.fetchData(); // fetch initial data automatically
    }

    get monthOptions() {
        return [
            { label: 'January', value: '1' },
            { label: 'February', value: '2' },
            { label: 'March', value: '3' },
            { label: 'April', value: '4' },
            { label: 'May', value: '5' },
            { label: 'June', value: '6' },
            { label: 'July', value: '7' },
            { label: 'August', value: '8' },
            { label: 'September', value: '9' },
            { label: 'October', value: '10' },
            { label: 'November', value: '11' },
            { label: 'December', value: '12' }
        ];
    }

    handleMonthChange(event) {
        this.selectedMonth = event.detail.value;
        this.fetchData();
    }

    fetchData() {
        if (this.selectedMonth) {
            this.loading = true;

            // 1. Fetch total hours
            getProjectMonthlyWorkHours({ projectId: this.recordId, month: parseInt(this.selectedMonth) })
                .then(result => {
                    this.totalHours = result;
                })
                .catch(error => {
                    console.error('Error fetching project work hours:', error);
                });

            // 2. Fetch tasks
            getTasks({ projectId: this.recordId, month: parseInt(this.selectedMonth) })
                .then(result => {
                    this.tasks = result.map(t => ({
                        id: t.id,
                        name: t.name,
                        status: t.status
                    }));
                    this.taskCount = this.tasks.length;
                })
                .catch(error => {
                    console.error('Error fetching tasks:', error);
                })
                .finally(() => {
                    this.loading = false;
                });
        }
    }
}