public class RazorpayController {
    
    private static String RAZORPAY_KEY_ID;
    private static String RAZORPAY_SECRET;
    
    public String orderId { get; set; }
    public String amount { get; set; }
    public String currencyType { get; set; }
    public String paymentUrl { get; set; }  // Store Payment URL
    
    public RazorpayController() {
        this.amount = '500'; // Default amount in INR
        this.currencyType = 'INR';
    }
    
    public PageReference createOrder() {
        try {
            String endpoint = 'https://api.razorpay.com/v1/orders';
            Integrationsetup__c setting = [SELECT Name, Client_Id__c, Client_secret__c FROM Integrationsetup__c WHERE Name = 'RazorPay' LIMIT 1]; 
            RAZORPAY_KEY_ID = setting.Client_Id__c;
            RAZORPAY_SECRET = setting.Client_secret__c;
            // Prepare Request Body
            Map<String, Object> requestBody = new Map<String, Object>();
            requestBody.put('amount', Decimal.valueOf(amount) * 100); // Convert to paise
            requestBody.put('currency', currencyType);
            requestBody.put('receipt', 'order_receipt_' + System.currentTimeMillis());
            requestBody.put('payment_capture', true);
            
            // Convert Map to JSON
            String requestBodyJson = JSON.serialize(requestBody);
            
            // Prepare HTTP Request
            HttpRequest req = new HttpRequest();
            req.setEndpoint(endpoint);
            req.setMethod('POST');
            req.setHeader('Authorization', 'Basic ' + EncodingUtil.base64Encode(Blob.valueOf(RAZORPAY_KEY_ID + ':' + RAZORPAY_SECRET)));
            req.setHeader('Content-Type', 'application/json');
            req.setBody(requestBodyJson);
            
            // Send HTTP Request
            Http http = new Http();
            HttpResponse res = http.send(req);
            
            if (res.getStatusCode() == 200) {
                Map<String, Object> responseMap = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
                orderId = (String) responseMap.get('id');
                System.debug('Razorpay Order Created: ' + orderId);
                
                
                // Generate Payment Link using Razorpay API
                String paymentLinkEndpoint = 'https://api.razorpay.com/v1/payment_links';
                Map<String, Object> paymentLinkRequest = new Map<String, Object>();
                paymentLinkRequest.put('amount', Decimal.valueOf(amount) * 100);
                paymentLinkRequest.put('currency', currencyType);
                paymentLinkRequest.put('accept_partial', false);
                paymentLinkRequest.put('expire_by', (System.currentTimeMillis() / 1000) + 3600); // Expiry in 1 hour
                paymentLinkRequest.put('reference_id', orderId);
                paymentLinkRequest.put('description', 'Payment for Order ' + orderId);
                paymentLinkRequest.put('customer', new Map<String, Object>{
                    'name' => 'Test User',
                        'email' => 'test@example.com',
                        'contact' => '9876543210'
                        });
                
                String paymentLinkRequestJson = JSON.serialize(paymentLinkRequest);
                HttpRequest paymentLinkReq = new HttpRequest();
                paymentLinkReq.setEndpoint(paymentLinkEndpoint);
                paymentLinkReq.setMethod('POST');
                paymentLinkReq.setHeader('Authorization', 'Basic ' + EncodingUtil.base64Encode(Blob.valueOf(RAZORPAY_KEY_ID + ':' + RAZORPAY_SECRET)));
                paymentLinkReq.setHeader('Content-Type', 'application/json');
                paymentLinkReq.setBody(paymentLinkRequestJson);
                
                HttpResponse paymentLinkRes = http.send(paymentLinkReq);
                if (paymentLinkRes.getStatusCode() == 200) {
                    Map<String, Object> paymentLinkResponseMap = (Map<String, Object>) JSON.deserializeUntyped(paymentLinkRes.getBody());
                    paymentUrl = (String) paymentLinkResponseMap.get('short_url');
                    System.debug('Payment Link: ' + paymentUrl);
                }
                else {
                    System.debug('Error creating Razorpay payment link: ' + paymentLinkRes.getBody());
                }
                
            } else {
                System.debug('Error creating Razorpay order: ' + res.getBody());
            }
        } catch (Exception e) {
            System.debug('Exception: ' + e.getMessage());
        }
        return null;
    }
}