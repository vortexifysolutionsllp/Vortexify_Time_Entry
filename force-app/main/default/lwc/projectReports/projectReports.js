import { LightningElement, wire, track, api } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import CHARTJS from '@salesforce/resourceUrl/AviDeepChart';
import getAllProjectsWithDetailsData from '@salesforce/apex/AddModuleButtonHelper.appprojectDataWithDetails';
export default class ProjectReports extends LightningElement {
    @track wiredDataa = [];
    chartInitialized = false;


    @wire(getAllProjectsWithDetailsData)
    wiredData({ error, data }) {
        if (data) {
            debugger;
            this.wiredDataa = data;
            let tempMainData = data
            this.processData(tempMainData);
            console.log('Data', data);
        } else if (error) {
            console.error('Error:', error);
        }
    }

    processData(data) {
        debugger;
        let temLProjectLIst = [];
        for (let i = 0; i < data.projects.length; i++) {
            let currentItem = data.projects[i];

            // Check if currentItem.projects is not null before accessing its properties
            if (currentItem && currentItem.Number_Of_Weeks__c && currentItem.Project_Start_Date__c && currentItem.Name) {
                // Create an object for each item and push it to the array
                temLProjectLIst.push({
                    threshold: currentItem.Number_Of_Weeks__c,
                    value: this.calculateTotalWeeks(currentItem.Project_Start_Date__c),
                    label: currentItem.Name
                });
            } else {
                // Handle the case where some properties are null
                console.log('Skipping project due to null values in properties.');
            }
        }
        temLProjectLIst.unshift({
            threshold: 0,
            value: 0,
            label: 'Dummy Project'
        });

        this.initializeChart(temLProjectLIst);
    }


    renderedCallback() {
        if (this.chartInitialized) {
            return;
        }

        loadScript(this, CHARTJS)
            .then(() => {
                this.initializeChart();
            })
            .catch(error => {
                console.log('Error loading Chart.js', error);
            });
    }

    calculateDynamicColor(value, threshold) {
        // Change the color to red if the value crosses the threshold
        const color = value > threshold ? 'rgba(255, 0, 0, 0.2)' : 'rgba(75, 192, 192, 0.2)';
        return color;
    }

    initializeChart(projectsData) {
        const ctx = this.template.querySelector('canvas').getContext('2d');

        const max = Math.max(...projectsData.map(project => Math.max(project.value, project.threshold)));
        const ticks = Array.from({ length: max + 1 }, (_, i) => i);

        const chart = new window.Chart(ctx, {
            type: 'horizontalBar',
            data: {
                labels: projectsData.map(project => project.label),
                datasets: [
                    {
                        label: 'Total Week Taken',
                        data: projectsData.map(project => project.value),
                        backgroundColor: 'rgb(240, 0, 0)',
                        borderColor: 'rgb(255, 0, 0)',
                        borderWidth: 2,
                        datalabels: {
                            align: 'end',
                            anchor: 'end',
                            display: function (context) {
                                return context.dataset.data[context.dataIndex] > 0;
                            },
                            formatter: function (value, context) {
                                return value;
                            },
                            color: function (context) {
                                return 'rgba(75, 192, 192, 1)';
                            },
                            font: {
                                weight: 'bold',
                                size: 14
                            },
                            backgroundColor:'rgba(255, 0, 0, 1)'
                        }
                    },
                    {
                        label: 'Total Week Given',
                        data: projectsData.map(project => project.threshold),
                        backgroundColor: 'rgb(60, 179, 113)',
                        borderColor: 'rgb(60, 199, 113)',
                        borderWidth: 2,
                        datalabels: {
                            align: 'end',
                            anchor: 'end',
                            display: function (context) {
                                return context.dataset.data[context.dataIndex] > 0;
                            },
                            formatter: function (value, context) {
                                return value;
                            },
                            color: function (context) {
                                return 'rgba(255, 0, 0, 1)';
                            },
                            font: {
                                weight: 'bold',
                                size: 14
                            }
                        }
                    }
                ]
            },
            options: {
                scales: {
                    x: [{
                        type: 'linear',
                        position: 'bottom',
                        ticks: {
                            min: 0,
                            max: max,
                            stepSize: 1,
                            beginAtZero: true
                        },
                        stacked: true
                    }],
                    y: [{
                        stacked: true
                    }]
                },
                plugins: {
                    legend: {
                        display: true
                    }
                },
                tooltips: {
                    // backgroundColor: 'rgba(75, 192, 192, 1)',
                    // bodyFontColor: '#fff',
                    displayColors: false,
                    callbacks: {
                        label: function (tooltipItem, data) {
                            const dataIndex = tooltipItem.dataIndex;
                            if (!data.datasets || !data.datasets.length) {
                                return ''; // No datasets to display
                            }
                            const trackedDataset = data.datasets[0];
                            const thresholdDataset = data.datasets[1];

                            if (!trackedDataset.data || !thresholdDataset.data) {
                                return ''; // No data in datasets
                            }

                            const trackedValue = trackedDataset.data[dataIndex];
                            const thresholdValue = thresholdDataset.data[dataIndex];
                            const projectName = data.labels[dataIndex];

                            if (projectName === undefined || trackedValue === undefined || thresholdValue === undefined) {
                                return ''; // Skip if any value is undefined
                            }

                            const weeksCompleted = Math.min(trackedValue, thresholdValue);
                            const weeksLeft = Math.max(0, thresholdValue - trackedValue);
                            const isDelayed = trackedValue > thresholdValue;

                            let tooltipText = `Project: ${projectName}\n`;
                            tooltipText += `Tracked: ${trackedValue} weeks\n`;
                            tooltipText += `Threshold: ${thresholdValue} weeks\n`;
                            tooltipText += `Completed: ${weeksCompleted} weeks\n`;
                            tooltipText += `Left: ${weeksLeft} weeks\n`;
                            tooltipText += `Status: ${isDelayed ? 'Delayed' : 'On Track'}`;

                            return tooltipText;
                        }
                    }
                }

            }
        });

        this.chartInitialized = true;
    }

    calculateTotalWeeks(startDate) {
        const currentDate = new Date();
        startDate = new Date(startDate);
        // Calculate the difference in milliseconds
        const timeDifference = currentDate - startDate;
        // Calculate the number of weeks
        const weeksDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 7));
        return weeksDifference;

    }
}