import { LightningElement, api, track, wire } from 'lwc';
import getEmailList from '@salesforce/apex/ShowProjectRelatedEmailController.getEmailList';

export default class ShowProjectRelatedEmails extends LightningElement {
    @api recordId;
    @track emailList = [];
    @track currentEmailListToDisplay = [];

    connectedCallback() {
        setTimeout(() => {
           // this.getEmailList();
        }, 300);
    }

    @wire(getEmailList, { projId: '$recordId' })
    wiredData({ error, data }) {
        if (data) {
            alert
            this.emailList = data.map(email => {
                const showToggle = email.TextBody.length > 255;
                return {
                    ...email,
                    showFullText: false,
                    showToggle,
                    truncatedText: showToggle ? email.TextBody.slice(0, 255) : email.TextBody,
                    MessageDate: email.MessageDate ? this.formatDateTime(email.MessageDate) : null
                };
            });

            console.log('result--e>', data);
            setTimeout(() => this.template.querySelector('c-custom-pagination').setPagination(5));
        } else if (error) {
            console.error('Error:', error);
        }
    }

    // getEmailList() {
    //     getEmailList({ projId: this.recordId })
    //     .then(result => {
    //         if(result) {
    //             this.emailList = result.map(email => {
    //                 const showToggle = email.TextBody.length > 255;
    //                 return {
    //                     ...email,
    //                     showFullText: false,
    //                     showToggle,
    //                     truncatedText: showToggle ? email.TextBody.slice(0, 255) : email.TextBody,
    //                     MessageDate: email.MessageDate ? this.formatDateTime(email.MessageDate) : null
    //                 };
    //             });
    //             setTimeout(() => this.template.querySelector('c-custom-pagination').setPagination(5));
    //             console.log('result-->', result);
    //             console.log('result-->', JSON.stringify(this.emailList));
    //         }    
    //     })
    //     .catch(error => {
    //         console.log('error-->', error);
    //     });
    // }

    formatDateTime(dateTimeString) {
        const date = new Date(dateTimeString);
        const dateOptions = { month: 'short', day: 'numeric' };
        const formattedDate = date.toLocaleDateString('en-US', dateOptions);
        const timeOptions = { hour: 'numeric', minute: 'numeric' };
        const formattedTime = date.toLocaleTimeString('en-US', timeOptions);
        return `${formattedTime} | ${formattedDate}`;
    }

    toggleShowMore(event) {
        const emailId = event.target.dataset.id;
        this.emailList = this.emailList.map(email => {
            if (email.Id === emailId) {
                return { ...email, showFullText: !email.showFullText };
            }
            return email;
        });
        this.currentEmailListToDisplay = [...this.emailList];
        setTimeout(() => this.template.querySelector('c-custom-pagination').setPagination(5));
        //this.jobPaginationCallback(event);
    }

    jobPaginationCallback(event) {
        this.currentEmailListToDisplay = event.detail.recordToDisplay;
    }
}