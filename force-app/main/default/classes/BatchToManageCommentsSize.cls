/*
* Test Class name  : ManageBatchTestClass
* created Date     : 29/07/2023
* Created By       : shubham kumar
* Last Modfied By  : shubham kumar
* Descritpion      : This class executes the logic to delete all the duplicate cases.
*/
public class BatchToManageCommentsSize implements Database.Batchable<sObject>,Database.AllowsCallouts,Database.Stateful {
    
    private static Id caseRecordTypeId                                       = Schema.SObjectType.case.getRecordTypeInfosByName().get('Instagram').getRecordTypeId();
    
    public Database.QueryLocator start(Database.BatchableContext context) {
        List<Case> ExistingCaseRecords    = [Select id , Deletion_Batch_executed__c,Total_Comments__c from case where Total_Comments__c > 50 order by Total_Comments__c ASC ];
        String query = 'Select Comment__c,Comment_Id__c,case__c,Case__r.Post_Id__c,Commented_By__c,Post_Url__c,Post_comment_Time__c from Post_Comments__c where case__c IN :ExistingCaseRecords ORDER BY Post_comment_Time__c DESC';
        return Database.getQueryLocator(query);
    }
    
    public void execute(Database.BatchableContext context, List<Post_Comments__c> postCommentsList) {
        try{
            List<String> caseToBeUpdated = new List<String>();
            map<String,List<Post_Comments__c>> commentsOnPostByPostId = new map<String,List<Post_Comments__c>>();
            List<Id> commentsToDelete = new List<Id>();
            
            for(Post_Comments__c postCommRec : postCommentsList){
                if(commentsOnPostByPostId.containsKey(postCommRec.Case__c)){
                    commentsOnPostByPostId.get(postCommRec.Case__c).add(postCommRec);
                }else{
                    list<Post_Comments__c> postCommNewList = new list<Post_Comments__c>();
                    postCommNewList.add(postCommRec);
                    commentsOnPostByPostId.put(postCommRec.Case__c,postCommNewList);
                }
            }
            
            for(String keyalue : commentsOnPostByPostId.keyset()){
                caseToBeUpdated.add(keyalue);
                for (Integer i = 50; i < commentsOnPostByPostId.get(keyalue).size(); i++) {
                    commentsToDelete.add(commentsOnPostByPostId.get(keyalue)[i].Id);
                }
            }
            
            database.delete(commentsToDelete,false);
        }catch(exception e){
            system.debug(e.getMessage());
        }
        
    }
    
    public void finish(Database.BatchableContext context) {
        
    }
}