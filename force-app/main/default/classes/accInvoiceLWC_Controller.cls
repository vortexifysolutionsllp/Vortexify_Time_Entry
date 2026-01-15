public with sharing class accInvoiceLWC_Controller {
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getInvoicesByAccount(Id accountId) {
        //Test Angel 2
        Map<String, Object> result = new Map<String, Object>();
        if (accountId == null) return result;

        // Group invoices by status
        Map<String, List<Invoice__c>> groupedInvoices = new Map<String, List<Invoice__c>>();
        List<Invoice__c> invoices = [
            SELECT Id, Name, Status__c, Amount__c, GST_Total_Amount__c, CreatedDate
            FROM Invoice__c
            WHERE Account__c = :accountId
            ORDER BY CreatedDate DESC
        ];

        for (Invoice__c inv : invoices) {
            if (!groupedInvoices.containsKey(inv.Status__c)) {
                groupedInvoices.put(inv.Status__c, new List<Invoice__c>());
            }
            groupedInvoices.get(inv.Status__c).add(inv);
        }
        result.put('invoices', groupedInvoices);

        // Calculate totals by status
        Map<String, Decimal> totalsByStatus = new Map<String, Decimal>();
        AggregateResult[] totals = [
            SELECT Status__c status, SUM(GST_Total_Amount__c) total
            FROM Invoice__c
            WHERE Account__c = :accountId
            GROUP BY Status__c
        ];
        Decimal grandTotal = 0;
        for (AggregateResult ar : totals) {
            Decimal total = (Decimal)ar.get('total');
            totalsByStatus.put((String)ar.get('status'), total);
            grandTotal += total;
        }
        result.put('totals', totalsByStatus);
        result.put('grandTotal', grandTotal);

        return result;
    }
}