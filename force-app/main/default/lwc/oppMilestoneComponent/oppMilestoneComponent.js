import { LightningElement,wire,track,api } from 'lwc';
import fetchMilestone from '@salesforce/apex/OpportunityController.fetchMilestone';
import createMilestone from '@salesforce/apex/OpportunityController.createMilestone';
import deleteMilestone from '@salesforce/apex/OpportunityController.deleteMilestone';
import { CloseActionScreenEvent } from 'lightning/actions';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import { getRecordNotifyChange } from 'lightning/uiRecordApi';
import { RefreshEvent } from 'lightning/refresh';



export default class OppMilestoneComponent extends NavigationMixin(LightningElement) {


@track opportunityId;
@track accountId;
@api recordId;
@track isLoading = true;

@track showTable= false;
@track inputValue = '';
@track showError = false;
@track mileRecord;
@track milestones = [{Id: "",Milestone_Weightage__c:"",Name__c:"",Tentative_Date_of_Payment__c:"","Opportunity__c":this.opportunityId,"Account__c":this.accountId},
                     {Id: "",Milestone_Weightage__c:"",Name__c:"",Tentative_Date_of_Payment__c:"","Opportunity__c":this.opportunityId,"Account__c":this.accountId}];
uniqueIdCounter = 1;
//@api recordId='0066D000006w6e2QAA';
@track payMileName;
@track weightage;
 oppAmount = 0;
 oppRecorId;
 oppName;
 oppRecord;

@track data = [
    { Id: 1, column1: 'Row 1', column2: 'Value 1' },    
];

addRow() {
    debugger;
        
    let newValue = {Id: this.milestones.length +1,Milestone_Weightage__c:"",Name__c:"",Tentative_Date_of_Payment__c:"","Opportunity__c":this.opportunityId,"Account__c":this.accountId}
    this.milestones.push(newValue)
    
}

//remove records from table
    handleDeleteAction(event){
        this.showTable = false;
        debugger;
        if(isNaN(event.target.dataset.id)){
            this.milestones = this.milestones + ',' + event.target.dataset.id;
        }
        let deleteVal = this.milestones[event.target.dataset.id]
        if(deleteVal.Id.length == 18){
            this.deleteMilestone(deleteVal)
        }
        //this.milestones.splice(this.milestones[event.target.dataset.id,1]);
        this.milestones.splice(this.milestones.findIndex(row => row.Id === event.target.dataset.id), 1);
        console.log('removed rec:::'+JSON.stringify(this.milstones));
        this.showTable = true;

        //  if(isNaN(event.target.dataset.id)){
        //     this.deleteConatctIds = this.deleteConatctIds + ',' + event.target.dataset.id;
        // }
        //this.records.splice(this.records.findIndex(row => row.Id === event.target.dataset.id), 1);


        // var IndexKey=parseInt(event.target.accessKey);
        // console.log('IndexKey--',IndexKey);
        // if (this.milestones.length > 1) {
        //      this.milestones = this.milestones.filter(function (element) {
        //         return parseInt(element.index) !== parseInt(event.target.accessKey);
        //     });
        //      console.log("milestones After Splice Length -- ",this.milestones.length);
        // }
        // for(let i=0;i<this.milestones.length;i++){
        //         this.milestones[i].index=i+1;
        // }
    }

    deleteMilestone(deleteId){
        deleteMilestone({milestone:deleteId}).then((record) =>{
            
        })
    }

connectedCallback() {
    debugger;
  
     setTimeout(() => {
        this.callMethod();
   }, 2000);    
}

callMethod(){
    debugger;
    this.isLoading = false;
    fetchMilestone({recordid : this.recordId })
    .then((data) => {
        this.oppRecord = data;
        this.opportunityId = data.opportunityId;
        this.accountId = data.oppApplicantId;
        this.oppName = data.opportunityName;
        
            if(data.mileList && data.mileList.length>0){
                 this.milestones = JSON.parse(JSON.stringify(data.mileList));
            }else{
                this.milestones =[{Id: "",Milestone_Weightage__c:"",Name__c:"",Tentative_Date_of_Payment__c:"","Opportunity__c":this.opportunityId,"Account__c":this.accountId},
                                  {Id: "",Milestone_Weightage__c:"",Name__c:"",Tentative_Date_of_Payment__c:"","Opportunity__c":this.opportunityId,"Account__c":this.accountId}];
                //let newValue = {Id: this.milestones.length +2,Milestone_Weightage__c:"",Name__c:"",Tentative_Date_of_Payment__c:"","Opportunity__c":this.opportunityId,"Opportunity__r.AccountId":this.accountId}
                //this.milestones.push(newValue)
            }
        this.oppAmount=data.opportunityAmount;
        this.showTable = true;
        this.errors = undefined;
       // this.isLoading = false;
    })
   
}

// @wire(fetchMilestone,{ recordid : '$recordId'})
// wiredMilestones({data,error}){
//     debugger;
//         if(data){
//             console.log('data::',data);
//              this.opportunityId = data.opportunityId;
//              this.accountId = data.oppApplicantId;
//              this.oppName = data.opportunityName;
//             if(data.mileList){
//                  this.milestones = JSON.parse(JSON.stringify(data.mileList));
//             }else{
//                 let newValue = {Id: this.milestones.length +2,Milestone_Weightage__c:"",Name__c:"",Tentative_Date_of_Payment__c:"","Opportunity__c":this.opportunityId,"Opportunity__r.AccountId":this.accountId}
//                 this.milestones.push(newValue)
//             }
       
       
//         this.oppAmount=data.opportunityAmount;
//         this.showTable = true;
//         this.errors = undefined;
//     } else if(error){
//         console.error('Error fetching milestones: ' + error);
//     }
// }

payHandleChange(event){
    debugger;
    let name = event.target.name; 
    let index = event.target.label;

    if(name== 'Name__c'){
        this.milestones[index][name] = event.target.value;
    }
    if(name== 'Milestone_Weightage__c'){
        this.milestones[index][name] = event.target.value;
    }
    if(name== 'Tentative_Date_of_Payment__c'){
        this.milestones[index][name] = event.target.value;
    }
    console.log('this.milestones:::',JSON.stringify(this.milestones))
    
}

    handleSubmit() {
    let valueToSave = JSON.parse(JSON.stringify(this.milestones));

    // Check if any milestone has weightage greater than 100 or equal to 0
    const hasInvalidWeightage = valueToSave.some(milestone => 
        milestone.Milestone_Weightage__c <= 0 || milestone.Milestone_Weightage__c > 100
    );

    if (hasInvalidWeightage) {
        this.dispatchEvent(new ShowToastEvent({
            title: 'Error',
            message: 'Milestones must have a weightage between 1 and 100',
            variant: 'error'
        }));
    } else {
        // Calculate the total weightage
        const totalWeightage = valueToSave.reduce((total, milestone) => total + parseFloat(milestone.Milestone_Weightage__c), 0);

        if (totalWeightage !== 100) {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: 'Total weightage should be 100',
                variant: 'error'
            }));
        } else {
            // Prepare the data to save
            valueToSave.forEach(currentItem => {
                if(currentItem.Id.length != 18){
                    currentItem.Id = null;
                }
            });
            
            createMilestone({
                milstonesList: valueToSave
            }).then(result => {
                console.log('result:::', result)
                if (result === 'success') {
                    this.dispatchEvent(new ShowToastEvent({
                        title: 'Success',
                        message: 'Milestone Created Successfully',
                        variant: 'success'
                    }));
                    this.dispatchEvent(new CloseActionScreenEvent());
                     //getRecordNotifyChange([{recordId: this.recordId}]);
                     this.dispatchEvent(new RefreshEvent());
                } else {
                    this.dispatchEvent(new ShowToastEvent({
                        title: 'Error',
                        message: result,
                        variant: 'error'
                    }));
                }
            }).catch(error => {
                console.log('error:', error);
            }).finally(() => {
                
            });
        }
    }
}


    handleCancel(){
        this.dispatchEvent(new CloseActionScreenEvent());
    }

}