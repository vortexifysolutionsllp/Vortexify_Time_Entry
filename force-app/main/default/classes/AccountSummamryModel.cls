public class AccountSummamryModel {
public Account getAccountRecords(String accId){
return [select Id,Name,AccountNumber,Rating,Website,
(Select id,Firstname,Lastname,Email,Phone from Contacts),
(Select id,StageName,Closedate,Amount from Opportunities),
(Select id,Status,Priority from Cases)
from Account where id=:accId];
}
public List<Account> getAllAccountRecords(){
    return [select Id,Name,AccountNumber,Rating,Website,
    (Select id,Firstname,lastname,Email,Phone from Contacts),
    (Select id,StageName,Closedate,Amount from Opportunities),
    (Select id,Status,Priority from Cases)
    from Account];
    }
    // public List<Contact> getContact(String accid){
    //  return []   
    // }
}