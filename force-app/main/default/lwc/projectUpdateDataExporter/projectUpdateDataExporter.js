import { LightningElement, wire, track, api } from 'lwc';
import fetchRecords from '@salesforce/apex/ProjectDashboardController.getPrepareProjectUpdateReports';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getDependencies from '@salesforce/apex/ProjectDashboardController.getDependencies';
const PAGE_SIZE = 20;

export default class ProjectUpdateDataExporter extends LightningElement {
    @api recordId = '';
    @track records = [];
    @track pagedRecords = [];
    @track columns = [];
    @track columns1 = [];
    currentPage = 1;
    totalPages = 1;
    @track dependencies = false;
      @track selectedRecordId;

    @wire(fetchRecords)
    wiredFunction({ data, error }) {
        if (data) {
            debugger;
            if (data.length > 0) {
                this.currentPage = 1;
                this.totalPages = Math.ceil(data.length / PAGE_SIZE);
                const processedData = data.map((mdl, index) => {
                    return {
                        seriesNumber: index + 1,
                        Name: mdl.projectName || 'N/A',
                        Project_Start_Date__c: mdl.projectStartDate || 'N/A',
                        Project_End_Date__c: mdl.projectEndDate || 'N/A',
                        Project_Expected_Status: mdl.expectedStatus || 'N/A',
                        Project_Current_Status: mdl.currentStatus || 'N/A',
                        Percentage_Level__c: mdl.expectedStatus || 'N/A',
                        Type__c: mdl.currentStatus || 'N/A',
                        Active__c: mdl.completedModule || 'N/A',
                        Dependency: mdl.noOfDependencies || 'N/A',
                        id: mdl.projectId || String(index), 
                    };
                });

                this.records = processedData;
                this.updatePagedRecords();
                this.columns = [
                    { label: 'S.No', fieldName: 'seriesNumber', type: 'number' },
                    { label: 'Project Name', fieldName: 'Name' },
                    { label: 'Project Start Date', fieldName: 'Project_Start_Date__c' },
                    { label: 'Project End Date', fieldName: 'Project_End_Date__c'},
                    { label: 'Project Expected Status', fieldName: 'Project_Expected_Status'},
                    { label: 'Project Current Status', fieldName: 'Project_Current_Status'},
                    { label: 'Project Type', fieldName: 'Type__c'},
                    { label: 'Project Type', fieldName: 'Type__c'},
                    { label: 'Completed Modules', fieldName: 'Active__c', type: 'text'}, // Use Active__c for completedModule
                    { label: 'No. Of Dependencies', fieldName: 'Dependency', type: 'button', typeAttributes: { label: { fieldName: 'Dependency' }, name: 'dependencyButton', variant: 'brand' } }
                 
                ];
            } else {
                this.records = [];
                this.pagedRecords = [];
                this.totalPages = 1;
            }
        } else if (error) {
            console.error('Error:', error);
            this.records = [];
            this.pagedRecords = [];
            this.totalPages = 1;
        }
    }

    get checkRecord() {
        return this.records.length > 0 ? false : true;
    }

    updatePagedRecords() {
        const start = (this.currentPage - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        this.pagedRecords = this.records.slice(start, end).map((record, index) => ({
            ...record,
            seriesNumber: start + index + 1
        }));
    }

    handlePrevious() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updatePagedRecords();
        }
    }

    handleNext() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.updatePagedRecords();
        }
    }

    get isPreviousDisabled() {
        return this.currentPage === 1;
    }

    get isNextDisabled() {
        return this.currentPage === this.totalPages;
    }

    clickHandler() {
        let selectedRows = this.template.querySelector("lightning-datatable").getSelectedRows();
        if (selectedRows.length === 0) {
            this.showToast('Error', 'Please select any one of the records', 'error');
            return;
        }
        let downloadRecords = selectedRows.length > 0 ? [...selectedRows] : [...this.records];
        let csvFile = this.convertArrayToCsv(downloadRecords);
        this.createLinkForDownload(csvFile);
    }

    convertArrayToCsv(downloadRecords) {
        const columnLabels = this.columns.map(column => column.label).join(',');
        let csvFile = columnLabels + "\n";

        downloadRecords.forEach(record => {
            let csvRow = this.columns.map(column => {
                let value = record[column.fieldName] !== undefined && record[column.fieldName] !== null ? record[column.fieldName] : 'N/A';
                if (typeof value === 'string' && value.includes(',')) {
                    value = `"${value}"`;
                }
                return value;
            }).join(',');
            csvFile += csvRow + "\n";
        });

        return csvFile;
    }

    createLinkForDownload(csvFile) {
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvFile));
        element.setAttribute('download', 'Dependency_Record_Data.csv');
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(event);
    }

     handleRowAction(event) {
         debugger;
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        if (actionName === 'dependencyButton') {
            this.handleDependencyClick(row);
        }
    }

    handleDependencyClick(row) {
        debugger;
        this.selectedRecordId = row.id;
        console.log('Dependency button clicked for record: ', this.selectedRecordId);
        this.dependencies = true;
         //this.retrieveDependencies(recordId);
    }

    retrieveDependencies(projectId) {
        debugger;
        getDependencies()
            .then(result => {
                this.dependenciesMap = result;
                console.log('Dependencies Map: ', this.dependenciesMap);

                this.dependencies = this.dependenciesMap[projectId];
                if (this.dependencies) {
                    console.log('Dependencies for project: ', this.dependencies);

                     this.columns1 = [
        { label: 'Dependency Name', fieldName: 'Name', type: 'text' },
        { label: 'Module', fieldName: 'Module__c', type: 'text' },
        
        { label: 'Cleared Date', fieldName: 'Cleared_Date__c', type: 'date' },
        { label: 'Name', fieldName: 'Name', type: 'text' },
        { label: 'Depends On', fieldName: 'Depends_on__c', type: 'text' },
        { label: 'Description', fieldName: 'Description__c', type: 'text' },
        { label: 'Nature of Dependency', fieldName: 'Nature_of_Dependency__c', type: 'text' },
        { label: 'No. of Days', fieldName: 'No_of_days__c', type: 'number' }
    ];


                } else {
                    console.log('No dependencies found for this project.');
                }
            })
            .catch(error => {
                console.error('Error retrieving dependencies: ', error);
            });
    }

    closeModal(){
        this.dependencies = false;
    }


}