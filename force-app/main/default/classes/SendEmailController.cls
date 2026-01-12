public without sharing class SendEmailController {
    
    @AuraEnabled
    public static Lead_ContentDocWrapper getLead_ContentDocWrapper(string conId){
        List<Contact> conList = [SELECT Id, Email, Name, Account.Name, Owner.Name FROM Contact WHERE Id=: conId LIMIT 1];
        
        String msg = 'Hi ' + conList[0].Name + ',';
        msg += '<br><br>We hope this message finds you well and enjoying your day! We noticed that you recently engaged with our post on Instagram, and we wanted to take this opportunity to express our gratitude for your support of Hatti Kaapi\'s sustainable coffee initiatives.';
        msg += '<br><br>As a token of our appreciation, we would like to offer you exclusive Voucher Code: <b>HK2024SAVE10</b> that you can redeem for a delightful coffee experience at any of our stores. The voucher code entitle you to get a complimentary cup of coffee with any purchase.';
        msg += '<br><br>The Voucher Code is valid until 15th April, so be sure to claim your offer before then!';
        msg += '<br><br>Simply present your voucher code during your visit to any of our Hatti Kaapi outlets, and our friendly staff will be delighted to assist you in redeeming your offer.';
        msg += '<br><br>Once again, thank you for your continued support of our commitment to sustainability and authentic coffee experiences. We look forward to serving you soon and hope you enjoy every sip of your Hatti Kaapi coffee.';
        msg += '<br><br>Warm Regards,';
        msg += '<br><br>' + conList[0].Owner.Name ;
        msg += '<br>Hatti Kaapi';

        Lead_ContentDocWrapper wrp = new Lead_ContentDocWrapper();
        wrp.leadEmailId = conList[0].Email;
        wrp.emailMsg = msg;
        wrp.subject = 'Exclusive Offer: Voucher Codes for Hatti Kaapi\'s Sustainable Coffee Experience';
        return wrp;
    }
    
    public class Lead_ContentDocWrapper{
        @AuraEnabled
        Public String leadEmailId;
        @AuraEnabled
        Public String emailMsg;
        @AuraEnabled
        Public String subject;
    }
    
    @AuraEnabled
    public static string processEmail(String email, String Subject, String Message, String conId){
        String sMessage='';
        try{
            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
            List<String> mailIds = email.split(';');
            String[] toAddresses = mailIds; 
            mail.setToAddresses(toAddresses);
            mail.setSubject(Subject);
            mail.setHtmlBody(Message);
                        
            Messaging.SendEmailResult [] results = Messaging.sendEmail(new Messaging.SingleEmailMessage[] {mail});
            sMessage='Success';
        }
        catch(Exception ex){
            sMessage=ex.getLineNumber()+'\n'+ex.getCause()+'\n'+ex.getMessage()+'\n'+ex.getStackTraceString();
            system.debug('sMessage -- ' + sMessage);
        }
        return sMessage;
    }
    
}