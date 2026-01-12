import { LightningElement,track,api, wire} from 'lwc';


export default class TaskManagerParentPlaceholder extends LightningElement {

    @track selectedDate;
    @track selectedMonth;
    @track selectedYear;
    @api conId='003C400000JIQIsIAP';

    get isDateSelected() {
        console.log('isDateSelected---',this.selectedDate,'---',this.selectedMonth,'---',this.selectedYear,'---',this.conId,'check All');
        return this.selectedDate && this.selectedMonth && this.selectedYear;
    }
    

    dateSelectedCallback(callback){
        debugger;
        let parts = callback.detail.date.split('/');

        this.selectedDate = parseInt(parts[0]);
        this.selectedMonth = parseInt(parts[1]);
        this.selectedYear = parseInt(parts[2]);

        console.log('Placeholder recieved---',parts);
    }

    // dateSelectedCallback(callback) {
    //     let parts = callback.detail.date.split('/');
    //     this.selectedDate = parseInt(parts[0]);
    //     this.selectedMonth = parseInt(parts[1]);
    //     this.selectedYear = parseInt(parts[2]);
    // }
    


}