public with sharing class CreateCaseController {
    @AuraEnabled
    public static void createCase(String description, Id contactId) {
        Case c = new Case();
        c.Subject = 'Support Request from User';
        c.Description = description;
        c.ContactId = contactId;
        c.Origin = 'Web';
        c.Status = 'New';
        insert c;
    }
}