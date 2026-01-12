import { LightningElement, track } from 'lwc';
import updateMilestonesFromCSV from '@salesforce/apex/MilestoneController.updateMilestonesFromCSV';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CsvMilestoneUploader extends LightningElement {
    @track fileContent = '';
    @track isLoading = false;

    // Handle file input change
    handleFileChange(event) {
        const file = event.target.files[0];
        if (file && file.type === 'text/csv') {
            const reader = new FileReader();
            reader.onload = () => {
                this.fileContent = reader.result;
                
            };
            reader.readAsText(file);
        } else {
            this.showToast('Error', 'Please upload a valid CSV file.', 'error');
        }
    }

    // Handle file upload and processing
    handleUpload() {
        debugger;
        if (!this.fileContent) {
            console.log(JSON.stringify(this.fileContent))
            this.showToast('Error', 'No file content found. Please upload a valid CSV.', 'error');
            return;
        }

        this.isLoading = true;
        updateMilestonesFromCSV({ csvContent: this.fileContent })
            .then((updatedCount) => {
                this.isLoading = false;
                this.showToast(
                    'Success',
                    `${updatedCount} milestones were successfully updated.`,
                    'success'
                );
                this.fileContent = ''; // Clear the file content
            })
            .catch((error) => {
                this.isLoading = false;
                this.showToast('Error', error.body.message, 'error');
            });
    }

    // Show toast notifications
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title,
            message,
            variant,
        });
        this.dispatchEvent(event);
    }
}