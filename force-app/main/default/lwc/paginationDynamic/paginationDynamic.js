import { LightningElement,api,wire,track } from 'lwc';

const chunk = (arr, size) => {
    const chunkedArray = [];
    for (let i = 0; i < arr.length; i++) {
       const last = chunkedArray[chunkedArray.length - 1];
       if(!last || last.length === size){
          chunkedArray.push([arr[i]]);
       }else{
          last.push(arr[i]);
       }
    };
    return chunkedArray;
};


export default class PaginationDynamic extends LightningElement {

    @api list;
    @api value;

    @api replys;
    currentPage="1";
    @api contactChunks;
    contactToDisplay;
    totalPages;
    disableNext=false;
    disablePrev=true;
    pageOptionsLoaded = false;
    @track pageOptions=[];
    @track allpageOptions=[];
    size;
    totalRecords;
    pageLimit="10";

    @track point = 3;
    @track iteration = 0;
    
     get pageLimitOptions() {
        var pageLimitList = [
            { label: '10', value: '10' },
            { label: '15', value: '15' },
            { label: '20', value: '20' },
            { label: '50', value: '50' },
            { label: '100', value: '100' },
        ];
        return pageLimitList;
    }

    @api
    setPagination(size)
    {
        debugger;
        if(this.list.length > 0)
        {
            this.allpageOptions =[];
            this.pageOptions = [];
            this.disableNext=this.list.length<=size// false;
            this.disablePrev=true;
            this.size=size;
            if(this.iteration == 0){
                this.currentPage="1";
                this.totalRecords=this.list.length;
                this.contactChunks= chunk(this.list, this.size);
                console.log('contactChunks====>'+ this.contactChunks);
            
                this.contactToDisplay=this.contactChunks[0];
                console.log('this.contactToDisplay====>'+ this.contactToDisplay);
                        
                this.totalPages=this.contactChunks.length;
                console.log(' this.totalPages  ====>'+ this.totalPages);

            }
            else{
                this.currentPage= this.point-1;
                this.totalRecords=this.list.length;
                this.contactChunks= chunk(this.list, this.size);
                console.log('contactChunks====>'+ this.contactChunks);
                console.log('this.point=====>'+this.point);
                this.contactToDisplay=this.contactChunks[this.point-1];
                console.log('this.contactToDisplay====>'+ this.contactToDisplay);
                        
                this.totalPages=this.contactChunks.length;
                console.log(' this.totalPages  ====>'+ this.totalPages)

            }
            

            if(this.iteration === 0){
                var pageOptObj={};
                for(var i=1; i<= this.totalPages; i++)
                {
                pageOptObj={};
                pageOptObj.label=i.toString();
                pageOptObj.value=i.toString();
                pageOptObj.className = `${i==1?'background-color:#1589EE;color:white;':'color:black;'} height:30px;width:30px;border-radius: 2px;cursor: pointer;text-align: center;margin-right: 3px;display:flex;align-items: center;justify-content: center;`
                this.allpageOptions.push(pageOptObj);
                }

            }
            else{
                var pageOptObj={};
                for(var i=1; i<= this.totalPages; i++)
                {
                pageOptObj={};
                pageOptObj.label=i.toString();
                pageOptObj.value=i.toString();
                pageOptObj.className = `${i==this.currentPage+1?'background-color:#1589EE;color:white;':'color:black;'} height:30px;width:30px;border-radius: 2px;cursor: pointer;text-align: center;margin-right: 3px;display:flex;align-items: center;justify-content: center;`
                this.allpageOptions.push(pageOptObj);
                
                }
                //this.totalPages
                //
            

            }
            if(this.list.length==this.size){
                this.allpageOptions.slice(0,-1);
                console.log("pageOptions-----",+this.pageOptions);
            }
            if(this.iteration === 0){
                 this.pageOptions = this.allpageOptions.slice(0,3);
                 this.pageOptionsLoaded = true;
                 this.point = this.point+1;
                 this.iteration = this.iteration+1;
                 this.calculatePageText();
            }
            else{
                this.pageOptions = this.allpageOptions.slice(this.point-3,this.point);
                this.pageOptionsLoaded = true;
                this.point = this.point+1;
                this.calculatePageText1(this.point);
            }
            this.setDefaultPageLimit(size);
        }
    }


    @api
    setPaginationReply(size)
    {
        debugger;
        if(this.replys.length > 0)
        {
            this.pageOptions = [];
            this.disableNext=this.replys.length<=size// false;
            this.disablePrev=true;
            this.size=size;
            this.currentPage="1";
            this.totalRecords=this.replys.length;
            
            this.contactChunks= chunk(this.replys, this.size);
            this.contactToDisplay=this.contactChunks[0];
            this.totalPages=this.contactChunks.length;
            
            var pageOptObj={};
            for(var i=1; i<= this.totalPages; i++)
            {
                pageOptObj={};
                pageOptObj.label=i.toString();
                pageOptObj.value=i.toString();
                pageOptObj.className = `${i==1?'background-color:#1589EE;color:white;':'color:black;'} height:30px;width:30px;border-radius: 2px;cursor: pointer;text-align: center;margin-right: 3px;display:flex;align-items: center;justify-content: center;`
                this.allpageOptions.push(pageOptObj);
            }
            console.log("ListLenght---",this.replys.length);
            console.log("Size---",this.size);

            
            if(this.replys.length==this.size){
                this.pageOptions.slice(0,-1);
                console.log("pageOptions-----",this.pageOptions);
            }
            this.point = this.point+1;
            this.updateDisplayedPageOptionsNext(this.point)
            this.pageOptionsLoaded = true;
            this.calculatePageText();
            this.setDefaultPageLimit(size);
        }
    }

    calculatePageText()
    {
        debugger;
        var end=(parseInt(this.currentPage) * this.size) > this.totalRecords ? this.totalRecords : (parseInt(this.currentPage) * this.size);
        this.pageParam=((parseInt(this.currentPage) * this.size) - (this.size-1))+' to '+end;
        this.returnRecordToDisplay();
    }

    calculatePageText1(curr1)
    {
        debugger;
        var end=(parseInt(curr1-1) * this.size) > this.totalRecords ? this.totalRecords : (parseInt(curr1-1) * this.size);
        this.pageParam=((parseInt(curr1-1) * this.size) - (this.size-1))+' to '+end;
        this.returnRecordToDisplay();
    }

    updateDisplayedPageOptionsNext(curr) {
        debugger;
        this.pageOptions = [];
        const endIndex = curr; // Assuming you want to show 3 options at a time
        const startIndex = endIndex - 3;
        this.pageOptions = this.allpageOptions.slice(startIndex, endIndex);
    }

    updateDisplayedPageOptionsPrev(curr) {
        debugger;
        this.pageOptions = [];
        const startIndex = curr-1;
        const endIndex= startIndex + 3;
       
        this.pageOptions = this.allpageOptions.slice(startIndex, endIndex);
    }

    handleNext()
    {
        debugger;
        this.currentPage=(parseInt(this.currentPage)+1).toString();
        if(parseInt(this.currentPage) >= this.totalPages)
        {
            this.currentPage=this.totalPages.toString();
            this.disableNext=true;
            this.disablePrev=false;
        }
        else
        {
            this.disableNext=false;
            this.disablePrev=false;
        }
        this.contactToDisplay=this.contactChunks[parseInt(this.currentPage)-1];
        this.updateDisplayedPageOptionsNext(this.currentPage);
        this.calculatePageText();
        this.handlePageChangeStyle(this.currentPage);
        
    }

    handlePrev()
    {
        debugger;
        this.currentPage=(parseInt(this.currentPage)-1).toString();
        if(parseInt(this.currentPage) <= "1")
        {
            this.currentPage="1";
            this.disableNext=false;
            this.disablePrev=true;
        }
        else
        {
            this.disableNext=false;
            this.disablePrev=false;
        }
        this.point = this.point-1;
        
        this.contactToDisplay=this.contactChunks[parseInt(this.currentPage)-1];
        console.log('contactToDisplay=====>'+this.contactToDisplay);
        this.updateDisplayedPageOptionsPrev(this.currentPage);
        this.calculatePageText();
         this.handlePageChangeStyle(this.currentPage);
    }

    handlePageChange(event)
    {
        debugger;
        this.currentPage=event.target.value;

        this.contactToDisplay=this.contactChunks[parseInt(this.currentPage)-1];
        if(parseInt(this.currentPage) == this.totalPages && (parseInt(this.pageOptions[this.pageOptions.length-1].value) != this.currentPage)  ){
            this.disableNext=true;
            this.disablePrev=true;
        }else if(parseInt(this.pageOptions[this.pageOptions.length-1].value) == this.currentPage){
            this.disableNext=true;
            this.disablePrev=false;
        }
        else if(parseInt(this.currentPage) <= 1)
        {
            this.disableNext=false;
            this.disablePrev=true;
        }
        else if(parseInt(this.currentPage) >= this.totalPages)
        {
            this.disableNext=true;
            this.disablePrev=false;
        }
        else
        {
            this.disableNext=false;
            this.disablePrev=false;
        }
        this.calculatePageText();
        this.handlePageChangeStyle(this.currentPage);
    }

    handlePageChangeStyle(selectedValue){
        debugger;
        let prevSelectedIndex = this.pageOptions.findIndex(item=>item.className.includes('background-color'));
        let currentSelectedIndex = this.pageOptions.findIndex(item=>item.value==selectedValue);

        this.pageOptions[prevSelectedIndex].className = this.pageOptions[prevSelectedIndex].className.replace('background-color:#1589EE;','') + 'color:black;';
        this.pageOptions[currentSelectedIndex].className = this.pageOptions[currentSelectedIndex].className + 'background-color:#1589EE;color:white;';

    }


    

    handlemore(){
        debugger;
        if(this.value == 'fb'){
            const customevent = new CustomEvent('showmore',{detail:{message:'Hello'}});
            this.dispatchEvent(customevent);
        }else{
            const customevent = new CustomEvent('instashowmore',{detail:{message:'Hello'}});
            this.dispatchEvent(customevent);
        }
        
    }

    handleFirst()
    {
        this.currentPage="1";
        this.disableNext=false;
        this.disablePrev=true;
        this.contactToDisplay=this.contactChunks[parseInt(this.currentPage)-1];
        this.calculatePageText();
    }

    handleLast()
    {
        this.currentPage=this.totalPages.toString();
        this.disableNext=true;
        this.disablePrev=false;
        this.contactToDisplay=this.contactChunks[parseInt(this.currentPage)-1];
        this.calculatePageText();
    }

    handleLimitChange(event) {
        debugger;
        this.pageLimit = event.detail.value;
        this.selectedPage='1';
        this.size = parseInt(this.pageLimit)
        this.setPagination(this.size); //invoking the pagination logic
        //this.calculatePageText();
    }

    setDefaultPageLimit(value) {
        debugger;
        this.pageLimit = value.toString();
        this.selectedPage='1';
        this.size = parseInt(this.pageLimit)
        //this.setPagination(this.size); //invoking the pagination logic
        //this.calculatePageText();
    }

    returnRecordToDisplay(){
        let event = new CustomEvent('pagechanged',{detail:{recordToDisplay:this.contactToDisplay}});
        this.dispatchEvent(event);
    }

    



}