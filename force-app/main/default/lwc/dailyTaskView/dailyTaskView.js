import { LightningElement, track } from 'lwc';
import getDailyTaskData from '@salesforce/apex/DailyTaskViewController.getDailyTaskData';
import getTaskById from '@salesforce/apex/DailyTaskViewController.getTaskById';
import getModulesByProject from '@salesforce/apex/UtilityClassforSite.getModulesByProject';
import getContactsByProject from '@salesforce/apex/UtilityClassforSite.getContactsByProject';
import getProjectResourceMappingId from '@salesforce/apex/TaskCreationController.getProjectResourceMappingId';
import createJiraTask from '@salesforce/apex/TaskCreationController.createJiraTask';

export default class DailyTaskView extends LightningElement {

    selectedDate = new Date().toISOString().split('T')[0];

    @track taskData = [];
    @track employeeData = [];
    allTaskData = [];
    allEmployeeData = [];


    // MODALS
    @track isViewTaskModalOpen = false;
    @track isCreateTaskModalOpen = false;

    @track selectedTask;

    // CREATE TASK FIELDS
    @track selectedProject;
    @track selectedModule;
    @track selectedModuleName;
    @track moduleOptions = [];

    @track selectedPriority = '';

    @track contactOptions = [];
    @track selectedContact;
    @track selectedContactName;

    @track projectResourceMappingId;

    @track startDate;
    @track startTime;
    @track endDate;
    @track endTime;
    @track description = '';

    @track showSpinner = false;

    showTasks = true;
    showEmployees = false;

    priorityOptions = [
        { label: 'Low', value: 'Low' },
        { label: 'Medium', value: 'Medium' },
        { label: 'High', value: 'High' },
        { label: 'Critical', value: 'Critical' }
    ];

    taskColumns = [
        // { label: 'Employee Name', fieldName: 'employeeName' },
        { label: 'Task Name', fieldName: 'Name' },
        { label: 'Assigned To', fieldName: 'assignedTo' },
        { label: 'Assigned By', fieldName: 'assignedBy' },

        { label: 'Status', fieldName: 'Status__c' },
        {
            label: 'Action',
            type: 'button',
            typeAttributes: {
                label: 'View',
                name: 'view',
                variant: 'brand'
            }
        }
    ];

    employeeColumns = [
        { label: 'Employee Name', fieldName: 'Name' },
        { label: 'Status', fieldName: 'Status__c' },
        { label: 'Reporting Manager', fieldName: 'assignedBy' },
        {
            label: 'Action',
            type: 'button',
            typeAttributes: {
                label: 'Create Task',
                name: 'create_task',
                variant: 'brand'
            }
        }
    ];

    connectedCallback() {
        this.loadData();
    }

    // loadData() {
    //     getDailyTaskData({ selectedDate: this.selectedDate })
    //         .then(data => {
    //             this.taskData = data.tasks;
    //             this.employeeData = data.employeesWithoutTask;
    //             this.allEmployeeData = [...this.employeeData];
    //         })
    //         .catch(error => {
    //             console.error(error);
    //         });
    // }

    loadData() {
        getDailyTaskData({ selectedDate: this.selectedDate })
            .then(data => {
                this.taskData = data.tasks.map(task => ({
                    ...task,
                    assignedTo: task.Team_Member__r ? task.Team_Member__r.Name : '',
                    assignedBy: task.Team_Member__r ? task.Team_Member__r.Reports_To_Name__c : '',
                    employeeName: task.Employee__r ? task.Employee__r.Name : ''
                }));

                // this.employeeData = data.employeesWithoutTask;
                this.employeeData = data.employeesWithoutTask.map(emp => ({
                    Id: emp.Id,
                    Name: emp.Name,
                    Status__c: emp.Status__c,
                    assignedBy: emp.ReportsTo ? emp.ReportsTo.Name : '—'
                }));

                this.allTaskData = [...this.taskData];

                this.allEmployeeData = [...this.employeeData];
            })
            .catch(error => {
                console.error(error);
            });
    }


    handleRowAction(event) {
        const action = event.detail.action.name;
        const row = event.detail.row;

        // VIEW TASK
        if (action === 'view') {
            getTaskById({ taskId: row.Id })
                .then(task => {
                    this.selectedTask = {
                        ...task,
                        assignedTo: task.Team_Member__r ? task.Team_Member__r.Name : '',
                        assignedBy: task.Team_Member__r ? task.Team_Member__r.Reports_To_Name__c : '',
                        CreatedDate: this.formatDate(task.CreatedDate)
                    };
                    this.isViewTaskModalOpen = true;
                });
        }

        // CREATE TASK
        if (action === 'create_task') {
            this.selectedContact = row.Id;
            this.selectedContactName = row.Name;

            this.isCreateTaskModalOpen = true;
        }
    }

    formatDate(dateValue) {
        if (!dateValue) return '';
        const d = new Date(dateValue);
        return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
    }

    closeViewModal() {
        this.isViewTaskModalOpen = false;
        this.selectedTask = null;
    }

    closeCreateModal() {
        this.isCreateTaskModalOpen = false;

        this.selectedProject = null;
        this.selectedModule = null;
        this.selectedModuleName = '';
        this.selectedContact = null;
        this.selectedContactName = '';
        this.selectedPriority = '';
        this.startDate = null;
        this.startTime = null;
        this.endDate = null;
        this.endTime = null;
        this.description = '';
        this.projectResourceMappingId = null;
        this.moduleOptions = [];
        this.contactOptions = [];
    }

    // handleSearch(event) {
    //     const key = event.target.value.toLowerCase();

    //     if (!key) {
    //         this.employeeData = [...this.allEmployeeData];
    //         return;
    //     }

    //     this.employeeData = this.allEmployeeData.filter(e =>
    //         e.Name.toLowerCase().includes(key)
    //     );
    // }

    handleSearch(event) {
        const key = event.target.value.toLowerCase();

        // reset if empty
        if (!key) {
            this.taskData = [...this.allTaskData];
            this.employeeData = [...this.allEmployeeData];
            return;
        }

        // TASK TABLE SEARCH (all columns)
        this.taskData = this.allTaskData.filter(row =>
            Object.values(row).join(' ').toLowerCase().includes(key)
        );

        // EMPLOYEE TABLE SEARCH (all columns)
        this.employeeData = this.allEmployeeData.filter(row =>
            Object.values(row).join(' ').toLowerCase().includes(key)
        );
    }


    handlePriorityChange(event) {
        this.selectedPriority = event.detail.value;
    }

    toggleTaskSection() {
        this.showTasks = !this.showTasks;
        this.showEmployees = false;
    }

    toggleEmployeeSection() {
        this.showEmployees = !this.showEmployees;
        this.showTasks = false;
    }

    handleStartDate(event) {
        this.startDate = event.detail.value;
    }

    handleStartTime(event) {
        this.startTime = event.detail.value;
    }

    handleEndDate(event) {
        this.endDate = event.detail.value;
    }

    handleEndTime(event) {
        this.endTime = event.detail.value;
    }

    handleDescriptionChange(event) {
        this.description = event.target.value;
    }

    handleModuleSelect(event) {
        this.selectedModule = event.detail.recordId;
        this.selectedModuleName = event.detail.recordName;
    }

    handleProjectChange(event) {
        this.selectedProject = event.detail.recordId;

        this.selectedModule = null;
        this.selectedModuleName = '';
        this.moduleOptions = [];
        this.contactOptions = [];

        if (!this.selectedProject) {
            return;
        }

        // FETCH MODULES
        getModulesByProject({ projectId: this.selectedProject })
            .then(result => {
                this.moduleOptions = result.map(m => ({
                    Id: m.Id,
                    Name: m.Name
                }));
            });

        // FETCH CONTACTS
        getContactsByProject({ projectId: this.selectedProject })
            .then(result => {
                this.contactOptions = result.map(c => ({
                    Id: c.Id,
                    Name: c.Name
                }));
            });

        // FETCH PROJECT RESOURCE MAPPING
        if (this.selectedProject && this.selectedContact) {
            this.tryFetchProjectResourceMapping();
        }
    }

    handleContactSelect(event) {
        this.selectedContact = event.detail.recordId;
        this.selectedContactName = event.detail.recordName;
        this.tryFetchProjectResourceMapping();
    }

    tryFetchProjectResourceMapping() {
        if (this.selectedProject && this.selectedContact) {
            getProjectResourceMappingId({
                projectId: this.selectedProject,
                candidateId: this.selectedContact
            })
                .then(mappingId => {
                    this.projectResourceMappingId = mappingId;
                })
                .catch(() => {
                    alert('No Project Resource Mapping found');
                });
        }
    }

    handleSubmit() {
        if (
            !this.selectedProject ||
            !this.selectedModule ||
            !this.selectedContact ||
            !this.selectedPriority ||
            !this.startDate ||
            !this.startTime ||
            !this.endDate ||
            !this.endTime ||
            !this.description
        ) {
            alert('Please fill all required fields');
            return;
        }

        if (!this.projectResourceMappingId) {
            alert('Project Resource Mapping not found');
            return;
        }

        const startDateTime = `${this.startDate}T${this.startTime}`;
        const endDateTime = `${this.endDate}T${this.endTime}`;

        const start = new Date(startDateTime);
        const end = new Date(endDateTime);

        if (end <= start) {
            alert('End Time must be greater than Start Time');
            return;
        }

        this.submitTask(start, end);
    }

    submitTask(startDateTime, endDateTime) {
        this.showSpinner = true;

        createJiraTask({
            projectId: this.projectResourceMappingId,
            moduleId: this.selectedModule,
            contactId: this.selectedContact,
            priority: this.selectedPriority,
            startDateTime: startDateTime,
            endDateTime: endDateTime,
            description: this.description
        })
            .then(() => {
                this.closeCreateModal();
                this.selectedDate = this.startDate; // refresh correct day
                this.loadData();
                alert('Task Created Successfully');
            })
            .catch(error => {
                console.error(error);
                alert('Something went wrong');
            })
            .finally(() => {
                this.showSpinner = false;
            });
    }

    get taskIcon() {
        return this.showTasks ? 'utility:chevrondown' : 'utility:chevronright';
    }

    get employeeIcon() {
        return this.showEmployees ? 'utility:chevrondown' : 'utility:chevronright';
    }

    get formattedDate() {
        const d = new Date(this.selectedDate);
        return `${("0" + d.getDate()).slice(-2)}-${("0" + (d.getMonth() + 1)).slice(-2)}-${d.getFullYear()}`;
    }


    handlePrev() {
        const d = new Date(this.selectedDate);
        d.setDate(d.getDate() - 1);
        this.selectedDate = d.toISOString().split('T')[0];
        this.loadData();
    }
    handleNext() {
        const d = new Date(this.selectedDate);
        d.setDate(d.getDate() + 1);
        this.selectedDate = d.toISOString().split('T')[0];
        this.loadData();

    }
}