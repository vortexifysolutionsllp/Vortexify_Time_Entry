import { LightningElement, wire, track, api } from 'lwc';
import fetchRecords from '@salesforce/apex/ProjectDashboardController.getreports';
const PAGE_SIZE = 10;
export default class CsvDataExporter extends LightningElement {

    @api recordId='';
    @track records = [];
    @track pagedRecords = [];
    @track columns = [];
    currentPage = 1;
    totalPages = 1;
    accountData = [];

    @wire(fetchRecords)
    wiredFunction ({ data, error }) {
        if (data) {
            console.log('data---',JSON.stringify(data));
            if (data.length > 0) {

                this.records = data;
                this.currentPage = 1;
                this.totalPages = Math.ceil(data.length / PAGE_SIZE);
                this.updatePagedRecords();
                this.columns = Object.keys(data[0]).map((field) => {
                    return { label: field, fieldName: field };
                });
                console.log('this.columns---',JSON.stringify(this.columns));
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
        this.pagedRecords = this.records.slice(start, end);
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
        let selectedRows = [];
        let downloadRecords = [];
        selectedRows = this.template.querySelector("lightning-datatable").getSelectedRows()
        if (selectedRows.length > 0) {
            downloadRecords = [...selectedRows];
        } else {
            downloadRecords = [...this.accountData];
        }
        let csvFile = this.convertArrayToCsv(downloadRecords)
        this.createLinkForDownload(csvFile);
    }

    convertArrayToCsv(downloadRecords) {
        let csvHeader = Object.keys(downloadRecords[0]).toString();
        console.log('header: ' + csvHeader);
        let csvBody = downloadRecords.map((currItem) => Object.values(currItem).toString());
        console.log('body: ' + csvBody);
        let csvFile = csvHeader + "\n" + csvBody.join("\n");
        return csvFile;
    }

    createLinkForDownload(csvFile) {
        const downLink = document.createElement("a");
        downLink.href = "data:text/csv;charset=utf-8," + encodeURI(csvFile);
        downLink.target = '_blank';
        downLink.download = "Account_Record_Data.csv"
        downLink.click();
    }

}