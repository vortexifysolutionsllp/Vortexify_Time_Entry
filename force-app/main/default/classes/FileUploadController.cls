public with sharing class FileUploadController {
    public Blob fileBody { get; set; }
    public String fileName { get; set; }

    public PageReference upload() {
        if (fileBody != null && fileName != null) {
            try {
                // Create a new ContentVersion record
                ContentVersion cv = new ContentVersion();
                cv.VersionData = fileBody;
                cv.Title = fileName;
                cv.PathOnClient = fileName;

                // (Optional) Associate with a specific record, replace <recordId> with the ID of the record
	                // cv.FirstPublishLocationId = '<recordId>';

                insert cv;

                ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.CONFIRM, 'File uploaded successfully.'));
            } catch (DmlException e) {
                ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.ERROR, 'Upload failed: ' + e.getMessage()));
            }
        } else {
            ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.ERROR, 'Please choose a file to upload.'));
        }

        return null;
    }
}