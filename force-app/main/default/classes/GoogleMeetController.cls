public with sharing class GoogleMeetController {
    public String subject { get; set; }
    public DateTime startTime { get; set; }
    public DateTime endTime { get; set; }
    public String meetLink { get; set; }

    // Method to get Access Token using values from custom setting
    private static String getAccessToken(Integrationsetup__c setting) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint(setting.Token_Url__c);
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/x-www-form-urlencoded');

        String body = 'client_id=' + EncodingUtil.urlEncode(setting.Client_Id__c, 'UTF-8') +
                      '&client_secret=' + EncodingUtil.urlEncode(setting.Client_Secret__c, 'UTF-8') +
                      '&refresh_token=' + EncodingUtil.urlEncode(setting.Refresh_Token__c, 'UTF-8') +
                      '&grant_type=refresh_token';
        req.setBody(body);

        Http http = new Http();
        HttpResponse res = http.send(req);

        System.debug('Access Token Response: ' + res.getBody());

        if (res.getStatusCode() == 200) {
            Map<String, Object> responseMap = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
            return (String) responseMap.get('access_token');
        } else {
            System.debug('Error fetching access token: ' + res.getBody());
            return null;
        }
    }

    // Method to create a Google Meet event
    @AuraEnabled
    public static String createGoogleMeet(String eventTitle, Datetime startTime, Datetime endTime) {
        Integrationsetup__c setting = [
            SELECT Client_Id__c, Client_Secret__c, Api_Endpoint__c, Refresh_Token__c, Token_Url__c
            FROM Integrationsetup__c
            WHERE Name = 'googleMeet'
            LIMIT 1
        ];

        String accessToken = getAccessToken(setting);
        if (accessToken == null) {
            return 'Error: Unable to fetch access token.';
        }

        Map<String, Object> eventDetails = new Map<String, Object>();
        eventDetails.put('summary', eventTitle);

        Map<String, Object> start = new Map<String, Object>();
        start.put('dateTime', startTime.formatGmt('yyyy-MM-dd\'T\'HH:mm:ss\'Z\''));
        start.put('timeZone', 'UTC');
        eventDetails.put('start', start);

        Map<String, Object> endData = new Map<String, Object>();
        endData.put('dateTime', endTime.formatGmt('yyyy-MM-dd\'T\'HH:mm:ss\'Z\''));
        endData.put('timeZone', 'UTC');
        eventDetails.put('end', endData);

        Map<String, Object> conferenceData = new Map<String, Object>();
        Map<String, Object> createRequest = new Map<String, Object>();
        createRequest.put('requestId', String.valueOf(Datetime.now().getTime()));
        conferenceData.put('createRequest', createRequest);
        eventDetails.put('conferenceData', conferenceData);

        HttpRequest req = new HttpRequest();
        req.setEndpoint(setting.Api_Endpoint__c + '?conferenceDataVersion=1');
        req.setMethod('POST');
        req.setHeader('Authorization', 'Bearer ' + accessToken);
        req.setHeader('Content-Type', 'application/json');
        req.setBody(JSON.serialize(eventDetails));

        Http http = new Http();
        HttpResponse res = http.send(req);
        System.debug('Google Meet Response: ' + res.getBody());

        if (res.getStatusCode() == 200) {
            Map<String, Object> responseMap = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
            if (responseMap.containsKey('conferenceData')) {
                Map<String, Object> conference = (Map<String, Object>) responseMap.get('conferenceData');
                if (conference.containsKey('entryPoints')) {
                    List<Object> entryPoints = (List<Object>) conference.get('entryPoints');
                    for (Object entry : entryPoints) {
                        Map<String, Object> entryPoint = (Map<String, Object>) entry;
                        if (entryPoint.get('entryPointType') == 'video') {
                            return (String) entryPoint.get('uri');
                        }
                    }
                }
            }
            return 'Error: Meet link not found in API response.';
        } else {
            return 'Error: ' + res.getBody();
        }
    }

    @AuraEnabled(cacheable = true)
    public static String generateMeet(Datetime startTime, Datetime endTime, String subject) {
        return createGoogleMeet(subject, startTime, endTime);
    }
}