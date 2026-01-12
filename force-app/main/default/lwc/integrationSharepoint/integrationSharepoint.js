import { LightningElement, track } from 'lwc';
import fetchFiles from '@salesforce/apex/sharePointIntegration.fetchFiles';
import uploadFile from '@salesforce/apex/sharePointIntegration.uploadFile';
import getFileContent from '@salesforce/apex/sharePointIntegration.getFileContent';

export default class IntegrationSharepoint extends LightningElement {
    @track files = [];
    @track fileName = '';
    @track uploadMessage = '';

    // Define columns for lightning-datatable
    columns = [
        { label: 'File Name', fieldName: 'name', type: 'text' }
    ];

    // Fetch files from SharePoint
    handleFetchFiles() {
        fetchFiles()
            .then(result => {
                if (result && Array.isArray(result)) {
                    this.files = result.map((file, index) => ({
                        id: index.toString(),
                        name: file
                    }));
                } else {
                    this.files = [];
                }
            })
            .catch(error => {
                console.error('Error fetching files:', error);
            });
    }

    // Update file name when user types in input field
    handleFileNameChange(event) {
        this.fileName = event.target.value;
    }

            handleFileUpload(event) {
                const uploadedFiles = event.detail.files;
                if (uploadedFiles.length === 0) return;
            
                let fileId = uploadedFiles[0].documentId; // ContentDocumentId
                let fileName = this.fileName || uploadedFiles[0].name; // Use updated name if provided
            
                this.uploadMessage = `Uploading ${fileName} to SharePoint...`;
            
                // Fetch file content from Salesforce
                getFileContent({ fileId: fileId })
                    .then(base64Data => {
                        return uploadFile({ fileName: fileName, base64Data: base64Data });
                    })
                    .then(result => {
                        this.uploadMessage = `File uploaded to SharePoint successfully: ${fileName}`;
                        this.handleFetchFiles(); // Refresh file list after upload
                    })
                    .catch(error => {
                        this.uploadMessage = 'Error uploading to SharePoint';
                        console.error('Upload Error:', error);
                    });
            }
}