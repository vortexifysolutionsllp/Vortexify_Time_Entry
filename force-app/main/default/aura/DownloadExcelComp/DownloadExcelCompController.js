({
    doInit : function(component, event, helper) {
        
    },
    
    downloadFormat : function(component, event, helper){

        var csvMetaData = component.get("v.downloadFiles");  
        var csv = helper.convertArrayToCSV(component,csvMetaData);    
            
        var hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
        hiddenElement.target = '_self'; // 
        hiddenElement.download = 'GroupSeriesRecordFormat.csv';  // CSV file Name* you can change it.[only name not .csv] 
        document.body.appendChild(hiddenElement); // Required for FireFox browser
        hiddenElement.click(); // using click() js function to download csv file
        
    }
})