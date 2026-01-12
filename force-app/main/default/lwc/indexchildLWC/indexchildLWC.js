import { LightningElement, api} from 'lwc';
 
export default class IndexchildLWC extends LightningElement {
 
    @api indexchild;
 
    connectedCallback() {
        //defined a varibale
        this.position();
 
    }
    position() {
        this.indexchild = this.indexchild + 1;
    }
}