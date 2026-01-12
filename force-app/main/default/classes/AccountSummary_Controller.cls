global class AccountSummary_Controller {
    public Account accRecord{get;set;}  
    public String accRecordString{get;set;}
    public String curAccountId {get;set;}
    public AccountSummary_Controller() {
        String accId = apexpages.currentpage().getparameters().get('id');
        curAccountId=accId;
        AccountSummamryModel accountModelInstance=new AccountSummamryModel();
        // accRecord=accountModelInstance.getAccountRecords(accId);
        //     accRecordString=JSON.serialize(accRecord);
        if(accId!=null && accId!=''){
            accRecord=accountModelInstance.getAccountRecords(accId);
            accRecordString=JSON.serialize(accRecord);
        }
        else{
            List<Account> lAccount=accountModelInstance.getAllAccountRecords();
            accRecordString=JSON.serialize(lAccount);
        }
    }
    @RemoteAction
    global static String deleteAccountRecord(String accountId){
        AccountSummaryHelper ash=new AccountSummaryHelper();
        return ash.deleteAccountRecord(accountId);
    }
    @RemoteAction
    global static String deleteContactRecord(String contactId){
        AccountSummaryHelper ash=new AccountSummaryHelper();
        return ash.deleteContactRecord(contactId);
    }
    @RemoteAction
    global static String deleteOpportunityRecord(String oppId){
        AccountSummaryHelper ash=new AccountSummaryHelper();
        return ash.deleteOpportunityRecord(oppId);
    }
    @RemoteAction
    global static String deleteCaseRecord(String caseid){
        AccountSummaryHelper ash=new AccountSummaryHelper();
        return ash.deleteCaseRecord(caseid);
    }
    @RemoteAction
    global static string updateAccountRecord(String accid,Account acc){
        AccountSummaryHelper ash=new AccountSummaryHelper();
        return ash.updateAccountRecord(accid,acc);
    }    
    @RemoteAction
    global static string updateContactRecord(String conid,Contact con){
        AccountSummaryHelper ash=new AccountSummaryHelper();
        return ash.updateContactRecord(conid,con);
    }
    @RemoteAction
    global static string updateOppRecord(String oppid,Opportunity opp){
        system.debug('oppid---'+oppid+'--opp--- '+opp);
        AccountSummaryHelper ash=new AccountSummaryHelper();
        return ash.updateOppRecord(oppid,opp);
    }   
    @RemoteAction
    global static string updateCaseRecord(String caseid, Case objCase){
        AccountSummaryHelper ash=new AccountSummaryHelper();
        return ash.updateCaseRecord(caseid,objCase);
    }
    // @RemoteAction
    // global static String getContact(){
    //     AccountSummamryModel accountModelInstance=new AccountSummamryModel();
    //     return ash.deleteAccountRecord(curAccountId);
    // }
}