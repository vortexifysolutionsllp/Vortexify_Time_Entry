import { LightningElement,api,wire,track } from 'lwc';
import Progressbar from '@salesforce/resourceUrl/Progressbar';
import { loadStyle, loadScript } from 'lightning/platformResourceLoader';
import selectedProjectDetails from '@salesforce/apex/ProjectEstimation_Prepartion_Controller.getSelectedProjectProgress';
export default class Related_Project_Progress extends LightningElement {

   @track isChartJsInitialized;
   @track ProjectRecord;
   @track MODULEDETAILS=[];
   @track ResourceProjectDetails=[];
   @track config;
   @track maxvalue;
   
   @track ressourceMaxvalue;
   @track ProjectRecord;
   @track totalSpentHours;
   @api projectId;
   connectedCallback() {
       debugger;
    //    this.callApexMethod();
   }

//    callApexMethod(){
//        debugger;
//        selectedProjectDetails({ProjectId:this.projectId})
//        .then(result=>{
//            if(result!=null && result!=undefined){
//                this.ProjectRecord=result.ProjectRecord;
//                this.MODULEDETAILS=result.PMPWList;
//                this.ResourceProjectDetails=result.RHOPList;
               
//                this.maxvalue=Math.max(...this.MODULEDETAILS.map(element => element.Module_Allocated_hours),...this.MODULEDETAILS.map(element => element.Total_JiraTask_Created_hours));
//                this.totalSpentHours=+this.MODULEDETAILS.map(element => element.Total_JiraTask_Created_hours).reduce((a, b) => a + b);
//                this.ressourceMaxvalue=Math.max(...this.ResourceProjectDetails.map(element => element.Resource_Spend_hours))
//                this.modulebasedCharts();
//                this.resourcebasedCharts();
//                this.isChartJsInitialized=false;
//                this.renderedCallback();
//            }
//        })
//        .catch(error=>{
//            console.log('error',error);
//        })
//    }

   @wire(selectedProjectDetails, { ProjectId: '$projectId' })
    wiredProjectDetails({ error, data }) {
        if (data) {
            this.ProjectRecord = data.ProjectRecord;
            this.MODULEDETAILS = data.PMPWList;
            this.ResourceProjectDetails = data.RHOPList;

            this.maxvalue = Math.max(
                ...this.MODULEDETAILS.map(element => element.Module_Allocated_hours),
                ...this.MODULEDETAILS.map(element => element.Total_JiraTask_Created_hours)
            );

            this.totalSpentHours = +this.MODULEDETAILS.map(element => element.Total_JiraTask_Created_hours).reduce((a, b) => a + b);

            this.ressourceMaxvalue = Math.max(...this.ResourceProjectDetails.map(element => element.Resource_Spend_hours));

            this.modulebasedCharts();
            this.resourcebasedCharts();
            this.isChartJsInitialized = false;
            this.renderedCallback();
        } else if (error) {
            console.log('Error:', error);
        }
    }


      modulebasedCharts() {
        debugger
        this.config = {
            type: 'horizontalBar',
            data: {
                labels: this.MODULEDETAILS.map(element => element.Module_Name),
                datasets: [
                {
                    label: 'Total Jira Task Created Hours',
                    data: this.MODULEDETAILS.map(element => element.Total_JiraTask_Created_hours),
                    backgroundColor:'rgb(211, 84, 0)',
                    borderWidth: 1
                },
                {
                    label: 'Allocated Hours',
                    data: this.MODULEDETAILS.map(element => element.Module_Allocated_hours),
                    backgroundColor:'rgb(80, 200, 120)',
                    borderWidth: 1
                }]
            },
            options: {
                //responsive: true,
                //animation: true,
                scales: {
                    xAxes: [{
                        stacked: false,
                        beginAtZero: true,
                        type: 'linear',
                        position: 'bottom',
                        ticks: {
                            min: 0,
                            max: this.maxvalue,
                            callback: function (value) { return value + "hr" }
                        }
                    }],
                    yAxes: [{
                        stacked: false,
                        beginAtZero: true
                    }]
                },
                tooltips: {
                    enabled: true,
                    mode: 'single',
                    callbacks: {
                        label: function (tooltipItems, data) {
                            return data.datasets[tooltipItems.datasetIndex].label + ': ' + tooltipItems.xLabel + 'hr';
                        }
                    }
                },
                legend: {
                    display: true  // Hide legends
                }
            }
        };
    }

     resourcebasedCharts() {
        debugger
        this.resourceconfig = {
            type: 'bar',
            data: {
                labels: this.ResourceProjectDetails.map(element => element.Resource_Name),
                datasets: [
                {
                    label: 'Total Jira Task Created Hours',
                    data: this.ResourceProjectDetails.map(element => element.Resource_Spend_hours),
                    backgroundColor:'rgb(211, 84, 0)',
                    borderWidth: 1
                },
                ]
            },
            options: {
                // responsive: true,
                scales: {
                    xAxes: [{
   
                    }],
                    yAxes: [{
                        stacked: false,
                        beginAtZero: true,
                        type: 'linear',
                        position: 'bottom',
                        ticks: {
                            min: 0,
                            max: this.ressourceMaxvalue,
                            callback: function (value) { return value + "hr" }
                        }
                    }]
                },
                tooltips: {
                    enabled: true,
                    mode: 'single',
                    callbacks: {
                        label: function (tooltipItems, data) {
                            return data.datasets[tooltipItems.datasetIndex].label + ': ' + tooltipItems.xLabel + 'hr';
                        }
                    }
                },
                legend: {
                    display: true  // Hide legends
                }
            }
        };
    }

    renderedCallback() {
        debugger;
        if (this.isChartJsInitialized) {
            return;
        }
        this.isChartJsInitialized = true;

        Promise.all([
            loadScript(this, Progressbar)
        ]).then(() => {
            const ctx = this.template.querySelector('canvas.linechart').getContext('2d');
            const ctxres = this.template.querySelector('canvas.resourcechart').getContext('2d');
            this.chart = new window.Chart(ctx, this.config);
            this.chart = new window.Chart(ctxres, this.resourceconfig);
            this.chart.canvas.parentNode.style.height = '100%';
            this.chart.canvas.parentNode.style.width = '100%';
        }).catch(error => {
            /*this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error loading ChartJS',
                    message: error.message,
                    variant: 'error',
                }),
            );*/
        });
    }
}