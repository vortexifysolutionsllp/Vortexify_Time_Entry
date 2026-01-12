import { LightningElement, api, track } from 'lwc';

const chunk = (arr, size) => {
    const chunkedArray = [];
    for (let i = 0; i < arr.length; i++) {
       const last = chunkedArray[chunkedArray.length - 1];
       if(!last || last.length === size){
          chunkedArray.push([arr[i]]);
       }else{
          last.push(arr[i]);
       }
    }
    return chunkedArray;
};

export default class PaginationReply extends LightningElement {
    @api replys;
    @api contactChunks;
    currentPage = 1;
    @track contactToDisplay;
    totalPages;
    disableNext = false;
    disablePrev = true;
    @track pageOptions = [];
    pageOptionsLoaded = false;
    size;
    totalRecords;
    pageLimit = 10;

    get pageLimitOptions() {
        return [
            { label: '10', value: '10' },
            { label: '15', value: '15' },
            { label: '20', value: '20' },
            { label: '50', value: '50' },
            { label: '100', value: '100' },
        ];
    }

    @api
    setPaginationReply(size) {
        if (this.replys.length > 0) {
            this.pageOptions = [];
            this.disableNext = this.replys.length <= size;
            this.disablePrev = true;
            this.size = size;
            this.currentPage = 1;
            this.totalRecords = this.replys.length;
            this.contactChunks = chunk(this.replys, this.size);
            this.contactToDisplay = this.contactChunks[0];
            this.totalPages = this.contactChunks.length;

            this.updatePageOptions();
            this.pageOptionsLoaded = true;
            this.calculatePageText();
        }
    }

    updatePageOptions() {
        this.pageOptions = [];
        let startPage = Math.max(1, this.currentPage - 2);
        let endPage = Math.min(this.totalPages, startPage + 4);
        for (let i = startPage; i <= endPage; i++) {
            this.pageOptions.push({
                label: i.toString(),
                value: i.toString(),
                className: `${i == this.currentPage ? 'background-color:#1589EE;color:white;' : 'color:black;'} height:30px;width:30px;border-radius: 2px;cursor: pointer;text-align: center;margin-right: 3px;display:flex;align-items: center;justify-content: center;`
            });
        }
    }

    calculatePageText() {
        let end = (this.currentPage * this.size) > this.totalRecords ? this.totalRecords : (this.currentPage * this.size);
        this.pageParam = ((this.currentPage * this.size) - (this.size - 1)) + ' to ' + end;
        this.returnRecordToDisplay();
    }

    handleNext() {
        this.currentPage = Math.min(this.currentPage + 1, this.totalPages);
        this.updateNavigationState();
    }

    handlePrev() {
        this.currentPage = Math.max(this.currentPage - 1, 1);
        this.updateNavigationState();
    }

    handlePageChange(event) {
        this.currentPage = parseInt(event.target.dataset.value);
        this.updateNavigationState();
    }

    updateNavigationState() {
        this.disableNext = this.currentPage >= this.totalPages;
        this.disablePrev = this.currentPage <= 1;
        this.contactToDisplay = this.contactChunks[this.currentPage - 1];
        this.calculatePageText();
        this.updatePageOptions();
    }

    handleLimitChange(event) {
        this.pageLimit = event.detail.value;
        this.size = parseInt(this.pageLimit);
        this.setPaginationReply(this.size);
    }

    returnRecordToDisplay() {
        this.dispatchEvent(new CustomEvent('pagechanged', { detail: { recordToDisplay: this.contactToDisplay } }));
    }
}