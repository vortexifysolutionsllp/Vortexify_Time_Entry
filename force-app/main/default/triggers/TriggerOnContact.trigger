trigger TriggerOnContact on Contact (after insert, after update) {
    if(Trigger.isAfter){
        if(Trigger.isInsert || Trigger.isUpdate){
            ContactTriggerHandler.createCurrentMonthDayAttendance(Trigger.new, ((Trigger.isUpdate) ? Trigger.oldMap : null));
        }
    }
    if (Trigger.isBefore && Trigger.isInsert) {
        ContactTriggerHandler.populateContentMappings(Trigger.new);
    }

    if(Trigger.isBefore && (Trigger.isInsert || Trigger.isUpdate)){
        ContactTriggerHandler.contactLWD(Trigger.new);
    }
}