global class MonthlyLeaveEntitlementBatch 
    implements Database.Batchable<SObject> {

    private Policy__c activePolicy;
    private String currentYear;
    private Integer currentMonth;

    global MonthlyLeaveEntitlementBatch() {
        activePolicy = [
            SELECT Id, Floater_Leave_Per_Year__c, Casual_Leave_Per_Year__c, Earned_Leave_Per_Month__c, Sick_Leave_Per_Month__c
            FROM Policy__c
            WHERE Active__c = TRUE
            LIMIT 1
        ];

        currentYear  = String.valueOf(Date.today().year());
        currentMonth = Date.today().month();
    }

    global Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator(
            'SELECT Id FROM Contact WHERE Status__c = \'Available\''
        );
    }

    global void execute(Database.BatchableContext bc, List<Contact> scope) {

    Set<Id> employeeIds = new Set<Id>();
    for (Contact c : scope) {
        employeeIds.add(c.Id);
    }

    Map<Id, Leave_Entitlement__c> entitlementMap = new Map<Id, Leave_Entitlement__c>();

    for (Leave_Entitlement__c le : [
        SELECT Id, Employee__c,
               Floater_Allocated__c,
               Casual_Allocated__c,
               Earned_Allocated__c,
               Sick_Allocated__c
        FROM Leave_Entitlement__c
        WHERE Employee__c IN :employeeIds
          AND Calendar_Year__c = :currentYear
    ]) {
        entitlementMap.put(le.Employee__c, le);
    }

    List<Leave_Entitlement__c> upserts = new List<Leave_Entitlement__c>();
    Integer totalMonths = 12;

    for (Contact emp : scope) {

        Leave_Entitlement__c le = entitlementMap.get(emp.Id);
        Boolean isNewEntitlement = false;

        if (le == null) {
            isNewEntitlement = true;

            le = new Leave_Entitlement__c(
                Employee__c = emp.Id,
                Calendar_Year__c = currentYear,
                Policy__c   = activePolicy.Id,
                Floater_Allocated__c = 0,
                Casual_Allocated__c  = 0,
                Earned_Allocated__c  = 0,
                Sick_Allocated__c    = 0
            );
        }

        /* ==================================================
           YEARLY LEAVES – PRORATA (NEW ENTITLEMENT ONLY)
           ================================================== */
        if (isNewEntitlement) {

            Integer remainingMonths = totalMonths - currentMonth + 1;

            Decimal floaterRaw =
                (activePolicy.Floater_Leave_Per_Year__c / totalMonths)
                * remainingMonths;

            Decimal casualRaw =
                (activePolicy.Casual_Leave_Per_Year__c / totalMonths)
                * remainingMonths;

            // Round to nearest tens
            le.Floater_Allocated__c = Math.floor(floaterRaw);

            le.Casual_Allocated__c = Math.floor(casualRaw);
        }

        /* ===============================
           MONTHLY ACCRUAL (EVERY RUN)
           =============================== */
        // le.Earned_Allocated__c += activePolicy.Earned_Leave_Per_Month__c;
        // le.Sick_Allocated__c   += activePolicy.Sick_Leave_Per_Month__c;
        Decimal earnedAllocated =
            le.Earned_Allocated__c == null ? 0 : le.Earned_Allocated__c;

        Decimal earnedPerMonth =
            activePolicy.Earned_Leave_Per_Month__c == null ? 0 : activePolicy.Earned_Leave_Per_Month__c;
            le.Earned_Allocated__c = earnedAllocated + earnedPerMonth;

        Decimal sickAllocated =
            le.Sick_Allocated__c == null ? 0 : le.Sick_Allocated__c;

        Decimal sickPerMonth =
            activePolicy.Sick_Leave_Per_Month__c == null ? 0 : activePolicy.Sick_Leave_Per_Month__c;
            le.Sick_Allocated__c = sickAllocated + sickPerMonth;


        upserts.add(le);
    }

    if (!upserts.isEmpty()) {
        upsert upserts;
    }
}


    global void finish(Database.BatchableContext bc) {
        // Optional: logging, notifications
    }
}
