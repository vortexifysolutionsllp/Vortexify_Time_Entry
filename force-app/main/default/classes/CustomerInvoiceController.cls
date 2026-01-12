/*public class CustomerInvoiceController {
    public static Invoice__c invoice { get; set; }
    public static List<Invoice_Line_Items__c> lineItems { get; set; }
    public static Bill_From_Details__mdt billFrom { get; set; }
    
    public CustomerInvoiceController() {
        // Fetch invoice ID from query parameter
        Id invoiceId = ApexPages.currentPage().getParameters().get('id');
        
        if(invoiceId == null) {
            ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.ERROR, 'Invoice ID is missing in the URL'));
            return;
        }
        
        // Fetch Invoice
        invoice = [
            SELECT Id, Account__r.Name, Account__r.Shipping_Address__c, Account__r.GST__c, Account__r.CIN__c, Account__r.PAN__c,Account__r.Website,
            Name, Description__c, Start_Date__c, End_Date__c, Due_Date__c,
            Amount__c, GST__c, Other_Tax__c, Total_Amount__c
            FROM Invoice__c
            WHERE Id = :invoiceId
            LIMIT 1
        ];
        
        // Fetch line items
        lineItems = [
            SELECT Description__c, Time_Hr__c, Rate__c, Total_Amount__c, Date__c
            FROM Invoice_Line_Items__c
            WHERE Invoice__c = :invoiceId
            ORDER BY Date__c ASC
        ];
        
        // Fetch Bill From details (1st active record)
        billFrom = [
            SELECT Address__c, GSTIN__c, CIN__c, PAN__c, Website__c
            FROM Bill_From_Details__mdt
            LIMIT 1
        ];
    }
}*/


public class CustomerInvoiceController {
    public Invoice__c invoice { get; set; }
    public List<Invoice_Line_Items__c> lineItems { get; set; }
    public Bill_From_Details__mdt billFrom { get; set; }

    public CustomerInvoiceController(ApexPages.StandardController stdController) {
        // Get Invoice ID from URL
        Id invoiceId = ApexPages.currentPage().getParameters().get('id');
        
        if(invoiceId == null) {
            ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.ERROR, 'Invoice ID is missing in the URL'));
            return;
        }

        // Fetch Invoice
        invoice = [
            SELECT Id, Account__r.Name, Account__r.Shipping_Address__c, Account__r.GST__c, Account__r.CIN__c, Account__r.PAN__c, Account__r.Website,
            Name, Description__c, Start_Date__c, End_Date__c, Due_Date__c,
            Amount__c, GST__c, Other_Tax__c, Total_Amount__c, Base_Amount__c, Total_Amount_With_Gst__c, GST_Total_Amount__c,Total_Gst_Amount__c
            FROM Invoice__c
            WHERE Id = :invoiceId
            LIMIT 1
        ];

        // Fetch line items
        lineItems = [
            SELECT Description__c, Name,Gst__c, Time_Hr__c, Rate__c, Total_Amount__c, Date__c,Gst_Amount__c, Total_Amount_with_Gst__c
            FROM Invoice_Line_Items__c
            WHERE Invoice__c = :invoiceId
            ORDER BY Date__c ASC
        ];
        system.debug('--testing'+lineItems);
        // Fetch Bill From details (first active record)
        billFrom = [
            SELECT Address__c, GSTIN__c, CIN__c, PAN__c, Website__c
            FROM Bill_From_Details__mdt
            LIMIT 1
        ];
    }
}