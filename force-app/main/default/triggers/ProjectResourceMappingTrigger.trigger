trigger ProjectResourceMappingTrigger on Project_Resource_Mapping__c (after insert) {
    if(trigger.isAfter && trigger.isInsert){
        ProjectResourceMappingTriggerHandler.createTimeEntryCards(trigger.new);
    }
}