import { LightningElement, wire, api, track } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import apexchartJs from '@salesforce/resourceUrl/apexchartJs';
import getAllProjectsWithDetailsData from '@salesforce/apex/AddModuleButtonHelper.appprojectDataWithDetails';
export default class ProjectPrecentageView extends LightningElement {
    chartInitialized = false;
    chart;

    @track daysDifference;
    @track testingMapData;
    @track testFinalDATA;
    @track totalActiveProjects;

    @wire(getAllProjectsWithDetailsData)
    wiredData({ error, data }) {
        if (data) {
            debugger;
            this.processData(data);
            // console.log('JSON DATA', JSON.stringify(data));
            this.wiredDataa = data;
        } else if (error) {
            console.error('Error:', error);
        }
    }

    processData(data) {
        debugger;
        let temLProjectLIst = [];
        this.totalActiveProjects = data.projects.length
        for (let i = 0; i < data.projects.length; i++) {
            let currentItem = data.projects[i];
            if (currentItem && currentItem.Milestones__r && currentItem.Project_Start_Date__c && currentItem.Name) {
                let tempMils = currentItem.Milestones__r
                temLProjectLIst.push({
                    // threshold: this.calculateDaysDifference(currentItem.Project_Start_Date__c, currentItem.Project_End_Date__c),
                    label: currentItem.Name,
                    precentage:currentItem.Percentage_Level__c,
                    Id: currentItem.Id,
                });
            } else {
                console.log('Skipping project due to null values in properties.');
            }
        }
      
        this.initializeChart(temLProjectLIst);
    }

    initializeChart(data) {
        debugger;
        const chartOptions = {
            series: [{
                data:data.map(project => project.precentage),
            }],
            chart: {
                type: 'bar',
                height: 350,
                // stacked: true,
                stackType: '100%'
            },
            plotOptions: {
                bar: {
                    borderRadius: 4,
                    horizontal: true,
                    dataLabels: {
                        total: {
                            enabled: true,
                            offsetX:10,
                            style: {
                                fontSize: '13px',
                                fontWeight: 900
                            }
                        }
                    }
                }
            },
            dataLabels: {
                enabled: false
            },
            xaxis: {
                categories: data.map(project => project.label),

            }

        };

        loadScript(this, apexchartJs + '/dist/apexcharts.js')
            .then(() => {
                if (this.chartInitialized) {
                    // If the chart is already initialized, destroy it before rendering again
                    this.chart.destroy();
                }

                const div = this.template.querySelector('.chart');
                // console.log('Chart Options:', chartOptions);

                // Adjust the width and height of the container dynamically
                const containerWidth = div.offsetWidth || 400;
                const containerHeight = div.offsetHeight || 300;

                div.style.width = containerWidth + 'px';
                div.style.height = containerHeight + 'px';

                this.chart = new ApexCharts(div, chartOptions);
                this.chart.render();
                this.chartInitialized = true;
            })
            .catch((error) => {
                console.error('Failed: ' + error);
            });
    }

    renderedCallback() {
        // Use a guard clause to ensure the chart is initialized only once
        if (this.chartInitialized) {
            return;
        }

        // Call initializeChart with an empty array or provide initial data if needed
        this.initializeChart([]);
    }

    calculateDaysDifference(startDate, endDate) {
        if (startDate && endDate) {
            const startDateTime = new Date(startDate);
            const endDateTime = new Date(endDate);
            // Calculate the time difference in milliseconds
            const timeDifference = endDateTime - startDateTime;

            // Calculate the number of days
            const daysDifference = Math.floor(timeDifference / (24 * 60 * 60 * 1000));

            // Update the tracked variable to display the result
            this.daysDifference = daysDifference;
            return daysDifference;
        } else {
            // Handle the case where either startDate or endDate is not provided
            this.daysDifference = undefined;
        }
    }


}