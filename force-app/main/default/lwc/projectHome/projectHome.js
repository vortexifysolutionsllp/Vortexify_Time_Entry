import { LightningElement ,track,wire} from 'lwc';
export default class ProjectHome extends LightningElement {
    @track homePageUrl='https://sales-production--sales--c.sandbox.vf.force.com/apex/ClusteredStackedChart?core.apexpages.request.devconsole=1';
    @track height = '100%'
    @track referrerPolicy = 'no-referrer';
    @track sandbox = '';
    @track width = '100%';

    connectedCallback() {
        debugger;
        // this.callVFPageMethod();
    }


    callVFPageMethod() {
        debugger;
        this.dispatchEvent(new CustomEvent(
            'DOMContentLoaded',
            {
                detail:'',
                bubbles: true,
                composed: true,
            }
        ));
    }
}