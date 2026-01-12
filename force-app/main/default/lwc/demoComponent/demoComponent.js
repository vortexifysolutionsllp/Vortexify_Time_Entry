import { LightningElement, track, wire } from 'lwc';
import getPageLoadMessage from "@salesforce/apex/DemoComponentController.getPageLoadMessage";



export default class DemoComponent extends LightningElement {
  @track message = 'testing the component';

  @wire(getPageLoadMessage,{accId:"0016D00000w0Ll9QAE"})
  result;

  clicked = () => {

    console.log(this.result);
    
  }


}