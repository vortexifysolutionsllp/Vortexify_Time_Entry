import { LightningElement, track, wire } from 'lwc';
import getProjectDetails from '@salesforce/apex/ProjectEstimation_Prepartion_Controller.getProjectDetails';
import Progressbar from '@salesforce/resourceUrl/Progressbar';
import { loadStyle, loadScript } from 'lightning/platformResourceLoader';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class ProjectEstimation_Preparation extends LightningElement {

    @track isChartJsInitialized;
    @track ActiveProjectData = [];
    @track mapData=[];
    @track maxvalue;


    connectedCallback() {
        debugger;
        this.callApexMethod();
    }

    callApexMethod() {
        debugger;
        getProjectDetails()
            .then(result => {
                    if(result!=null && result!=undefined) {
                        this.ActiveProjectData=result;  
                    }
                    this.configureCharts();
                    this.isChartJsInitialized = false;
                    this.renderedCallback(); 
                    console.log('result', result);
            })
            .catch(error => {
                console.log('error', error);
            })
    }

    configureCharts() {
        debugger
        this.config = {
            type: 'horizontalBar', //horizontalBar
            data: {
                labels: this.ActiveProjectData.map(element => element.projectName),
                datasets: [{
                    label: 'Project Progress',
                    data: this.ActiveProjectData.map(element => element.Total_JiraTask_hours_onPercent),
                    backgroundColor:'rgb(80, 200, 120)',
                    borderWidth: 1
                }]
            },
            options: {
                // responsive: true,
                scales: {
                    xAxes: [{
                        stacked: true,
                        beginAtZero: true,
                        ticks: {
                            min: 0,
                            max: 100,
                            callback: function (value) { return value + "%" }
                        }
                    }],
                    yAxes: [{
                        stacked: true,
                        beginAtZero: true
                    }]
                },
                tooltips: {
                    enabled: true,
                    mode: 'single',
                    callbacks: {
                        label: function (tooltipItems, data) {
                               console.log('data',data);
                                console.log('tooltipItems',tooltipItems);
                            return data.datasets[tooltipItems.datasetIndex].label + ': ' + tooltipItems.xLabel + ' %';
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
            this.chart = new window.Chart(ctx, this.config);
            this.chart.canvas.parentNode.style.height = '100%';
            this.chart.canvas.parentNode.style.width = '100%';
        }).catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error loading ChartJS',
                    message: error.message,
                    variant: 'error',
                }),
            );
        });
    }
}