public with sharing class MilestoneController {
    @AuraEnabled(cacheable=true)
    public static List<Milestone__c> getMilestoneData(string projectId) {
        system.debug('projectId---'+projectId);
        return [
            SELECT Account__c, Actual_End_Date__c, Actual_Start_Date__c, Anticipated_End_Date__c, 
            Anticipated_Hours__c, Closed_the_Milesstone__c, Description__c, Expected_End_Date__c, 
            Expected_Start_Date__c, Id, Is_Collected__c, Milestone_Weightage_Rs__c, 
            Milestone_Weightage__c, Name, Name__c, Opportunity__c, Precentage__c, 
            Project__c, Stages__c, Tentative_Date_of_Payment__c, Total_Utilised_Time__c 
            FROM Milestone__c WHERE Project__c =:projectId limit 25
        ];
    }
    
    @AuraEnabled
    public static Integer saveMilestoneChanges(List<Milestone__c> updatedRecords) {
        if (updatedRecords == null || updatedRecords.isEmpty()) {
            throw new AuraHandledException('No records to update.');
        }
        
        // Perform DML update on the records
        update updatedRecords;
        
        return updatedRecords.size();
    }
    
    @AuraEnabled
    public static Integer updateMilestonesFromCSV(String csvContent) {
        if (String.isBlank(csvContent)) {
            throw new AuraHandledException('No CSV content provided.');
        }
        
        List<Milestone__c> milestonesToUpdate = new List<Milestone__c>();
        String[] lines = csvContent.split('\n');
        
        // Ensure the file is not empty and has at least a header and one data row
        if (lines.size() < 2) {
            throw new AuraHandledException('The CSV file must contain a header row and at least one data row.');
        }
        
        // Detect delimiter (tab or comma)
        String delimiter = lines[0].contains('\t') ? '\t' : ',';
        
        // Parse header row for column mapping
        Map<String, Integer> headerMap = new Map<String, Integer>();
        String[] headers = lines[0].split(delimiter);
        for (Integer i = 0; i < headers.size(); i++) {
            headerMap.put(headers[i].trim(), i);
        }
        System.debug('headerMap: ' + headerMap);
        
        // Process each row after the header
        for (Integer i = 1; i < lines.size(); i++) {
            String line = lines[i].trim();
            if (String.isBlank(line)) {
                continue; // Skip empty rows
            }
            
            String[] values = line.split(delimiter);
            if (values.size() != headers.size()) {
                System.debug('Skipping row ' + (i + 1) + ': Mismatch in number of columns.');
                continue; // Skip rows with column mismatch
            }
            
            Milestone__c milestone = new Milestone__c();
            try {
                // Map values from CSV to Milestone__c fields
                if (headerMap.containsKey('Id')) {
                    milestone.Id = values[headerMap.get('Id')].trim();
                }
                if (headerMap.containsKey('Actual End Date') && values[headerMap.get('Actual End Date')] != 'N/A') {
                    milestone.Actual_End_Date__c = parseDate(values[headerMap.get('Actual End Date')].trim());
                }
                if (headerMap.containsKey('Actual Start Date') && values[headerMap.get('Actual Start Date')] != 'N/A') {
                    milestone.Actual_Start_Date__c = parseDate(values[headerMap.get('Actual Start Date')].trim());
                }
                if (headerMap.containsKey('Closed Milestone')) {
                    milestone.Closed_the_Milesstone__c = Boolean.valueOf(values[headerMap.get('Closed Milestone')].trim());
                }
                if (headerMap.containsKey('Description')) {
                    milestone.Description__c = values[headerMap.get('Description')].trim();
                }
                if (headerMap.containsKey('Expected End Date') && values[headerMap.get('Expected End Date')] != 'N/A') {
                    milestone.Expected_End_Date__c = parseDate(values[headerMap.get('Expected End Date')].trim());
                }
                if (headerMap.containsKey('Expected Start Date') && values[headerMap.get('Expected Start Date')] != 'N/A') {
                    milestone.Expected_Start_Date__c = parseDate(values[headerMap.get('Expected Start Date')].trim());
                }
                if (headerMap.containsKey('Percentage') && values[headerMap.get('Percentage')] != 'N/A') {
                    milestone.Precentage__c = parseDecimal(values[headerMap.get('Percentage')].trim());
                }
                if (headerMap.containsKey('Stages')) {
                    milestone.Stages__c = values[headerMap.get('Stages')].trim();
                }
                if (headerMap.containsKey('Tentative Date of Payment') && values[headerMap.get('Tentative Date of Payment')] != 'N/A') {
                    milestone.Tentative_Date_of_Payment__c = parseDate(values[headerMap.get('Tentative Date of Payment')].trim());
                }
                if (headerMap.containsKey('Total Utilized Time') && values[headerMap.get('Total Utilized Time')] != 'N/A') {
                    milestone.Total_Utilised_Time__c = parseDecimal(values[headerMap.get('Total Utilized Time')].trim());
                }
                
                milestonesToUpdate.add(milestone);
            } catch (Exception e) {
                System.debug('Error processing row ' + (i + 1) + ': ' + e.getMessage());
            }
        }
        
        // Perform the update
        if (!milestonesToUpdate.isEmpty()) {
            system.debug('milestonesToUpdate---'+milestonesToUpdate);
            update milestonesToUpdate;
        }
        
        return milestonesToUpdate.size();
    }
    
    // Utility methods for parsing
    private static Date parseDate(String dateStr) {
        try {
            return Date.valueOf(dateStr);
        } catch (Exception e) {
            throw new AuraHandledException('Invalid date format: ' + dateStr);
        }
    }
    
    private static Decimal parseDecimal(String decimalStr) {
        try {
            return Decimal.valueOf(decimalStr);
        } catch (Exception e) {
            throw new AuraHandledException('Invalid decimal format: ' + decimalStr);
        }
    }
    
    
    
    
}