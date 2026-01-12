import { LightningElement, track, wire, api } from 'lwc';
import { exportToExcel } from 'c/excelExportUtil'; // Utility to export Excel
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getMilestoneRecords from '@salesforce/apex/MilestoneController.getMilestoneData';
import saveMilestoneChanges from '@salesforce/apex/MilestoneController.saveMilestoneChanges'; // Apex to save changes

const COLUMNS = [
    {label :'Id' ,fieldName:'Id'},
    { label: 'Actual End Date', fieldName: 'Actual_End_Date__c', type: 'date', editable: true },
    { label: 'Actual Start Date', fieldName: 'Actual_Start_Date__c', type: 'date', editable: true },
    { label: 'Closed Milestone', fieldName: 'Closed_the_Milesstone__c', type: 'boolean', editable: true },
    { label: 'Description', fieldName: 'Description__c', editable: true },
    { label: 'Expected End Date', fieldName: 'Expected_End_Date__c', type: 'date', editable: true },
    { label: 'Expected Start Date', fieldName: 'Expected_Start_Date__c', type: 'date', editable: true },
    { label: 'Name', fieldName: 'Name' },
    { label: 'Project', fieldName: 'Project__c' },
    { label: 'Percentage', fieldName: 'Precentage__c', type: 'percent', editable: true },
    {
        label: 'Stages',
        fieldName: 'Stages__c',
        type: 'picklist',
        editable: true,
        typeAttributes: {
            placeholder: 'Select a Stage',
            options: [
                { label: 'Not Started', value: 'Not Started' },
                { label: 'In Progress', value: 'In Progress' },
                { label: 'Completed', value: 'Completed' },
                { label: 'New', value: 'New' },
            ],
        },
    },
    { label: 'Tentative Date of Payment', fieldName: 'Tentative_Date_of_Payment__c', type: 'date', editable: true },
    { label: 'Total Utilized Time', fieldName: 'Total_Utilised_Time__c', type: 'number', editable: true },
];

export default class MilestonesUpdate extends LightningElement {
    @track selectedProjectId=null;
    @track milestoneRecords = [];
    columns = COLUMNS;
    @track selectedRows = [];
    @track isLoading = false;
    @track draftValues = [];

    // Wire method to get milestone records by project ID
    @wire(getMilestoneRecords, { projectId: '$selectedProjectId' })
    wiredMilestones({ error, data }) {
        debugger;
        // this.isLoading = true;
        if (data) {
            console.log('data',JSON.stringify(data))
            this.milestoneRecords = data;
            this.isLoading = false;
        } else if (error) {
            this.isLoading = false;
             console.log('error',JSON.stringify(error))
            this.showToast('Error', error.body.message, 'error');
           
        }
    }

    // Handle row selection
    handleRowSelection(event) {
        this.selectedRows = event.detail.selectedRows;
    }

    // Handle Save action
    handleSave(event) {
        const draftValues = event.detail.draftValues;
        this.isLoading = true;

        saveMilestoneChanges({ updatedRecords: draftValues })
            .then(() => {
                this.showToast('Success', 'Changes saved successfully', 'success');
                this.draftValues = [];
                // Refresh the data by invoking the wire method
                return getMilestoneRecords({ projectId: this.selectedProjectId });
            })
            .then(updatedRecords => {
                this.milestoneRecords = updatedRecords;
                this.isLoading = false;
            })
            .catch(error => {
                this.isLoading = false;
                this.showToast('Error', error.body.message, 'error');
            });
    }

    // Show toast notifications
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(event);
    }

    handleRecordChange(event) {
        debugger;
       this.selectedProjectId = event.detail.recordId;
   }

   //Handle the export to CSV
    clickHandler() {
        debugger;
        let selectedRecords = this.selectedRows.length > 0 ? [...this.selectedRows] : [...this.milestoneRecords];
        if (selectedRecords.length === 0) {
            this.showToast('Error', 'Please select at least one record to export', 'error');
            return;
        }

        let csvFile = this.convertArrayToCsv(selectedRecords);
        this.createLinkForDownload(csvFile);
    }

    // Convert selected records to CSV format
    convertArrayToCsv(selectedRecords) {
        const columnLabels = this.columns.map(column => column.label).join(',');
        let csvFile = columnLabels + "\n";

        selectedRecords.forEach(record => {
            let csvRow = this.columns.map(column => {
                let value = record[column.fieldName] !== undefined && record[column.fieldName] !== null ? record[column.fieldName] : 'N/A';
                if (typeof value === 'string' && value.includes(',')) {
                    value = "${value}";
                }
                return value;
            }).join(',');
            csvFile += csvRow + "\n";
        });

        return csvFile;
    }

    // Create download link for CSV file
    createLinkForDownload(csvFile) {
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvFile));
        element.setAttribute('download', 'Milestone_Records.csv');
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }
}