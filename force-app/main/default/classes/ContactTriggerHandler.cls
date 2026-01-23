public without sharing class ContactTriggerHandler {

    public static void createCurrentMonthDayAttendance(List<Contact> conList,Map<Id, Contact> oldMap) {
        if (conList.isEmpty()) return;

        List<Contact> activeContacts = new List<Contact>();
        for (Contact con : conList) {
            if (con.Status__c == 'Available') {
                activeContacts.add(con);
            }
        }

        Date today = Date.today();

        // 🔥 CURRENT MONTH LOGIC
        Integer currentMonth = today.month();
        Integer currentYear  = today.year();

        Date firstDayOfMonth = Date.newInstance(currentYear, currentMonth, 1);
        Date lastDayOfMonth  = firstDayOfMonth.addMonths(1).addDays(-1);
        Integer totalDays    = lastDayOfMonth.day();

        // Get or create Attendance Month records
        Map<Id, Attendance_Month__c> monthMap =
            getAttendanceMonthMap(currentYear, currentMonth, activeContacts);

        // Fetch holidays
        Map<Date, Id> holidayMap = new Map<Date, Id>();
        for (Holiday__c h : [
            SELECT Id, Date__c
            FROM Holiday__c
            WHERE Date__c >= :firstDayOfMonth
            AND Date__c <= :lastDayOfMonth
        ]) {
            holidayMap.put(h.Date__c, h.Id);
        }

        // Fetch active policy
        Policy__c policy = [
            SELECT Working_Days__c
            FROM Policy__c
            WHERE Active__c = true
            LIMIT 1
        ];

        Set<String> workingPolicyDays = new Set<String>();
        if (policy.Working_Days__c != null) {
            workingPolicyDays.addAll(policy.Working_Days__c.split(';'));
        }

        Map<String, String> weekdayNameMap = new Map<String, String>{
            '1' => 'Monday',
            '2' => 'Tuesday',
            '3' => 'Wednesday',
            '4' => 'Thursday',
            '5' => 'Friday',
            '6' => 'Saturday',
            '7' => 'Sunday'
        };

        List<DayAttendance__c> dayRecords = new List<DayAttendance__c>();

        for (Contact con : activeContacts) {

            Attendance_Month__c attMonth = monthMap.get(con.Id);

            for (Integer d = 1; d <= totalDays; d++) {

                Date currentDate = Date.newInstance(currentYear, currentMonth, d);

                DayAttendance__c dayAtt = new DayAttendance__c();
                dayAtt.Employee__c = con.Id;
                dayAtt.Date__c = currentDate;
                dayAtt.Day_Status__c = 'Absent';
                dayAtt.Attendance_Month__c = attMonth.Id;
                dayAtt.Name = con.FirstName + ' ' + con.LastName + ' - ' + currentDate.format();

                // Holiday
                if (holidayMap.containsKey(currentDate)) {
                    dayAtt.IsHoliday__c = true;
                    dayAtt.Day_Status__c = 'Holiday';
                    dayAtt.Holiday__c = holidayMap.get(currentDate);
                }

                // Weekend
                String wd = Datetime.newInstance(currentDate, Time.newInstance(0,0,0,0)).format('u');
                String dayName = weekdayNameMap.get(wd);
                if (!workingPolicyDays.contains(dayName)) {
                    dayAtt.IsWeekend__c = true;
                    if (!dayAtt.IsHoliday__c) {
                        dayAtt.Day_Status__c = 'Weekend';
                    }
                }

                dayRecords.add(dayAtt);
            }
        }

        if (!dayRecords.isEmpty()) {
            database.insert(dayRecords, false);
        }
    }

    private static Map<Id, Attendance_Month__c> getAttendanceMonthMap(
        Integer yearValue,
        Integer monthValue,
        List<Contact> conList
    ) {

        Map<Id, Attendance_Month__c> result = new Map<Id, Attendance_Month__c>();

        for (Attendance_Month__c am : [
            SELECT Id, Employee__c
            FROM Attendance_Month__c
            WHERE Year__c = :yearValue
            AND Month__c = :monthValue
            AND Employee__c IN :conList
        ]) {
            result.put(am.Employee__c, am);
        }

        List<Attendance_Month__c> toInsert = new List<Attendance_Month__c>();

        for (Contact con : conList) {
            if (!result.containsKey(con.Id)) {
                toInsert.add(new Attendance_Month__c(
                    Name = 'Attendance ' + monthValue + '/' + yearValue + ' - ' + con.FirstName + ' ' + con.LastName,
                    Month__c = monthValue,
                    Year__c = yearValue,
                    Employee__c = con.Id
                ));
            }
        }

        if (!toInsert.isEmpty()) {
            insert toInsert;
            for (Attendance_Month__c am : toInsert) {
                result.put(am.Employee__c, am);
            }
        }

        return result;
    }

    public static void populateContentMappings(List<Contact> newContacts) {
        // Fetch the specific Account
        Account vortexifyAcc = [
            SELECT Id, Bond_Content_Mapping__c, Letter_Content_Mapping__c
            FROM Account
            WHERE Name = 'VORTEXIFY SOLUTIONS LLP'
            LIMIT 1
        ];
        
        for (Contact con : newContacts) {
            con.Content_Mapping__c = vortexifyAcc.Bond_Content_Mapping__c;
            con.Letter_Content_Mapping__c = vortexifyAcc.Letter_Content_Mapping__c;
        }
    }

    public static void contactLWD(List<contact> conlist){
        for(contact con:conlist){
            if(con.Last_Working_Day__c!=null){
                con.Status__c='Not Available';
            }
        }
    }
}