({
    validateRequired: function(component, event) {
        var isValid = true;
        var allPRMRows = component.get("v.prmList");
        for (var indexVar = 0; indexVar < allPRMRows.length; indexVar++) {
            if (allPRMRows[indexVar].Project == '') {
                isValid = false;
                alert('Project Can\'t be Blank on Row Number ' + (indexVar + 1));
            }
        }
        return isValid;
    }
})