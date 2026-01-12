public class ShowProjectRelatedEmailController {

//HtmlBody
    @AuraEnabled(cacheable=true)
    public static  List<EmailMessage>  getEmailList(String projId){
        Project__c proj;
        List<EmailMessage> emailList;
        try{
        emailList  = [Select Id,Subject,FromAddress,ToAddress,CcAddress,TextBody,MessageDate,RelatedToId From EmailMessage Where RelatedToId =:projId];
        system.debug('emailList-->'+emailList);
        }catch(Exception e){
            System.debug('Exception Message-->'+e.getMessage());
            System.debug('Exception Line Number-->'+e.getLineNumber());
        }
        return emailList;
    }

}