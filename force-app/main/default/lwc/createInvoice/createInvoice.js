import { LightningElement, api, track,wire } from 'lwc';
import insertInvoice from '@salesforce/apex/createInvoiceController.createInvoice';
import insertInvoiceLineItem from '@salesforce/apex/createInvoiceController.createInvoiceLineItem';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
 import { CurrentPageReference } from 'lightning/navigation';
import { NavigationMixin } from 'lightning/navigation';

export default class CreateInvoice extends NavigationMixin(LightningElement) {
    @api recordId ; // Default Account ID (can be passed from record page)
    @track rows = [];
    @track invoiceFields = {
        DueDate: '',
        EndDate: '',
        StartDate:'',
        // ProjectCost: ''
    };
@wire(CurrentPageReference)
getStateParameters(currentPageReference) {
    if (currentPageReference) {
        this.recordId = currentPageReference.state.recordId;
        console.log('Dynamic recordId from URL:', this.recordId);
    }
}

    connectedCallback() {
        console.log('recordId:', this.recordId);
        this.addRow();
    }

    addRow() {
        const newRow = {
            Id: Date.now().toString(),
            Description: '',
            Date: '',
            Time: '',
            Rate: '',
            GST: ''
        };
        this.rows = [...this.rows, newRow];
    }

    handleDelete(event) {
        const rowId = event.target.dataset.id;
        this.rows = this.rows.filter(row => row.Id !== rowId);
    }

    handleInputChange(event) {
        const rowId = event.target.dataset.id;
        const fieldName = event.target.name;
        const value = event.target.value;

        this.rows = this.rows.map(row => {
            if (row.Id === rowId) {
                return { ...row, [fieldName]: value };
            }
            return row;
        });
    }

    handleInvoiceInputChange(event) {
        const { name, value } = event.target;
        this.invoiceFields = { ...this.invoiceFields, [name]: value };
    }

    /*handleSave() {
        if (!this.rows.length) {
            this.showToast('Validation Error', 'Please add at least one project row before saving.', 'error');
            return;
        }

        const invoiceObj = {
            Account__c: this.recordId,
            Due_Date__c: this.invoiceFields.DueDate || null,
            End_Date__c: this.invoiceFields.EndDate || null,
            Start_Date__c:this.invoiceFields.StartDate || null
            // Project_Cost__c: this.invoiceFields.ProjectCost ? parseFloat(this.invoiceFields.ProjectCost) : null
        };

        insertInvoice({ invoiceCreate: invoiceObj })
            .then(invoiceId => {
                console.log('Invoice created with ID:', invoiceId);
                this.createLineItems(invoiceId);
            })
            .catch(error => {
                this.handleError(error, 'Error creating invoice');
            });
    }*/

    handleSave() {
    if (!this.validateInvoiceFields() || !this.validateLineItems()) {
        return;
    }

    const invoiceObj = {
        Account__c: this.recordId,
        Due_Date__c: this.invoiceFields.DueDate,
        End_Date__c: this.invoiceFields.EndDate,
        Start_Date__c: this.invoiceFields.StartDate
    };

    insertInvoice({ invoiceCreate: invoiceObj })
        .then(invoiceId => {
            console.log('Invoice created with ID:', invoiceId);
            this.createLineItems(invoiceId);
        })
        .catch(error => {
            this.handleError(error, 'Error creating invoice');
        });
}


    createLineItems(invoiceId) {
        const lineItems = this.rows.map(row => ({
            Invoice__c: invoiceId,
            Description__c: row.Description || '',
            Date__c: row.Date || null,
            Time_Hr__c: row.Time ? parseFloat(row.Time) : 0,
            Rate__c: row.Rate ? parseFloat(row.Rate) : 0,
            Gst__c: row.GST !== undefined ? parseFloat(row.GST) : null

        }));
console.log('Line Items being sent:', JSON.stringify(lineItems));

        insertInvoiceLineItem({ invoiceLineItemCreate: lineItems })
            .then(() => {
                this.showToast('Success', 'Invoice and Line Items created successfully!', 'success');
                this.resetForm();
                this.navigateToInvoice(invoiceId);
            })
            .catch(error => {
                this.handleError(error, 'Error creating invoice line items');
            });
    }

    resetForm() {
        this.rows = [];
        this.invoiceFields = { DueDate: '',StartDate:'', EndDate: '', ProjectCost: '' };
    }

    navigateToInvoice(invoiceId) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: invoiceId,
                objectApiName: 'Invoice__c',
                actionName: 'view'
            }
        });
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }

    handleError(error, defaultMessage) {
        console.error('Error:', error);
        let message = defaultMessage;
        if (error?.body?.message) {
            message = error.body.message;
        } else if (error?.message) {
            message = error.message;
        }
        this.showToast('Error', message, 'error');
    }

    validateInvoiceFields() {
    const { DueDate, StartDate, EndDate } = this.invoiceFields;
    if (!DueDate || !StartDate || !EndDate) {
        this.showToast('Validation Error', 'Please fill in all invoice fields.', 'error');
        return false;
    }
    return true;
}

validateLineItems() {
    for (let row of this.rows) {
        if (!row.Description || !row.Date || !row.Time || !row.Rate || !row.GST) {
            this.showToast('Validation Error', 'Please fill in all fields in each project row.', 'error');
            return false;
        }
    }
    return true;
}

}