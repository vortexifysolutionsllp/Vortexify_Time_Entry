public without sharing class LinkedInOAuthController {
    private static final String CLIENT_ID = '86eocq3y08eldj';
    private static final String REDIRECT_URI = 'https://sales-production--sales.sandbox.my.salesforce-sites.com/LinkedinRedirectPage';
    private static final String STATE = '7879723'; 
    private static final String SCOPE = 'profile email openid';
    private static final String AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
    private static final String CLIENT_SECRET = 'WPL_AP1.h8tXyvUvioTmcTGR.3onPBQ==';
    private static final String LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';

    //private static final string authCodeURL = 'https://www.linkedin.com/oauth/v2/authorization?response_type=code&state=78797w23&scope=profile&client_id=86eocq3y08eldj&redirect_uri=https%3A%2F%2Futilitarianlabs.com';
    
    @RemoteAction
    public static String redirectToUtilitarianLabs() {
        String authCodeUrl = AUTH_URL + 
            '?response_type=code' +
            '&client_id=' + CLIENT_ID +
            '&redirect_uri=' + EncodingUtil.urlEncode(REDIRECT_URI, 'UTF-8') +
            '&state=' + STATE +
            '&scope=' + SCOPE;
        return authCodeUrl;
    }

    @RemoteAction
    public static String getSalesforceBaseURL() {
        String domain = URL.getOrgDomainUrl().toExternalForm();
        return domain.replace('my.salesforce.com', 'lightning.force.com');
    }

    @RemoteAction
    public static String fetchRefreshToken(String authCode) {
        try {
            System.debug('authCode ===> ' + authCode);
            return 'Auth code received: ' + authCode;


        } catch (Exception e) {
            System.debug('Error ===> ' + e.getMessage());
            System.debug('Error Line ===> ' + e.getLineNumber());
            return 'Error: ' + e.getMessage();
        }
    }

    public static void generateAccessToken(){
        String authCode = 'AQSyhdGZTNrxQHsfnN9Jrq1owhRR2Oadg2pX2UroDODSjgH7lcowhBf3cuUWnHBofVrzFxZd_UmA2aFqLnmgV2q_xjIbnlKgk1QXBJ34oCH2ZsNC4azyfqFbdk4QnR1OQAhYTzX66lIiUZCAMXPsAWPAQaT0pe01OL0e1GgqnoQspM9OOhWZ9gZxwPuGn0OyZd-Vef-QNYH10Jx0nCQ';
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint(LINKEDIN_TOKEN_URL);
        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/x-www-form-urlencoded');

        String requestBody = 'grant_type=authorization_code'
            + '&code=' + EncodingUtil.urlEncode(authCode, 'UTF-8')
            + '&client_id=' + CLIENT_ID
            + '&client_secret=' + CLIENT_SECRET
            + '&redirect_uri=' + EncodingUtil.urlEncode(REDIRECT_URI, 'UTF-8');

        request.setBody(requestBody);
        System.debug('📝 Request Body: ' + requestBody);

        try {
            System.debug('🚀 Sending HTTP Request...');
            HttpResponse response = http.send(request);
            System.debug('📥 Response Received');

            System.debug('🔄 HTTP Status Code: ' + response.getStatusCode());
            System.debug('📜 Response Body: ' + response.getBody());

            if (response.getStatusCode() == 200) {
                System.debug('✅ Access Token Successfully Retrieved');
                return;
            } else {
                System.debug('❌ LinkedIn Token Error: ' + response.getBody());
                return;
            }
        } catch (Exception e) {
            System.debug('⚠️ Exception Occurred: ' + e.getMessage());
        }
        System.debug('⚡ [END] LinkedIn Access Token Request');
    }

    @AuraEnabled
    public static void getProfilePhoto() {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        
        request.setEndpoint(
            'callout:LinkedIn/v2/shares?q=owners&owners=urn:li:organization:67475523&sharesPerOwner=100'
        );
        request.setMethod('GET');
        
        HttpResponse response = http.send(request);
        
        if (response.getStatusCode() == 200) {
            System.debug('Response received successfully ' + response.getBody());
        } else {
            System.debug('Response Failure ' + response.getBody());
        }
    }

    public static void getData(){
        
    }
}