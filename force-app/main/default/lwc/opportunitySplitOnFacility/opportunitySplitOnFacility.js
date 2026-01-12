import { LightningElement, track } from 'lwc';

export default class OpportunitySplitOnFacility extends LightningElement {

    @track accordList = [{ 'Number': '1' }];

    handleAddMore() {
        this.accordList = [...this.accordList, { 'Number': '' }];
    }
}