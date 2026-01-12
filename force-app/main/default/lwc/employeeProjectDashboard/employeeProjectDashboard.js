import { LightningElement, api, wire } from 'lwc';
import getProjectsForContact from '@salesforce/apex/EmployeeProjectChartController.getProjectsForContact';

export default class EmployeeProjectDashboard extends LightningElement {
    @api recordId;
    projects = []; 
    error;

    @wire(getProjectsForContact, { contactId: '$recordId' })
    wiredNames({ error, data }) {
        if (data) {
            this.projects = data.map((proj, index) => {
                let formattedDate = '';
                if (proj.mappingCreatedDate) {
                    // Convert datetime string → Date → Local date string
                    formattedDate = new Date(proj.mappingCreatedDate).toLocaleDateString();
                }

                return {
                    id: proj.projectId,
                    name: proj.projectName,
                    createdDate: formattedDate   // 👈 only Date
                };
            });
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