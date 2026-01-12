import { LightningElement, wire, track, api } from 'lwc';
import fetchRecords from '@salesforce/apex/ProjectDashboardController.getDependencyreports';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const PAGE_SIZE = 10;

export default class DependencyDataExporter extends LightningElement {
    @api recordId = '';
    @track records = [];
    @track pagedRecords = [];
    @track columns = [];
    currentPage = 1;
    totalPages = 1;
    accountData = [];
    @track showDependency = false;

    @wire(fetchRecords,{recordId: '$recordId'})
    wiredFunction({ data, error }) {
        debugger;
        if (data) {
            if (data.length > 0) {
                this.currentPage = 1;
                this.totalPages = Math.ceil(data.length / PAGE_SIZE);
                const processedData = data.map((mdl, index) => {
                    return {
                        seriesNumber: index + 1, // Adding series number
                        Name: mdl.Name || 'N/A',
                        moduleNameValue: mdl.Module__r && mdl.Module__r.Name ? mdl.Module__r.Name : 'N/A',
                        CreatedDate: mdl.CreatedDate || 'N/A',
                        Cleared_Date__c: mdl.Cleared_Date__c || 'N/A',
                        No_of_days__c: mdl.No_of_days__c || 'N/A',
                        Nature_of_Dependency__c: mdl.Nature_of_Dependency__c || 'N/A',
                        Description__c: mdl.Description__c || 'N/A',
                    };
                });

                this.records = processedData;
                this.updatePagedRecords();
                this.columns = [
                    { label: 'S.No', fieldName: 'seriesNumber', type: 'number' }, // Adding series number column
                    { label: 'Dependency Name', fieldName: 'Name' },
                    { label: 'Module', fieldName: 'moduleNameValue' },
                    { label: 'Raised Date', fieldName: 'CreatedDate', type: 'date' },
                    { label: 'Cleared Date', fieldName: 'Cleared_Date__c'},
                    { label: 'No of Days', fieldName: 'No_of_days__c'},
                    { label: 'Nature of Dep', fieldName: 'Nature_of_Dependency__c' },
                    { label: 'Description', fieldName: 'Description__c' },
                ];
                this.showDependency = true;
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
            seriesNumber: start + index + 1 // Adjusting series number for paged records
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
        console.log('Selected rows:', selectedRows);  // Debug log
        if (selectedRows.length === 0) {
            this.showToast('Error', 'Please select any one of the records', 'error');
            return;
        }
        let downloadRecords = selectedRows.length > 0 ? [...selectedRows] : [...this.accountData];
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
        console.log('Dispatching toast event:', event); // Debug log
        this.dispatchEvent(event);
    }

    closeModal(){
        debugger;
        this.showDependency = false;
         
    }
}