public class BatchForForwardingBulkInvoiceHelper {
    @auraEnabled
    public static void callingBatchForBulkInvoiceForwarding(DateTime timeValue){
        system.debug('timeValue::'+timeValue);
        //testingBAtch.batchTesting(timeValue);
        BatchForForwardingBulkInvoice batchInstance = new BatchForForwardingBulkInvoice(timeValue);
        database.executeBatch(batchInstance);
    }
    
}