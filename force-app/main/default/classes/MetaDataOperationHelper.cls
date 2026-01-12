public class MetaDataOperationHelper {

   //Method to get the MetaData record of specific auth
    @AuraEnabled
    public static Google_Auth_Setting__mdt getMetadataRecord(String metaDataName, String developerName) {
        System.debug('MetaDataOperationHelper > getMetadataRecord > ' + developerName);
        
        // Return null if developerName is null or empty
        if (String.isBlank(developerName)) {
            System.debug('DeveloperName is null or empty');
            return null;
        }

        try {
            // Query the custom metadata record
            List<Google_Auth_Setting__mdt> authRecordList = [
                SELECT Id, DeveloperName, MasterLabel, Label, QualifiedApiName, Scopes__c, 
                    Type__c, Client_Id__c, Auth_URI__c, Token_URI__c, Client_Secret__c, 
                    Access_Token__c, Refresh_Token__c, Code__c, RedirectRecordId__c, RedirectURI__c  
                FROM Google_Auth_Setting__mdt 
                WHERE DeveloperName = :developerName 
                LIMIT 1
            ];
            System.debug('Auth Record Retrieved: ' + authRecordList.size());

            // Return if no metadata record is found
            if (authRecordList.isEmpty()) {
                System.debug('No related metadata record found for developerName: ' + developerName);
                return null;
            } else {
                return authRecordList[0];
            }
        } catch (Exception e) {
            System.debug('Exception occurred while retrieving metadata record: ' + e.getMessage());
            return null;
        }
    }

    
    // Method to update the custom metadata record
    public static Boolean updateMetadataRecord(String metaDataName, String recordDeveloperName, Map<String, String> fieldWithValuesMap) {
        System.debug('MetaDataOperationHelper > updateMetadataRecord > @@recordDeveloperName: ' + metaDataName + '.' + recordDeveloperName);
        System.debug('fieldWithValuesMap: ' + fieldWithValuesMap);

        // Validate input parameters
        if (String.isBlank(metaDataName) || String.isBlank(recordDeveloperName) || fieldWithValuesMap == null || fieldWithValuesMap.isEmpty()) {
            System.debug('Invalid input parameters.');
            return false;
        }

        try {
            // Query the custom metadata record
            List<Google_Auth_Setting__mdt> authRecordList = [SELECT Id, DeveloperName, MasterLabel, Label, QualifiedApiName, Scopes__c, 
                                                            Type__c, Client_Id__c, Auth_URI__c, Token_URI__c, Client_Secret__c, 
                                                            Access_Token__c, Refresh_Token__c, Code__c, RedirectRecordId__c, RedirectURI__c  
                                                            FROM Google_Auth_Setting__mdt WHERE DeveloperName = :recordDeveloperName LIMIT 1];
            System.debug('authRecordList: ' + authRecordList.size());

            // Return if no metadata record is found
            if (authRecordList.isEmpty()) {
                System.debug('No related metadata record found. DeveloperName: ' + recordDeveloperName);
                return false;
            }

            // Update the metadata record
            Metadata.CustomMetadata customMetadata = new Metadata.CustomMetadata();
            customMetadata.fullName = metaDataName + '.' + authRecordList[0].DeveloperName;
            customMetadata.label = authRecordList[0].MasterLabel;

            for (String key : fieldWithValuesMap.keySet()) {
                Metadata.CustomMetadataValue customField = new Metadata.CustomMetadataValue();
                customField.field = key;
                customField.value = fieldWithValuesMap.get(key);
                customMetadata.values.add(customField);
            }

            Metadata.DeployContainer mdContainer = new Metadata.DeployContainer();
            mdContainer.addMetadata(customMetadata);

            // Deploy the changes if not in a test context
            if (!Test.isRunningTest()) {
                CreateUpdateMetadataUtils callback = new CreateUpdateMetadataUtils();
                Id jobId = Metadata.Operations.enqueueDeployment(mdContainer, callback);
                System.debug('Metadata updated with job ID: ' + jobId);
                return true;
            } else {
                return false;
            }
        } catch (Exception e) {
            System.debug('Exception occurred while updating metadata record: ' + e.getMessage());
            return false;
        }
    }


    //MetaData Operation Util Class - For deployment of MetaData records
    public class CreateUpdateMetadataUtils implements Metadata.DeployCallback {
        public void handleResult(Metadata.DeployResult result, Metadata.DeployCallbackContext context) {
            if (result.status == Metadata.DeployStatus.Succeeded) {
                System.debug(' success : '+ result);
            } else {
                System.debug(' fail : '+ result);
            }
        }
    }
}