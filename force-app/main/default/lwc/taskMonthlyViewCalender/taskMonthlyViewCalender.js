import { LightningElement, track, api, wire } from 'lwc';
import getJiraTasksForContact from '@salesforce/apex/taskOnCalenderController.getjiratasksForContact';
import getEmployee from '@salesforce/apex/UserAccessController.getEmployee';
import getLeaveAndHolidays from '@salesforce/apex/taskOnCalenderController.getLeaveAndHolidays';


export default class TaskMonthlyViewCalender extends LightningElement {

    @api recordId;
    @track reopenParentModal = false;

    @track currentDate = new Date();
    @track calendarCells = [];
    @track jiraTaskMap = {};
    @track leaveAndHolidays = [];

    @track showModal = false;
    @track selectedTasks = [];
    @track selectedDate = '';

    @track selectedEmployeeId;
    @track selectedEmployeeName;

    @track isLoading = false;

    @track userRole = '';
    @track isBlockedRole = false;   

    @track isReadOnlyModalOpen = false;
    @track viewTask = {};
    @track leaveStatusMap ={};
 

    columns = [
        {
        label: 'Task Name',
        fieldName: 'name',
        type: 'button',
        typeAttributes: {
            label: { fieldName: 'name' },
            name: 'view_task',
            variant: 'base'
        }
    },
       /* {
            label: 'Start Time',
            fieldName: 'time',
            type: 'date',
            typeAttributes: {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }
        }, */
        { label: 'Project', fieldName: 'project' },
        { label: 'Module', fieldName: 'module' },
        { label: 'Priority', fieldName: 'priority' },
        {label: 'Task Description', fieldName: 'description', wrapText: true},
        { label: 'Status', fieldName: 'status' }
        
    ];

    dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    async connectedCallback() {
        await this.getLeaveAndHolidays();
        this.leaveStatusMap = this.buildLeaveMap();
        this.getRole();
        this.loadJiraTasks();
    }

    // buildLeaveMap() {
    //     const map = {};

    //     this.leaveAndHolidays.forEach(rec => {
    //         const dateStr = rec.Date__c; 
    //         map[dateStr] = rec.Day_Status__c; 
    //     });

    //     return map;
    // }

    buildLeaveMap() {
        const map = {};
        const todayStr = new Date().toISOString().split('T')[0];

        this.leaveAndHolidays.forEach(rec => {
            const dateStr = rec.Date__c;
            let status = rec.Day_Status__c;
            if (dateStr > todayStr && status === 'Absent') {
                status = '';
            }
            map[dateStr] = status;
        });

        return map;
    }


    getRole(){
        debugger;
        const employeeId = this.selectedEmployeeId ?? this.recordId;
        getEmployee({ contactId: employeeId })
        .then((data) => {
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



    get monthYearLabel() {
        return this.currentDate.toLocaleString('default', {
            month: 'long',
            year: 'numeric'
        });
    }

    handlePrev() {
        this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
        this.generateCalendar();
    }

    handleNext() {
        this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
        this.generateCalendar();
    }

    handleToday() {
        this.currentDate = new Date();
        this.generateCalendar();
    }

    loadJiraTasks() {

        this.isLoading = true;

        const employeeId = this.selectedEmployeeId ?? this.recordId;

        getJiraTasksForContact({ contactId: employeeId })
            .then((data) => {
                const taskMap = {};
                const leaveMap = this.buildLeaveMap();
                data.forEach(task => {
                    if (task.Task_Start_Date_Time__c) {
                        const dateOnly = task.Task_Start_Date__c;

                        if (!taskMap[dateOnly]) taskMap[dateOnly] = [];

                        const endTime = task.Task_End_Date_Time__c
                            ? task.Task_End_Date_Time__c.split('T')[1]?.substring(0, 5)
                            : '';

                        taskMap[dateOnly].push({
                            id: task.Id,
                            name: task.Name,
                            time: task.Task_Start_Date_Time__c,
                            endTime: task.Task_End_Date_Time__c,
                            project: task.Project_Name__c,
                            module: task.Module_Name__c,
                            priority: task.Priority__c,
                            status: task.Status__c,
                            description: task.Task_Description__c,
                            leaveStatus: leaveMap[dateOnly] || null
                        });
                    }
                });

                this.jiraTaskMap = taskMap;
                this.generateCalendar();
            })
            .catch(error => {
                console.error('Error loading Jira tasks:', error);
            })
            .finally(() => {
                setTimeout(() => {
                    this.isLoading = false;
                }, 2000);
            });
    }

    getLeaveAndHolidays() {
        const employeeId = this.selectedEmployeeId ?? this.recordId;
        return getLeaveAndHolidays({ contactId: employeeId })
            .then((data) => {
                this.leaveAndHolidays = data;
                return data; // 👈 important
            })
            .catch(error => {
                console.error('Error loading leave and holidays:', error);
                throw error;
            });
    }

    generateCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();

        const cells = [];
        for (let i = 0; i < firstDay; i++) {
            cells.push({ key: `empty-${i}`, dateLabel: '', style: '', containerClass : 'custom-card', isEmpty:true });
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const cellDate = new Date(year, month, day);
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2,'0')}`;

            const tasks = this.jiraTaskMap[dateStr] || [];
            const dayStatus = this.leaveStatusMap?.[dateStr] || null;
            let containerClass = 'custom-card'
            let visitLabel = tasks.length ? 'Task Details' : '';
            let hasVisits = tasks.length>0;
            let isEmpty = false;
            if (dayStatus === 'Holiday') {
                containerClass += ' holiday-card';
                visitLabel = 'Holiday';
                hasVisits = true;
                isEmpty = true;
            } else if (dayStatus === 'Weekend') {
                containerClass += ' weekend-card';
                visitLabel = 'Weekend';
                hasVisits = true;
                isEmpty = true;
            } else if (dayStatus === 'Approved Leave') {
                containerClass += ' leave-card';
                visitLabel = 'On Leave';
                hasVisits = true;
                isEmpty = true;
            }else if (dayStatus === 'Absent') {
                //containerClass += ' leave-card';
                visitLabel = 'Absent';
                hasVisits = true;
                isEmpty = true;
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
                tasks: tasks,
                date: dateStr,
                hasVisits: hasVisits,
                visitLabel: visitLabel,
                containerClass: containerClass,
                isToday: isToday,
                isEmpty
            });
        }

        this.calendarCells = cells;
    }

    get preparedCells() {
        return this.calendarCells.map(cell => {
            const count = cell.tasks?.length || 0;

            let color = '#080707';

            if (count < 2) color = '#e74c3c';
            else if (count <= 4) color = '#f1c40f';
            else color = '#2ecc71';

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

    handleClick(event) {
        const clickedDate = event.currentTarget.dataset.date;
        this.selectedDate = clickedDate;
        this.selectedTasks = this.jiraTaskMap[clickedDate] || [];
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
        this.selectedTasks = [];
        this.selectedDate = '';
    }

    handleHover(event) {
        event.currentTarget.classList.add('slds-theme_alert-texture');
    }

    handleUnhover(event) {
        event.currentTarget.classList.remove('slds-theme_alert-texture');
    }

    async handleEmployeeChange(event) {

        this.selectedEmployeeId = event.detail.recordId;
        this.selectedEmployeeName = event.detail.recordName;
        await this.getLeaveAndHolidays();
        this.leaveStatusMap = this.buildLeaveMap();
        this.loadJiraTasks();
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        if (actionName === 'view_task') {
        this.reopenParentModal = this.showModal;
        this.showModal = false;
            this.openTaskReadOnly(row);
        }
    }

    openTaskReadOnly(task) {
        this.viewTask = { ...task };
        this.isReadOnlyModalOpen = true;
    }

    closeReadOnlyModal() {
        this.isReadOnlyModalOpen = false;
        this.viewTask = {};

        if (this.reopenParentModal) {
            this.showModal = true;
            this.reopenParentModal = false;
        }
    }

    get todayISO() {
        const today = new Date();
        return today.toISOString().split('T')[0]; // yyyy-MM-dd
    }


}