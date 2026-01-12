public with sharing class GoogleDriveController {
    public String accessToken { get; set; }
    public Blob fileBlob { get; set; }
    public String fileName { get; set; }
    public String uploadResponse { get; set; }
    public List<DriveFile> driveFiles { get; set; }
    public String fileId { get; set; }
    public String folderId; 			
    
    public GoogleDriveController() {
        driveFiles = new List<DriveFile>();
       // Integrationsetup__c cust_setting = Integrationsetup__c.getInstance();
        Integrationsetup__c setting = [SELECT Name, Client_Id__c, Client_secret__c, folderId__c, Refresh_Token__c FROM Integrationsetup__c WHERE Name = 'googledrive' LIMIT 1];
        folderId = setting.folderId__c;
        
    }
    
    public void fetchAccessToken() {
        //Integrationsetup__c cust_setting = Integrationsetup__c.getInstance();
        Integrationsetup__c setting = [SELECT Name, Client_Id__c, Client_secret__c, folderId__c, Refresh_Token__c FROM Integrationsetup__c WHERE Name = 'googledrive' LIMIT 1];
        String clientId = setting.Client_Id__c;
        String clientSecret = setting.Client_Secret__c;
        String refreshToken = setting.Refresh_Token__c;
        
        String tokenUrl = 'https://oauth2.googleapis.com/token';
        String body = 'client_id=' + clientId + '&client_secret=' + clientSecret +
            '&refresh_token=' + refreshToken + '&grant_type=refresh_token';
        
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint(tokenUrl);
        request.setMethod('POST');
        request.setBody(body);
        request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        
        HttpResponse response = http.send(request);
        if (response.getStatusCode() == 200) {
            Map<String, Object> result = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
            accessToken = (String) result.get('access_token');
        }
    }
    
    public void handleFileUpload() {
        if (fileBlob == null || String.isEmpty(fileName)) {
            uploadResponse = 'No file selected!';
            return;
        }
        if (accessToken == null) {
            fetchAccessToken();
        }
        
        String fileMetadata = '{"name": "' + fileName + '", "parents": ["' + folderId + '"]}';
        String fileBody = EncodingUtil.base64Encode(fileBlob);
        
        String boundary = '-------314159265358979323846';
        String body = '--' + boundary + '\r\n' +
            'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
            fileMetadata + '\r\n' +
            '--' + boundary + '\r\n' +
            'Content-Type: application/octet-stream\r\n' +
            'Content-Transfer-Encoding: base64\r\n\r\n' +
            fileBody + '\r\n' +
            '--' + boundary + '--';
        
        HttpRequest request = new HttpRequest();
        request.setEndpoint('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart');
        request.setMethod('POST');
        request.setHeader('Authorization', 'Bearer ' + accessToken);
        request.setHeader('Content-Type', 'multipart/related; boundary=' + boundary);
        request.setBody(body);
        
        Http http = new Http();
        HttpResponse response = http.send(request);
        
        if (response.getStatusCode() == 200) {
            uploadResponse = 'File uploaded successfully!';
        } else {
            uploadResponse = 'Error: ' + response.getBody();
        }
    }
    
    
    public void fetchFiles() {
        if (accessToken == null) {
            fetchAccessToken();
        }
        
        
        HttpRequest request = new HttpRequest();
        request.setEndpoint('https://www.googleapis.com/drive/v3/files?q=\'' + folderId + '\'+in+parents');
        request.setMethod('GET');
        request.setHeader('Authorization', 'Bearer ' + accessToken);
        
        Http http = new Http();
        HttpResponse response = http.send(request);
        
        if (response.getStatusCode() == 200) {
            Map<String, Object> result = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
            List<Object> files = (List<Object>) result.get('files');
            
            driveFiles.clear();
            for (Object fileObj : files) {
                Map<String, Object> fileMap = (Map<String, Object>) fileObj;
                driveFiles.add(new DriveFile((String) fileMap.get('id'), (String) fileMap.get('name')));
            }
        }
    }
    
    public void deleteFile() {
        System.debug('--->>>' + fileId);
        if (String.isEmpty(fileId)) {
            uploadResponse = 'Error: No file selected for deletion.';
            return;
        }
        
        if (accessToken == null) {
            fetchAccessToken();
        }
        
        HttpRequest request = new HttpRequest();
        request.setEndpoint('https://www.googleapis.com/drive/v3/files/' + fileId);
        request.setMethod('DELETE');
        request.setHeader('Authorization', 'Bearer ' + accessToken);
        
        HttpResponse response = new Http().send(request);
        
        if (response.getStatusCode() == 204) {
            uploadResponse = 'File deleted successfully!';
            fetchFiles();
        } else {
            uploadResponse = 'Error deleting file: ' + response.getBody();
        }
    }
    
    
    public class DriveFile {
        public String id { get; set; }
        public String name { get; set; }
        public DriveFile(String id, String name) {
            this.id = id;
            this.name = name;
        }
    }
}