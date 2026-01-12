public class sendEmail {
@AuraEnabled
public static invoice__c fetchRecord(String invoiceId){
    return[select id,Account__r.Email__c from invoice__c where id =:invoiceId limit 1];
}
@AuraEnabled
public static void sendEmailWithAttachments(String invoiceId) {
    system.debug('invoiceId->'+invoiceId);
    List<Invoice__c> invoiceList =  new List<Invoice__c> ();
    if(!String.isEmpty(invoiceId)){
        invoiceList = [Select Id,Account__r.Email__c From INvoice__c where id = :invoiceId limit 1];
                /*if (results[0].isSuccess()) {
            return 'Email sent successfully with attachment(s) to ' + recipientEmail;
                } else {
                    return 'Error sending email: ' + results[0].getErrors()[0].getMessage();
                }*/
                
        
        }
    
    
List<Id> contentDocumentIds = new List<Id>();
    if (invoiceId != null) {
list<ContentDocumentLink> contentData=[SELECT ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId = :invoiceId];
    
for (ContentDocumentLink link : contentData) {
    contentDocumentIds.add(link.ContentDocumentId);
}
    }
// Step 2: Fetch latest ContentVersion records for those ContentDocuments
List<Messaging.EmailFileAttachment> attachments = new List<Messaging.EmailFileAttachment>();
if (!contentDocumentIds.isEmpty()) {
    List<ContentVersion> contentVersions = [SELECT Title, VersionData, FileType FROM ContentVersion WHERE ContentDocumentId IN :contentDocumentIds 
         ORDER BY CreatedDate DESC];
// AND IsLatest = TRUE
    for (ContentVersion cv : contentVersions) {
        Messaging.EmailFileAttachment attachment = new Messaging.EmailFileAttachment();
        String fileExtension = cv.FileType.toLowerCase();
        String fileName = cv.Title + '.' + fileExtension;

        // If file is NOT already a PDF, set the filename correctly
        if (fileExtension != 'pdf') {
            fileName = cv.Title + '.pdf'; 
        }

        attachment.setFileName(fileName);
        attachment.setBody(cv.VersionData);
        attachment.setContentType('application/pdf'); // Force content type as PDF
        attachments.add(attachment);
    }
}
if(!invoiceList.isEMpty()){
            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
            mail.setToAddresses(new List<String>{invoiceList[0].Account__r.Email__c});
            mail.setSubject('This is emails Subject');
            //mail.setReplyTo(invoiceList[0].account__r.owner.email);
            mail.setPlainTextBody('This is the message body.');
            mail.setFileAttachments(attachments);
            Messaging.SendEmailResult[] results = Messaging.sendEmail(new List<Messaging.SingleEmailMessage>{mail});
}   
}
}