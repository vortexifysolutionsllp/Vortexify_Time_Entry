global class MonthlyCardCreationBatch implements Database.Batchable<sObject>
{
    global Database.QueryLocator start(Database.BatchableContext BC)
    {
        String query =
            'SELECT Id, Name, Project__c, Project__r.Name, Contact__r.Name ' +
            'FROM Project_Resource_Mapping__c ' +
            'WHERE Card_Created__c = false';

        return Database.getQueryLocator(query);
    }

    global void execute(Database.BatchableContext BC, List<Project_Resource_Mapping__c> projectList)
    {
        String currentMonth = Datetime.now().format('MMMM');

        List<Time_Entry_Monthly_Card__c> monthlyCards = new List<Time_Entry_Monthly_Card__c>();
        List<Time_Entry_Weekly_Card__c> weeklyCards = new List<Time_Entry_Weekly_Card__c>();
        List<Time_Entry_Daily_Card__c> dailyCards = new List<Time_Entry_Daily_Card__c>();

        Map<Id, String> projectNameByPRMId = new Map<Id, String>();

        // Month dates
        Date firstDayOfMonth = System.today().toStartOfMonth();
        Date endDate = firstDayOfMonth.addDays(
            Date.daysInMonth(firstDayOfMonth.year(), firstDayOfMonth.month()) - 1
        );

        Integer noOfDaysRemaining = firstDayOfMonth.daysBetween(endDate);
        Integer numberOfWeek = 0;

        if(noOfDaysRemaining > 28 && noOfDaysRemaining < 32){
            numberOfWeek = 5;
        }else if(noOfDaysRemaining > 21){
            numberOfWeek = 4;
        }else if(noOfDaysRemaining > 14){
            numberOfWeek = 3;
        }else if(noOfDaysRemaining > 7){
            numberOfWeek = 2;
        }else{
            numberOfWeek = 1;
        }

        // Project names
        for(Project_Resource_Mapping__c prm : projectList){
            projectNameByPRMId.put(prm.Id, prm.Project__r.Name);
        }

        // ===== CREATE MONTHLY CARDS =====
        List<Time_Entry_Monthly_Card__c> existingMonthlyCards = [SELECT Id, Name, Month_Start_Date__c, Month_End_Date__c, Project_Resource_Mapping__c FROM Time_Entry_Monthly_Card__c WHERE Month_Start_Date__c = :firstDayOfMonth AND Month_End_Date__c = :endDate];
        Set<Id> existingMonthlyCardPRMIds = new Set<Id>();
        if(existingMonthlyCards?.size()>0){
            for(Time_Entry_Monthly_Card__c tec : existingMonthlyCards){
            existingMonthlyCardPRMIds.add(tec.Project_Resource_Mapping__c);
        }
        }
        for(Project_Resource_Mapping__c prm : projectList){
            if(existingMonthlyCardPRMIds.contains(prm.Id)){
                continue;
            }
            Time_Entry_Monthly_Card__c monthCard = new Time_Entry_Monthly_Card__c();
            monthCard.Name = prm.Contact__r.Name + '-' + projectNameByPRMId.get(prm.Id) + '-' + currentMonth + ' Card';
            monthCard.Month_Start_Date__c = firstDayOfMonth;
            monthCard.Month_End_Date__c = endDate;
            monthCard.Project_Resource_Mapping__c = prm.Id;
            monthlyCards.add(monthCard);
        }

        insert monthlyCards;

        Map<Id, Time_Entry_Monthly_Card__c> monthCardByPRM = new Map<Id, Time_Entry_Monthly_Card__c>();
        for(Integer i = 0; i < projectList.size(); i++){
            monthCardByPRM.put(projectList[i].Id, monthlyCards[i]);
        }

        // ===== CREATE WEEKLY CARDS =====
        for(Project_Resource_Mapping__c prm : projectList){
            Integer weekNum = 0;

            for(Integer i = 0; i < numberOfWeek; i++){
                weekNum++;

                Time_Entry_Weekly_Card__c weekCard = new Time_Entry_Weekly_Card__c();
                weekCard.Name = 'Week - ' + weekNum;

                if(weekNum == 1){
                    weekCard.Week_Start_Date__c = firstDayOfMonth;
                    weekCard.Week_End_Date__c = firstDayOfMonth.addDays(6);
                }
                else if(weekNum == 5){
                    weekCard.Week_Start_Date__c = firstDayOfMonth.addDays(7 * (weekNum - 1));
                    weekCard.Week_End_Date__c = endDate;
                }
                else{
                    weekCard.Week_Start_Date__c = firstDayOfMonth.addDays(7 * (weekNum - 1));
                    weekCard.Week_End_Date__c = firstDayOfMonth.addDays((7 * weekNum) - 1);
                }

                weekCard.Time_Entry_Monthly_Card__c =
                    monthCardByPRM.get(prm.Id).Id;

                weeklyCards.add(weekCard);
            }
        }

        insert weeklyCards;

        // ===== CREATE DAILY CARDS =====
        for(Time_Entry_Weekly_Card__c week : weeklyCards){
            for(
                Date d = week.Week_Start_Date__c;
                d <= week.Week_End_Date__c;
                d = d.addDays(1)
            ){
                Time_Entry_Daily_Card__c daily = new Time_Entry_Daily_Card__c();
                daily.Name = 'Daily Card - ' + d.format();
                daily.Date_Of_Work__c = d;
                daily.Time_Entry_Weekly_Card__c = week.Id;
                dailyCards.add(daily);
            }
        }

        if(!dailyCards.isEmpty()){
            insert dailyCards;
        }
    }

    global void finish(Database.BatchableContext BC) {
        // Optional: update Card_Created__c = true
    }
}