import { LightningElement, api, track } from 'lwc';
import getProjectResourceMappingId from '@salesforce/apex/TaskCreationController.getProjectResourceMappingId';
import getModulesByProject from '@salesforce/apex/UtilityClassforSite.getModulesByProject';
import getContactsByProject from '@salesforce/apex/UtilityClassforSite.getContactsByProject';
import createJiraTask from '@salesforce/apex/TaskCreationController.createJiraTask';
import getJiraTasks from '@salesforce/apex/TaskCreationController.getJiraTasks';
import updateJiraTask from '@salesforce/apex/TaskCreationController.updateJiraTask';
import deleteJiraTask from '@salesforce/apex/TaskCreationController.deleteJiraTask';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import SWEETALERT from '@salesforce/resourceUrl/sweetalert2';
import EMPTY_TASK_IMAGE from '@salesforce/resourceUrl/emptyTaskIllustration';

export default class CreateTask extends LightningElement {
    @api recordid;
    @track showSpinner = false;
@track showDeleteModal = false;
@track taskIdToDelete = null;
@track selectedModuleName = '';
@track selectedContactName = '';
@track disableFilters = true;
@track isCloneMode = false;


// VIEW ONLY MODAL PROPERTIES ---------------------------
    @track isReadOnlyModalOpen = false;

    @track viewProject;
    @track viewModule;
    @track viewTeamMember;
    @track viewPriority;
    @track viewStart;
    @track viewEnd;
    @track viewDescription;
    isTasksAvailable = false;

@track isReadOnlyModalOpen = false;
@track viewTask = {};

    @track tasks = [];
    @track isModalOpen = false;
    @track modalTitle = 'Create Task';
    @track submitButtonLabel = 'Create Task';
    
    selectedProject = null;
    selectedModule = null;
    selectedContact = null;
    selectedPriority = '';
    startDateTime = '';
    endDateTime = '';
    description = '';
    currentTaskId = null;
    isEditMode = false;
    moduleOptions = [];
    contactOptions = [];
    
    get isModuleDisabled() {
        return !this.selectedProject;
    }
    
    get isContactDisabled() {
        return !this.selectedProject;
    }
    
    


    priorityOptions = [
        { label: 'Low', value: 'Low' },
        { label: 'Medium', value: 'Medium' },
        { label: 'High', value: 'High' },
        { label: 'Critical', value: 'Critical' }
    ];

    connectedCallback() {
        this.getTaskData();
    }

    sweetAlertInitialized = false;

renderedCallback() {
  if (this.sweetAlertInitialized) {
    return;
  }
  this.sweetAlertInitialized = true;

  Promise.all([
    loadScript(this, SWEETALERT + '/sweetalert2.all.min.js'),
    loadStyle(this, SWEETALERT + '/sweetalert2.min.css')
  ])
    .then(() => {
      console.log('SweetAlert2 loaded');
      if (typeof Swal !== 'undefined') {
        window.Swal = Swal; // make it globally accessible if needed
      }
    })
    .catch(error => {
      console.error('Error loading SweetAlert2:', error);
    });
}

    getTaskData() {
        getJiraTasks({ contactid: this.recordid })
            .then(result => {
                this.tasks = result.map(t => {
                    const fullDescription = t.Task_Description__c || '';
                    const shortDesc = fullDescription.split(' ').slice(0, 4).join(' ');
                    return {
                        id: t.Id,
                        name: t.Name,
                        ProjectResourceMapping:t.Project_Resource_Mapping__c,
                        //ProjectResourceMapping: t.Project_Resource_Mapping__c,
                        projectId: t.Project_Resource_Mapping__r?.Project__r.Name,
                        contactId: t.Project_Resource_Mapping__r?.Contact__c,
                        project: t.Project_Name__c,
                        module: t.Module_Name__c,
                        mainmoduleID: t.Module__c,
                        priority: t.Priority__c,
                        owner: t.Assigned_By_Name__c,
                        AssignTo: t.Team_Member_Name__c,
                        startTime: t.Task_Start_Date_Time__c,
                        endTime: t.Task_End_Date_Time__c,
                        description: fullDescription,
                        shortDescription: shortDesc,
                        hasMore: fullDescription.length > shortDesc.length,
                        tooltipVisible: false
                    };
                });
            })
            .catch(error => {
                console.error('Error fetching tasks:', error);
                this.tasks = [];
            });
            this.isTasksAvailable = this.tasks.length>0;
    }

    // Tooltip Handlers
    handleMouseEnter(event) {
        const taskId = event.currentTarget.dataset.id;
        this.tasks = this.tasks.map(task => ({
            ...task,
            tooltipVisible: task.id === taskId
        }));
    }

    handleMouseLeave() {
        this.tasks = this.tasks.map(task => ({
            ...task,
            tooltipVisible: false
        }));
    }

    // Modal Open for Create
    openCreateModal() {
        this.resetFields();
        this.modalTitle = 'Create Task';
        this.submitButtonLabel = 'Create Task';
        this.isEditMode = false;
        this.isModalOpen = true;
    }

   handleClone(event) {
    const taskId = event.target.dataset.id;
    const task = this.tasks.find(t => t.id === taskId);

    if (task) {
        this.currentTaskId = null;

        this.isCloneMode = true;
        this.isEditMode = true;

        this.selectedProject = task.project;
        this.selectedModule = task.mainmoduleID;
        this.selectedModuleName = task.module;

        // ✅ REAL Contact Id
        this.selectedContact = task.contactId;
        this.selectedContactName = task.AssignTo;

        // ✅ REQUIRED FOR APEX
        this.projectResourceMappingId = task.ProjectResourceMapping;

        this.selectedPriority = task.priority;
        this.description = task.description;

        this.modalTitle = 'Create Task';
        this.submitButtonLabel = 'Create Task';
        this.isModalOpen = true;
    }
}

    // Modal Open for Edit
    handleEdit(event) {
        const taskId = event.target.dataset.id;
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            this.currentTaskId = task.id;
            this.selectedProject = task.projectId;
            this.selectedModule = task.mainmoduleID;
            this.selectedModuleName = task.module;
            this.selectedContact = task.contactId;
            this.selectedContactName = task.AssignTo;
            this.selectedPriority = task.priority;
            this.startDateTime = task.startTime;
            this.endDateTime = task.endTime;
            this.description = task.description;

            this.modalTitle = 'Edit Task';
            this.submitButtonLabel = 'Update Task';
            this.isEditMode = true;
            this.isModalOpen = true;
        }
    }

    

    closeModal() {
        this.isModalOpen = false;
        this.isCloneMode = false;
        this.resetFields();
    }

    openReadOnlyPopup(event) {
    const taskId = event.target.dataset.id;
    const taskRecord = this.tasks.find(t => t.id === taskId);

    if (taskRecord) {
        this.viewTask = { ...taskRecord };
        this.isReadOnlyModalOpen = true;
    }
}

closeReadOnlyModal() {
    this.isReadOnlyModalOpen = false;
    this.viewTask = {};
}


    resetFields() {
        this.currentTaskId = null;
        this.selectedProject = null;
        this.selectedModule = null;
        this.selectedContact = null;
        this.selectedPriority = '';
        this.startDateTime = '';
        this.endDateTime = '';
        this.description = '';
        this.isEditMode = false;
        this.moduleOptions = [];
        this.contactOptions = [];
        this.disableFilters = true;
    }

    handleModuleChange(event) {
        this.selectedModule = event.detail.recordId;
        console.log('--selectedModule--'+this.selectedModule);
    }

    handlePriorityChange(event) {
        this.selectedPriority = event.detail.value;
        console.log('--selectedPriority--'+this.selectedPriority);
    }
    handleModuleSelect(event) {
        this.selectedModule = event.detail.recordId;
        this.selectedModuleName = event.detail.recordName;
    }
    
    handleContactSelect(event) {
        this.selectedContact = event.detail.recordId;
        this.selectedContactName = event.detail.recordName;
        this.tryFetchProjectResourceMapping();
    }
    

    handleProjectChange(event) {
        this.selectedProject = event.detail.recordId;
        console.log('--selectedProject--' + this.selectedProject);
        this.disableFilters = !this.selectedProject;
        this.selectedModule = null;
        this.selectedModuleName = '';
        this.selectedContact = null;
        this.selectedContactName = '';
        this.moduleOptions = [];
    this.contactOptions = [];
    
        this.tryFetchProjectResourceMapping();
    
        // 🔹 Fetch Modules by selected project
        getModulesByProject({ projectId: this.selectedProject })
            .then(modules => {
                console.log('--module--'+modules);
                this.moduleOptions = modules.map(m => ({
                    Id: m.Id,
                    Name: m.Name
                }));
                console.log('--moduleOptions--'+this.moduleOptions);
                console.log('---test--'+JSON.stringify(this.moduleOptions));
                console.log('--moduleOptions--'+this.moduleOptions.length);
            })
            .catch(error => {
                console.error('Error fetching modules:', error);
                this.moduleOptions = [];
            });
    
        // 🔹 Fetch Contacts via Project Resource Mapping
        getContactsByProject({ projectId: this.selectedProject })
            .then(contacts => {
                console.log('--contacts--'+contacts);
                this.contactOptions = contacts.map(c => ({
                    Id: c.Id,
                    Name: c.Name
                }));
                console.log('--ContactOptions--'+this.contactOptions);
                console.log('---test--'+JSON.stringify(this.contactOptions));
                console.log('--moduleOptions--'+this.contactOptions.length);
            })
            .catch(error => {
                console.error('Error fetching contacts:', error);
                this.contactOptions = [];
            });
    }
    
    
    handleContactChange(event) {
        this.selectedContact = event.detail.recordId;
        console.log('--selectedContact--' + this.selectedContact);
        this.tryFetchProjectResourceMapping();
    }
    
    tryFetchProjectResourceMapping() {
        if (this.selectedProject && this.selectedContact) {
            console.log('selected p'+this.selectedProject);
            console.log('selected c'+this.selectedContact);
            getProjectResourceMappingId({ 
                projectId: this.selectedProject, 
                candidateId: this.selectedContact 
            })
            .then(mappingId => {
                this.projectResourceMappingId = mappingId;
                console.log('--Fetched Mapping Id--', this.projectResourceMappingId);
            })
            .catch(error => {
                console.error('Error fetching Project Resource Mapping:', error);
                this.showToast('Error', 'Could not find a matching Project Resource Mapping', 'error');
            });
        }
    }

    handleStartDateTimeChange(event) {
        this.startDateTime = event.detail.value; // e.g., 2025-05-03T10:22:00.000Z
        console.log('--Formatted Start DateTime--', this.startDateTime);
    }
    
    handleEndDateTimeChange(event) {
        this.endDateTime = event.detail.value;
        console.log('--Formatted End DateTime--', this.endDateTime);
    }
    
    

    handleDescriptionChange(event) {
        this.description = event.target.value;
        console.log('--description--'+this.description);
    }


handleSubmit() {
    if (!this.selectedProject || !this.selectedModule || !this.selectedContact || !this.startDateTime || !this.endDateTime || !this.description) {
        this.showSwalAlert('Error', 'Please fill all required fields.', 'error');
        return;
    }

    // ✅ Convert to local time correctly
    const now = new Date();
    now.setSeconds(0, 0);

    console.log('Selected startdatetime'+ this.startDateTime);
    console.log('Selected enddatetime'+ this.endDateTime);

    const startTime = new Date(this.startDateTime); // already UTC → JS auto converts to local
    startTime.setSeconds(0, 0);

    const endTime = new Date(this.endDateTime);
    endTime.setSeconds(0, 0);
    // ✅ Allow startTime earlier than now if it is today
    const today = new Date();
    today.setHours(0,0,0,0);
    const startDate = new Date(startTime);
    startDate.setHours(0,0,0,0);

    if (startDate < today) {
        // Start date is in the past
        this.showSwalAlert('Error', 'Start Date cannot be in the past.', 'error');
        return;
    }

    // 🚨 End Time <= Start Time
    if (endTime <= startTime) {
        this.showSwalAlert('Error', 'End Time must be greater than Start Time.', 'error');
        return;
    }

    if (this.isEditMode && !this.isCloneMode) {
    this.updateTask();
} else {
    this.submitTask(); // Create + Clone
}

}


    submitTask() {
    console.log('Submitting task...');
    this.showSpinner = true;
    createJiraTask({
        projectId: this.projectResourceMappingId,
        moduleId: this.selectedModule,
        contactId: this.selectedContact,
        priority: this.selectedPriority,
        startDateTime: this.startDateTime,
        endDateTime: this.endDateTime,
        description: this.description
    })
    .then((result) => {
        if(result == 'Task has already been created for this time slot'){
            this.showSwalAlert('Error', result, 'error');
            return;
        }
        this.closeModal();
        this.getTaskData();
        // ✅ Show alert only if task creation succeeds
        this.showSwalAlert('Task Created', 'Your Jira task was successfully created.', 'success');
    })
    .catch(error => {
        console.error('Error creating task:', error);
        this.showSwalAlert('Error', 'Something went wrong!', 'error');
    })
    .finally(() => {
        setTimeout(() => {
            this.showSpinner = false;
        }, 1000);
    });
}



    updateTask() {
    console.log('Updating Jira Task...');
    this.showSpinner = true;
    updateJiraTask({
        taskId: this.currentTaskId,
        priority: this.selectedPriority,
        startDateTime: this.startDateTime,
        endDateTime: this.endDateTime,
        description: this.description
    })
    .then(() => {
        this.closeModal();
        this.getTaskData();
        // ✅ Show alert only if task update succeeds
        this.showSwalAlert('Task Updated', 'Your Jira task was successfully updated.', 'success');
    })
    .catch(error => {
        console.error('Error updating task:', error);
        this.showSwalAlert('Error', 'Something went wrong!', 'error');
    })
    .finally(() => {
        setTimeout(() => {
            this.showSpinner = false;
        }, 1000);
    });
}

    
    handleDelete(event) {
        this.taskIdToDelete = event.target.dataset.id;
        this.showDeleteModal = true;
    }

    cancelDelete() {
        this.showDeleteModal = false;
        this.taskIdToDelete = null;
    }
    
   
    confirmDelete() {
    this.showSpinner = true;
    deleteJiraTask({ taskId: this.taskIdToDelete })
        .then(() => {
            this.getTaskData();
            // ✅ Show alert only if delete succeeds
            this.showSwalAlert('Success', 'Your Jira task was successfully deleted.', 'success');
        })
        .catch(error => {
            console.error(error);
            this.showSwalAlert('Error', 'Something went wrong!', 'error');
        })
        .finally(() => {
            this.showDeleteModal = false;
            this.taskIdToDelete = null;
            setTimeout(() => {
                this.showSpinner = false;
            }, 1000);
        });
}


    showSwalAlert(title, message, icon) {
        if (window.Swal) {
          Swal.fire({
            title: title,
            text: message,
            icon: icon, // 'success', 'error', 'warning', 'info', 'question'
            confirmButtonText: 'OK',
            position: 'center',
            backdrop: true,
            allowOutsideClick: false,

          });
        } else {
          console.error('Swal not loaded');
        }
      }

    openReadOnlyPopup(event) {
    const taskId = event.target.dataset.id;
    const t = this.tasks.find(t => t.id === taskId);

    if (t) {
        this.viewProject = t.project;
        this.viewModule = t.module;
        this.viewTeamMember = t.AssignTo;
        this.viewPriority = t.priority;
        this.viewStart = t.startTime;   // FIXED
        this.viewEnd = t.endTime;       // FIXED
        this.viewDescription = t.description;
        console.log('viewStart: ' + this.viewStart + ' viewEnd: ' + this.viewEnd + ' viewDescription:')
    }

    this.isReadOnlyModalOpen = true;
}


    closeReadOnlyModal() {
        this.isReadOnlyModalOpen = false;
    }

    get emptyTaskImage() {
        return EMPTY_TASK_IMAGE;
    }

      
}