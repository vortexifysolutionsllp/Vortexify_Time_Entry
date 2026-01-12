import { LightningElement,api,wire,track } from 'lwc';
import Chartjs from '@salesforce/resourceUrl/ChartJS'; 
import { loadScript } from 'lightning/platformResourceLoader';
import getAllMileStoneRecords from '@salesforce/apex/ProjectHomeController.getAllMileStoneRecords';  

export default class ShowStackedClusterBar extends LightningElement {


    connectedCallback() {
        this.doSearch();
    }

    @track mileList = [];
     doSearch() {
        getAllMileStoneRecords()
            .then(result => {
                if(result){

                }                
               
            })
            .catch(error => {
                  console.log('error-->',error);
        });
    }


     @track showgraph = true;
    @track showComponentOnClick = false;

 chartjs = Chartjs + "/js/chart.js";
 connectedCallback() {

if (this.chartjsInitialized) {
          return;
        }
        this.chartjsInitialized = true;
        Promise.all([
          loadScript(this, this.utilJs),
          loadScript(this, this.chartjs)

        ])
          .then(() => { 

        this.generateSteppedChart();

})
          .catch(error => {
            this.error = error;
          });  
      }
      errorCallback(error) {
        this.error = error;
      }

         graphClickEvent(){
            window.console.log("In graph click");
            this.showgraph = false;
            this.showComponentOnClick = true;
            window.console.log(this.showgraph);
            window.console.log(this.showComponentOnClick);
    } 


 generateSteppedChart() {
        var barChartData = {
            labels: ["Jan","Feb","March","April","May","Jun","July","August","Sep","Oct","Nov","Dec","Total Amount"],
            datasets: [

            {
                label: "Credit",
                backgroundColor: "#6B8A70",


                borderWidth: 1,
                data: [50,50,50,50,50,50,50,50,50,50,50,50]
              },
              {
                label: "Debit",
                backgroundColor: "#F5A623",


                borderWidth: 1,
                data: [20.30,20.30,20.30,20.30,20.30,20.30,20.30,20.30,20.30,20.30,20.30,20.30]
              },
            ]
          };

          var dataSet = {
            type: "bar",
            data: barChartData,
            options: {
              legend:{
                display:true,
                position:"top",
                labels: {
                  boxWidth:20
              }

              },tooltips:{enabled:true},
              cutoutPercentage: 75,
              responsive: true,
              title: {
                display: true,
               // text: "DPD Assessment"
              },
              scales: {
                yAxes: [{
                  ticks: {
                    beginAtZero: true,
                    suggestedMax: 90
                  },
                  scaleLabel: {
                    display: true,
                    labelString: 'Amount ( in INR Lakhs)'
                  }
                }],
                xAxes: [{

                    barPercentage: 0.5,
                    gridLines: {
                        color: "rgba(0, 0, 0, 0)",
                    },

                }]
              },
            onClick: graphClickEvent
            }
          };
          const ctx = this.template.querySelector("canvas.stepped").getContext("2d");
          this.steppedChart = new window.Chart(ctx, dataSet);


        }


   
       

}