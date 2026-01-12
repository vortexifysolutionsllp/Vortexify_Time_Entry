public class ConnectAccountController {
    public static String caseId { get; set; }
    public static String code { get; set; }
    public static String appConnected { get; set; }
    public static String fromApp { get; set; }
    
    //Redirect user to connect DropBox account page
    public static PageReference redirectToOAuthYouTube() {
        
        Google_Auth_Setting__mdt metaDataRecord = MetaDataOperationHelper.getMetadataRecord('Google_Auth_Setting__mdt', 'Youtube_Auth_Person');
        if(metaDataRecord == null){
            System.debug('No MetaData Record Found for Youtube_Auth');
            return null;
        }
        
        // Define your OAuth URL
        // https://accounts.google.com/o/oauth2/auth?scope=https://www.googleapis.com/auth/youtube.force-ssl%20https://www.googleapis.com/auth/youtube&access_type=offline&include_granted_scopes=true&response_type=code&state=YouTube_Auth&redirect_uri=https://adpoc-dev-ed--c.develop.vf.force.com/apex/connectAccount&client_id=407837052111-kvv7basrtuo9spudjvk639ifj8s9ebvm.apps.googleusercontent.com
        String oauthUrl = 'https://accounts.google.com/o/oauth2/auth?' +
            'scope=' + metaDataRecord.Scopes__c +
            '&access_type=offline' +
            '&include_granted_scopes=true' +
            '&response_type=code' +
            '&state=' + metaDataRecord.DeveloperName +
            '&redirect_uri=' + metaDataRecord.RedirectURI__c +
            '&client_id=' + metaDataRecord.Client_Id__c;
        System.debug('YouTube oAuth Url: \n' + oauthUrl);
        
        // Redirect to the OAuth URL
        PageReference oauthPage = new PageReference(oauthUrl);
        return oauthPage;
    }
    
    public static PageReference handleOAuthResponse() {
        
        // Check if the authorization code is received
        if (ApexPages.currentPage().getParameters().get('code') != null) {
            
        	Google_Auth_Setting__mdt metaDataRecord = MetaDataOperationHelper.getMetadataRecord('Google_Auth_Setting__mdt', 'Youtube_Auth_Person');
            if(metaDataRecord == null){
                System.debug('No MetaData Record Found for Youtube_Auth');
                return null;
            }
            
            // Retrieve the authorization code
            code = ApexPages.currentPage().getParameters().get('code');
            System.debug('Code::: ' + code);
            
            //Extract state that says from which app auth user is redirected back
            fromApp = ApexPages.currentPage().getParameters().get('state');
            System.debug('State (FromApp)::: ' + fromApp);
            
            //1st Step - Done: Code Retrieved
            //2nd Callout - Redeem Code to get Access & Refresh Token;
            redeemCodeCallout(fromApp, code);
            
            //Redirect To LWC
            String redirectUrl = System.Url.getOrgDomainUrl().toExternalForm() + '/' + metaDataRecord.RedirectRecordId__c;
            PageReference redirectPage = new PageReference(redirectUrl);
            System.debug('redirectUrl LWC Url: ' + redirectUrl);
            return redirectPage;
        } else if (ApexPages.currentPage().getParameters().get('c__caseId') != null) {
			// Retrieve the authorization code
            caseId = ApexPages.currentPage().getParameters().get('c__caseId');
            System.debug('caseId::: ' + caseId); 
            
            Map<String, String> metaDataRecordToUpdateMap = new Map<String, String>{'RedirectRecordId__c' => caseId};
                
            //Update the MetaData Record with caseId
        	Boolean metaDataUpdated = MetaDataOperationHelper.updateMetadataRecord('Google_Auth_Setting__mdt', 'Youtube_Auth_Person', metaDataRecordToUpdateMap);
            System.debug('MetaData Updated with RedirectRecordId: ' + caseId);
            
            return null;
        } else {
            // Handle the case where the authorization code is not received
            return null;
        }
    }
    
    @future(callout=true)
    public static void redeemCodeCallout(String authApp, String authCode){
        System.debug('FutureMethod > redeemCodeCallout > authApp: ' + authApp);
        System.debug('FutureMethod > redeemCodeCallout > authCode: ' + authCode);
        String access_token = null;
        String refresh_token = null;
        String httpMethod = 'POST';
        String body = '';
        String endPoint = '';
        Map<String, String> headers = new Map<String, String>();
        Map<String, String> queryParam = new Map<String, String>();
        Map<String, String> metaDataRecordToUpdateMap = new Map<String, String>{'Code__c' => authCode}; //This map will used to update metadata record
            
        Google_Auth_Setting__mdt metaDataRecord = MetaDataOperationHelper.getMetadataRecord('Google_Auth_Setting__mdt', 'Youtube_Auth_Person');
        if(metaDataRecord == null){
            System.debug('No MetaData Record Found for Youtube_Auth');
            return;
        }
        
        if(authApp == 'Youtube_Auth_Person'){
            System.debug('Making GoogleDrive_Auth Callout for Code Redeemption');
            
            endPoint = 'https://accounts.google.com/o/oauth2/token';
            
            body = 'code=' +authCode +
                '&client_id=' + metaDataRecord.Client_Id__c +
                '&client_secret=' + metaDataRecord.Client_Secret__c +
                '&grant_type=' + 'authorization_code' +
                '&redirect_uri=' + metaDataRecord.RedirectURI__c;
            
            headers.put('Content-Type', 'application/x-www-form-urlencoded');
        } else {
            System.debug('Not Making A callout, last else condition executed');
            return;
        }
        
        HttpResponse res = DynamicHttpCallout.makeCallout(httpMethod, endPoint, queryParam, headers, body);
        if(res == null){
            System.debug('Callout Failed, Existing the system...');
            
            //Update the MetaData Record
            //Boolean metaDataUpdated = updateMetadataRecord(authApp, metaDataRecordToUpdateMap);
            return;
        }
        
        if (res.getStatusCode() == 200) {
            String responseBody = res.getBody();
            System.debug(JSON.serializePretty(responseBody));
            
            Map<String, Object> rootResponse = (Map<String, Object>) JSON.deserializeUntyped(responseBody);
            
            //Extract access-token
            if(rootResponse.containsKey('access_token')){
                access_token = (String) JSON.deserializeUntyped(JSON.serialize(rootResponse.get('access_token')));
                metaDataRecordToUpdateMap.put('Access_Token__c', access_token);
            }
            
            //Extract access-token
            if(rootResponse.containsKey('refresh_token')){
                refresh_token = (String) JSON.deserializeUntyped(JSON.serialize(rootResponse.get('refresh_token')));
                metaDataRecordToUpdateMap.put('Refresh_Token__c', refresh_token);
            }
            
        } else {
            System.debug('Callout Request Failed with ErrorCode: ' + res.getStatusCode());
            String responseBody = res.getBody();
            System.debug(JSON.serializePretty(responseBody));
        }
        
        //Update the MetaData Record
        Boolean metaDataUpdated = MetaDataOperationHelper.updateMetadataRecord('Google_Auth_Setting__mdt', authApp, metaDataRecordToUpdateMap);
    }
}