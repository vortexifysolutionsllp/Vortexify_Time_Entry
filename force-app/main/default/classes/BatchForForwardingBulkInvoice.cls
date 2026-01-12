public class BatchForForwardingBulkInvoice implements Database.Batchable<sObject>{
    private DateTime acceptableDateTime;
    private Date startingDateOfMonth;
    public BatchForForwardingBulkInvoice(DateTime dateTimeValue) {
        if(dateTimeValue == null){
            DateTime currentDate = system.now();
            acceptableDateTime = currentDate.addMonths(-1);
            Date myDate = date.newinstance(acceptableDateTime.year(), acceptableDateTime.month(), acceptableDateTime.day());
            startingDateOfMonth = myDate.toStartOfMonth();
        }
        else if(dateTimeValue != null){
            acceptableDateTime = dateTimeValue.addMonths(-1);
            Date myDate = date.newinstance(acceptableDateTime.year(), acceptableDateTime.month(), acceptableDateTime.day());
            startingDateOfMonth = myDate.toStartOfMonth();
        }
    }
    
    public Database.QueryLocator start(Database.BatchableContext bc) {
        // fetching data from custom setting for details of CA
        return Database.getQueryLocator([SELECT Email__c,First_Name__c,Last_Name__c,Name FROM CA_Info__c]);
    }
    
    public void execute(Database.BatchableContext BC, List<CA_Info__c> listOfCAInformation){
        List<Messaging.SingleEmailMessage> mails = new List<Messaging.SingleEmailMessage>();
        List<Messaging.Emailfileattachment> efaList = new List<Messaging.Emailfileattachment>();
        
        EmailTemplate et=[Select id, Name, DeveloperName, Subject, Body, HtmlValue from EmailTemplate where name = 'Send Bulk Invoices To CA' limit 1];
        List<Attachment> attachmentList = [SELECT Body,ContentType,Name FROM Attachment WHERE CreatedDate >= : startingDateOfMonth];
        
        for(CA_Info__c CAInformationRec : listOfCAInformation){
            List<String> recipients = new List<String>();
            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
            
            for(Attachment attachmentRec : attachmentList){
                Messaging.EmailFileAttachment efa = new Messaging.EmailFileAttachment();
                
                efa.setFileName(attachmentRec.Name);
                efa.setBody(attachmentRec.Body);
                efa.setContentType(attachmentRec.ContentType);
                efaList.add(efa);
            }
            
            recipients.add(CAInformationRec.Email__c);
            mail.setToAddresses(recipients);
            mail.setReplyTo('test@email.com');
            mail.setSenderDisplayName('Test Organization');
            
            String htmlBody = et.HtmlValue;
            htmlBody = htmlBody.replace('{!CA.FirstName}', CAInformationRec.First_Name__c != null? CAInformationRec.First_Name__c : '');
            htmlBody = htmlBody.replace('{!CA.LastName}', CAInformationRec.Last_Name__c != null? CAInformationRec.Last_Name__c:'');
            mail.setHtmlBody(htmlBody);
            
            String plainBody = et.Body;
            plainBody = plainBody.replace('{!CA.FirstName}', CAInformationRec.First_Name__c != null?CAInformationRec.First_Name__c : '');
            plainBody = plainBody.replace('{!CA.LastName}', CAInformationRec.Last_Name__c != null? CAInformationRec.Last_Name__c:'');
            mail.setPlainTextBody(plainBody);
            
            String subject = et.Subject;
            mail.setSubject(subject);
            mail.setFileAttachments(efaList );
            mails.add(mail);
        }
        if(!mails.isEmpty()){
            Messaging.sendEmail(mails);
        } 
    }
    
    public void finish(Database.BatchableContext BC){
        
    }    
}