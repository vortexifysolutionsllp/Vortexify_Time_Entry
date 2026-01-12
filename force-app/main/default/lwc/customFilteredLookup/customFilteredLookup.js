import { LightningElement, api, track } from 'lwc';

export default class CustomFilteredLookup extends LightningElement {
    @api label;
    @api placeholder;
    @api recordsList = [];

    @api disabled;

    @track searchKey = '';
    @track filteredRecords = [];

    get hasRecords() {
        return this.filteredRecords && this.filteredRecords.length > 0;
    }

    handleChange(event) {
        this.searchKey = event.target.value.toLowerCase();
        this.filterRecords();
    }

    handleFocus() {
        if (this.searchKey.length >= 2) {
            this.filterRecords();
        }
    }

    filterRecords() {
        if (!this.recordsList || this.searchKey.length < 2) {
            this.filteredRecords = [];
            return;
        }

        this.filteredRecords = this.recordsList.filter(
            rec => rec.Name && rec.Name.toLowerCase().includes(this.searchKey)
        );
    }

    handleSelect(event) {
        const recordId = event.currentTarget.dataset.id;
        const recordName = event.currentTarget.dataset.name;
        this.searchKey = recordName;
        this.filteredRecords = [];

        this.dispatchEvent(new CustomEvent('recordselect', {
            detail: { recordId, recordName }
        }));
    }
}