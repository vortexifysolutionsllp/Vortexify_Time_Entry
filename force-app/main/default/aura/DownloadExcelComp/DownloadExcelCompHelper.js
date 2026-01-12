({
	convertArrayToCSV : function(component,metaDataRecord){
        debugger;
        // declare variables
        var csvStringResult, counter, keys, columnDivider, lineDivider;

        // store ,[comma] in columnDivider variabel for sparate CSV values and 
        // for start next line use '\n' [new line] in lineDivider varaible  
        columnDivider = ',';
        lineDivider =  '\n';

        // in the keys valirable store fields API Names as a key 
        // this labels use in CSV file header  
        keys = ['Project Name','Module Name','Priority','Team Member','Stand By Resource','Assigned By','Estimated Efforts',
                'Estimated Start Date','Description','Solution Details'];
        
        csvStringResult = '';
        csvStringResult += keys.join(columnDivider);
        csvStringResult += lineDivider;

        /*for(var i=0; i <= metaDataRecord.length; i++){   
            counter = 0;
           
             for(var sTempkey in keys) {
                var skey = keys[sTempkey] ;  

              // add , [comma] after every String value,. [except first]
                  if(counter >= 0){ 
                      csvStringResult += columnDivider; 
                   }   
               
               csvStringResult += '"'+ metaDataRecord[i][skey]+'"'; 
               
               counter++;

            } // inner for loop close 
             csvStringResult += lineDivider;
          }// outer main for loop close */
       
       // return the CSV formate String 
        return csvStringResult;        

	}
})