import { LightningElement, api, track } from 'lwc';
import searchRecords from '@salesforce/apex/UtilityClassforSite.searchRecords';


export default class CustomLookup extends LightningElement {
    @api label;
    @api placeholder;
    @api objectApiName;
    

    @track searchKey = '';
    @track records = [];

    @api selectedId;
    @api selectedName;

    // ✅ Proper recordsList binding
    _recordsList = [];

    @api
    get recordsList() {
        return this._recordsList;
    }

    set recordsList(value) {
        this._recordsList = value || [];
        console.log('✅ Received recordsList from parent:', this._recordsList);
        this.records = this._recordsList;
    }

    connectedCallback() {
        if (this.selectedName) {
            this.searchKey = this.selectedName;
        }
    }

    // get showDropdown() {
    //     return this.searchKey && this.searchKey.length >= 2;
    // }

    get hasRecords() {
        return this.records && this.records.length > 0;
    }

    handleChange(event) {
        this.searchKey = event.target.value;
        this.fetchRecords();
    }

    handleFocus() {
        if (this.searchKey && this._recordsList.length === 0) {
            this.fetchRecords();
        }
    }

    fetchRecords() {
        if (this.searchKey.length < 2) {
            this.records = [];
            return;
        }

        // Only search if objectApiName is defined
        if (!this.objectApiName) return;

        searchRecords({ objectApiName: this.objectApiName, searchKey: this.searchKey })
            .then(result => {
                this.records = result;
            })
            .catch(error => {
                console.error(error);
            });
    }

    handleSelect(event) {
        const recordId = event.currentTarget.dataset.id;
        const recordName = event.currentTarget.dataset.name;

        this.searchKey = recordName;
        this.records = [];

        this.dispatchEvent(new CustomEvent('recordselect', {
            detail: { recordId, recordName }
        }));
    }
    
}