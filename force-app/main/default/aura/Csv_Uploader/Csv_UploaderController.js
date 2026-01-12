({
    
    onchange: function(component, event, helper) 
    {
     	event.stopPropagation();
        event.preventDefault();
     	//var files=event.dataTransfer.files;
        //helper.readFile(component,helper,files[0]);
        debugger;
        var fileName = 'No File Selected..';
        if (event.getSource().get("v.files").length > 0) { 
            fileName = event.getSource().get("v.files")[0];//['name'];
        }
        component.set("v.fileName", fileName['name']);
        helper.readFile(component,helper,fileName);
        
  	},
    
	onDragOver : function(component, event, helper) {
		event.preventDefault();
	},
    
    onDrop : function(component, event, helper) {
		event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect='copy'; 
        var files=event.dataTransfer.files;
        helper.readFile(component,helper,files[0]);
	},
    
    processFileContent : function(component,event,helper){
        helper.saveRecords(component,event);
    },
    
    cancel : function(component,event,helper){
        component.set("v.showMain",true);
    }
})