import { LightningElement,api,wire,track } from 'lwc';
import getMonthlyReport from '@salesforce/apex/ReportLWCController.getMonthlyReport';

export default class MonthlyReport extends LightningElement 
{

    monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];


    @track columns = ['Resource'];
    @track resultData = [];
    @track resourceTasks = [];

    @track data = [];

    connectedCallback(){
        getMonthlyReport().then(res=>{
            console.log('Result-----',res);
            console.log('type of result',  typeof res);
            var json = JSON.parse(res);
            
            console.log('Result jSON-----',json);
            
            var result = Object.keys(json).map((key) => [{'name':key, data:json[key]}]);
            
            var resResult = [];
            result.forEach(item=>{
                let obj = item[0];
                if(obj.data){
                    obj.data.forEach(d=>{
                        d.date = parseInt(d.day.split('-')[2]);
                    })
                }
                resResult.push(obj);
            })

            this.data = resResult;

            console.log('Resss----',resResult);

            this.configColumns();
        }).catch(error=>{
            console.log('Error---',error);
        })
    }

    configColumns(){ 
        debugger;
        let today = new Date();
        let month = today.getMonth();
        let year = today.getYear();
        let empty = [];
        
        var totalDays = this.getDays(today.getYear(),today.getMonth()+1);
        console.log(this.totalDays);

        // let startDate = new Date(year,month,1);
        // let endDate = new Date(year,month,totalDays);

        let resList = [];
    
        for(var i = 1; i<=totalDays; i++){
            let day = i+ ' ' + this.monthNames[today.getMonth()];
            this.columns.push(day); 

            this.data.forEach(res=>{
                //res = {key:'Shiva',data=[]};
                //one resource will come here one by one
                let dData = res.data;
                console.log('dData ==-->',dData);
                 let r = [];
                if(res.data){
                    let resTaskOnThatDay = dData.find(item=>item.date==i);
                    if(!resTaskOnThatDay){
                           //let obj = {hours:'',day:day,date:i};
                          //dData[i-1] = obj;
                         // r[i-1] = obj; 
                 r[i-1] = resTaskOnThatDay?resTaskOnThatDay:{day:i,hours:0};
                             
                    }else{
                      //  dData[i-1] = resTaskOnThatDay;
                            r[i-1] = resTaskOnThatDay;
                    }
                   
                }
                console.log('R value==>',r);

                res.data = dData;
                
                resList.push(res);
            })
        }

        console.log('month=',this.columns);
        console.log('ResourcesWorks----',resList);
    }
    getDays(year, month){
        return new Date(year, month, 0).getDate();
    }
}