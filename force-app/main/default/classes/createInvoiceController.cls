public with sharing class createInvoiceController {

    @AuraEnabled(cacheable=false)
    public static Id createInvoice(Invoice__c invoiceCreate) {
        if (invoiceCreate == null) {
            throw new AuraHandledException('Invoice object is null.');
        }
        insert invoiceCreate;
        return invoiceCreate.Id;
    }

    /*@AuraEnabled(cacheable=false)
    public static void createInvoiceLineItem(List<Invoice_Line_Items__c> invoiceLineItemCreate) {
        if (invoiceLineItemCreate == null || invoiceLineItemCreate.isEmpty()) {
            throw new AuraHandledException('Line item list is empty.');
        }
        insert invoiceLineItemCreate;
    }*/
    @AuraEnabled(cacheable=false)
public static void createInvoiceLineItem(List<Invoice_Line_Items__c> invoiceLineItemCreate) {
    if (invoiceLineItemCreate == null || invoiceLineItemCreate.isEmpty()) {
        throw new AuraHandledException('Line item list is empty.');
    }

    try {
        insert invoiceLineItemCreate;
    } catch (DmlException e) {
        throw new AuraHandledException('DML Error inserting Invoice Line Items: ' + e.getMessage());
    } catch (Exception e) {
        String errMsg = 'Unexpected Error: ' + e.getMessage();
        System.debug(errMsg);
        throw new AuraHandledException(errMsg);
    }
}

}