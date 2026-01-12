public class DynamicHttpCallout {
    
    public static HttpResponse makeHttpGetCallout(String endpointUrl, Map<String, String> queryParams, Map<String, String> headers) {
        String fullUrl = endpointUrl;
        HttpRequest request = new HttpRequest();
        request.setEndpoint(fullUrl);
        request.setMethod('GET');
        if (headers != null && !headers.isEmpty()) {
            for (String key : headers.keySet()) {
                request.setHeader(key, headers.get(key));
            }
        }
        Http http = new Http();
        HttpResponse response = http.send(request);
        return response;
    }
    
    public static HttpResponse makeHttpPOSTCallout(String endpointUrl, Map<String, String> queryParams, Map<String, String> headers) {
        
        String fullUrl = endpointUrl;
        HttpRequest request = new HttpRequest();
        request.setEndpoint(fullUrl);
        request.setMethod('POST');
        if (headers != null && !headers.isEmpty()) {
            for (String key : headers.keySet()) {
                request.setHeader(key, headers.get(key));
            }
        }
        Http http = new Http();
        HttpResponse response = http.send(request);
        system.debug('response==>'+response);
        return response;
    }
    
    public static HttpResponse makeHttpDeleteCallout(String endpointUrl, Map<String, String> queryParams, Map<String, String> headers) {
        String fullUrl = endpointUrl;
        if (queryParams != null && !queryParams.isEmpty()) {
            fullUrl += '?' + String.join(new List<String>(queryParams.keySet()), '&');
        }
        HttpRequest request = new HttpRequest();
        request.setEndpoint(fullUrl);
        request.setMethod('GET');
        
        if (headers != null && !headers.isEmpty()) {
            for (String key : headers.keySet()) {
                request.setHeader(key, headers.get(key));
            }
        }
        Http http = new Http();
        HttpResponse response = http.send(request);
        return response;
    }

    public static HttpResponse makeCallout(String httpMethod, String endpointUrl, Map<String, String> queryParams, Map<String, String> headers, String body) {

        // Create the HTTP request
        HttpRequest request = new HttpRequest();
        request.setMethod(httpMethod);
        //request.setTimeout(3000);

        // Add queryParams to endpointUrl if provided
        if (queryParams != null && !queryParams.isEmpty()) {
            endpointUrl += '?';
            for (String key : queryParams.keySet()) {
                endpointUrl += key + '=' + queryParams.get(key) + '&';
            }
            endpointUrl.removeEndIgnoreCase('&');
        }
        request.setEndpoint(endpointUrl);

        // Set headers if provided
        if (headers != null && !headers.isEmpty()) {
            System.debug('Headers Map: ' + headers);
            for (String key : headers.keySet()) {
                request.setHeader(key, headers.get(key));
            }
        }

        // Set Body if provided
        if(String.isNotBlank(body) && !String.isEmpty(body)){
            request.setBody(body);
        }

        System.debug('@@DynamicHttpCallout > HttpRequest: ' + request);

        try{
            Http http = new Http();
            HttpResponse response = http.send(request);
            System.debug('Status Code: ' + response.getStatusCode());
            //System.debug('@@DynamicHttpCallout > HttpRequest: ' + JSON.serializePretty(response.getBody()));
            return response;
        } catch (Exception e){
            System.debug('@@DynamicHttpCallout > Error while making callout:  ' + e.getMessage());
            return null;
        }
    }


    //Overrride Method For Body of type Blob
    public static HttpResponse makeCalloutWithBlobBody(String httpMethod, String endpointUrl, Map<String, String> queryParams, Map<String, String> headers, Blob body) {

        // Create the HTTP request
        HttpRequest request = new HttpRequest();
        request.setMethod(httpMethod);

        // Add queryParams to endpointUrl if provided
        if (queryParams != null && !queryParams.isEmpty()) {
            endpointUrl += '?';
            for (String key : queryParams.keySet()) {
                endpointUrl += key + '=' + queryParams.get(key) + '&';
            }
            endpointUrl.removeEndIgnoreCase('&');
        }
        request.setEndpoint(endpointUrl);

        // Set headers if provided
        if (headers != null && !headers.isEmpty()) {
            for (String key : headers.keySet()) {
                request.setHeader(key, headers.get(key));
            }
        }

        // Set Body if provided
        if(body != null){
            request.setBodyAsBlob(body);
        }

        System.debug('@@DynamicHttpCallout > HttpRequest: ' + request);

        try{
            Http http = new Http();
            HttpResponse response = http.send(request);
            System.debug('@@DynamicHttpCallout > HttpRequest: ' + JSON.serializePretty(response.getBody()));
            return response;
        } catch (Exception e){
            System.debug('@@DynamicHttpCallout > Error while making callout:  ' + e.getMessage());
            return null;
        }
    }
}