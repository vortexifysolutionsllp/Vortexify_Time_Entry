public class Employmentbond {
    public string idOfEmployee{get;set;}
    public string contactName{get;set;}
    public string mailingCountry{get;set;}
    public string mailingCity{get;set;}
    public string mailingStreet{get;set;}
    public string mailingState{get;set;}
    public string mailingZipcode{get;set;}
    public Date dateOfJoining{get;set;}
    public String finalContent {get;set;} 
    public String letterContent{get;set;}
    
    public Employmentbond(){
        Id documentId = ApexPages.currentPage().getParameters().get('contactId');
        Employee_Onboarding_Document__c onboardingRec = [Select Id ,Document_Content__c, Employee__c from Employee_Onboarding_Document__c where Id =:documentId ];
        contact con = [select Id,Name, MailingCountry,MailingCity,MailingState,MailingPostalCode,MailingStreet, Joining_Date__c,Emp_ID__c, Content_Mapping__c,Letter_Content_Mapping__c from contact where Id =: onboardingRec.Employee__c];
        
        contactName = con.Name;
        mailingCountry = con.MailingCountry;
        mailingCity = con.MailingCity;
        mailingState = con.MailingState;
        mailingZipcode = con.MailingPostalCode;
        mailingStreet = con.MailingStreet;
        // dateOfJoining = con.Formatted_Date__c;
        dateOfJoining = con.Joining_Date__c;
        idOfEmployee =con.Emp_ID__c;
        
        //Bond content mapping using rich text area
        finalContent = onboardingRec.Document_Content__c;
        if(String.isNotBlank(finalContent)) {
            finalContent = finalContent.replace('{!Name}', contactName);
            finalContent = finalContent.replace('{!Employee_Id__c}', idOfEmployee);
            finalContent = finalContent.replace('{!FormattedDate__c}', String.valueOf(dateOfJoining));
            // finalContent = finalContent.replace('{!FormattedDate__c}', dateOfJoining);
            finalContent = finalContent.replace('{!MailingStreet}', mailingStreet);
            finalContent = finalContent.replace('{!MailingCity}', mailingCity);
            finalContent = finalContent.replace('{!MailingCountry}',mailingCountry);
            finalContent = finalContent.replace('{!MailingState}',mailingState);
            finalContent = finalContent.replace('{!MailingPostalCode}',mailingZipcode);
            finalContent = finalContent.replace('[PAGEBREAK]', '<div style="page-break-after: always;"></div>');
        }
        //Bond content mapping using rich text area
        letterContent = con.Letter_Content_Mapping__c;
        if(String.isNotBlank(letterContent)) {
            letterContent = letterContent.replace('{!Name}', contactName);
            letterContent = letterContent.replace('{!Employee_Id__c}', idOfEmployee);
            letterContent = letterContent.replace('{!FormattedDate__c}', String.valueOf(dateOfJoining));
            letterContent = letterContent.replace('{!MailingStreet}', mailingStreet);
            letterContent = letterContent.replace('{!MailingCity}', mailingCity);
            letterContent = letterContent.replace('{!MailingCountry}',mailingCountry);
            letterContent = letterContent.replace('{!MailingState}',mailingState);
            letterContent = letterContent.replace('{!MailingPostalCode}',mailingZipcode);
            letterContent = letterContent.replace('[PAGEBREAK]', '<div style="page-break-after: always;"></div>');
        }
    }
}