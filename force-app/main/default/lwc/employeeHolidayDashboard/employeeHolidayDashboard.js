import { LightningElement, track , api } from 'lwc';
import getEmpHolidays from '@salesforce/apex/employeeHolidayController.employeeHolidayMethod';
export default class EmployeeHolidayDashboard extends LightningElement {
    @api recordId;
    @track selectedMonth;
    @track holidays = [];

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
        console.log('Selected Month: ' + this.selectedMonth);

        // 👇 Imperative call to Apex
        getEmpHolidays({ 
            conID: this.recordId, 
            MonthNumber: this.selectedMonth 
        })
            .then(result => {
                this.holidays = result.map((holi, index) => ({
                    id: holi.Id,
                    name: holi.Holiday_Name__c,   // 👈 now available
                    date: holi.Start_Date__c,
                    reason: holi.Reason__c,
                    status: holi.Status__c,
                    label: `#${index + 1}`
                }));
                this.error = undefined;
            })
            .catch(error => {
                this.error = error.body.message;
                this.holidays = [];
            });
    }

    get holiCount() {
        return this.holidays.length;
    }
    // handleMonthChange(event) {
    //     this.selectedMonth = event.detail.value;
    //     console.log('Selected Month: ' + this.selectedMonth);
    //     // You can now call Apex method to fetch data for this month
    // }

    // @wire(getEmpHolidays,{conID:'$contactId',MonthNumber:'$selectedMonth'})
    // wiredHolidays({ error, data }) {
    //     if (data) {
    //         this.holidays = data.map((holi, index) => ({
    //             id: holi.Id,
    //             name: holi.Name,  // 👈 Corrected here (capital N)
    //             label: `#${index + 1}`
    //         }));
    //         this.error = undefined;
    //     } else if (error) {
    //         this.error = error.body.message;
    //         this.projects = [];
    //     }
    // }
}