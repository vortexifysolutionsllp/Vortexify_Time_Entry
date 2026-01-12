import { LightningElement, api, wire, track } from 'lwc';
import getInvoicesByAccount from '@salesforce/apex/accInvoiceLWC_Controller.getInvoicesByAccount';

export default class AccInvoiceLWC extends LightningElement {
    @api recordId;

    @track initiatedInvoices = [];
    @track pendingInvoices = [];
    @track realisedInvoices = [];

    initiatedCount = 0;
    pendingCount = 0;
    realisedCount = 0;

    initiatedTotal = 0;
    pendingTotal = 0;
    realisedTotal = 0;

    grandTotal = 0;

    // 👁 Show/Hide Grand Total
    @track showGrandTotal = false;

    get eyeIcon() {
        return this.showGrandTotal ? 'utility:hide' : 'utility:preview';
    }

    toggleGrandTotal() {
        this.showGrandTotal = !this.showGrandTotal;
    }

        get formattedGrandTotal() {
        return Math.floor(this.grandTotal).toString();
    }

    // Masked value (X’s)
    get maskedGrandTotal() {
        const intStr = Math.floor(this.grandTotal).toString();
        const length = intStr.length;
        return "X".repeat(length > 0 ? length : 1);
    }

    // 👉 Masked Grand Total (Xs)
    // get maskedGrandTotal() {
    //     if (!this.grandTotal) return '';
    //     const digits = Math.floor(this.grandTotal).toString().length;
    //     this.grandTotal ? this.grandTotal.toString() : "0";
    //     return 'X'.repeat(digits);
    // }
    

    @wire(getInvoicesByAccount, { accountId: '$recordId' })
    wiredInvoices({ error, data }) {
        if (data) {
            const invoicesMap = data.invoices || {};
            const totalsMap = data.totals || {};

            // Format invoice data
            const formatInvoices = (list) => {
                return (list || []).map(inv => ({
                    ...inv,
                    recordUrl: '/' + inv.Id,
                    formattedDate: inv.CreatedDate ? inv.CreatedDate.split('T')[0] : ''
                }));
            };

            this.initiatedInvoices = formatInvoices(invoicesMap['Initiated']);
            this.pendingInvoices   = formatInvoices(invoicesMap['Pending']);
            this.realisedInvoices  = formatInvoices(invoicesMap['Realised']);

            this.initiatedCount = this.initiatedInvoices.length;
            this.pendingCount   = this.pendingInvoices.length;
            this.realisedCount  = this.realisedInvoices.length;

            this.initiatedTotal = totalsMap['Initiated'] || 0;
            this.pendingTotal   = totalsMap['Pending']   || 0;
            this.realisedTotal  = totalsMap['Realised']  || 0;

            this.grandTotal = data.grandTotal || 0;
        } else if (error) {
            console.error('Error fetching invoices:', error);
        }
    }
}