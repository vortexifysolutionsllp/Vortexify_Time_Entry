global without sharing class FullCalendarController {
    
    
    
    public class EventException extends Exception {}
    
    /**
     * @description: To retrieve the most recent events
     */
    @AuraEnabled(cacheable=true)
    public static List<Event> fetchEvents() {
        return [SELECT Id, Subject, StartDateTime, IsAllDayEvent, EndDateTime 
                FROM Event 
                ORDER BY CreatedDate DESC
                LIMIT 100];
    }
    
    
    @RemoteAction
    global static List<User_Calendar__c> getEvents() {
        String userId = UserInfo.getUserId() ;
        List<User_Calendar__c> userCalendar = [SELECT Id, Name, Contact__r.Name,
                                               Event__c, Event__r.Name, Event__r.Start_Time__c, Event__r.End_Time__c
                                               FROM User_Calendar__c
                                               WHERE Contact__c =:userId];
        if(userCalendar.size()>0){
            return userCalendar;
        } else{
            return null;
        }
    }
    
    @RemoteAction
    global static List<User_Calendar__c> createOrUpdateEvents(String calendarEvent,String contactId) {
        //Geting Calendar_Event__c object from received Json String
        Calendar_Event__c eventObject = ((Calendar_Event__c) JSON.deserialize(calendarEvent, Calendar_Event__c.class));
        //you need to put proper regex to validate recordId
        Boolean isOldRecord = eventObject.Id != null;
        upsert eventObject;
        //If its new record, create User Calendar record as well
        if(!isOldRecord){
            User_Calendar__c userCalendar = new User_Calendar__c(Event__c=eventObject.Id, Contact__c = contactId );
            //User_Calendar__c userCalendar = new User_Calendar__c(Event__c=eventObject.Id, Contact__c = '003C400000JIQIsIAP  ' );

            insert userCalendar;
        }
        return getEvents();
    }
    //Shiva im changing code from here!!!!😎

      @AuraEnabled
    public static Id createEvent(String event){

        //The following logic to be replaced with your respective event object
        if(String.isBlank(event)){
            return null;
        }
        Map<String, Object> eventMap = (Map<String, Object>) JSON.deserializeUntyped(event);
        
        Event newEvent = new Event();
        newEvent.Subject = eventMap.get('title') != null ? (String)eventMap.get('title') : null;

        String startdate = eventMap.get('start') != null ? 
                            ((String)eventMap.get('start')).replace('T', ' ').replace('.000Z', '') : 
                            null;
        String endDate = eventMap.get('end') != null ? 
                            ((String)eventMap.get('end')).replace('T', ' ').replace('.000Z', '') : 
                            null;

        newEvent.StartDateTime = startdate != null ? Datetime.valueOfGmt(startdate) : null;
        newEvent.EndDateTime = endDate != null ? Datetime.valueOfGmt(endDate) : null;
        // newEvent.IsAllDayEvent = eventMap.get('start') != null ? eventMap.get('start') : null;
        insert newEvent;

        return newEvent.Id;

    }

    /**
     * @description To delete an event from web component 
     * @param eventid - event id to delete from the component
     */
    @AuraEnabled
    public static void deleteEvent(Id eventid) {
        
        if(eventid != null){
            delete [SELECT Id FROM Event Where Id=:eventid];
        }else{
           throw new EventException('Event id is not passed');
        }

    }
    
    //CREATED BY SHIVA 😎😎
    //ALL METHODS WILL BE USED FOR HOLIDAYS MANAGENT CONTACT(RESOURCE RECORDTYPE ) FOR TIME NETRY MODULE
    //DATE 22-05-2023
    
    @AuraEnabled(cacheable=true)
    public static List<Holiday__c> getHolidays(String conID) {
        System.debug('conID'+conID);
        return [SELECT Id, Contact__c,End_Date__c,Type__c,Reason__c,Start_Date__c FROM Holiday__c WHERE Contact__c =:conID ORDER BY CreatedDate DESC LIMIT 100];
    }
    
    @AuraEnabled
    Public Static Holiday__c CreateHolidays(Holiday__c HolidaysRec){
        System.debug('HolidaysRec--'+HolidaysRec);

        try{
            system.debug('HolidaysRec::'+HolidaysRec);
            //HolidaysRec.Manager__c='0052v00000gOuCEAA0';
            HolidaysRec.Status__c='On hold';
            database.insert(HolidaysRec);
            return HolidaysRec;
        }
        catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
      @AuraEnabled
    Public Static void deleteHolidays(String recordID){
        system.debug('recordID::'+recordID);
        Holiday__c deleteHoliday =[SELECT Id, Contact__c,End_Date__c,Type__c,Reason__c,Start_Date__c FROM Holiday__c  where id =:recordID];
        delete deleteHoliday;
       
    }
  
    }