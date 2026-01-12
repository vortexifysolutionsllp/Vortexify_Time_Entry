import { LightningElement, api, track } from 'lwc';

export default class Pagination extends LightningElement {
    @api totalRecords;
    @api pageSize;
    @track pageNumber = 1;

    get totalPages() {
        return Math.ceil(this.totalRecords / this.pageSize);
    }

    get isFirstPage() {
        return this.pageNumber === 1;
    }

    get isLastPage() {
        return this.pageNumber >= this.totalPages;
    }

    handleFirst() {
        this.pageNumber = 1;
        this.dispatchEvent(new CustomEvent('pagechange', { detail: this.pageNumber }));
    }

    handlePrevious() {
        if (this.pageNumber > 1) {
            this.pageNumber--;
            this.dispatchEvent(new CustomEvent('pagechange', { detail: this.pageNumber }));
        }
    }

    handleNext() {
        if (this.pageNumber < this.totalPages) {
            this.pageNumber++;
            this.dispatchEvent(new CustomEvent('pagechange', { detail: this.pageNumber }));
        }
    }

    handleLast() {
        this.pageNumber = this.totalPages;
        this.dispatchEvent(new CustomEvent('pagechange', { detail: this.pageNumber }));
    }
}