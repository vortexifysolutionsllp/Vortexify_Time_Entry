import { LightningElement, track, api } from 'lwc';
import getAttendance from '@salesforce/apex/AttendanceController.getAttendance';
import getEmployee from '@salesforce/apex/AttendanceController.getEmployee';
import {loadStyle} from 'lightning/platformResourceLoader';
import COLORS from '@salesforce/resourceUrl/colors';
import AttendanceModal from 'c/attendanceModalPopup';

export default class EmployeeAttendance extends LightningElement {

    //selectedDate = '';
    //searchKey = '';
    isCssLoaded = false
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
    @track employeeAttendanceMap = {};
    monthlyView = false;
    dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    @track selectedDate= '';
    showModal = false;
    @track selectedAttendance = [];

    attendanceData = [];
    connectedCallback() {
        this.getRole();
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
    renderedCallback(){ 
        if(this.isCssLoaded) return
        this.isCssLoaded = true
        loadStyle(this, COLORS).then(()=>{
            console.log("Loaded Successfully")
        }).catch(error=>{ 
            console.error("Error in loading the colors")
        })
    }
   // Role based View 
    getRole(){
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
            { id: 1, label: "Days Present", value: this.attendanceData.filter(a => a.status === "Present").length },
            { id: 2, label: "Days Absent", value: this.attendanceData.filter(a => a.status === "Absent").length },
            { id: 3, label: "On Leave Days", value: this.attendanceData.filter(a => a.status === "Approved Leave").length },
            { id: 4, label: "Holidays", value: this.attendanceData.filter(a => a.status === "Holiday").length }
        ];
    }

    columns = [
        { label: 'Employee Name', fieldName: 'name', cellAttributes: {
                class: { fieldName: 'statusClass' }
            }
         },
        { label: 'First Check-in', fieldName: 'firstcheckin', cellAttributes: {
                class: { fieldName: 'statusClass' }
            }
         },
        { label: 'Checkin Count', fieldName: 'checkincount', cellAttributes: {
                class: { fieldName: 'statusClass' }
            }
         },
        //{ label: 'Employee ID', fieldName: 'empId' },
        { label: 'Date', fieldName: 'date', cellAttributes: {
                class: { fieldName: 'statusClass' }
            }
         },
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
        const fromDateObj = this.fromDate
        ? this.parseYYYYMMDD(this.fromDate)
        : null;
        const toDateObj = this.toDate
        ? this.parseYYYYMMDD(this.toDate)
        : null;
        console.log('fromDate', this.fromDate);
        console.log('toDate', this.toDate);
        console.log('data', JSON.stringify(data));
        if (fromDateObj) {
            data = data.filter(item => {
                const itemDate = this.parseDDMMYYYY(item.date);
                return itemDate >= fromDateObj;
            });
        }

        if (toDateObj) {
            data = data.filter(item => {
                const itemDate = this.parseDDMMYYYY(item.date);
                return itemDate <= toDateObj;
            });
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
                        ? 'datatable-green'
                        : row.status === 'Absent'
                            ? 'pill absent'
                            : row.status === 'Approved Leave'
                                ? 'pill leave'
                                : row.status === 'Holiday'
                                    ? 'pill holiday'
                                    : row.status === 'Weekend'
                                        ? 'datatable-grey'
                                        : row.status === 'Unpaid'
                                            ? 'pill unpaid'
                                            : 'pill'
            }))
            : null;

    }

    parseDDMMYYYY(dateStr) {
        const [day, month, year] = dateStr.split('/');
        return new Date(year, month - 1, day);
    }

    parseYYYYMMDD(dateStr) {
        const [year, month, day] = dateStr.split('-');
        return new Date(year, month - 1, day);
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

    formatDate(sfDate) {
        if (!sfDate) return '';

        const dateObj = new Date(sfDate);

        return new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(dateObj);
    }

    formatTime(sfDateTime) {
        if (!sfDateTime) return '';

        const dateObj = new Date(sfDateTime);

        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).format(dateObj);
    }

    loadAttendance() {
        if (!this.fromDate || !this.toDate) {
            this.attendanceData = [];
            return;
        }
        const today = this.getToday();

        getAttendance({ fromDate: this.fromDate, toDate: this.toDate, contactId: this.employeeIdToUse })
            .then(result => {
                this.attendanceData = result.map(row => {
                    const rowDate = new Date(row.Date__c); // Salesforce Date → JS Date
                    rowDate.setHours(0, 0, 0, 0);
                    return{
                        id: row.Id,
                        name: row.Employee__r.Name,
                        date: this.formatDate(row.Date__c),
                        status: rowDate > today && row.Day_Status__c == 'Absent' ? '' : row.Day_Status__c,
                        firstcheckin: this.formatTime(row.FirstCheckIn__c),
                        lastcheckOut: this.formatTime(row.LastCheckOut__c),
                        checkincount: row.CheckinCount__c
                    };
                });
            })
            .catch(error => {
                console.error(error);
            });
    }

    getToday() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    }

    loadTodayAttendance() {
        this.selectedStatus = '';
        const today = new Date().toLocaleDateString('fr-CA');

        getAttendance({ fromDate: today, toDate: today, contactId: this.employeeIdToUse })
            .then(result => {
                this.mapAttendance(result);
            })
            .catch(error => {
                console.error(error);
            });
    }

    loadYesterdayAttendance() {
        this.selectedStatus = '';
        const date = new Date();
        date.setDate(date.getDate() - 1);

        const yesterday = date.toLocaleDateString('fr-CA');

        getAttendance({ fromDate: yesterday, toDate: yesterday, contactId: this.employeeIdToUse })
            .then(result => {
                this.mapAttendance(result);
            })
            .catch(error => {
                console.error(error);
            });
    }



    loadMonthlyAttendance() {
        this.monthlyView = false;
        const employeeAttendanceMap = {};
        const currentDate = new Date(); // Creates a new Date object for the current time
        const currentMonth = currentDate.getMonth() + 1; // getMonth() is 0-indexed, so add 1        
        
        if (!this.selectedMonth){
            this.selectedMonth = currentMonth.toString();
        }

        const year = new Date().getFullYear();
        const month = this.selectedMonth.padStart(2, '0');
        const fromDate = `${year}-${month}-01`;
        const lastDay = new Date(year, this.selectedMonth, 0).getDate();
        const toDate = `${year}-${month}-${lastDay}`;
        const empId = this.employeeIdToUse;
        const today = this.getToday();
        getAttendance({ fromDate: fromDate, toDate: toDate, contactId: this.employeeIdToUse})
            .then(result => {
                this.mapAttendance(result);

                result.forEach(attendanceDay => {
                    if (attendanceDay.Date__c) {
                        const dateOnly = attendanceDay.Date__c;

                        if (!employeeAttendanceMap[dateOnly]) employeeAttendanceMap[dateOnly] = [];
                        const rowDate = new Date(attendanceDay.Date__c);
                        rowDate.setHours(0, 0, 0, 0);
                        employeeAttendanceMap[dateOnly].push({
                            id: attendanceDay.Id,
                            name: attendanceDay.Name,
                            checkInTime: this.formatTime(attendanceDay.FirstCheckIn__c),
                            checkOutTime: this.formatTime(attendanceDay.LastCheckOut__c),
                            status: rowDate > today && attendanceDay.Day_Status__c == 'Absent' ? '' : attendanceDay.Day_Status__c,
                        });
                    }
                });

                this.employeeAttendanceMap = employeeAttendanceMap;
                this.generateCalendar();
            })
            .catch(error => {
                console.error(error);
            });
    }

    mapAttendance(result) {
        const today = this.getToday();
        this.attendanceData = result.map(row => {
            const rowDate = new Date(row.Date__c); // Salesforce Date → JS Date
                    rowDate.setHours(0, 0, 0, 0);
                    return{
                        id: row.Id,
                        name: row.Employee__r.Name,
                        date: this.formatDate(row.Date__c),
                        status: rowDate > today && row.Day_Status__c == 'Absent' ? '' : row.Day_Status__c,
                        firstcheckin: this.formatTime(row.FirstCheckIn__c),
                        lastcheckOut: this.formatTime(row.LastCheckOut__c),
                        checkincount: row.CheckinCount__c
                    }
        });
    }


    // ===============================
    // VIEW MODE HANDLERS
    // ===============================

    handleViewModeChange(event) {
        this.viewMode = event.detail.value;

        this.attendanceData = [];
        this.fromDate = '';
        this.toDate = '';

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

    generateCalendar() {
        const currentDate = new Date(); // Creates a new Date object for the current time
        const currentMonth = currentDate.getMonth() + 1; // getMonth() is 0-indexed, so add 1        
        
        if (!this.selectedMonth){
            this.selectedMonth = currentMonth.toString();
        }

        const year = new Date().getFullYear();
        const month = this.selectedMonth.padStart(2, '0');
        const fromDate = `${year}-${month}-01`;
        const lastDay = new Date(year, this.selectedMonth, 0).getDate();
        const toDate = `${year}-${month}-${lastDay}`;

        const firstDay = new Date(year, parseInt(month) - 1, 1).getDay();
        const daysInMonth = new Date(year, month, 0).getDate();
        const today = new Date();

        const cells = [];
        for (let i = 0; i < firstDay; i++) {
            cells.push({ key: `empty-${i}`, dateLabel: '', style: '', containerClass : 'custom-card' });
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const cellDate = new Date(year, parseInt(month) - 1, day);
            const dateStr = `${year}-${String(month)}-${String(day).padStart(2,'0')}`;

            const attendanceDay = this.employeeAttendanceMap[dateStr] || [];
            let containerClass = 'custom-card'
            let dayStatus = attendanceDay[0].status;
            let visitLabel = attendanceDay[0].status;
            let chckIn = attendanceDay[0].checkInTime || 'NA';
            let hasVisits = false;
            if (dayStatus === 'Holiday') {
                containerClass += ' holiday-card';
                hasVisits = true;
            } else if (dayStatus === 'Weekend') {
                containerClass += ' weekend-card';
                hasVisits = true;
            } else if (dayStatus === 'Approved Leave') {
                containerClass += ' leave-card';
                hasVisits = true;
            }else if (dayStatus === 'Present') {
                containerClass += ' present-card';
                hasVisits = true;
            }else if (dayStatus === 'Absent') {
                hasVisits = true;
            }
            const isToday = dateStr === this.todayISO;
            if(isToday){
                containerClass += ' today-card';
            }
            cells.push({
                key: `day-${day}`,
                dateLabel: cellDate.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                }),
                attendanceDay: attendanceDay,
                date: dateStr,
                checkInTime:chckIn,
                hasVisits,
                visitLabel: visitLabel,
                isToday: isToday,
                containerClass: containerClass
            });
        }

        this.calendarCells = cells;
        this.monthlyView = true;
    }

    get preparedCells() {
        return this.calendarCells.map(cell => {
            const status = cell.attendanceDay?.[0]?.status || 'NA';

            let color = '#080707';

            if (status == 'Absent') color = '#e74c3c';
            else if (status == 'Present') color = '#f1c40f';
            else color = '#61aae2ff';

            return {
                ...cell,
                buttonColorStyle: `
                    background-color: ${color};
                    color: white;
                    font-weight: bold;
                    padding-block: 7px;
                    border-radius: 0.5rem;
                    cursor: pointer;
                `
            };
        });
    }

    async handleClick(event) {
        debugger;
        const date = event.currentTarget.dataset.date;
        this.selectedDate = date;
        this.selectedAttendance = this.employeeAttendanceMap[date] || [];

        await AttendanceModal.open({
            size: 'small',
            header: `Details for ${date}`,
            checkInTime: this.selectedAttendance[0].checkInTime || 'NA',
            checkOutTime: this.selectedAttendance[0].checkOutTime || 'NA'
        });
    }

    closeModal() {
        this.showModal = false;
        this.selectedAttendance = [];
        this.selectedDate = '';
    }

    handleHover(event) {
        event.currentTarget.classList.add('slds-theme_alert-texture');
    }

    handleUnhover(event) {
        event.currentTarget.classList.remove('slds-theme_alert-texture');
    }


    get checkInTime() {
        return this.selectedTasks[0]?.checkInTime || 'NA';
    }

    get checkOutTime() {
        return this.selectedTasks[0]?.checkOutTime || 'NA';
    }

    get todayISO() {
        const today = new Date();
        return today.toISOString().split('T')[0]; // yyyy-MM-dd
    }

}