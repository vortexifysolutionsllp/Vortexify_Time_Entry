import { LightningElement, api, track } from 'lwc';
import doInit from '@salesforce/apex/AddModuleButtonHelper.addModule';
import addModule from '@salesforce/apex/AddModuleButtonHelper.addModule';
import saveModuleList from '@salesforce/apex/AddModuleButtonHelper.saveModuleLIst';

export default class AddModules extends LightningElement {
    @api recordId='a1L6D00000AMSYZUA5';
    @track values = [];
    @track selectedValue = [];
    @track min = 1;
    @track max = 3;
    @track options = [];
    @track preDefinedmodules = [];
    @track selectedmodules = [];
    @track showAddModule = false;
    @track moduleList = [];

    connectedCallback() {
        this.presentModule();
    }

    presentModule() {
        doInit()
            .then(result => {
                this.options = result;
                this.preDefinedmodules = result.map(item => ({ value: item.MasterLabel, label: item.MasterLabel }));
            })
            .catch(error => {
                console.error('Error initializing module data: ', error);
            });
    }

    showModuleComp() {
        const moduleList = [...this.moduleList];
        const selectedValues = [...this.selectedmodules];
        const selectedValuesformodules = [...moduleList];

        if (selectedValues.length > 0) {
            for (let i = 0; i < selectedValues.length; i++) {
                for (let j = 0; j < moduleList.length; j++) {
                    if (moduleList[j].Name === selectedValues[i]) {
                        this.showToast('This module is already Selected', 'warning');
                        return;
                    }
                }
                selectedValuesformodules.push({
                    Name: selectedValues[i],
                    Module_Description__c: '',
                    Total_Estimated_Efforts__c: ''
                });
            }

            this.moduleList = selectedValuesformodules;
            this.showAddModule = true;
        } else {
            this.showToast('Please Select the required module to proceed!!', 'warning');
            return;
        }
    }

    handleChange(event) {
        this.selectedmodules = event.detail.value;
    }

    addRow() {
        this.moduleList = [...this.moduleList, {
            sobjectType: 'Module__c',
            'Module Description': '',
            Name: '',
            'Total Estimated Efforts': ''
        }];
    }

    removeRecord(event) {
        const index = event.currentTarget.dataset.record;
        this.moduleList.splice(index, 1);
        this.moduleList = [...this.moduleList];
    }

    saveModule() {
        const recordId = this.recordId;
        const moduleListt = [...this.moduleList];
        const addModuleList = [];

        if (moduleListt.length > 0) {
            for (let i = 0; i < moduleListt.length; i++) {
                moduleListt[i].Project__c = recordId;
            }
            this.moduleList = moduleListt;
        }

        if (this.validateAccountRecords()) {
            saveModuleList({ mddList: moduleListt })
                .then(result => {
                    this.moduleList = result;
                    this.showToast('This module has been added successfully', 'success');
                })
                .catch(error => {
                    console.error('Error saving module list: ', error);
                });
        }
    }

    validateAccountRecords() {
        // Add your validation logic here if needed
        return true;
    }

    showToast(message, variant) {
        const toastEvent = new ShowToastEvent({
            title: 'Success',
            message: message,
            variant: variant,
        });
        this.dispatchEvent(toastEvent);
    }
}