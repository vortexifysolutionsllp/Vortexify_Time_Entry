import { LightningElement, track, api } from 'lwc';
import getAttendance from '@salesforce/apex/AttendanceController.getAttendance';
import getEmployee from '@salesforce/apex/AttendanceController.getEmployee';

export default class EmployeeAttendance extends LightningElement {

    //selectedDate = '';
    //searchKey = '';

    @api recordId;
    @track selectedEmployeeId;

    @track userRole = '';
    @track isBlockedRole = false;
    viewMode = 'Monthly';
    selectedMonth = '';
    selectedStatus = '';
    searchKey = '';
    fromDate = '';
    toDate = '';

    attendanceData = [];
    connectedCallback() {
        this.getRole();
    }
   // Role based View 
    getRole(){
        debugger;
        const employeeId = this.selectedEmployeeId ?? this.recordId;
        console.log('--check--',employeeId);
        getEmployee({ contactId: employeeId })
        .then((data) => {
            console.log('--data---',JSON.stringify(data));
            this.userRole = data.Role__c;
            if (this.userRole === 'Student' || this.userRole === 'Developer') {
                this.isBlockedRole = true;
            } else {
                this.isBlockedRole = false;
            }
        }).catch(error => {
            console.error('Error loading User Role:', error);
        })
    }

    get viewModeOptions() {
        return [
            { label: 'Today', value: 'Today' },
            { label: 'Yesterday', value: 'Yesterday' },
            { label: 'Monthly', value: 'Monthly' },
            { label: 'Weekly', value: 'Weekly' },
            { label: 'Custom Date', value: 'Custom' }
        ];
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

    // STATUS PICKLIST OPTIONS
    get statusOptions() {
        return [
            { label: 'All', value: '' },
            { label: 'Present', value: 'Present' },
            { label: 'Absent', value: 'Absent' },
            { label: 'Approved Leave', value: 'Approved Leave' },
            { label: 'Holiday', value: 'Holiday' },
            { label: 'Weekend', value: 'Weekend' },
            { label: 'Unpaid', value: 'Unpaid' }
        ];
    }



    get isMonthly() {
        return this.viewMode === 'Monthly';
    }

    get isCustom() {
        return this.viewMode === 'Custom';
    }

    get isToday() {
        return this.viewMode === 'Today';
    }

    get isYesterday() {
        return this.viewMode === 'Yesterday';
    }



    // Summary Cards Data
    get summaryCards() {
        return [
            { id: 1, label: "Total Present", value: this.attendanceData.filter(a => a.status === "Present").length },
            { id: 2, label: "Total Absent", value: this.attendanceData.filter(a => a.status === "Absent").length },
            { id: 3, label: "On Leave", value: this.attendanceData.filter(a => a.status === "Leave").length },
            { id: 4, label: "Total Employees", value: this.attendanceData.length }
        ];
    }

    columns = [
        { label: 'Employee Name', fieldName: 'name' },
        { label: 'First Check-in', fieldName: 'firstcheckin' },
        { label: 'Checkin Count', fieldName: 'checkincount' },
        //{ label: 'Employee ID', fieldName: 'empId' },
        { label: 'Date', fieldName: 'date' },
        {
            label: 'Status',
            fieldName: 'status',
            cellAttributes: {
                class: { fieldName: 'statusClass' }
            }
        }
    ];

    get filteredData() {
        let data = [...this.attendanceData];

        if (this.fromDate) {
            data = data.filter(item => item.date >= this.fromDate);
        }

        if (this.toDate) {
            data = data.filter(item => item.date <= this.toDate);
        }

        //  STATUS FILTER
        if (this.selectedStatus) {
            data = data.filter(item => item.status === this.selectedStatus);
        }
        //  EMPLOYEE NAME SEARCH
        if (this.searchKey) {
            data = data.filter(item =>
                item.name &&
                item.name.toLowerCase().includes(this.searchKey)
            );
        }


        return data.length
            ? data.map(row => ({
                ...row,
                statusClass:
                    row.status === 'Present'
                        ? 'pill present'
                        : row.status === 'Absent'
                            ? 'pill absent'
                            : row.status === 'Approved Leave'
                                ? 'pill leave'
                                : row.status === 'Holiday'
                                    ? 'pill holiday'
                                    : row.status === 'Weekend'
                                        ? 'pill weekend'
                                        : row.status === 'Unpaid'
                                            ? 'pill unpaid'
                                            : 'pill'
            }))
            : null;

    }


    get isEmpty() {
        return this.filteredData === null;
    }

    handleFromDateChange(event) {
        this.fromDate = event.target.value;
        this.loadAttendance();
    }

    handleToDateChange(event) {
        this.toDate = event.target.value;
        this.loadAttendance();
    }

    loadAttendance() {
        if (!this.fromDate || !this.toDate) {
            this.attendanceData = [];
            return;
        }

        getAttendance({ fromDate: this.fromDate, toDate: this.toDate, contactId: this.employeeIdToUse })
            .then(result => {
                this.attendanceData = result.map(row => ({
                    id: row.Id,
                    name: row.Employee__r.Name,
                    date: row.Date__c,
                    status: row.Day_Status__c,
                    firstcheckin: row.FirstCheckIn__c,
                    checkincount: row.CheckinCount__c
                }));
            })
            .catch(error => {
                console.error(error);
            });
    }

    loadTodayAttendance() {
        const today = new Date().toISOString().split('T')[0];

        getAttendance({ fromDate: today, toDate: today, employeeId: this.employeeIdToUse })
            .then(result => {
                this.mapAttendance(result);
            })
            .catch(error => {
                console.error(error);
            });
    }

    loadYesterdayAttendance() {
        const date = new Date();
        date.setDate(date.getDate() - 1);

        const yesterday = date.toISOString().split('T')[0];

        getAttendance({ fromDate: yesterday, toDate: yesterday, employeeId: this.employeeIdToUse })
            .then(result => {
                this.mapAttendance(result);
            })
            .catch(error => {
                console.error(error);
            });
    }



    loadMonthlyAttendance() {
        if (!this.selectedMonth) return;

        const year = new Date().getFullYear();
        const month = this.selectedMonth.padStart(2, '0');

        const fromDate = `${year}-${month}-01`;
        const lastDay = new Date(year, this.selectedMonth, 0).getDate();
        const toDate = `${year}-${month}-${lastDay}`;
        const empId = this.employeeIdToUse;
        getAttendance({ fromDate: fromDate, toDate: toDate, contactId: this.employeeIdToUse})
            .then(result => {
                this.mapAttendance(result);
            })
            .catch(error => {
                console.error(error);
            });
    }

    mapAttendance(result) {
        this.attendanceData = result.map(row => ({
            id: row.Id,
            name: row.Employee__r.Name,
            date: row.Date__c,
            status: row.Day_Status__c,
            firstcheckin: row.FirstCheckIn__c,
            checkincount: row.CheckinCount__c
        }));
    }


    // ===============================
    // VIEW MODE HANDLERS
    // ===============================

    handleViewModeChange(event) {
        this.viewMode = event.detail.value;

        this.attendanceData = [];
        this.fromDate = '';
        this.toDate = '';
        const currentDate = new Date(); // Creates a new Date object for the current time
        const currentMonth = currentDate.getMonth() + 1; // getMonth() is 0-indexed, so add 1

        console.log('currentMonth--> ' + currentMonth); 
        
        this.selectedMonth = currentMonth;
        this.selectedStatus = 'All';

        if (this.viewMode === 'Today') {
            this.loadTodayAttendance();
        }

        if (this.viewMode === 'Yesterday') {
            this.loadYesterdayAttendance();
        }

        if (this.viewMode === 'Monthly') {
            this.loadMonthlyAttendance();
        }
    }


    handleMonthChange(event) {
        this.selectedMonth = event.detail.value;
        this.loadMonthlyAttendance();
    }
    handleStatusChange(event) {
        this.selectedStatus = event.detail.value;
    }

    handleSearchChange(event) {
    this.searchKey = event.target.value.toLowerCase();
}

    // for custom lookup
    handleEmployeeChange(event) {
    this.selectedEmployeeId = event.detail.recordId;
    this.selectedEmployeeName = event.detail.recordName;

    // Reload attendance based on current view mode
    if (this.viewMode === 'Today') {
        this.loadTodayAttendance();
    } else if (this.viewMode === 'Yesterday') {
        this.loadYesterdayAttendance();
    } else if (this.viewMode === 'Monthly') {
        this.loadMonthlyAttendance();
    } else if (this.viewMode === 'Custom') {
        this.loadAttendance();
    }
}


    get employeeIdToUse() {
    return this.selectedEmployeeId ?? this.recordId;
}




}