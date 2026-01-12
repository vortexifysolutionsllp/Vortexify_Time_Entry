import { LightningElement, api, wire,track } from 'lwc';
import sendEmailWithAttachments from '@salesforce/apex/sendEmail.sendEmailWithAttachments';
import getRecord from '@salesforce/apex/sendEmail.fetchRecord';
import { CurrentPageReference } from 'lightning/navigation';
import { CloseActionScreenEvent } from 'lightning/actions';

export default class SendInvoice extends LightningElement {
    @track recordId ;
    // @track record;
    @track supplierEmail='';
    @track fromEmail='shubhi.vishnoi@vortexifysync.com';
    //@track userEmail='';
    @track subject;
    @track isModalOpen=true;
    //showInitialContent = true;

    handleSubjectChange(event) {
        this.subject = event.target.value;
    }
    // connectedCallback() {
    //     this.handleSend();
    // }
    // @wire(getRecord,{invoiceId:'$recordId'})
    // fetchingRecord({data,error}){
    //     if(data){
    //        this.record=data;
    //        this.supplierEmail = data.Account__r?.Email__c || '';
    //        //this.userEmail=data.Account__r?.Owner?.Email;
    //     }else{
    //         console.log(error); 
    //     }
    // }


        fetchInvoiceData() {
        getRecord({ invoiceId: this.recordId })
            .then(data => {
                if (data) {
                    this.supplierEmail = data.Account__r?.Email__c || '';
                }
            })
            .catch(error => {
                console.error('Error fetching invoice record:', error);
            });
    }

    handleSend() {
        debugger;

        sendEmailWithAttachments({ invoiceId: this.recordId })
            .then(result => {
                this.showInitialContent = false;
                this.closeQuickAction();
            })
            .catch(error => {
                this.error = error;
            });
    }
    closeQuickAction() {
        this.dispatchEvent(new CloseActionScreenEvent());
    }
    @wire(CurrentPageReference)
    getInvoiceId(currentPageReference){
        if(currentPageReference){
           this.recordId=currentPageReference.state.recordId;
           this.fetchInvoiceData();
        }
    }


}