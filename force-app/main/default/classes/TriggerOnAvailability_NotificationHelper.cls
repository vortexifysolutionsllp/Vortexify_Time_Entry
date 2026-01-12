public without sharing class TriggerOnAvailability_NotificationHelper {
    
    Public Static void getNotified(List<Availability_Notification__c> newList){
        for(Availability_Notification__c ngf:newList){
            Availability_me__e pushNewComments = new Availability_me__e();
            //pushNewComments.PostId__c=pcmmnt.
            pushNewComments.RaisedById__c=ngf.Raised_By__c;
            pushNewComments.RaisedTime__c=ngf.Raised_Time__c;
            EventBus.publish(pushNewComments);
            system.debug('ngf---'+ngf);
            system.debug('pushNewComments---'+pushNewComments);
        }
        
    }
    
    @AuraEnabled(cacheable=true)
    public static String getSessionId() {
        return UserInfo.getSessionId();
    }
}