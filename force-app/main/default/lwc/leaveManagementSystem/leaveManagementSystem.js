import { LightningElement, api, wire, track } from 'lwc';
import getEmployee from '@salesforce/apex/leaveManagementSystemController.getEmployee';
import getLeaveTypes from '@salesforce/apex/leaveManagementSystemController.getLeaveTypes';
import getLeaves from '@salesforce/apex/leaveManagementSystemController.getLeaves';
import createLeave from '@salesforce/apex/leaveManagementSystemController.createLeave';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import SWEETALERT from '@salesforce/resourceUrl/sweetalert2';

export default class LeaveManagementSystem extends LightningElement {
    @api recordId;

    employeeId;
    employeeName;
    leaveTypeOptions = [];
    leaveData = [];
    leaveResult;

    hide = true;
    isFormOpen = false;

    selectedEmployeeId;
    selectedEmployeeName;
    reportingManager;

    @track numberOfDays = 0;
    @track showSpinner = false;
    sweetAlertInitialized = false;

    leaveBalances = [
        { label: "Sick Leave", value: 18 },
        { label: "Casual Leave", value: 18 },
        { label: "Paid Leave", value: 18 },
        { label: "Total Leave", value: 54 }
    ];

    renderedCallback() {
        if (this.sweetAlertInitialized) {
            return;
        }
        this.sweetAlertInitialized = true;

        Promise.all([
            loadScript(this, SWEETALERT + '/sweetalert2.all.min.js'),
            loadStyle(this, SWEETALERT + '/sweetalert2.min.css')
        ])
            .then(() => {
                window.Swal = Swal;
            })
            .catch(error => {
                console.error('SweetAlert load error', error);
            });
    }

    showSwalAlert(title, message, icon) {
        if (window.Swal) {
            Swal.fire({
                title: title,
                text: message,
                icon: icon, // success | error | warning | info
                confirmButtonText: 'OK',
                position: 'center',
                backdrop: true,
                allowOutsideClick: false
            });
        }
    }


    @wire(getEmployee, { contactId: '$recordId' })
    wiredEmployee({ data, error }) {
        if (data) {
            this.employeeId = data.Id;
            this.employeeName = data.Name;
            this.reportingManager = data.ReportsToId;
        } else if (error) {
            console.error(error);
        }
    }

    @wire(getLeaveTypes)
    wiredPicklist({ data, error }) {
        if (data) {
            this.leaveTypeOptions = data.map(v => ({ label: v, value: v }));
        } else if (error) {
            console.error(error);
        }
    }

    @wire(getLeaves, { contactId: '$recordId' /*'$selectedEmployeeId' */ })
    wiredGetLeaves(result) {
        this.leaveResult = result;
        if (result.data) {
            this.leaveData = result.data.map(row => ({
                ...row,
                EmployeeName: row.Employee__r?.Name || ''
            }));
        } else if (result.error) {
            console.error(result.error);
        }
    }



    columns = [
        { label: "Employee Name", fieldName: "EmployeeName" },
        { label: "From", fieldName: "Start_Date__c", type: "date" },
        { label: "To", fieldName: "End_Date__c", type: "date" },
        { label: "Leave Type", fieldName: "Leave_Type__c" },
        { label: "Status", fieldName: "Status__c" },
        { label: "Reason", fieldName: "Reason_for_Leave__c" }
    ];

    openForm() {
        this.isFormOpen = true;
        this.numberOfDays = 0;
    }

    closeForm() {
        this.isFormOpen = false;
    }

    handleDateChange() {
        const startEl = this.template.querySelector('[data-id="start"]');
        const endEl = this.template.querySelector('[data-id="end"]');

        const startDate = startEl?.value;
        const endDate = endEl?.value;

        this.numberOfDays = 0;
        startEl.setCustomValidity('');
        endEl.setCustomValidity('');

        if (!startDate || !endDate) {
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (end < start) {
            endEl.setCustomValidity('End Date cannot be before Start Date');
            endEl.reportValidity();
            return;
        }

        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        this.numberOfDays = diffDays;
    }

    validateForm() {
        let isValid = true;

        const fields = this.template.querySelectorAll(
            'lightning-input, lightning-combobox, lightning-textarea'
        );

        fields.forEach(field => {
            field.reportValidity();
            if (!field.checkValidity()) {
                isValid = false;
            }
        });

        return isValid;
    }

    query(selector) {
        const el = this.template.querySelector(selector);
        return el ? el.value : '';
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({ title, message, variant })
        );
    }

    async saveLeave() {
        debugger;
        try {
            if (!this.validateForm()) {
                this.showSwalAlert(
                    'Validation Error',
                    'Please fill all required fields before saving.',
                    'error'
                );
                return;
            }

            if (this.numberOfDays <= 0) {
                this.showSwalAlert(
                    'Validation Error',
                    'Please select valid Start and End dates.',
                    'error'
                );
                return;
            }

            this.showSpinner = true;

            const req = {
                Status: 'Pending',
                EmployeeId: this.employeeId,
                LeaveType: this.query('[data-id="leaveType"]'),
                StartDate: this.query('[data-id="start"]'),
                EndDate: this.query('[data-id="end"]'),
                Days: this.numberOfDays,
                Reason: this.query('[data-id="reason"]'),
                ReportingManager: this.reportingManager
            };

            await createLeave({ req });

            // Close modal
            this.isFormOpen = false;

            await refreshApex(this.leaveResult);

            this.showSwalAlert(
                'Leave Created',
                'Your leave application saved successfully.',
                'success'
            );

        } catch (error) {
            console.error(error);
            this.showSwalAlert(
                'Error',
                'Error while saving leave application.',
                'error'
            );
        } finally {
            setTimeout(() => {
                this.showSpinner = false;
            }, 800);
        }
    }

}