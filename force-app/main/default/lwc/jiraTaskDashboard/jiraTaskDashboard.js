import { LightningElement, wire,api,track } from 'lwc';
import getJiraTasks from '@salesforce/apex/ProjectDashboardController.prepareJiraTaskRecords';

export default class JiraTaskDashboard extends LightningElement {
    @track jiraTaskList;
    @api moduleId;
    @track isjiraTaskListView;
    @track isjiraTaskList=true;
    @track selectedTeamMemeberId;
    @track selectedModuleId;

    @wire(getJiraTasks,{ModuleId: '$moduleId'})
    wiredModules({ error, data }) {
        debugger;
        if (data) {
            this.modulesHealthWrapperList = data.map(mod => {
                return {
                    ...mod,
                    delayRateFlagColor: mod.delayRateFlagColor === undefined || mod.delayRateFlagColor === null ? 'Blue' : mod.delayRateFlagColor
                };
            });
            this.jiraTaskList=this.modulesHealthWrapperList;
            console.log('data', data);
        } else if (error) {
            this.modulesHealthWrapperList = undefined;
            console.error('Error retrieving project data', error);
        }
    }
    updateTaskDescriptions() {
        this.template.querySelectorAll('.task-description').forEach((element, index) => {
            element.innerHTML = this.jiraTaskList[index].Description;
        });
    }

    viewRelatedTasks(event){
        debugger;
        this.selectedTeamMemeberId = event.currentTarget.dataset.id;
        this.selectedModuleId = event.currentTarget.dataset.mid;
        this.isjiraTaskList=false;
        this.isjiraTaskListView=true;
    }

     backAction(event){
        if(this.isjiraTaskListView){
            this.isjiraTaskListView=false;
            this.isjiraTaskList=true;
        }
    }
}