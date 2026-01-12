import { LightningElement, track, api } from 'lwc';
import getMonthlyWorkHours from '@salesforce/apex/EmployeeManagementController.getMonthlyWorkHours';
import employeeHolidayMethod from '@salesforce/apex/EmployeeManagementController.employeeHolidayMethod';
import getTasks from '@salesforce/apex/EmployeeManagementController.getTasks';   // ✅ correct name
import getEmployeeAttendance from '@salesforce/apex/EmployeeManagementController.getEmployeeAttendance';

export default class EmployeeManagementDashboard extends LightningElement {
    @api recordId; // Contact Id from record page

    @track selectedMonth;
    @track loading = false;
    @track holidays = [];
    @track tasks = [];
    @track attendance = [];

    @track totalHours = 0;
    @track workingHours = [];

    @track taskCount = 0;
    @track holiCount = 0;
    @track attendanceCount = 0;

    error;

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

    connectedCallback() {
        const today = new Date();
        this.selectedMonth = (today.getMonth() + 1).toString(); // JS months start from 0
        console.log('Default Month on Load: ' + this.selectedMonth);
        this.fetchData();
    }

    // Handle month dropdown change
    handleMonthChange(event) {
        this.selectedMonth = event.detail.value;
        console.log('Selected Month: ' + this.selectedMonth);
        this.fetchData();
    }

    // Fetch data from all Apex methods
    fetchData() {
        if (!this.selectedMonth || !this.recordId) {
            return;
        }
        this.loading = true;

        // 1. Work Hours
        // getMonthlyWorkHours({ contactId: this.recordId, month: this.selectedMonth })
        //     .then(result => {
        //         this.totalHours = result;
        //     })
        //     .catch(error => {
        //         this.showError(error);
        //     });
        getMonthlyWorkHours({ contactId: this.recordId, month: this.selectedMonth })
        .then(result => {
        if (result) {
            // result is decimal (e.g., 1.75)
            let hours = Math.floor(result); // 1
            let minutes = Math.round((result - hours) * 60); // 45

            let formatted = '';
            if (hours > 0) {
                formatted += hours + (hours === 1 ? ' Hour ' : ' Hours ');
            }
            if (minutes > 0) {
                formatted += minutes + ' Mins';
            }
            if (!formatted) {
                formatted = '0 Mins';
            }

            this.totalHours = formatted.trim();
        } else {
            this.totalHours = '0 Mins';
        }
        })
        .catch(error => {
            this.showError(error);
        });


  
        // 2. Holidays
        employeeHolidayMethod({ conID: this.recordId, MonthNumber: this.selectedMonth })
            .then(result => {
    this.holidays = result.map((holi, index) => ({
        id: holi.Id,
        name: holi.Name,
        startDate: holi.StartDate,
        endDate: holi.EndDate,
        type: holi.Type,
        reason: holi.Reason,
        status: holi.Status,
        daysInMonth: holi.DaysInMonth,
        label: `#${index + 1}`
    }));

    // Total holiday days in this month (sum of all DaysInMonth values)
    this.holiCount = this.holidays.reduce((total, h) => total + h.daysInMonth, 0);
})

            .catch(error => {
                this.showError(error);
                this.holidays = [];
            });

        // 3. Tasks
        getTasks({ conID: this.recordId, MonthNumber: this.selectedMonth })
            .then(result => {
                this.tasks = result.map(t => ({
                    id: t.Id,
                    name: t.Name,
                    status: t.Status__c,
                    Date:t.Task_Start_Date__c
                }));
                this.taskCount = this.tasks.length;
            })
            .catch(error => {
                this.showError(error);
            });

        // 4. Attendance
        getEmployeeAttendance({ conID: this.recordId, MonthNumber: this.selectedMonth })
            .then(result => {
                // this.attendance = result.map(a => ({
                //     id: a.Id,
                //     name :a.Name,
                //     time: a.Check_In__c,
                //     date:a.Date__c,
                // }));
                this.attendance = result.map(a => {
                let formattedTime = '';
                let colorClass = ''; 
                if(a.Check_In__c != null) {
                    // Salesforce Time comes as milliseconds since midnight
                    const ms = a.Check_In__c;
                    const date = new Date(ms); // treat as milliseconds
                    let hours = date.getUTCHours();   // use UTC since ms is from midnight
                    let minutes = date.getUTCMinutes();
                    let ampm = hours >= 12 ? 'PM' : 'AM';
                    hours = hours % 12;
                    hours = hours === 0 ? 12 : hours; // handle midnight/noon
                    let minutesStr = minutes < 10 ? '0' + minutes : minutes;
                    formattedTime = `${hours}:${minutesStr} ${ampm}`;
                    console.log('formattedTime'+formattedTime);
                    //  const compareHour = 11;
                    //  const compareMinute = 30;
                    //     if(hours < compareHour || (hours === compareHour && minutes < compareMinute)) {
                    //         colorClass = 'green-time'; // before 11:30 AM
                    //     } else {
                    //         colorClass = 'red-time'; // after 11:30 AM
                    //     }
                    //     console.log('colorClass'+colorClass);
                }

                return {
                    id: a.Id,
                    name: a.Name,
                    time: formattedTime,
                    date: a.Date__c
                };
            });

                console.log('Attendance '+ JSON.stringify(this.attendance));
                this.attendanceCount = this.attendance.length;
            })
            .catch(error => {
                this.showError(error);
            })
            .finally(() => {
                this.loading = false;
            });
    }

    showError(error) {
        console.error('Error:', error);
        this.error = error?.body?.message || error.message;
    }
}