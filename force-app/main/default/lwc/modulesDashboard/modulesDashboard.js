import { LightningElement, api, track, wire } from 'lwc';
import getProjectData from '@salesforce/apex/ProjectDashboardController.prepareModulesData';
export default class ModulesDashboard extends LightningElement {
    @api projectId = 'a1L6D00000AMYbXUAX';
    @track modulesHealthWrapperList;
    @track isShowModuleComp = true
    @track isShowMemberCardComp;
    @track selectedModuleId;

    @wire(getProjectData, { projectId: '$projectId' })
    wiredModules({ error, data }) {
        debugger;
        if (data) {
            this.modulesHealthWrapperList = data.map(mod => {
                return {
                    ...mod,
                    delayRateFlagColor: mod.delayRateFlagColor === undefined || mod.delayRateFlagColor === null ? 'Blue' : mod.delayRateFlagColor
                };
            });

            console.log('data', data);
        } else if (error) {
            this.modulesHealthWrapperList = undefined;
            console.error('Error retrieving project data', error);
        }
    }

    viewTaskDetails(event) {
        debugger;
        this.selectedModuleId = event.currentTarget.dataset.id;
    }

    computeFlagStyle(flagColor) {
        return `background-color: ${flagColor}`;
    }

    viewMemeberCardComp(event) {
        debugger;
        this.isShowModuleComp = false;
        this.selectedModuleId = event.currentTarget.dataset.id;
        this.isShowMemberCardComp = true;

    }

    backAction() {
        if (this.isShowMemberCardComp) {
            this.isShowMemberCardComp = false;
            this.isShowModuleComp = true;
        }
    }


}