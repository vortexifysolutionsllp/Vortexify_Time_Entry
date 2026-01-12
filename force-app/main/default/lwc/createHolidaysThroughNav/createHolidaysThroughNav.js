import { LightningElement, track, wire,api } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import fullCalendarJS from '@salesforce/resourceUrl/FullCalendarJS';
import getHolidays from '@salesforce/apex/FullCalendarController.getHolidays';
import CreateHolidays from '@salesforce/apex/FullCalendarController.CreateHolidays';
import deleteHolidays from '@salesforce/apex/FullCalendarController.deleteHolidays';
import { refreshApex } from '@salesforce/apex';
export default class CreateHolidaysThroughNav extends LightningElement {
    isModalOpen2= true;
    isModalOpen= false;
    
    @api contactId='';
    @track HolidaTypes='';

   

    fullCalendarJsInitialised = false;
    
    
    
   //Fields to store the event data -- add all other fields you want to add
   title;
   startDate;
   endDate;

   eventsRendered = false;//To render initial events only once
   openSpinner = false; //To open the spinner in waiting screens
   openModal = false; //To open form

   @track
   events = []; //all calendar events are stored in this field

   //To store the orignal wire object to use in refreshApex method
   eventOriginalData = [];

   //Get data from server - in this example, it fetches from the event object
   @wire(getHolidays,{conID:'$contactId'})
   eventObj(value){
       this.eventOriginalData = value; //To use in refresh cache

       const {data, error} = value;
       if(data){
           //format as fullcalendar event object
           console.log(data);
           let events = data.map(event => {
               return { id : event.Id, 
                       title : event.Reason__c, 
                       start : event.Start_Date__c,
                       end : event.End_Date__c,
                       allDay : event.Type__c};
           });
           this.events = JSON.parse(JSON.stringify(events));
           console.log(this.events);
           this.error = undefined;

           //load only on first wire call - 
           // if events are not rendered, try to remove this 'if' condition and add directly 
           if(! this.eventsRendered){
               //Add events to calendar
               const ele = this.template.querySelector("div.fullcalendarjs");
               $(ele).fullCalendar('renderEvents', this.events, true);
               this.eventsRendered = true;
           }
       }else if(error){
           this.events = [];
           this.error = 'No events are found';
       }
  }

  /**
   * Load the fullcalendar.io in this lifecycle hook method
   */
  renderedCallback() {
     // Performs this operation only on first render
     if (this.fullCalendarJsInitialised) {
        return;
     }
     this.fullCalendarJsInitialised = true;

     // Executes all loadScript and loadStyle promises
     // and only resolves them once all promises are done
       Promise.all([
           loadScript(this, fullCalendarJS + "/FullCalendarJS/jquery.min.js"),
           loadScript(this, fullCalendarJS + "/FullCalendarJS/moment.min.js"),
           loadScript(this, fullCalendarJS + "/FullCalendarJS/fullcalendar.min.js"),
           loadStyle(this, fullCalendarJS + "/FullCalendarJS/fullcalendar.min.css"),
       ])
       .then(() => {
           //initialize the full calendar
       this.initialiseFullCalendarJs();
       })
       .catch((error) => {
       console.error({
           message: "Error occured on FullCalendarJS",
           error,
       });
       });
  }

   initialiseFullCalendarJs() {
       const ele = this.template.querySelector("div.fullcalendarjs");
       const modal = this.template.querySelector('div.modalclass');
       console.log(FullCalendar);

       var self = this;

       //To open the form with predefined fields
       //TODO: to be moved outside this function
       function openActivityForm(startDate, endDate){
           self.startDate = startDate;
           self.endDate = endDate;
           self.openModal = true;
       }
       //Actual fullcalendar renders here - https://fullcalendar.io/docs/v3/view-specific-options
       $(ele).fullCalendar({
           header: {
               left: "prev,next today",
               center: "title",
               right: "month,agendaWeek,agendaDay",
           },
           defaultDate: new Date(), // default day is today - to show the current date
           defaultView : 'month', //To display the default view - as of now it is set to week view
           navLinks: true, // can click day/week names to navigate views
           // editable: true, // To move the events on calendar - TODO 
           selectable: true, //To select the period of time

           //To select the time period : https://fullcalendar.io/docs/v3/select-method
           selectAllow: function(selectInfo) {
            const today = moment().startOf('day');
            return selectInfo.start.isSameOrAfter(today);
        },
    
        select: function (startDate, endDate) {
            let stDate = startDate.format();
            let edDate = endDate.format();
            openActivityForm(stDate, edDate);
        },
    
        eventLimit: true,
        events: this.events, // all the events that are to be rendered - can be a duplicate statement here
       });
   }

   //TODO: add the logic to support multiple input texts
   handleKeyup(event) {
       this.title = event.target.value;
   }
    
   //To close the modal form
   handleCancel(event) {
       this.openModal = false;
       this.isModalOpen2 = false;
    refreshApex(this.eventOriginalData);
    window.location.reload();
   }

   get options() {
        return [
            { label: 'Sick Leave', value: 'Sick Leave' },
            { label: 'Casual Leave', value: 'Casual Leave'},
            { label: 'Festival', value: 'Festival' },
            { label: 'Company Event', value: 'Company Event' },
            { label: 'Govt Holiday', value: 'Govt Holiday' },
        ];
    }

    handleChange(event) {
        this.HolidaTypes = event.detail.value;
       refreshApex(this.eventOriginalData);

    }

  //To save the event
   handleSave(event) {
       debugger
       let events = this.events;


       //get all the field values - as of now they all are mandatory to create a standard event
       //TODO- you need to add your logic here.
       this.template.querySelectorAll('lightning-input').forEach(ele => {
           if(ele.name === 'title'){
              this.title = ele.value;
          }
          if(ele.name === 'start'){
            const selectedDate = new Date(ele.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // normalize time
        
            if (selectedDate >= today) {
                this.startDate = ele.value;
            } else {
                alert("Please select today or a future date.");
                ele.value = ''; // reset
            }
        }
           if(ele.name === 'end'){
               this.endDate = ele.value;
           }
       });
       
       //format as per fullcalendar event object to create and render
       let newevent = {Reason__c : this.title, Start_Date__c : this.startDate, End_Date__c: this.endDate,Contact__c:this.contactId,Type__c:this.HolidaTypes,Status__c:'Approved'};
       console.log(this.events);
       console.log('im beloe thia event');

       //Close the modal
       this.isModalOpen2 = false;
       this.isModalOpen = false;
       //Server call to create the event
       CreateHolidays({'HolidaysRec' : newevent})
       .then( result => {
           debugger;
           const ele = this.template.querySelector("div.fullcalendarjs");

           //To populate the event on fullcalendar object
           //Id should be unique and useful to remove the event from UI - calendar
           newevent.Id = result;
           //refreshApex(this.eventOriginalData);

           //renderEvent is a fullcalendar method to add the event to calendar on UI
           //Documentation: https://fullcalendar.io/docs/v3/renderEvent
           $(ele).fullCalendar( 'renderEvent', newevent, true );
                 refreshApex(this.eventOriginalData);
           //To display on UI with id from server
           this.events.push(newevent);

           //To close spinner and modal
           this.openSpinner = false;

           //show toast message
           this.showNotification('Success!!', 'Your event has been logged', 'success');
           refreshApex(this.eventOriginalData);
           window.location.reload();

       })
       .catch( error => {
           console.log(error);
           this.openSpinner = false;

           //show toast message - TODO 
           this.showNotification('Oops', 'Something went wrong, please review console', 'error');
       })
  }
   
  /**
   * @description: remove the event with id
   * @documentation: https://fullcalendar.io/docs/v3/removeEvents
   */
  removeEvent(event) {
       //open the spinner
       this.openSpinner = true;

       //delete the event from server and then remove from UI
       let eventid = event.target.value;
       deleteHolidays({'recordID' : eventid})
       .then( result => {
           console.log(result);
           const ele = this.template.querySelector("div.fullcalendarjs");
           console.log(eventid);
           $(ele).fullCalendar( 'removeEvents', [eventid] );

           this.openSpinner = false;
            
           //refresh the grid
           return refreshApex(this.eventOriginalData);

       })
       .catch( error => {
           console.log(error);
           this.openSpinner = false;
       });
  }

  /**
   *  @description open the modal by nullifying the inputs
   */
   addEvent(event) {
       this.startDate = null;
       this.endDate = null;
       this.title = null;
       this.openModal = true;
   }

   /**
    * @description method to show toast events
    */
   showNotification(title, message, variant) {
       console.log('enter');
       const evt = new ShowToastEvent({
           title: title,
           message: message,
           variant: variant,
       });
       this.dispatchEvent(evt);
   }

    closeModal() {
        // to close modal set isModalOpen tarck value as false
        this.isModalOpen2 = false;
        this.isModalOpen = false;
        window.location.reload();
    }

    closeModalManin(){
        debugger;
        this.isModalOpen2 = false;
        this.isModalOpen = false;
            this.dispatchEvent(new CustomEvent('myevent', {
        detail: {
            data: 'Success'
        }
    }));

    }
}