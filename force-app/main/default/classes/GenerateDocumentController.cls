public class GenerateDocumentController {
    
    public String finalContent { get; set; }
    
    public GenerateDocumentController() {
        
        Id documentId = ApexPages.currentPage().getParameters().get('onboardingRecId');
        if (documentId == null) {
            finalContent = 'No document selected.';
            return;
        }
        
        // Fetch onboarding document record
        Employee_Onboarding_Document__c onboardingRec = [
            SELECT Id,
                   Name,
                   Document_Content__c,
                   Employee__c
            FROM Employee_Onboarding_Document__c
            WHERE Id = :documentId
            LIMIT 1
        ];
        
        // Fetch employee (Contact)
        Contact con = [
            SELECT Id,
                   FirstName,
                   LastName,
                   Name,
                   Emp_ID__c,
                   MailingStreet,
                   MailingCity,
                   MailingPostalCode,
                   MailingState,
                   MailingCountry,
                   Joining_Date__c,
                   Last_Working_Day__c,
                   Designation__c,
                   Department__c,
                   Location__c,
                   ReportsToId,
                   ReportsTo.Name,
                   ReportsTo.Designation__c
            FROM Contact
            WHERE Id = :onboardingRec.Employee__c
            LIMIT 1
        ];
        
        // Fetch company account
        Account companyAcc = getCompanyAccount();
        
        // Fetch HR contact (by Department__c)
        Contact hrCon = getHrContact();
        
        // Base HTML template content
        String content = onboardingRec.Document_Content__c != null ? onboardingRec.Document_Content__c : '';
        
        // 1) Replace all merge tokens
        content = mergeTokens(content, con, onboardingRec, companyAcc, hrCon);
        
        // 2) Replace page break placeholders
        String pageBreakHtml = '<div style="page-break-after: always;"></div><br/><br/><br/><br/><br/><br/>';
        content = content.replace('[PAGEBREAK]', pageBreakHtml);
        content = content.replace('{!PageBreak}', pageBreakHtml);
        
        // 3) Wrap in styling block for PDF readability
        finalContent = '<div style="font-size:13px; line-height:20px;">' + content + '</div>';
    }
    
    
    @AuraEnabled
    public static void generateFinalDocument(Id onboardingDocId) {
        
        Employee_Onboarding_Document__c onboardingRec = [
            SELECT Id,
                   Name,
                   Document_Content__c,
                   Employee__c,
                   Employee__r.Name
            FROM Employee_Onboarding_Document__c
            WHERE Id = :onboardingDocId
            LIMIT 1
        ];
        
        // ==== Delete existing files linked to this document ====
        
        List<ContentDocumentLink> links = [
            SELECT Id, ContentDocumentId
            FROM ContentDocumentLink
            WHERE LinkedEntityId = :onboardingDocId
        ];
        
        Set<Id> docIds = new Set<Id>();
        for (ContentDocumentLink linkRec : links) {
            docIds.add(linkRec.ContentDocumentId);
        }
        
        if (!links.isEmpty()) {
            delete links;
        }
        
        if (!docIds.isEmpty()) {
            List<ContentDocument> docs = [
                SELECT Id FROM ContentDocument WHERE Id IN :docIds
            ];
            delete docs;
        }
        
        
        // ==== Generate new PDF ====
        
        PageReference pdfPage = Page.GenerateDocument;
        pdfPage.getParameters().put('onboardingRecId', onboardingDocId);
        Blob pdfBlob = pdfPage.getContentAsPDF();
        
        
        // ==== Save PDF as File ====
        
        ContentVersion cv = new ContentVersion(
            Title        = onboardingRec.Employee__r.Name + '-' + onboardingRec.Name,
            PathOnClient = onboardingRec.Employee__r.Name + '-' + onboardingRec.Name + '.pdf',
            VersionData  = pdfBlob,
            Origin       = 'H'
        );
        insert cv;
        
        
        // ==== Link File to Onboarding Doc ====
        
        ContentDocumentLink cdl = new ContentDocumentLink(
            ContentDocumentId = [
                SELECT ContentDocumentId 
                FROM ContentVersion 
                WHERE Id = :cv.Id
                LIMIT 1
            ].ContentDocumentId,
            LinkedEntityId = onboardingDocId,
            ShareType      = 'V'
        );
        insert cdl;
    }
    
    
    
    /* ============================================================
       TOKEN REPLACEMENT METHOD
    ============================================================ */
    
    private static String mergeTokens(
        String template,
        Contact con,
        Employee_Onboarding_Document__c onboardingRec,
        Account companyAcc,
        Contact hrCon
    ) {
        if (String.isBlank(template)) {
            return '';
        }
        
        Date today = Date.today();
        String formattedToday = today.format();
        Integer currentYear   = today.year();
        Integer nextYear      = currentYear + 1;
        
        String companyAddress = buildCompanyAddress(companyAcc);
        
        Map<String, String> tokenMap = new Map<String, String>();
        
        
        // ===== Contact fields =====
        tokenMap.put('{!Name}',               nvl(con.Name));
        tokenMap.put('{!FirstName}',          nvl(con.FirstName));
        tokenMap.put('{!LastName}',           nvl(con.LastName));
        tokenMap.put('{!Employee_Id__c}',     nvl(con.Emp_ID__c));
        
        tokenMap.put('{!MailingStreet}',      nvl(con.MailingStreet));
        tokenMap.put('{!MailingCity}',        nvl(con.MailingCity));
        tokenMap.put('{!MailingPostalCode}',  nvl(con.MailingPostalCode));
        tokenMap.put('{!MailingState}',       nvl(con.MailingState));
        tokenMap.put('{!MailingCountry}',     nvl(con.MailingCountry));
        
        tokenMap.put('{!Joining_Date__c}',    formatDate(con.Joining_Date__c));
        
        // *** UPDATED ***
        tokenMap.put('{!Relieving_Date__c}',  formatDate(con.Last_Working_Day__c));
        
        
        // ===== Date tokens =====
        tokenMap.put('{!FormattedDate__c}',   formattedToday);
        tokenMap.put('{!Today}',              formattedToday);
        tokenMap.put('{!Current_Year}',       String.valueOf(currentYear));
        tokenMap.put('{!Next_Year}',          String.valueOf(nextYear));
        
        
        // ===== Job fields =====
        tokenMap.put('{!Designation}',                   nvl(con.Designation__c));
        tokenMap.put('{!Department}',                    nvl(con.Department__c));
        tokenMap.put('{!Location}',                      nvl(con.Location__c));
        tokenMap.put('{!Reporting_Manager}',             con.ReportsToId != null ? nvl(con.ReportsTo.Name) : '');
        tokenMap.put('{!Reporting_Manager_Designation}', con.ReportsToId != null ? nvl(con.ReportsTo.Designation__c) : '');
        
        
        // ===== Policy values =====
        tokenMap.put('{!Probation_Period}',  '3 months');
        tokenMap.put('{!Notice_Period}',     '45 days');
        tokenMap.put('{!Working_Days}',      '5 days');
        tokenMap.put('{!Leave_Per_Year}',    '18');
        
        
        // ===== HR info =====
        tokenMap.put('{!HR_Name}',        hrCon != null ? nvl(hrCon.Name) : '');
        tokenMap.put('{!HR_Designation}', hrCon != null ? nvl(hrCon.Designation__c) : '');
        
        
        // ===== Company info =====
        tokenMap.put('{!Company_Name}',    companyAcc != null ? nvl(companyAcc.Name) : 'VORTEXIFY SOLUTIONS LLP');
        tokenMap.put('{!Company_Address}', companyAddress);
        
        
        // ===== Document fields =====
        tokenMap.put('{!Document_Name}', nvl(onboardingRec.Name));
        tokenMap.put('{!Document_Date}', formattedToday);
        
        
        // *** DO NOT replace salary/bond tokens yet ***
        
        
        // ===== Apply replacements =====
        for (String token : tokenMap.keySet()) {
            template = template.replace(token, tokenMap.get(token));
        }
        
        return template;
    }
    
    
    
    /* ============================================================
       SUPPORT METHODS
    ============================================================ */
    
    private static Account getCompanyAccount() {
        List<Account> accList = [
            SELECT Id,
                   Name,
                   BillingStreet,
                   BillingCity,
                   BillingPostalCode,
                   BillingState,
                   BillingCountry
            FROM Account
            WHERE Name = 'VORTEXIFY SOLUTIONS LLP'
            LIMIT 1
        ];
        return accList.isEmpty() ? null : accList[0];
    }
    
    private static Contact getHrContact() {
        List<Contact> hrList = [
            SELECT Id,
                   Name,
                   Designation__c
            FROM Contact
            WHERE Department__c = 'HR Department'
            LIMIT 1
        ];
        return hrList.isEmpty() ? null : hrList[0];
    }
    
    private static String nvl(String v) {
        return v == null ? '' : v;
    }
    
    private static String formatDate(Date d) {
        return d == null ? '' : d.format();
    }
    
    private static String buildCompanyAddress(Account acc) {
        
        if (acc != null &&
           (!String.isBlank(acc.BillingStreet) ||
            !String.isBlank(acc.BillingCity) ||
            !String.isBlank(acc.BillingPostalCode) ||
            !String.isBlank(acc.BillingState) ||
            !String.isBlank(acc.BillingCountry))) {
            
            String addr = '';
            
            if (!String.isBlank(acc.BillingStreet))      addr += acc.BillingStreet + ', ';
            if (!String.isBlank(acc.BillingCity))        addr += acc.BillingCity + ', ';
            if (!String.isBlank(acc.BillingState))       addr += acc.BillingState + ', ';
            if (!String.isBlank(acc.BillingPostalCode))  addr += acc.BillingPostalCode + ', ';
            if (!String.isBlank(acc.BillingCountry))     addr += acc.BillingCountry;
            
            return addr.trim();
        }
        
        return 'Registered Address: 18B, Gyan Khand - 4, Indirapuram, Ghaziabad, Uttar Pradesh, 201014, India ' +
               'Noida Branch: 305, 3rd Floor, B-158, Sector 63, Noida, Uttar Pradesh, 201301, India';
    }
}