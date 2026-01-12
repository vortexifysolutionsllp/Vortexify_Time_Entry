public with sharing class WhatsAppIntegrationController {

    @AuraEnabled
    public static Boolean sendTemplateMessage(String contactId) {
        try {
            Contact contactDetail = [SELECT Id, Phone FROM Contact WHERE Id = :contactId LIMIT 1];

            if (String.isBlank(contactDetail.Phone)) {
                throw new AuraHandledException('Phone number is not available for this contact.');
            }

            String whatsAppNumber = '91' + contactDetail.Phone;
            System.debug('WhatsApp Number: ' + whatsAppNumber);

            Http http = new Http();
            HttpRequest req = new HttpRequest();

            req.setEndpoint('https://graph.facebook.com/v22.0/658251147367488/messages');
            req.setMethod('POST');
            req.setHeader('Content-Type', 'application/json');

            String apiToken = 'EAAN2zYqJ8ToBO83WHzPCQsloD29yklIVdCdL9DzqcZBjzKYX3lFcgBemrZAZB8Wj5yYoM0whbDlwXHSkxXIZAlvAmpZACNQ7MxmodvNYIYBPebr5iC1tPJV3PLxHaHVQgMWjUhEzB63SmwIaJW71hjYaTdgEWKG92aJUi0q8B66Kg6gaoYqFDs5gVmr7LR5vLZAqXcWAlezpLyZC5oi7fBy31HCIlMu6g9hn3kZD'; // Replace with secure storage in production
            req.setHeader('Authorization', 'Bearer ' + apiToken);

            String body = JSON.serializePretty(new Map<String, Object>{
                'messaging_product' => 'whatsapp',
                'to' => whatsAppNumber,
                'type' => 'template',
                'template' => new Map<String, Object>{
                    'name' => 'hello_world',
                    'language' => new Map<String, String>{'code' => 'en_IN'}
                }
            });

            req.setBody(body);
            System.debug('Send Body: '+body);
            HttpResponse res = http.send(req);
            System.debug('Response Body: ' + res.getBody());
            System.debug('Status Code: ' + res.getStatusCode());

            return res.getStatusCode() == 200;
        } catch (Exception e) {
            System.debug('Error: ' + e.getMessage());
            return false;
        }
    }
}