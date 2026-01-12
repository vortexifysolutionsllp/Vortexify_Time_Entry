global without sharing class CustomerLoginController {
    
    @RemoteAction
    public static String CustomerLogIn(string userName, string password){
        System.debug('---->>>>' + userName);
        System.debug('---->>>>' + password);
        try{
            List<Contact> contacts = [SELECT Name,Vortexify_Email__c,Password__c,Login_Hash_Code__c,Id FROM Contact WHERE Vortexify_Email__c =:userName AND Password__c =:password LIMIT  1];
            system.debug('contacts----'+contacts);
            if(contacts.size() > 0 ){
                //String currentReviewId;
                String hasCode;
                Contact con = new Contact();
                //Con.Login_Hash_Code__c = Utility.generateRandomString();
                con.Id = contacts[0].id;
                //hasCode = String.valueOf(Con.Login_Hash_Code__c) ;
                System.debug('The Hash Code Value');
                update con;
                return con.Id;
            }else{
                return null; 
            }
        }catch(exception e){
            system.debug(e.getLineNumber()+'---error Message---'+e.getMessage());
            return null;
        }   
    }
    
    @RemoteAction
public static Boolean verifyUserEmail(String email) {
    List<Contact> contacts = [SELECT Id FROM Contact WHERE Vortexify_Email__c = :email LIMIT 1];
    return !contacts.isEmpty();
}

@RemoteAction
public static Boolean resetUserPassword(String email, String newPassword) {
    List<Contact> contacts = [SELECT Id, Password__c FROM Contact WHERE Vortexify_Email__c = :email LIMIT 1];
    if (!contacts.isEmpty()) {
        contacts[0].Password__c = newPassword; // Ideally hashed
        update contacts[0];
        return true;
    }
    return false;
}

    
}