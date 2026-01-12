public with sharing class SetupAuditTrailController {
    public class AuditTrailWrapper {
        @AuraEnabled public String Id;
        @AuraEnabled public String Section;
        @AuraEnabled public String Element;
        @AuraEnabled public String CreatedByName;
        @AuraEnabled public Datetime CreatedDate;
        @AuraEnabled public String Remarks;
        @AuraEnabled public String MetadataType;
        @AuraEnabled public String FullName;
    }

    @AuraEnabled(cacheable=true)
    public static List<AuditTrailWrapper> getAuditTrail(Integer daysBack) {
        Integer db = daysBack == null ? 7 : daysBack;
        Datetime endDt = System.now();
        Datetime startDt = endDt.addDays(-db);

        List<AuditTrailWrapper> results = new List<AuditTrailWrapper>();
        for (SetupAuditTrail sat : [
            SELECT Id, Section, Display, Action, CreatedBy.Name, CreatedDate
            FROM SetupAuditTrail
            WHERE ResponsibleNamespacePrefix = null
              AND CreatedBy.Name != 'Automated Process'
              AND CreatedDate >= :startDt
              AND CreatedDate <= :endDt
            ORDER BY CreatedDate DESC
            LIMIT 1000
        ]) {
            AuditTrailWrapper w = new AuditTrailWrapper();
            w.Id = sat.Id;
            w.Section = sat.Section != null ? sat.Section.trim() : 'Unknown';
            w.Element = sat.Display != null ? sat.Display.trim() : '';
            w.CreatedByName = sat.CreatedBy != null ? sat.CreatedBy.Name : '';
            w.CreatedDate = sat.CreatedDate;
            w.Remarks = sat.Action != null ? sat.Action : '';
            w.MetadataType = deriveMetadataType(w.Section);
            w.FullName = w.Element; // best-effort; you can enhance this mapping per org
            results.add(w);
        }
        return results;
    }

    @AuraEnabled(cacheable=true)
    public static List<String> getSections() {
        Set<String> sections = new Set<String>();
        
        // Query only what’s allowed
        for (SetupAuditTrail sat : [
            SELECT Id, Section, CreatedBy.Name, ResponsibleNamespacePrefix
            FROM SetupAuditTrail
            WHERE ResponsibleNamespacePrefix = null
            AND CreatedBy.Name != 'Automated Process'
            LIMIT 2000
        ]) {
            if (sat.Section != null && String.isNotBlank(sat.Section)) {
                sections.add(sat.Section.trim());
            }
        }
        
        List<String> listSections = new List<String>(sections);
        listSections.sort();
        return listSections;
    }

    // small heuristic - extend with your org-specific rules
    private static String deriveMetadataType(String section) {
        if (section == null) return 'Unknown';
        String s = section.toLowerCase();
        if (s.contains('apex')) return 'ApexClass';
        if (s.contains('flow')) return 'Flow';
        if (s.contains('object') || s.contains('objects')) return 'CustomObject';
        if (s.contains('layout')) return 'Layout';
        if (s.contains('field')) return 'CustomField';
        if (s.contains('profile')) return 'Profile';
        if (s.contains('permission set')) return 'PermissionSet';
        return 'Unknown';
    }
}