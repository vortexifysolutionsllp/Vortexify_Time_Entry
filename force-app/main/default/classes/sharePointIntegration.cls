/*public with sharing class sharePointIntegration {
    private static final String TENANT_ID = '602a17ac-8224-496d-a066-3ed2da37662b';
   private static final String CLIENT_ID = '27fc9602-f4b8-4555-a704-5eb36eb3d61d';
    private static final String CLIENT_SECRET = '~bC8Q~d.taAv0ETpk~jMqJM3FxN.jgluTzSvzaih';
    private static final String GRANT_TYPE = 'client_credentials';
    private static final String SCOPE = 'https://graph.microsoft.com/.default';
    private static final String SITE_NAME = 'Your_Site_Name';  // Add your SharePoint site name here

   /* public sharePointIntegration(){
        Integrationsetup__c cust_setting = 	Integrationsetup__c.getInstance();
        String CLIENT_ID = cust_setting.Client_Id__c;
        String CLIENT_SECRET = cust_setting.Client_secret__c;
        
    }
    private static String accessToken;
    private static Datetime tokenExpiry;

    // Fetch Files from SharePoint
    @AuraEnabled(cacheable=true)
    public static List<String> fetchFiles() {
        List<String> sharePointFiles = new List<String>();
        String accessToken = getAccessToken();
        String siteId = getSiteId();

        if (accessToken == null || siteId == null) {
            return null;
        }

        HttpRequest request = new HttpRequest();
        request.setEndpoint('https://graph.microsoft.com/v1.0/sites/' + siteId + '/drive/root/children');
        request.setMethod('GET');
        request.setHeader('Authorization', 'Bearer ' + accessToken);

        Http http = new Http();
        HttpResponse response = http.send(request);

        if (response.getStatusCode() == 200) {
            Map<String, Object> responseMap = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
            List<Object> fileList = (List<Object>) responseMap.get('value');

            for (Object fileObj : fileList) {
                Map<String, Object> fileMap = (Map<String, Object>) fileObj;
                sharePointFiles.add((String) fileMap.get('name'));
            }
        }
        return sharePointFiles;
    }

    //  Retrieve File Content from Salesforce
    @AuraEnabled
    public static String getFileContent(String fileId) {
        try {
            ContentVersion fileVersion = [
                SELECT VersionData
                FROM ContentVersion
                WHERE ContentDocumentId = :fileId
                ORDER BY CreatedDate DESC
                LIMIT 1
            ];
            
            if (fileVersion == null) {
                return null;
            }
            
            return EncodingUtil.base64Encode(fileVersion.VersionData);
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving file content: ' + e.getMessage());
        }
    }

    //  Upload File to SharePoint
    @AuraEnabled
    public static String uploadFile(String fileName, String base64Data) {
        system.debug(fileName);
        system.debug(base64Data);
        if (String.isEmpty(fileName) || String.isEmpty(base64Data)) {
            return 'Error: File Name or Content cannot be empty.';
        }

        String accessToken = getAccessToken();
        String siteId = getSiteId();
        if (accessToken == null || siteId == null) {
            return 'Error: Failed to retrieve access token or site ID.';
        }

        Blob fileContent = EncodingUtil.base64Decode(base64Data);
        HttpRequest request = new HttpRequest();
        request.setEndpoint('https://graph.microsoft.com/v1.0/sites/' + siteId + '/drive/root:/' + fileName + ':/content');
        request.setMethod('PUT');
        request.setHeader('Authorization', 'Bearer ' + accessToken);
        
        if (fileName.endsWith('.txt')) {
            request.setHeader('Content-Type', 'text/plain');
        } else if (fileName.endsWith('.pdf')) {
            request.setHeader('Content-Type', 'application/pdf');
        } else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
            request.setHeader('Content-Type', 'image/jpeg');
        } else if (fileName.endsWith('.png')) {
            request.setHeader('Content-Type', 'image/png');
        } else {
            request.setHeader('Content-Type', 'application/octet-stream');
        }

        request.setBodyAsBlob(fileContent);

        Http http = new Http();
        HttpResponse response = http.send(request);

        if (response.getStatusCode() == 201 || response.getStatusCode() == 200) {
            return 'File uploaded successfully!';
        } else {
            return 'File upload failed: ' + response.getBody();
        }
    }

    //  Get Access Token
    private static String getAccessToken() {
       
        if (accessToken != null && tokenExpiry != null && tokenExpiry > Datetime.now()) {
            return accessToken;
        }
     system.debug(accessToken);
        HttpRequest req = new HttpRequest();
        req.setEndpoint('https://login.microsoftonline.com/' + TENANT_ID + '/oauth2/v2.0/token');
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/x-www-form-urlencoded');

        String body = 'client_id=' + CLIENT_ID + 
                      '&client_secret=' + CLIENT_SECRET +
                      '&grant_type=' + GRANT_TYPE +
                      '&scope=' + SCOPE;

        req.setBody(body);
        system.debug(body);
        Http http = new Http();
        HttpResponse res = http.send(req);

        if (res.getStatusCode() == 200) {
            Map<String, Object> responseMap = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
            accessToken = (String) responseMap.get('access_token');
            tokenExpiry = Datetime.now().addSeconds((Integer) responseMap.get('expires_in') - 60);
            return accessToken;
        } else {
            return null;
        }
    }

    //  **Get SharePoint Site ID (FIXED METHOD)**
    private static String getSiteId() {
        String accessToken = getAccessToken();
        system.debug(accessToken);
        if (accessToken == null) {
            return null;
        }

        HttpRequest req = new HttpRequest();
        req.setEndpoint('https://graph.microsoft.com/v1.0/sites/vortexifysolution.sharepoint.com:/sites/salesforcefile');
        req.setMethod('GET');
        req.setHeader('Authorization', 'Bearer ' + accessToken);

        Http http = new Http();
        HttpResponse res = http.send(req);

        if (res.getStatusCode() == 200) {
            Map<String, Object> responseMap = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
            return (String) responseMap.get('id');
        } else {
            System.debug('Error retrieving site ID: ' + res.getBody());
            return null;
        }
    }
}*/

public with sharing class sharePointIntegration {
    private static String accessToken;
    private static Datetime tokenExpiry;

    // Fetch Files from SharePoint
    @AuraEnabled(cacheable=true)
    public static List<String> fetchFiles() {
        List<String> sharePointFiles = new List<String>();
        String accessToken = getAccessToken();
        String siteId = getSiteId();

        if (accessToken == null || siteId == null) {
            return null;
        }

        HttpRequest request = new HttpRequest();
        request.setEndpoint('https://graph.microsoft.com/v1.0/sites/' + siteId + '/drive/root/children');
        request.setMethod('GET');
        request.setHeader('Authorization', 'Bearer ' + accessToken);

        Http http = new Http();
        HttpResponse response = http.send(request);

        if (response.getStatusCode() == 200) {
            Map<String, Object> responseMap = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
            List<Object> fileList = (List<Object>) responseMap.get('value');

            for (Object fileObj : fileList) {
                Map<String, Object> fileMap = (Map<String, Object>) fileObj;
                sharePointFiles.add((String) fileMap.get('name'));
            }
        }
        return sharePointFiles;
    }

    // Retrieve File Content from Salesforce
    @AuraEnabled
    public static String getFileContent(String fileId) {
        try {
            ContentVersion fileVersion = [
                SELECT VersionData
                FROM ContentVersion
                WHERE ContentDocumentId = :fileId
                ORDER BY CreatedDate DESC
                LIMIT 1
            ];
            
            if (fileVersion == null) {
                return null;
            }
            
            return EncodingUtil.base64Encode(fileVersion.VersionData);
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving file content: ' + e.getMessage());
        }
    }

    // Upload File to SharePoint
    @AuraEnabled
    public static String uploadFile(String fileName, String base64Data) {
        if (String.isEmpty(fileName) || String.isEmpty(base64Data)) {
            return 'Error: File Name or Content cannot be empty.';
        }

        String accessToken = getAccessToken();
        String siteId = getSiteId();
        if (accessToken == null || siteId == null) {
            return 'Error: Failed to retrieve access token or site ID.';
        }

        Blob fileContent = EncodingUtil.base64Decode(base64Data);
        HttpRequest request = new HttpRequest();
        request.setEndpoint('https://graph.microsoft.com/v1.0/sites/' + siteId + '/drive/root:/' + fileName + ':/content');
        request.setMethod('PUT');
        request.setHeader('Authorization', 'Bearer ' + accessToken);
        
        if (fileName.endsWith('.txt')) {
            request.setHeader('Content-Type', 'text/plain');
        } else if (fileName.endsWith('.pdf')) {
            request.setHeader('Content-Type', 'application/pdf');
        } else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
            request.setHeader('Content-Type', 'image/jpeg');
        } else if (fileName.endsWith('.png')) {
            request.setHeader('Content-Type', 'image/png');
        } else {
            request.setHeader('Content-Type', 'application/octet-stream');
        }

        request.setBodyAsBlob(fileContent);

        Http http = new Http();
        HttpResponse response = http.send(request);

        if (response.getStatusCode() == 201 || response.getStatusCode() == 200) {
            return 'File uploaded successfully!';
        } else {
            return 'File upload failed: ' + response.getBody();
        }
    }

    // Get Access Token from Microsoft using values from custom settings
    private static String getAccessToken() {
        if (accessToken != null && tokenExpiry != null && tokenExpiry > Datetime.now()) {
            return accessToken;
        }

        //  Fetch credentials from custom setting
        Integrationsetup__c setting = [
            SELECT Client_Id__c, Client_Secret__c, Tenant_Id__c,Scope__c,GrantType__c
            FROM Integrationsetup__c
            WHERE Name = 'sharepoint'
            LIMIT 1
        ];

        if (setting == null) {
            System.debug('Custom setting not found!');
            return null;
        }

        String clientId = setting.Client_Id__c;
        String clientSecret = setting.Client_Secret__c;
        String tenantId = setting.Tenant_Id__c;
        String GrantType = setting.GrantType__c;
        String Scope = setting.Scope__c;
        
        HttpRequest req = new HttpRequest();
        req.setEndpoint('https://login.microsoftonline.com/' + tenantId + '/oauth2/v2.0/token');
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/x-www-form-urlencoded');

        String body = 'client_id=' + clientId + 
                      '&client_secret=' + clientSecret +
                      '&grant_type=' + GrantType +
                      '&scope=' + Scope;

        req.setBody(body);

        Http http = new Http();
        HttpResponse res = http.send(req);

        if (res.getStatusCode() == 200) {
            Map<String, Object> responseMap = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
            accessToken = (String) responseMap.get('access_token');
            tokenExpiry = Datetime.now().addSeconds((Integer) responseMap.get('expires_in') - 60);
            return accessToken;
        } else {
            System.debug('Token fetch error: ' + res.getBody());
            return null;
        }
    }

    // Get SharePoint Site ID
    private static String getSiteId() {
        String accessToken = getAccessToken();
        if (accessToken == null) {
            return null;
        }

        HttpRequest req = new HttpRequest();
        req.setEndpoint('https://graph.microsoft.com/v1.0/sites/vortexifysolution.sharepoint.com:/sites/salesforcefile');
        req.setMethod('GET');
        req.setHeader('Authorization', 'Bearer ' + accessToken);

        Http http = new Http();
        HttpResponse res = http.send(req);

        if (res.getStatusCode() == 200) {
            Map<String, Object> responseMap = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
            return (String) responseMap.get('id');
        } else {
            System.debug('Error retrieving site ID: ' + res.getBody());
            return null;
        }
    }
}