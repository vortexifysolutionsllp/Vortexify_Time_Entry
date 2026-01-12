public with sharing class EmploymentBondService {
    @AuraEnabled
    public static void sendEmploymentBond(Id contactId) {
        Contact con = [
            SELECT Id, Name, Email 
            FROM Contact 
            WHERE Id = :contactId 
            LIMIT 1
        ];
        
        if (String.isBlank(con.Email)) {
            throw new AuraHandledException('This contact does not have an email address.');
        }
        
        // Generate PDF from VF page
        PageReference pdfPage = Page.Employmentbond; // your VF page name
        pdfPage.getParameters().put('contactId', contactId);
        Blob pdfBlob = pdfPage.getContentAsPDF();
        
        // Save PDF as File (ContentVersion)
        ContentVersion cv = new ContentVersion(
            Title = 'EmploymentBond',
            PathOnClient = 'EmploymentBond.pdf',
            VersionData = pdfBlob,
            Origin = 'H'
        );
        insert cv;
        
        // Relate the File to the Contact
        ContentDocumentLink cdl = new ContentDocumentLink(
            ContentDocumentId = [
                SELECT ContentDocumentId 
                FROM ContentVersion 
                WHERE Id = :cv.Id
            ].ContentDocumentId,
            LinkedEntityId = contactId,
            ShareType = 'V'
        );
        insert cdl;
    }
    
    //For Appointment
    @AuraEnabled
    public static void LetterOfAppointment(Id contactId) {
        // Generate PDF from VF page
        PageReference pdfPage1= Page.LetterOfAppointment; // your VF page name
        pdfPage1.getParameters().put('contactId', contactId);
        Blob pdfBlob1 = pdfPage1.getContentAsPDF();
        
        // Save PDF as File (ContentVersion)
        ContentVersion cv1 = new ContentVersion(
            Title = 'LetterOfAppointment',
            PathOnClient = 'LetterOfAppointment.pdf',
            VersionData = pdfBlob1,
            Origin = 'H'
        );
        insert cv1;
        
        // Relate the File to the Contact
        ContentDocumentLink cdl1 = new ContentDocumentLink(
            ContentDocumentId = [
                SELECT ContentDocumentId 
                FROM ContentVersion 
                WHERE Id = :cv1.Id
            ].ContentDocumentId,
            LinkedEntityId = contactId,
            ShareType = 'V'
        );
        insert cdl1;
        
        // Prepare PDF for email
        /*Messaging.EmailFileAttachment efa = new Messaging.EmailFileAttachment();
efa.setFileName('EmploymentBond.pdf');
efa.setBody(pdfBlob);
efa.setContentType('application/pdf');

// Send Email
Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
mail.setToAddresses(new String[] { con.Email });
mail.setSubject('Employment Bond');
mail.setPlainTextBody(
'Dear ' + con.Name + ',\n\nPlease find attached your Employment Bond.'
);
mail.setFileAttachments(new Messaging.EmailFileAttachment[] { efa });

Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });*/
    }
    
}