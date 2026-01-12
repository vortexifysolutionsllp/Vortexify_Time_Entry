public with sharing class EmployeeManagementController {
     @AuraEnabled(cacheable=true)
    public static Decimal getMonthlyWorkHours(Id contactId, Integer month) {
    if(contactId == null || month == null) return 0;
    
    Date startOfMonth = Date.newInstance(Date.today().year(), month, 1);
    Date endOfMonth = startOfMonth.addMonths(1).addDays(-1);

    List<Jira_Task__c> tasks = [
        SELECT Id, Total_Utilised_Time__c,Task_Start_Date__c,Project__c
        FROM Jira_Task__c
        WHERE Team_Member__c = :contactId
          AND Actual_Task_Start_Time__c >= :startOfMonth
          AND Actual_Task_Start_Time__c <= :endOfMonth
          AND Total_Utilised_Time__c != NULL
    ];

    Decimal totalHours = 0;
    for(Jira_Task__c task : tasks) {
        if(task.Total_Utilised_Time__c != null) {
            totalHours += task.Total_Utilised_Time__c;
        }
    }
 
   return totalHours.setScale(2);
}

   /* public static Decimal getMonthlyWorkHours(Id contactId, Integer month) {
        if(contactId == null || month == null) return 0;
        
        Date startOfMonth = Date.newInstance(Date.today().year(), month, 1);
        Date endOfMonth = startOfMonth.addMonths(1).addDays(-1);

        List<Jira_Task__c> tasks = [
            SELECT Id, Actual_Task_Start_Time__c, Actual_Task_End_Time__c,
            FROM Jira_Task__c
            WHERE Team_Member__c = :contactId
              AND Actual_Task_Start_Time__c >= :startOfMonth
              AND Actual_Task_Start_Time__c <= :endOfMonth
              AND Actual_Task_End_Time__c != NULL
              AND Actual_Task_Start_Time__c != NULL
        ];

        Decimal totalHours = 0;
        for(Jira_Task__c task : tasks) {
            if(task.Actual_Task_Start_Time__c != null && task.Actual_Task_End_Time__c != null) {
                Long diffMillis = task.Actual_Task_End_Time__c.getTime() - task.Actual_Task_Start_Time__c.getTime();
                Decimal diffHours = (Decimal)diffMillis / (1000 * 60 * 60);
                totalHours += diffHours;
            }
        }
        return totalHours.setScale(2);
    } */
    


    public class HolidayWrapper {
        @AuraEnabled public Id Id {get; set;}
        @AuraEnabled public String Name {get; set;}
        @AuraEnabled public Date StartDate {get; set;}
        @AuraEnabled public Date EndDate {get; set;}
        @AuraEnabled public String Type {get; set;}
        @AuraEnabled public String Reason {get; set;}
        @AuraEnabled public String Status {get; set;}
        @AuraEnabled public Integer DaysInMonth {get; set;} // total days of this holiday in given month
    }

    @AuraEnabled(cacheable=true)
    public static List<HolidayWrapper> employeeHolidayMethod(Id conID, Integer MonthNumber) {
        List<Holiday__c> empHolidayList = [
            SELECT Id, Holiday_Name__c, Contact__c, End_Date__c, Type__c, 
                   Reason__c, Status__c, Start_Date__c, Number_of_days__c
            FROM Holiday__c 
            WHERE Contact__c = :conID
        ];

        List<HolidayWrapper> result = new List<HolidayWrapper>();

        for (Holiday__c empHoliDay : empHolidayList) {
            if (empHoliDay.Start_Date__c != null && empHoliDay.End_Date__c != null) {
                 if (empHoliDay.Type__c != 'Sick Leave' && empHoliDay.Type__c != 'Casual Leave') {
                continue; // skip this holiday
            }
                Date startDate = empHoliDay.Start_Date__c;
                Date endDate   = empHoliDay.End_Date__c;

                Integer daysInMonth = 0;

                for (Date d = startDate; d <= endDate; d = d.addDays(1)) {
                    if (d.month() == MonthNumber) {
                        daysInMonth++;
                    }
                }

                if (daysInMonth > 0) {
                    HolidayWrapper hw = new HolidayWrapper();
                    hw.Id = empHoliDay.Id;
                    hw.Name = empHoliDay.Holiday_Name__c;
                    hw.StartDate = startDate;
                    hw.EndDate = endDate;
                    hw.Type = empHoliDay.Type__c;
                    hw.Reason = empHoliDay.Reason__c;
                    hw.Status = empHoliDay.Status__c;
                    hw.DaysInMonth = daysInMonth;
                    result.add(hw);
                }
            }
        }
        return result;
    }


   




   @AuraEnabled(cacheable=true)
public static List<Jira_Task__c> getTasks(Id conID, Integer MonthNumber){
    try {
        List<Jira_Task__c> taskList = [
            SELECT Id, Name, Status__c, Actual_Task_Start_Time__c, Actual_Task_End_Time__c,Task_Start_Date__c
            FROM Jira_Task__c
            WHERE Team_Member__c = :conID ORDER BY Task_Start_Date__c DESC
        ];

        List<Jira_Task__c> filteredTasks = new List<Jira_Task__c>();
        for(Jira_Task__c task : taskList) {
            if(task.Actual_Task_Start_Time__c != null && task.Actual_Task_Start_Time__c.month() == MonthNumber) {
                filteredTasks.add(task);
            }
        }
        return filteredTasks;
    } catch (Exception e) {
        throw new AuraHandledException(e.getMessage());
    }
}

@AuraEnabled (cacheable=true)
public static List<DayAttendance__c> getEmployeeAttendance(Id conID, Integer MonthNumber){
    try {
        List<DayAttendance__c> attendanceList = [
            SELECT Id, Name,FirstCheckIn__c, LastCheckOut__c,Date__c
            FROM DayAttendance__c
            WHERE Employee__c= :conID ORDER BY Date__c DESC
        ];

        List<DayAttendance__c> filteredAttendance = new List<DayAttendance__c>();
        for(DayAttendance__c attendance : attendanceList) {
            if(attendance.Date__c != null && attendance.Date__c.month() == MonthNumber && attendance.FirstCheckIn__c!= null) {
            //    String formattedCheckIn = attendance.Check_In__c != null 
            // ? Datetime.newInstance(attendance.Date__c,attendance.Check_In__c)
            //           .format('hh:mm a', 'Asia/Kolkata')
            // : '';
            // System.debug('Data '+formattedCheckIn);
                filteredAttendance.add(attendance);
            } 
        }
        System.debug('filteredAttendance' +filteredAttendance);
        return filteredAttendance;
    } catch (Exception e) {
        throw new AuraHandledException(e.getMessage());
    }
}
}