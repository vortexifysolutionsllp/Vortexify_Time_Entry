import { LightningElement, track, wire, api } from 'lwc';
import createProjectmethod from '@salesforce/apex/AddModuleButtonHelper.createProjectmethod';
import getAllRelatedProjects from '@salesforce/apex/AddModuleButtonHelper.getAllRelatedProjects';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class Project_Creation extends LightningElement {
    @api recordId = '0016D00000kRePvQAK';
    @track isShowProject = true
    @track isShowMilstones = false
    @track isShowModules = false
    @track projectName;
    @track percentageLevel;
    @track startDate;
    @track endDate;
    @track salesforceProducts;
    @track projectId;
    @track projects = [];
    @track error;
    @track productOptions = [
        { label: 'Salesforce Sales Cloud', value: 'Salesforce Sales Cloud' },
        { label: 'Salesforce Service Cloud', value: 'Salesforce Service Cloud' },
        { label: 'Salesforce Marketing Cloud', value: 'Salesforce Marketing Cloud' }

    ];

    @track selectedProducts = [];
    @track error;


    @wire(getAllRelatedProjects, { accId: '$recordId' })
    wiredProject({ data, error }) {
        debugger;
        if (data) {
            data.forEach(currentItem => {
                let arr=[];
                
                let copy = Object.assign({}, currentItem);
                let obj = currentItem.hasOwnProperty('Salesforce_Products__c') ? currentItem.Salesforce_Products__c:null;
                if(obj!=null)
                arr=obj.split(';');
                copy.salesforceProducts=arr;
                this.projects.push(copy);
            });
            
            //this.projects = data;
            console.log(JSON.stringify(this.projects));

        }
        else if (error) {
            this.error = error;
        }
    }

    handleonChange(event) {
        debugger;
        if (event.target.name == 'projectName') {
            this.projectName = event.target.value;
        } else if (event.target.name == 'startDate') {
            this.startDate = event.target.value;
        }
        else if (event.target.name == 'endDate') {
            this.endDate = event.target.value;
        } else if (event.target.name == 'resourcePriceRate') {
            this.resourcePriceRate = event.target.value;
        } else if (event.target.name == 'selectedProducts') {
            this.selectedProducts = event.target.value;
        }

    }

    nextPage(event) {
        let buttonName = event.target.name;
        debugger;
        if (buttonName == 'project') {
            this.isShowProject = false
            this.isShowMilstones = true
            this.isShowModules = false
        } else if (buttonName == 'milestones') {
            this.isShowProject = false
            this.isShowMilstones = false
            this.isShowModules = true
        } else if (buttonName == 'modules') {
            this.isShowProject = false
            this.isShowMilstones = false
            this.isShowModules = true
        }
    }

    backPage(event) {
        let buttonName = event.target.name;
        if (buttonName == 'project') {
            this.isShowProject = true
            this.isShowMilstones = false
            this.isShowModules = false
        } else if (buttonName == 'milestones') {
            this.isShowProject = true
            this.isShowMilstones = false
            this.isShowModules = false
        } else if (buttonName == 'modules') {
            this.isShowProject = false
            this.isShowMilstones = true
            this.isShowModules = false
        }
    }

    createProject(event) {
        debugger;
        let tempProject = {
            Name: this.projectName,
            Project_Start_Date__c: this.startDate,
            Project_End_Date__c: this.endDate,
            Salesforce_Products__c: this.selectedProducts,
            Account__c: this.recordId
        };

        createProjectmethod({ singleproject: tempProject })

            .then((result) => {
                if (result) {
                    alert('record created Sucessfully....')
                    this.isShowProject = true;
                    this.showToast();

                } else {
                    alert("record creation error");
                }

            }).catch((error) => {
                this.error = error;
            });
    }






    showToast() {
        const event = new ShowToastEvent({
            title: 'Success',
            message:
                'REcord Create Successfully',
        });
        this.dispatchEvent(event);
    }

}