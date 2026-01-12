import { LightningElement, track, wire, api } from 'lwc';
import getProjectResourceMappings from '@salesforce/apex/ProjectDashboardController.allProjectsDataCheck';
export default class ProjectResourceTable extends LightningElement {
    @track projectResources;
    @track error;
    @track isLoading = true;
    @track wiredResult;
    @api recordId;

    @wire(getProjectResourceMappings, { recordId: '$recordId' })
    wiredData(result) {
        this.wiredResult = result;
        if (result.data) {
            // this.projectResources = result.data;
            let tmpPRMS = result.data.map((prm, index) => ({
                ...prm,
                taggedDate: this.formatDate(prm.CreatedDate),
                index: index + 1 // Adding 1 to start index from 1 instead of 0
            }));
            this.projectResources=tmpPRMS;
            console.log('result.Data', result.data);
        } else if (result.error) {
            console.error('Error:', result.error);
        }
    }

    formatDate(isoDateString) {
        // Create a new Date object from the ISO string
        const date = new Date(isoDateString);

        // Check if the date is valid
        if (isNaN(date)) {
            throw new Error('Invalid date string');
        }

        // Use Intl.DateTimeFormat for formatting
        const formatter = new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            timeZone: 'UTC'
        });

        // Format the date
        return formatter.format(date);
    }
}