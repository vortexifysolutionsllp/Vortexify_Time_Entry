import { LightningElement, api, wire } from 'lwc';
import getProjectsForContact from '@salesforce/apex/ProjectEmployeeController.getProjectEmployee';

export default class ProjectEmpolyeeDashboard extends LightningElement {
    @api recordId;
    projects = []; 
    error;

    @wire(getProjectsForContact, { projectID: '$recordId' })
    wiredNames({ error, data }) {
        if (data) {
            this.projects = data.map((proj, index) => ({
                id: proj.Id,
                name: proj.Name,  // 👈 Corrected here (capital N)
                label: `#${index + 1}`
            }));
            this.error = undefined;
        } else if (error) {
            this.error = error.body.message;
            this.projects = [];
        }
    }

    get projectCount() {
        return this.projects.length;
    }
}