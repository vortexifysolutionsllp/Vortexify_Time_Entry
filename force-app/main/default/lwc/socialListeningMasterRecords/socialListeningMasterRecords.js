import { LightningElement } from 'lwc';
export default class SocialListeningMasterRecords extends LightningElement {

    openLink(event) {
        const url = event.target.dataset.url;
        if (url) {
            window.open(url, '_blank');
        } else {
            console.error('URL not provided for this button.');
        }
    }
}