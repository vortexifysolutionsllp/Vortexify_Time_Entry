import { LightningElement, api, track } from 'lwc';
import getMonthlyWorkHours from '@salesforce/apex/ContactWorkHour.getMonthlyWorkHours';

export default class WorkingTimeCalculator extends LightningElement {
    @api recordId; // Contact Id from record page
    @track selectedMonth;
    @track totalHours;
    @track loading = false;

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
        if(this.selectedMonth) {
            this.loading = true;
            getMonthlyWorkHours({ contactId: this.recordId, month: parseInt(this.selectedMonth) })
                .then(result => {
                    this.totalHours = result;
                })
                .catch(error => {
                    console.error('Error fetching monthly work hours:', error);
                })
                .finally(() => {
                    this.loading = false;
                });
        }
    }
}