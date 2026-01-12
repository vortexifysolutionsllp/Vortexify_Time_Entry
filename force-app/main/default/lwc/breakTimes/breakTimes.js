import { LightningElement,track,api,wire } from 'lwc';
import getUnStoppedBreakLast from '@salesforce/apex/BreakTimeHandler.getUnStoppedBreakLast';
import EndBreack from '@salesforce/apex/BreakTimeHandler.EndBreack';
import createBreak from '@salesforce/apex/BreakTimeHandler.createBreak';

export default class BreakTimes extends LightningElement {
    @track isShowTimewComp = true;
    @api selJiraId = '';
    @api breakRecId = '';  
    @track wiredData;

    @wire(getUnStoppedBreakLast, { JiraTaskID: '$selJiraId' })
    wiredData({ error, data }) {
      if (data) {
        console.log('Data', data);
      } else if (error) {
         console.error('Error:', error);
      }
    }

    hideModalBox (){
        this.isShowTimewComp =false; 
    }


    CreateBreakRecord(){
        debugger;
        this.selJiraId;

        this.template.querySelectorAll('lightning-input').forEach(ele => {
           if(ele.name === 'Descrption'){
              this.Descrption = ele.value;
           }

       });
        createBreak({Description:this.Descrption,JiraTaskID:this.selJiraId})
        .then( result => {
           debugger;
           this.breakRecId = result;
           this.isShowTimewComp =false;
           this.showNotification('Success!!', 'Your event has been logged');
           this.fireEventToParent();

       })
       .catch( error => {
           //show toast message - TODO 
            this.showNotification('Oops', 'Something went wrong, please review console');
       })
        this.isShowTimewComp= false;

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
   




   @api 
   stopBreak(){
       debugger;
       this.dispatchEvent(new CustomEvent('closed'));
         this.selJiraId;
       EndBreack({JiraTaskID:this.selJiraId})
        .then( result => {
           debugger;
            //this.isShowTimewComp =false;
           this.showNotification('Success!!', 'Your event has been logged', 'success');

       })
       .catch( error => {
           //show toast message - TODO 
            this.showNotification('Oops', 'Something went wrong, please review console', 'error');
       })
   }

   fireEventToParent() {
       debugger;
        const selectedEvent = new CustomEvent('breakvaluechanged', {
            detail:{recordid:this.breakRecId }
        });
        this.dispatchEvent(selectedEvent);
    }

}