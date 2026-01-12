import { LightningElement, track, wire,api } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import fullCalendarJS from '@salesforce/resourceUrl/FullCalendarJS';
import getHolidays from '@salesforce/apex/FullCalendarController.getHolidays';
import CreateHolidays from '@salesforce/apex/FullCalendarController.CreateHolidays';
import deleteHolidays from '@salesforce/apex/FullCalendarController.deleteHolidays';
import { refreshApex } from '@salesforce/apex';
import SWEETALERT from '@salesforce/resourceUrl/sweetalert2';

export default class FullCalendarJS extends LightningElement {
    isModalOpen= true;
    @api contactId='';
    @track HolidaTypes='';

   

    fullCalendarJsInitialised = false;
    sweetAlertInitialized = false;
    
    
    
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
//   renderedCallback() {
//      // Performs this operation only on first render
//      if (this.fullCalendarJsInitialised) {
//         return;
//      }
//      this.fullCalendarJsInitialised = true;

//      // Executes all loadScript and loadStyle promises
//      // and only resolves them once all promises are done
//        Promise.all([
//            loadScript(this, fullCalendarJS + "/FullCalendarJS/jquery.min.js"),
//            loadScript(this, fullCalendarJS + "/FullCalendarJS/moment.min.js"),
//            loadScript(this, fullCalendarJS + "/FullCalendarJS/fullcalendar.min.js"),
//            loadStyle(this, fullCalendarJS + "/FullCalendarJS/fullcalendar.min.css"),
//        ])
//        .then(() => {
//            //initialize the full calendar
//        this.initialiseFullCalendarJs();
//        })
//        .catch((error) => {
//        console.error({
//            message: "Error occured on FullCalendarJS",
//            error,
//        });
//        });
//   }

renderedCallback() {
    // If both libraries are already initialized, do nothing
    if (this.fullCalendarJsInitialised && this.sweetAlertInitialized) {
        return;
    }

    // Mark flags so they are not re-initialized
    if (!this.fullCalendarJsInitialised) {
        this.fullCalendarJsInitialised = true;
    }

    if (!this.sweetAlertInitialized) {
        this.sweetAlertInitialized = true;
    }

    // Load both SweetAlert2 and FullCalendarJS
    Promise.all([
        // FullCalendar scripts and styles
        loadScript(this, fullCalendarJS + "/FullCalendarJS/jquery.min.js"),
        loadScript(this, fullCalendarJS + "/FullCalendarJS/moment.min.js"),
        loadScript(this, fullCalendarJS + "/FullCalendarJS/fullcalendar.min.js"),
        loadStyle(this, fullCalendarJS + "/FullCalendarJS/fullcalendar.min.css"),

        // SweetAlert2 scripts and styles
        loadScript(this, SWEETALERT + "/sweetalert2.all.min.js"),
        loadStyle(this, SWEETALERT + "/sweetalert2.min.css")
    ])
    .then(() => {
        console.log('All scripts loaded');

        // Initialize FullCalendar
        this.initialiseFullCalendarJs();

        // Optionally set Swal globally
        if (typeof Swal !== 'undefined') {
            window.Swal = Swal;
        }
    })
    .catch((error) => {
        console.error("Error loading libraries:", error);
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
       console.log('---title--',this.title);
   }
    
   //To close the modal form
   handleCancel(event) {
       this.openModal = false;
    refreshApex(this.eventOriginalData);


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
        console.log('----Selected Holiday Type----',this.HolidaTypes);
       refreshApex(this.eventOriginalData);

    }

  //To save the event
  handleSave(event) {
    debugger;
    let events = this.events;
    this.openSpinner = true;

    this.template.querySelectorAll('lightning-input').forEach(ele => {
        if(ele.name === 'title'){
            this.title = ele.value;
        }
        if(ele.name === 'start'){
            this.startDate = ele.value; // Always allow selected date (past or future)
        }
        if(ele.name === 'end'){
            this.endDate = ele.value;
        }
    });

    // Validate required fields
    if (!this.title || !this.HolidaTypes) {
        this.showSwalAlert('Error','Please Fill All the Fields', 'error');
        console.log('Required fields missing');
        this.openSpinner = false;
        return;
    }

    let newevent = {
        Reason__c : this.title,
        Start_Date__c : this.startDate,
        End_Date__c : this.endDate,
        Contact__c: this.contactId,
        Type__c: this.HolidaTypes,
        Status__c: 'Approved'
    };

    console.log('Creating holiday:', newevent);
    this.openModal = false;

    CreateHolidays({ HolidaysRec: newevent })
    .then(result => {
        const ele = this.template.querySelector("div.fullcalendarjs");
        newevent.Id = result;

        $(ele).fullCalendar('renderEvent', newevent, true);
        this.events.push(newevent);

        this.openSpinner = false;
        this.showSwalAlert('Success', 'Event has been logged', 'success');
        return refreshApex(this.eventOriginalData);
    })
    .catch(error => {
        console.error('Error creating holiday:', error);
        this.openSpinner = false;
        this.showNotification('Oops', 'Something went wrong, please review console', 'error');
    });
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
        this.openModal = false;
    }

    closeModalManin(){
        debugger;
        this.isModalOpen = false;
            this.dispatchEvent(new CustomEvent('myevent', {
        detail: {
            data: 'Success'
        }
    }));

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
            didOpen: () => {
                const container = document.querySelector('.swal2-container');
                const popup = document.querySelector('.swal2-popup');
        
                if (container) {
                    container.style.zIndex = '99999';
                }
                if (popup) {
                    popup.style.zIndex = '99999';
                }
            }

          });
        } else {
          console.error('Swal not loaded');
        }
      }


}