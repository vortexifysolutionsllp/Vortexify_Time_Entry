import { LightningElement, track, api, wire } from 'lwc';
import getJiraTasksForContact from '@salesforce/apex/taskOnCalenderController.getjiratasksForContact';
import getEmployee from '@salesforce/apex/UserAccessController.getEmployee';

export default class TaskMonthlyViewCalender extends LightningElement {

    @api recordId;
    @track reopenParentModal = false;

    @track currentDate = new Date();
    @track calendarCells = [];
    @track jiraTaskMap = {};

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

    //     @wire(getEmployee, { contactId: '$recordId' })
    //     wiredData({ error, data }) {
    //      if (data) {
    //            this.userRole = data.Role__c;
    //            debugger;
    //            console.log('User Role:', this.userRole);
    //             if (this.userRole === 'Student' || this.userRole === 'Developer') {
    //                this.isBlockedRole = true;
    //             } else {
    //                this.isBlockedRole = false;
    //             }

    //        } else if (error) {
    //            console.error('Error:', error);
    //        }
    //    }
    connectedCallback() {
        this.getRole();
        this.loadJiraTasks();
    }

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

                data.forEach(task => {
                    if (task.Task_Start_Date_Time__c) {
                        const dateOnly = task.Task_Start_Date_Time__c.split('T')[0];

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
                            description: task.Task_Description__c
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

    generateCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();

        const cells = [];
        for (let i = 0; i < firstDay; i++) {
            cells.push({ key: `empty-${i}`, dateLabel: '', style: '' });
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const cellDate = new Date(year, month, day);
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2,'0')}`;

            const tasks = this.jiraTaskMap[dateStr] || [];

            cells.push({
                key: `day-${day}`,
                dateLabel: cellDate.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                }),
                tasks: tasks,
                date: dateStr,
                hasVisits: tasks.length > 0,
                visitLabel: tasks.length ? `Task Details` : ''
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

    handleEmployeeChange(event) {

        this.selectedEmployeeId = event.detail.recordId;
        this.selectedEmployeeName = event.detail.recordName;

        this.loadJiraTasks();
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        if (actionName === 'view_task') {

              // Remember parent modal state
        this.reopenParentModal = this.showModal;

        // Close parent modal
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


}