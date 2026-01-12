import { LightningElement,wire,api,track } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getSessionId from '@salesforce/apex/TriggerOnAvailability_NotificationHelper.getSessionId';
import { loadScript } from "lightning/platformResourceLoader";
import cometdlwc from "@salesforce/resourceUrl/cometd";

export default class Notificationlwc extends LightningElement {
     isModalOpenAvail=true;
    @api recordId;

    libInitialized = false;
    @track sessionId;
    @track error;


    @wire(getSessionId)
    wiredSessionId({ error, data }) {
        if (data) {
            console.log(data);
            this.sessionId = data;
            this.error = undefined;
            loadScript(this, cometdlwc)
            .then(() => {
                this.initializecometd()
            });
        } else if (error) {
            console.log(error);
            this.error = error;
            this.sessionId = undefined;
        }
    }


     //CometD
    initializecometd() {
        const self = this;
        if (this.libInitialized) {
          return;
        }
      
        this.libInitialized = true;
      
        //inintializing cometD object/class
        var cometdlib = new window.org.cometd.CometD();
              
        //Calling configure method of cometD class, to setup authentication which will be used in handshaking
        cometdlib.configure({
          url: window.location.protocol + '//' + window.location.hostname + '/cometd/47.0/',
          
          requestHeaders: { Authorization: 'OAuth ' + this.sessionId},
          appendMessageTypeToURL : false,
          logLevel: 'debug'
        });
      
        cometdlib.websocketEnabled = false;
      
        cometdlib.handshake(function(status) {          
            if (status.successful) {
                // Successfully connected to the server.
                // Now it is possible to subscribe or send messages
                
                console.log('Successfully connected to server');

                const messageCallBack = function(message){

                    let newmessage = message.data.payload;
                     console.log('NewMessage',newmessage);
                     alert('yes here now,,,');
                     self.recordId=newmessage.RaisedById__c
                     self.isModalOpenAvail=false;
                     var dataTosend="Success";
                     const sendDataEvent = new CustomEvent('senddata', {
                        detail:{dataTosend}
                    });
                    this.dispatchEvent(sendDataEvent);
                    
                }

                cometdlib.subscribe('/event/Availability_me__e', messageCallBack);
            }else {
              /// Cannot handshake with the server, alert user.
              console.error('Error in handshaking: ' + JSON.stringify(status));
            }
         });
    }

    closeModhhhal(){
        this.isModalOpenAvail=false;
    }
    
}