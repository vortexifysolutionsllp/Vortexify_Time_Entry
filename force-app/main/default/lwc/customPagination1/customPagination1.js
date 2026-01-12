import { LightningElement, api, track } from 'lwc';

const chunk = (arr, size) => {
    const chunkedArray = [];
    for (let i = 0; i < arr.length; i++) {
        const last = chunkedArray[chunkedArray.length - 1];
        if (!last || last.length === size) {
            chunkedArray.push([arr[i]]);
        } else {
            last.push(arr[i]);
        }
    };
    return chunkedArray;
};


export default class CustomPagination1 extends LightningElement {

    @api list;
    currentPage = "1";
    @api contactChunks;
    contactToDisplay;
    totalPages;
    @track disableNext = false;
    @track disablePrev = false;
    pageOptionsLoaded = false;
    @track pageOptions = [];
    size;
    totalRecords;
     pageLimit = "10";
    newRecordsCount;
    @track isFirstClick = true;
    @track lastRecordName;

    @track pageParameterStart = 1;
    @track pageParameterEnd = 10;
    @track total = 1;
    @track noOfRecords = 0;
    @track pageParameterTotal = this.pageParameterStart +  ' to ' + this.pageParameterEnd;

    @api
    updateRecords(newRecords) {
        debugger;
        this.list = newRecords;
        this.newRecordsCount = this.list.length;
        console.log('this.newRecordsCount ===> ' + this.newRecordsCount);
        this.setPagination(this.size);
    }

    get pageLimitOptions() {
        var pageLimitList = [
            { label: '5', value: '5' },
            { label: '10', value: '10' },
            { label: '15', value: '15' },
            { label: '20', value: '20' },
            { label: '50', value: '50' },
            { label: '100', value: '100' },
        ];
        return pageLimitList;
    }

    @api
    setPagination(size) {
        debugger;
        if (this.list.length > 0) {
            this.pageOptions = [];
            this.disableNext = this.list.length <= size// false;
            
            this.size = size;
            this.totalRecords = this.list.length;
            if(this.pageParameterStart < 91){
                this.disablePrev = true;
            }
         
            if(this.direction == 'previous'){
                this.noOfRecords = this.total * 100;
                this.pageParameterStart = this.noOfRecords - 9;
                this.pageParameterEnd = this.noOfRecords;
            }else{
                if(this.list.length == 100){
                     this.noOfRecords = this.total * 100;
                    this.pageParameterStart = this.noOfRecords - 99;
                    this.pageParameterEnd = this.noOfRecords - 90;
                }else{
                    if(this.total == 1 && this.list.length < 100){
                        this.noOfRecords = this.list.length;
                        this.pageParameterStart = 1;
                        this.pageParameterEnd = 10;
                    }
                }
               
            }
            
            this.pageParameterTotal = this.pageParameterStart +  ' to ' + this.pageParameterEnd;
            this.contactChunks = chunk(this.list, this.size);
            this.contactToDisplay = (this.direction == 'previous') ? this.contactChunks[this.contactChunks.length - 1] : this.contactChunks[0];
            this.totalPages = this.contactChunks.length;
            this.currentPage = (this.direction == 'previous') ? this.totalPages : "1";
            var pageOptObj = {};
            for (var i = 1; i <= this.totalPages; i++) {
                pageOptObj = {};
                pageOptObj.label = i.toString();
                pageOptObj.value = i.toString();
                this.pageOptions.push(pageOptObj);
            }
            console.log("ListLenght---", this.list.length);
            console.log("Size---", this.size);

            debugger;
            if (this.list.length == this.size) {
                this.pageOptions.slice(0, -1);
                console.log("pageOptions-----", this.pageOptions);
            }
            this.pageOptionsLoaded = true;
            this.calculatePageText();
        }
    }

    calculatePageText() {
        debugger;
        var end = (parseInt(this.currentPage) * this.size) > this.totalRecords ? this.totalRecords : (parseInt(this.currentPage) * this.size);
        this.pageParam = ((parseInt(this.currentPage) * this.size) - (this.size - 1)) + ' to ' + end;
        this.returnRecordToDisplay();
    }

    handleNext() {
        debugger;
        this.currentPage = (parseInt(this.currentPage) + 1).toString();
        if (parseInt(this.currentPage) > this.totalPages) {
            this.direction = 'next';
            this.currentPage = this.totalPages.toString();
            this.disableNext = false;//true;
            this.disablePrev = false;
            const lastRecord = this.list[this.list.length - 1];
            console.log('lastRecord-->'+lastRecord);
            this.lastRecordName = lastRecord != null ? lastRecord.commentIdNumber : null;
            console.log('lastRecord ===> ' + this.lastRecordName);

            if (this.lastRecordName != null) {

                this.requestMoreRecords();
            }
        }
        else {
            this.pageParameterStart = this.pageParameterStart + 10;
            this.pageParameterEnd = this.pageParameterStart + 9;
            
            this.pageParameterTotal = this.pageParameterStart +  ' to ' + this.pageParameterEnd;
            this.disableNext = false;
            this.disablePrev = false;
        }

        this.contactToDisplay = this.contactChunks[parseInt(this.currentPage) - 1];
        if(this.contactToDisplay.length != 10){
           this.pageParameterTotal = this.pageParameterStart + ' to ' + (parseInt(this.pageParameterStart) + (parseInt(this.contactToDisplay.length) - 1));

        }
        this.calculatePageText();
    }

    handlePrev() {
        debugger;
        if(this.pageParameterEnd % 10 === 0){
             this.pageParameterStart = this.pageParameterStart - 10;
            this.pageParameterEnd = this.pageParameterEnd - 10;
        }else{
            this.pageParameterStart = this.pageParameterStart - 10;
            this.pageParameterEnd = this.pageParameterStart + 9;
        }
       
        this.pageParameterTotal = this.pageParameterStart +  ' to ' + this.pageParameterEnd;
        if(this.pageParameterStart == 1){
            this.disablePrev = true;
        }else{
            this.disablePrev = false;
        }
        this.currentPage = (parseInt(this.currentPage) - 1).toString();

        if (parseInt(this.currentPage) < "1") {
            this.direction = 'previous';
            this.currentPage = "1";
            this.disableNext = false;
            this.disablePrev = false;//true;
            const firstRecord = this.list[0]; 
            this.firstRecordName = firstRecord != null ? firstRecord.commentIdNumber : null;
            console.log('firstRecord ===> ' + this.firstRecordName);
            
            if (this.firstRecordName != null) {
                this.requestPreviousRecords();
            }
        }
        else {
            this.disableNext = false;
        }
        this.contactToDisplay = this.contactChunks[parseInt(this.currentPage) - 1];
        debugger;
        this.calculatePageText();
    }

    handlePageChange(event) {
        debugger;
        this.currentPage = event.target.value;
        this.contactToDisplay = this.contactChunks[parseInt(this.currentPage) - 1];
        if (parseInt(this.currentPage) <= "1") {
            this.disableNext = false;
            this.disablePrev = false;
        }
        else if (parseInt(this.currentPage) >= this.totalPages) {
            this.disableNext = false;
            this.disablePrev = false;
        }
        else {
            this.disableNext = false;
            this.disablePrev = false;
        }
        this.calculatePageText();
    }

    @track firstRecordName;
    @track isFirstClickPrev = true;
    handleFirst() {
        debugger;
        if(this.pageParameterStart < 100){
            this.disablePrev = true;
        }else{
            this.disablePrev = false;
        }
        
        if(this.currentPage == "1"){
            this.isFirstClickPrev = false;
            this.direction = 'previous';
            this.pageParameterStart = this.noOfRecords - 109;
        this.pageParameterEnd = this.noOfRecords - 100;
        this.pageParameterTotal = this.pageParameterStart +  ' to ' + this.pageParameterEnd;
        }else{
            
            this.pageParameterStart = this.noOfRecords - 99;
        this.pageParameterEnd = this.noOfRecords - 90;
        this.pageParameterTotal = this.pageParameterStart +  ' to ' + this.pageParameterEnd;
            
        }
        if (!this.isFirstClickPrev) {
            console.log('second click - fetching previous records');
            const firstRecord = this.list[0]; 
            this.firstRecordName = firstRecord != null ? firstRecord.commentIdNumber : null;
            console.log('firstRecord ===> ' + this.firstRecordName);
            
            if (this.firstRecordName != null) {
                this.requestPreviousRecords();
            }
        }
        this.currentPage = "1";
        this.contactToDisplay = this.contactChunks[parseInt(this.currentPage) - 1];
    
        this.calculatePageText();
        this.isFirstClickPrev = !this.isFirstClickPrev;
    }

    handleLast() {
        debugger;
        this.pageParameterStart = this.noOfRecords - 9;
        this.pageParameterEnd = this.noOfRecords;
        this.pageParameterTotal = this.pageParameterStart +  ' to ' + this.pageParameterEnd;
        if(this.currentPage == this.totalPages){
            this.isFirstClick = false;
            this.direction = 'next';
            
        }else{
            this.isFirstClick = true;
            
        }
        if (!this.isFirstClick) {
            console.log('second click');
            const lastRecord = this.list[this.list.length - 1];
            this.lastRecordName = lastRecord != null ? lastRecord.commentIdNumber : null;
            console.log('lastRecord ===> ' + this.lastRecordName);

            if (this.lastRecordName != null) {
                this.requestMoreRecords();
            }
        }
        this.currentPage = this.totalPages.toString();
        this.contactToDisplay = this.contactChunks[parseInt(this.currentPage) - 1];
        this.disableNext = false;
        this.disablePrev = false;
        this.calculatePageText();
        this.isFirstClick = !this.isFirstClick;
    }
    

    handleLimitChange(event) {
        debugger;
        this.pageLimit = event.detail.value;
        this.selectedPage = '1';
        this.size = parseInt(this.pageLimit)
        this.setPagination(this.size); //invoking the pagination logic
        //this.calculatePageText();
    }

    requestMoreRecords() {
        debugger;
        
        this.total = this.total + 1;
        let event = new CustomEvent('requestmore', { detail : { 
            lastRecordName: this.lastRecordName,
            direction: 'next'
         }});
        this.dispatchEvent(event);
    }

    requestPreviousRecords() {
        debugger;
        this.total = this.total - 1;
        let event = new CustomEvent('requestpreviousrecords', { detail : { 
            lastRecordName: this.firstRecordName,
            direction: 'previous'
         }});
        this.dispatchEvent(event);
    }

    returnRecordToDisplay() {
        debugger;
        let event = new CustomEvent('pagechanged', { detail: { recordToDisplay: this.contactToDisplay } });
        this.dispatchEvent(event);
    }
   
}