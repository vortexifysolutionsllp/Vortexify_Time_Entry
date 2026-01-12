public class MonthlyLineItemTriggerHelper {
    public static void createDailyLineItems(List<Time_Entry_Weekly_Card__c> WeeklycardList) {
        List<Time_Entry_Daily_Card__c> dailylineiItemsList = new List<Time_Entry_Daily_Card__c>();

        for (Time_Entry_Weekly_Card__c tew : WeeklycardList) {
            // Skip records that don't have required dates
            if (tew.Week_Start_Date__c == null || (tew.Name == 'Week - 5' && tew.Week_End_Date__c == null)) {
                System.debug('Skipping record with missing start or end dates: ' + tew.Id);
                continue;
            }

            // Normal weeks (Week 1 to 4)
            if (tew.Name != 'Week - 5') {
                for (Integer i = 0; i < 7; i++) {
                    Time_Entry_Daily_Card__c tel = new Time_Entry_Daily_Card__c();
                    tel.Date_Of_Work__c = tew.Week_Start_Date__c.addDays(i);
                    tel.Name = String.valueOf(tel.Date_Of_Work__c);
                    tel.Time_Entry_Weekly_Card__c = tew.Id;
                    dailylineiItemsList.add(tel);
                }
            }
            // For Week - 5, only add required number of days based on week start and end
            else {
                Integer daysLeft = tew.Week_Start_Date__c.daysBetween(tew.Week_End_Date__c);
                System.debug('daysLeft: ' + daysLeft);

                for (Integer i = 0; i <= daysLeft; i++) {
                    Time_Entry_Daily_Card__c tel = new Time_Entry_Daily_Card__c();
                    tel.Date_Of_Work__c = tew.Week_Start_Date__c.addDays(i);
                    tel.Name = String.valueOf(tel.Date_Of_Work__c);
                    tel.Time_Entry_Weekly_Card__c = tew.Id;
                    dailylineiItemsList.add(tel);
                }
            }
        }

        System.debug('dailylineiItemsList --> ' + dailylineiItemsList);
        if (!dailylineiItemsList.isEmpty()) {
            insert dailylineiItemsList;
        }
    }
}