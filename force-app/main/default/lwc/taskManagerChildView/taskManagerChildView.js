import { LightningElement,track,api,wire} from 'lwc';
import getAllTaskRelatedToContact from "@salesforce/apex/TaskManagerChildViewLWCController.getAllTaskRelatedToContact";
import markStatusAsComplete from "@salesforce/apex/TaskManagerChildViewLWCController.markStatusAsComplete";
import sJob from "@salesforce/apex/TaskManagerChildViewLWCController.startJob";
import endJob from "@salesforce/apex/TaskManagerChildViewLWCController.endJob";
import manualTimeEntry from "@salesforce/apex/TaskManagerChildViewLWCController.manualTimeEntry";
import breakStartEnd from "@salesforce/apex/TaskManagerChildViewLWCController.breakStartEnd";
import updateExtension from "@salesforce/apex/TaskManagerChildViewLWCController.updateExtension";
import getFiles from "@salesforce/apex/TaskManagerChildViewLWCController.getFiles";
import getDependencies from "@salesforce/apex/TaskManagerChildViewLWCController.getDependencies";
import createDependencies from "@salesforce/apex/TaskManagerChildViewLWCController.createDependencies";
import getTeamLeads from "@salesforce/apex/TaskManagerChildViewLWCController.getTeamLeads";
import addJiraComment from '@salesforce/apex/TaskManagerChildViewLWCController.addCommentToTask';
import { refreshApex } from '@salesforce/apex';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import SWEETALERT from '@salesforce/resourceUrl/sweetalert2';


const fileCol = [
    { label: 'Name', fieldName: 'Name',type:'url'},
];

export default class TaskManagerChildView extends LightningElement {
    @api conId;

    @api selectedDate;
    @api selectedMonth;
    @api selectedYear;
    @track selectedJiraTask;
    @track timeIntervalInstance;
    @track currentTimer = '00h:00m:00s';
    @track ManageTaskModal= false;

    fileCol = fileCol;


    @track extensionDetail = {
        extensionTime:0,
        extensionDescription:''
    }

    @track wiredResponse;
    @track tasks = [];
    @track files = [];
    @track teamLeads = [];

    @track dependency = {
        Name:'',
        Depends_on__c:'',
        Task_Description__c:'',
        Jira_Task__c:'',
    }

    @track dependencies = [];
    @track isLoading = true;
    @track showTasks = false;
    @track showMTEPopup = false;
    @track showExtensionPopup = false;
    @track showDependencyPopup = false;
    @track selectedManualTime = 0;
    @track totalMilliseconds = 0;
    @track showFilesTab;
    @track showCommentModal = false;
    @track newComment = '';
    @track breakTimer = '00h:00m:00s';
breakInterval;

breakElapsedMs = 0;
formatMs(ms) {
    const sec = Math.floor(ms / 1000);
    const h = String(Math.floor(sec / 3600)).padStart(2, '0');
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${h}h:${m}m:${s}s`;
}



    renderedCallback() {
        if (this.sweetAlertInitialized) {
          return;
        }
        this.sweetAlertInitialized = true;
      
        Promise.all([
          loadScript(this, SWEETALERT + '/sweetalert2.all.min.js'),
          loadStyle(this, SWEETALERT + '/sweetalert2.min.css')
        ])
          .then(() => {
            console.log('SweetAlert2 loaded');
            if (typeof Swal !== 'undefined') {
              window.Swal = Swal; // make it globally accessible if needed
            }
          })
          .catch(error => {
            console.error('Error loading SweetAlert2:', error);
          });
      }

    handleopencomments() {
        console.log('Opening modal');
        this.showCommentModal = true;
    }

    
    closeCommentModal() {
        this.showCommentModal = false;
        this.newComment = '';
    }
    handleCommentChange(event) {
        this.newComment = event.target.value;
    }
    
    //After successful Apex call, prepend/append the comment to selectedJiraTask.Comments__c so formattedComments rerenders automatically.
    submitComment() {
        if (!this.newComment || !this.selectedJiraTask?.Id) {
            return;
        }

        addJiraComment({
            taskId: this.selectedJiraTask.Id,
            commentText: this.newComment,
            conId: this.conId
        })
            .then(() => {
                // Build comment format exactly like backend
                const timestamp = new Date().toLocaleString();
                const contactName = this.selectedJiraTask.Contact__r?.Name || 'You';

                const newLine = `${this.newComment} || ${contactName} || ${timestamp}`;

                // Append comment locally
                this.selectedJiraTask.Comments__c = this.selectedJiraTask.Comments__c
                    ? `${this.selectedJiraTask.Comments__c}\n${newLine}`
                    : newLine;

                // Close modal & reset
                this.showCommentModal = false;
                this.newComment = '';

                this.showSwalAlert(
                    'Comments',
                    'Your Task Comment has been added successfully.',
                    'success'
                );
            })
            .catch(error => {
                console.error(error);
                this.showSwalAlert('Error', 'Something went wrong!', 'error');
            });
    }

    get formattedComments() {
        if (this.selectedJiraTask && this.selectedJiraTask.Comments__c) {
            return this.selectedJiraTask.Comments__c
                .split('\n')
                .map((line, index) => {
                    let parts = line.split(' || ');
                    return {
                        id: index,
                        text: parts[0]?.trim(),
                        contact: parts[1]?.trim(),
                        timestamp: parts[2]?.trim()
                    };
                });
        }
        return null;
    }
    
    
    
    // get formattedComments() {
    //     if (this.selectedJiraTask && this.selectedJiraTask.Comments__c) {
    //         return this.selectedJiraTask.Comments__c
    //             .split('\n')
    //             .map((text, index) => ({
    //                 id: index,
    //                 text: text.trim(),
    //                 timestamp: new Date().toLocaleString() // You can enhance this
    //             }));
    //     }
    //     return null;
    // }
    
    


    get startButtonClass() {
        return this.selectedJiraTask?.disableStartTime
          ? 'slds-icon_x-small icon-disabled'
          : 'slds-icon_x-small icon-enabled';
      }
      

    @wire(getAllTaskRelatedToContact,{conId:'$conId',selectedDate:'$selectedDate',selectedMonth:'$selectedMonth',selectedYear:'$selectedYear'})
    wiredResult(result){
        console.log('Child View Result---',result);
        console.log('SELECTEDMONTH--',this.selectedMonth);
        console.log('SELECTEDDATE--',this.selectedDate);
        console.log('SELECTEDYEAR--',this.selectedYear);

        this.isLoading = false;
        this.wiredResponse = result;
        this.clearCache();

        if(result.data){
            debugger;
            result.data.forEach((item,index)=>{
                let obj = {...item};
                obj.disableStartBreak =  obj.Status__c=='Dev Completed' || !obj.Actual_Task_Start_Time__c || obj.Status__c=='New'
                //obj.disableEndBreak = !obj.Break_Start_Time__c || !obj.Actual_Task_Start_Time__c || (obj.Total_Break_Time__c && obj.Total_Break_Time__c>0);
                obj.disableEndBreak = obj.Status__c == 'Dev Completed' || !obj.Break_Start_Time__c || !obj.Actual_Task_Start_Time__c || (obj.Total_Break_Time__c && obj.Total_Break_Time__c > 0);
                obj.startTimeStyle = obj.Status__c == 'In Progress' ? 'success':'brand';
                obj.disableStartTime  = obj.Actual_Task_Start_Time__c || obj.Status__c=='Dev Completed';
                obj.endDisableStartTime = obj.Status__c=='Dev Completed' || (obj.Break_Start_Time__c && !obj.Break_End_Time__c) || obj.Actual_Task_End_Time__c!=null || !obj.Actual_Task_Start_Time__c;
                obj.disableManualTimeEntry = obj.Status__c == 'Dev Completed' || (obj.Break_Start_Time__c && !obj.Break_End_Time__c);
                obj.disableAskForExtension = obj.Status__c == 'Dev Completed' || (obj.Break_Start_Time__c && !obj.Break_End_Time__c);
                obj.estimatedHrs = 'Estimated Hours: '+obj.Estimated_Efforts__c + 'hrs';
                if(obj.Actual_Task_Start_Time__c && !obj.Actual_Task_End_Time__c){
                    debugger;
                    console.log('obj.Actual_Task_Start_Time__c',obj.Actual_Task_Start_Time__c);

                    let cTime = new Date();
                    let istTime = new Date(obj.Actual_Task_Start_Time__c);

                    let diffTime = 0;

                    if(obj.Break_Start_Time__c && !obj.Break_End_Time__c){
                        let bStartTime = new Date(obj.Break_Start_Time__c);

                        let diffBtwStartTimeAndBreakStartTime = bStartTime.getTime() - istTime.getTime();
                        diffTime = diffBtwStartTimeAndBreakStartTime;

                    }else if(obj.Break_Start_Time__c && obj.Break_End_Time__c){
                        let bStartTime = new Date(obj.Break_Start_Time__c);
                        let bEndTime = new Date(obj.Break_End_Time__c);

                        diffTime = cTime.getTime() - istTime.getTime() - (bEndTime.getTime() - bStartTime.getTime());
                    }else{
                        diffTime = cTime.getTime() - istTime.getTime();   
                    }
                    
                    obj.longStartTime = diffTime;
                }else if(obj.Actual_Task_Start_Time__c && obj.Actual_Task_End_Time__c){

                    let starTime = new Date(obj.Actual_Task_Start_Time__c);
                    let endTime = new Date(obj.Actual_Task_End_Time__c);
                    let diffTime = 0;

                    if(obj.Break_Start_Time__c && obj.Break_End_Time__c){
                        let bStartTime = new Date(obj.Break_Start_Time__c);
                        let bEndTime = new Date(obj.Break_End_Time__c);

                        diffTime = ((endTime.getTime() - (bEndTime.getTime() - bStartTime.getTime())) - starTime.getTime());
                    }else{
                        diffTime = endTime.getTime() - starTime.getTime();
                    }
                    obj.longStartTime = diffTime;
                }

              
                debugger;
                if(this.selectedJiraTask){
                    obj.selected = this.selectedJiraTask.Id==obj.Id; 
                }else{
                    obj.selected = index==0;
                }
                obj.disableMarkAsCompleted = obj.Status__c=='Dev Completed' || (obj.Break_Start_Time__c && !obj.Break_End_Time__c) || !obj.Actual_Task_End_Time__c;

                console.log('longStartTime',obj);
                this.tasks.push(obj);
            })
            
            this.showTasks = this.tasks.length>0;
            this.selectedJiraTask = this.tasks.find(item=>item.selected);
            if(!this.selectedJiraTask && this.tasks.length>0 ){
                debugger;
                this.tasks[0].selected = true;
                this.selectedJiraTask = this.tasks[0];
            }

            if(this.selectedJiraTask){

                if(this.selectedJiraTask.Actual_Task_Start_Time__c){
                    debugger;
                    if((this.selectedJiraTask.Break_Start_Time__c && !this.selectedJiraTask.Break_End_Time__c) || (this.selectedJiraTask.Actual_Task_Start_Time__c && this.selectedJiraTask.Actual_Task_End_Time__c)){
                        this.setPauseTimer(this.selectedJiraTask.longStartTime);
                        this.stopTimer();
                    }else {
                        this.configureTimer(this.selectedJiraTask.longStartTime);
                    }
                }else{
                    this.resetTimer();
                }
                this.showFiles();
                this.fetchTeamLeads();
                this.showDependencies();
            }
            
            this.selectedManualTime = 0;
            if(this.tasks.length>0 ){
            this.ManageTaskModal = true;
            }
        }
    }

    clearCache(){
        this.tasks = [];
        this.files = [];
        this.dependencies = [];
        this.teamLeads = [];
        this.dependency = {
            Name:'',
            Depends_on__c:'',
            Task_Description__c:'',
            Jira_Task__c:'',
        }
    }


    manualTimeChangeHandler(event){
        this.selectedManualTime = event.target.value;
    }

    taskClicked(event){
        debugger;
        let jiraTaskId = event.currentTarget.dataset.id;
        let prevIndex = this.tasks.findIndex(item=>item.selected);
        this.tasks[prevIndex].selected = false;

        let selectedIndex = this.tasks.findIndex(item=>item.Id==jiraTaskId);
        this.tasks[selectedIndex].selected = true;
        this.selectedJiraTask = this.tasks[selectedIndex];


        if(this.selectedJiraTask.longStartTime){

            let cTime = new Date();
            let istTime = new Date(this.selectedJiraTask.Actual_Task_Start_Time__c);

            let diffTime = 0;
            if(this.selectedJiraTask.Break_Start_Time__c && !this.selectedJiraTask.Break_End_Time__c){
                let bStartTime = new Date(this.selectedJiraTask.Break_Start_Time__c);

                let diffBtwStartTimeAndBreakStartTime = bStartTime.getTime() - istTime.getTime();
                diffTime = diffBtwStartTimeAndBreakStartTime;

            }else if(this.selectedJiraTask.Break_Start_Time__c && this.selectedJiraTask.Break_End_Time__c){
                let bStartTime = new Date(this.selectedJiraTask.Break_Start_Time__c);
                let bEndTime = new Date(this.selectedJiraTask.Break_End_Time__c);

                diffTime = cTime.getTime() - istTime.getTime() - (bEndTime.getTime() - bStartTime.getTime());
            }else{
                diffTime = cTime.getTime() - istTime.getTime();   
            }
                    
            this.selectedJiraTask.longStartTime = diffTime;
            if(!this.selectedJiraTask.Actual_Task_Start_Time__c){
                this.resetTimer();
            }else if((this.selectedJiraTask.Break_Start_Time__c && !this.selectedJiraTask.Break_End_Time__c) || (this.selectedJiraTask.Actual_Task_Start_Time__c && this.selectedJiraTask.Actual_Task_End_Time__c)){
                this.setPauseTimer(this.selectedJiraTask.longStartTime);
                this.stopTimer();
            }else {
                this.configureTimer(this.selectedJiraTask.longStartTime);
            }
        }else{
            this.resetTimer();
        }

        this.files = [];
    }

    resetTimer(){
        this.currentTimer = '00h:00m:00s';
        this.totalMilliseconds = 0;
        clearInterval(this.timeIntervalInstance);
    }

    stopTimer(){
        this.totalMilliseconds = 0;
        clearInterval(this.timeIntervalInstance);
    }

    extensionChangeHandler(event){
        let id = event.target.name;
        let value = event.target.value;

        this.extensionDetail[id] = value;
    }

    startJob(){
        debugger;
        this.isLoading = true;
        let params = {taskId:this.selectedJiraTask.Id,conId:this.conId,selectedDate:this.selectedDate,selectedMonth:this.selectedMonth,selectedYear:this.selectedYear,prmId:this.selectedJiraTask.Project_Resource_Mapping__c};
        console.log('Params---',params);

        sJob(params)
        .then(result=>{
            this.isLoading = false;
            console.log('Job Started Result--',result);
            if(result=='Success'){
                this.showSwalAlert('Success', 'Job Started!', 'success');
                //this.showNotification('Success','Job Started!','success');
                refreshApex(this.wiredResponse);
            }else{
                this.showSwalAlert('Error', result, 'Error');
                //this.showNotification('Error',result,'error');
            }
        })
        .catch(error=>{
            console.log(` this  is error from startJob`,error);
        })
    }

    endJob() {
    this.isLoading = true;

    

    endJob({
        teliId: this.selectedJiraTask.Time_Entry_Line_Items__r[0].Id,
        taskId: this.selectedJiraTask.Id
    })
    /*.then(result => {
        this.isLoading = false;

        if (result === 'Success') {
            this.showSwalAlert('Success', 'Job ended Successfully!', 'success');
            refreshApex(this.wiredResponse);
        } else {
            this.showSwalAlert('Error', result, 'error');
        }*/

        .then(result => {
    this.isLoading = false;

    if (result === 'Success') {

        // ✅ FREEZE BREAK TIME (JUST LIKE TOTAL TIME)
        if (this.selectedJiraTask.Total_Break_Time__c) {
            const finalBreakMs = this.selectedJiraTask.Total_Break_Time__c * 60 * 1000;
            this.freezeBreakTimer(finalBreakMs);
        } else {
            clearInterval(this.breakInterval);
        }

        this.showSwalAlert('Success', 'Job ended Successfully!', 'success');

        // refresh AFTER freezing
        refreshApex(this.wiredResponse);
    } else {
        this.showSwalAlert('Error', result, 'error');
    }


    })
    .catch(error => {
        this.isLoading = false;
        console.error(error);
    });
}

restoreBreakAfterRefresh() {
    clearInterval(this.breakInterval);

    const task = this.selectedJiraTask;
    if (!task) return;

    // ✅ CASE 1: Break completed (task ended or break ended)
    if (task.Break_Start_Time__c && task.Break_End_Time__c) {
        const start = new Date(task.Break_Start_Time__c);
        const end = new Date(task.Break_End_Time__c);

        const diffMs = end.getTime() - start.getTime();

        this.breakElapsedMs = diffMs;
        this.breakTimer = this.formatMs(diffMs);
        return;
    }

    // ✅ CASE 2: Break running
    if (task.Break_Start_Time__c && !task.Break_End_Time__c) {
        const start = new Date(task.Break_Start_Time__c);

        this.breakInterval = setInterval(() => {
            const now = new Date();
            const diffMs = now.getTime() - start.getTime();
            this.breakElapsedMs = diffMs;
            this.breakTimer = this.formatMs(diffMs);
        }, 1000);
        return;
    }

    // ✅ CASE 3: No break taken
    this.breakElapsedMs = 0;
    this.breakTimer = '00h:00m:00s';
}



    // endJob(){
    //     this.isLoading = true;
    //     endJob({teliId:this.selectedJiraTask.Time_Entry_Line_Items__r[0].Id,taskId:this.selectedJiraTask.Id}).then(result=>{
    //         this.isLoading = false;
    //         if(result=='Success'){
    //             this.showSwalAlert('Success', 'Job ended Successfully!', 'success');
    //             //this.showNotification('Success','Job ended Successfully!','success');
    //             refreshApex(this.wiredResponse);
    //         }else{
    //             this.showSwalAlert('Error', result, 'error');
    //             //this.showNotification('Failed',result,'error');
    //         }
    //     })
    // }

    // markAsComplete(){
    //     this.isLoading = true;
    //     markStatusAsComplete({taskId:this.selectedJiraTask.Id}).then(result=>{
    //         this.isLoading = false;
    //         console.log('Result---',result);
    //         if(result=='Success'){
    //             this.showNotification('Success','Job marked as completed!','success');
    //             refreshApex(this.wiredResponse);
    //         }else{
    //             this.showNotification('Failed',result,'error');
    //         }
    //     })
    // }

    markAsComplete() {
    this.isLoading = true;

    markStatusAsComplete({ taskId: this.selectedJiraTask.Id })
        .then(result => {
            this.isLoading = false;

            if (result === 'Success') {

                // IMMEDIATE UI LOCK
                this.selectedJiraTask = {
                    ...this.selectedJiraTask,
                    Status__c: 'Dev Completed',
                    disableStartBreak: true,
                    disableEndBreak: true,
                    disableStartTime: true,
                    endDisableStartTime: true,
                    disableManualTimeEntry: true,
                    disableAskForExtension: true,
                    disableMarkAsCompleted: true
                };

                this.showSwalAlert(
                    'Success',
                    'Task marked as Dev Completed',
                    'success'
                );

                // Sync with backend
                refreshApex(this.wiredResponse);

            } else {
                this.showSwalAlert('Error', result, 'error');
            }
        })
        .catch(error => {
            this.isLoading = false;
            console.error(error);
            this.showSwalAlert('Error', 'Something went wrong', 'error');
        });
}


    manualTimeBtnClicked(){
        this.showMTEPopup = true;
    }

    askExtensionBtnClicked(){
        this.showExtensionPopup = true;
    }

    closeAskExtensionBtnClicked(){
        this.showExtensionPopup = false;
    }

    closeManualTimeBtnClicked(){
        this.showMTEPopup = false;
        this.selectedManualTime = 0;
    }

    closeManageTask(){
        this.ManageTaskModal = false; 
    }

    

    fillManualTimeEntry(){
        if(!this.selectedManualTime || this.selectedManualTime==0){
            this.showNotification('Failed','Please enter time taken by you.','error');
            return;
        }

        this.isLoading = true;
        manualTimeEntry({taskId:this.selectedJiraTask.Id,conId:this.conId,selectedDate:this.selectedDate,selectedMonth:this.selectedMonth,selectedYear:this.selectedYear,usedHours:this.selectedManualTime,prmId:this.selectedJiraTask.Project_Resource_Mapping__c}).then(result=>{
            this.isLoading = false;
            if(result=='Success'){
                this.showMTEPopup = false;
                this.showNotification('Success','Time Updated Sucessfully!','success');
                refreshApex(this.wiredResponse);
            }else{
                this.showNotification('Failed',result,'error');
            }
        })
    }

    updateTimeExtension(){
        console.log('extensionDetail---',this.extensionDetail);
        if(!this.extensionDetail.extensionTime || this.extensionDetail.extensionTime==0){
            this.showNotification('Error','Please fill extension time','error');
            return;
        }

        if(!this.extensionDetail.extensionDescription){
            this.showNotification('Failed','Please fill description','error');
            return;
        }

        this.isLoading = true;

        updateExtension({taskId:this.selectedJiraTask.Id,timeAskedFor:this.extensionDetail.extensionTime,extensionReason:this.extensionDetail.extensionDescription,estimatedHours:this.selectedJiraTask.Estimated_Efforts__c}).then(result=>{
            this.isLoading = false;

            if(result=='Success'){
                this.showNotification('Success','New Extension created for this task','success');
                this.showExtensionPopup = false;
                this.extensionDetail = {extensionTime:0,extensionDescription:''};
                refreshApex(this.wiredResponse);
            }else{
                this.showNotification('Failed',result,'error');
            }
        })

    }

    // startBreak(){
    //     debugger;
    //     if(this.selectedJiraTask.Total_Break_Time__c && this.selectedJiraTask.Total_Break_Time__c>5){
    //         this.showNotification('Failed','Oppss, Break time can only be taken at once 😥','error');
    //         return;
    //     }
    //     breakStartEnd({taskId:this.selectedJiraTask.Id,breakType:'startBreak'}).then(result=>{
    //         if(result=='Success'){
    //             this.showNotification('Success','Break Time Started','success');
    //             refreshApex(this.wiredResponse);
    //         }else{
    //             this.showNotification('Failed',result,'error');
    //         }
    //     });
    // }

//     startBreak() {
//     if (this.selectedJiraTask.Total_Break_Time__c && this.selectedJiraTask.Total_Break_Time__c > 5) {
//         this.showNotification('Failed', 'Oppss, Break time can only be taken at once 😥', 'error');
//         return;
//     }

//     // UI change immediately
//     this.selectedJiraTask.disableStartBreak = true;
//     this.selectedJiraTask.disableEndBreak = false;

//     breakStartEnd({
//         taskId: this.selectedJiraTask.Id,
//         breakType: 'startBreak'
//     })
//     .then(result => {
//         if (result === 'Success') {
//             //this.showNotification('Success', 'Break Time Started', 'success');
//             refreshApex(this.wiredResponse);
//         } else {
//             // rollback UI on failure
//             this.selectedJiraTask.disableStartBreak = false;
//             this.selectedJiraTask.disableEndBreak = true;

//            // this.showNotification('Failed', result, 'error');
//         }
//     })
//     .catch(error => {
//         // rollback on error
//         this.selectedJiraTask.disableStartBreak = false;
//         this.selectedJiraTask.disableEndBreak = true;
//         console.error(error);
//     });
// }



    // endBreak(){
    //      breakStartEnd({taskId:this.selectedJiraTask.Id,breakType:'endBreak'}).then(result=>{
    //         if(result=='Success'){
    //             this.showNotification('Success','Break Time Ended','success');
    //             refreshApex(this.wiredResponse);
    //         }else{
    //             this.showNotification('Failed',result,'error');
    //         }
    //     });
    // }

//     endBreak() {
//     // UI change immediately
//     this.selectedJiraTask.disableStartBreak = false;
//     this.selectedJiraTask.disableEndBreak = true;

//     breakStartEnd({
//         taskId: this.selectedJiraTask.Id,
//         breakType: 'endBreak'
//     })
//     .then(result => {
//         if (result === 'Success') {
//            // this.showNotification('Success', 'Break Time Ended', 'success');
//             refreshApex(this.wiredResponse);
//         } else {
//             // rollback on failure
//             this.selectedJiraTask.disableStartBreak = true;
//             this.selectedJiraTask.disableEndBreak = false;

//             //this.showNotification('Failed', result, 'error');
//         }
//     })
//     .catch(error => {
//         // rollback on error
//         this.selectedJiraTask.disableStartBreak = true;
//         this.selectedJiraTask.disableEndBreak = false;
//         console.error(error);
//     });
// }

//**** */
   /* startBreak() {
    if (this.selectedJiraTask.disableStartBreak) {
        return;
    }

    // Start disable, Stop enable (FORCE)
    this.selectedJiraTask = {
        ...this.selectedJiraTask,
        disableStartBreak: true,
        disableEndBreak: false
    };

    breakStartEnd({
        taskId: this.selectedJiraTask.Id,
        breakType: 'startBreak'
    })
    .then(result => {
        if (result !== 'Success') {
            this.selectedJiraTask = {
                ...this.selectedJiraTask,
                disableStartBreak: false,
                disableEndBreak: true
            };
        }
    })
    .catch(error => {
        this.selectedJiraTask = {
            ...this.selectedJiraTask,
            disableStartBreak: false,
            disableEndBreak: true
        };
        console.error(error);
    });
}*/

freezeBreakTimer(finalMs) {
    clearInterval(this.breakInterval);
    this.breakElapsedMs = finalMs;
    this.breakTimer = this.formatMs(finalMs);
}

startBreak() {
    if (this.selectedJiraTask.disableStartBreak) {
        return;
    }

    /* ========= RESUME-SAFE BREAK TIMER ========= */
    // Start time = NOW minus already elapsed time
    this.breakStartTime = new Date(Date.now() - this.breakElapsedMs);

    clearInterval(this.breakInterval);
    this.breakInterval = setInterval(() => {
        const now = new Date();
        this.breakElapsedMs = now.getTime() - this.breakStartTime.getTime();
        this.breakTimer = this.formatMs(this.breakElapsedMs);
    }, 1000);
    /* =========================================== */

    // UI toggle (keep your logic)
    this.selectedJiraTask = {
        ...this.selectedJiraTask,
        disableStartBreak: true,
        disableEndBreak: false
    };

    breakStartEnd({
        taskId: this.selectedJiraTask.Id,
        breakType: 'startBreak'
    })
    .then(result => {
        if (result !== 'Success') {
            clearInterval(this.breakInterval);

            this.selectedJiraTask = {
                ...this.selectedJiraTask,
                disableStartBreak: false,
                disableEndBreak: true
            };
        }
    })
    .catch(error => {
        clearInterval(this.breakInterval);

        this.selectedJiraTask = {
            ...this.selectedJiraTask,
            disableStartBreak: false,
            disableEndBreak: true
        };
        console.error(error);
    });
}



    endBreak() {
         clearInterval(this.breakInterval);
    this.selectedJiraTask = {
        ...this.selectedJiraTask,
        disableStartBreak: false,
        disableEndBreak: true
    };

    breakStartEnd({
        taskId: this.selectedJiraTask.Id,
        breakType: 'endBreak'
    })
    .then(result => {
        if (result !== 'Success') {
            this.selectedJiraTask = {
                ...this.selectedJiraTask,
                disableStartBreak: true,
                disableEndBreak: false
            };
        }
    })
    .catch(error => {
        this.selectedJiraTask = {
            ...this.selectedJiraTask,
            disableStartBreak: true,
            disableEndBreak: false
        };
        console.error(error);
    });
}

disableBreakButtonsCompletely() {
    this.selectedJiraTask = {
        ...this.selectedJiraTask,
        disableStartBreak: true,
        disableEndBreak: true
    };
}




    showFiles(){

        this.showFilesTab = true;
        getFiles({taskId:this.selectedJiraTask.Id}).then(result=>{
            if(result){
                console.log('Files---',result);
                this.files = result;
            }
        })
    }

    fetchTeamLeads(){
        getTeamLeads({conId:this.conId}).then(result=>{
            if(result){
                let leads = [];
                result.forEach(con=>{
                    leads.push({label:con.Name,value:con.Id});
                })
                this.teamLeads = leads;
            }
        })
    }
    showDependencies(){
        this.isLoading = true;
        getDependencies({taskId:this.selectedJiraTask.Id}).then(result=>{
            this.isLoading = false;
            this.dependencies = result;
            console.log('Dependencies fetched -- ',result);
        }).catch(error=>{
            this.isLoading = false;
            console.log('Error to fetch dependencies');
            this.showNotification('Error',error,'error');
        })
    }

    redirectFile(event){
        let fileId = event.currentTarget.dataset.id;
        let baseUrl = window.location.origin;
        let fileUrl = `${baseUrl}/servlet/servlet.FileDownload?file=`+fileId;
        //let fileUrl = 'https://sales-production--sales.sandbox.file.force.com/servlet/servlet.FileDownload?file='+fileId;
        window.open(fileUrl, '_blank');
    }

    dependencyInputHandler(event){
        debugger;
        let fName = event.target.name;
        let value = event.target.value;
        this.dependency[fName] = value;
    }

    createDependency(){
        this.showDependencyPopup = true;
    }

    closeDependencyPopup(){
        this.showDependencyPopup = false;
    }

    submitDependency(){
        this.isLoading = true;
        this.dependency.Jira_Task__c = this.selectedJiraTask.Id;

        if(!this.dependency.Name){
            this.showNotification('Failed','Please choose name','error');
            return;
        }
        if(!this.dependency.Depends_on__c){
            this.showNotification('Failed','Please choose dependency on','error');
            return;
        }

        createDependencies({dp:this.dependency}).then(result=>{
            debugger;
            console.log('Dependency created ----',result);
            this.showNotification('Success','Dependency Created Successfully!','success');
            this.isLoading = false;
            this.dependencies.push(result);
            this.closeDependencyPopup();
            this.dependency = {
                Name:'',
                Depends_on__c:'',
                Task_Description__c:'',
                Jira_Task__c:'',
            }
            refreshApex(this.wiredResponse);
        }).catch(error=>{
            console.log('Error to create dependency--',error);
        })
    }


    configureTimer(timeInLong){
        
        var parentThis = this;
        parentThis.totalMilliseconds = timeInLong;
        
        this.timeIntervalInstance = setInterval(function() {

            var hours = parentThis.zeroPadding(Math.floor((parentThis.totalMilliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
            var minutes = parentThis.zeroPadding(Math.floor((parentThis.totalMilliseconds % (1000 * 60 * 60)) / (1000 * 60)));
            var seconds = parentThis.zeroPadding(Math.floor((parentThis.totalMilliseconds % (1000 * 60)) / 1000));
        
            parentThis.currentTimer = hours + "h:" + minutes + "m:" + seconds+'s';       
            parentThis.totalMilliseconds += 100;
        }, 100); 
    }

    setPauseTimer(timeInLong){
        var parentThis = this;
        parentThis.totalMilliseconds = timeInLong;

        var hours = parentThis.zeroPadding(Math.floor((parentThis.totalMilliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
        var minutes = parentThis.zeroPadding(Math.floor((parentThis.totalMilliseconds % (1000 * 60 * 60)) / (1000 * 60)));
        var seconds = parentThis.zeroPadding(Math.floor((parentThis.totalMilliseconds % (1000 * 60)) / 1000));
    
        parentThis.currentTimer = hours + "h:" + minutes + "m:" + seconds+'s';       
    }

    zeroPadding(num){
        console.log('NUMBER CHOOSED----',num);
        if(num){
            return num.toString().length==1? `0${num}`:num;
        }
        return '00';
    }


    showNotification(title,message,variant){
        alert(title+' '+message);
        // const evt = new ShowToastEvent({
        //     title: title,
        //     message: message,
        //     variant: variant,
        // });
        // this.dispatchEvent(evt);
    }

    showSwalAlert(title, message, icon) {
        if (window.Swal) {
          Swal.fire({
            title: title,
            text: message,
            icon: icon, // 'success', 'error', 'warning', 'info', 'question'
            confirmButtonText: 'OK',
            position: 'center',
            backdrop: true,
            allowOutsideClick: false,

          });
        } else {
          console.error('Swal not loaded');
        }
      }
    updateBreakButtons(isOnBreak) {
    this.selectedJiraTask = {
        ...this.selectedJiraTask,
        disableStartBreak: isOnBreak,
        disableEndBreak: !isOnBreak
    };
}

}