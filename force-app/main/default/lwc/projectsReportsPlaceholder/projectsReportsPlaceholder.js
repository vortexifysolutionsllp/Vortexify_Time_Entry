import { LightningElement, wire, track, api } from 'lwc';
import getAllProjectsWithDetailsData from '@salesforce/apex/AddModuleButtonHelper.appprojectDataWithDetails';

export default class ProjectsReportsPlaceholder extends LightningElement {
    @track isShowProjectDetails = true;
    @track wiredDataa = [];
    @track projectNameByIdList;
    @track selectedProjectId;





    @wire(getAllProjectsWithDetailsData)
    wiredData({ error, data }) {
        if (data) {
            debugger;
            this.processData(data);
            // console.log('JSON DATA', JSON.stringify(data));
            this.wiredDataa = data;
        } else if (error) {
            console.error('Error:', error);
        }
    }

    processData(data) {
        let projectNameByIdList = []
        data.projects.forEach(project => {
            projectNameByIdList.push({ value:project.Id, label: project.Name })
        });

        this.projectNameByIdList=projectNameByIdList;


    }


    openModuleWiseComp() {
        debugger;
        if (this.isShowProjectDetails) {
            this.isShowProjectDetails = false
        } else {
            this.isShowProjectDetails = true
        }
    }




    selectionChangeHandler(event) {
        debugger;
        this.selectedProjectId=event.target.value;
        
    }
}