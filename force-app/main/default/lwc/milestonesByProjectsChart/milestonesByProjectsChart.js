import { LightningElement, wire, track, api } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import kendo from '@salesforce/resourceUrl/AviDeepChart';
//import getChartData from '@salesforce/apex/KendoChartController.getChartData';

export default class MilestonesByProjectsChart extends LightningElement {


    chartInitialized = false;

    renderedCallback() {
        if (this.chartInitialized) {
            return;
        }
        this.chartInitialized = true;

        Promise.all([
            loadScript(this, kendo + '/js/kendo.all.min.js'), // Adjust the path accordingly
            loadStyle(this, kendo + '/styles/kendo.common.min.css'),
            loadStyle(this, kendo + '/styles/kendo.default.min.css')
        ])
        .then(() => {
            this.initializeChart();
        })
        .catch(error => {
            console.error('Error loading Kendo UI', error);
        });
    }

    initializeChart() {
        const categories = [1952, 1956, 1960, 1964, 1968, 1972, 1976, 1984, 1988, 1992, 1996, 2000, 2004, 2008, 2012];

        $(this.template.querySelector('.kendo-chart-container')).kendoChart({
            title: {
                text: 'Practice Versoon' // Typo in original script corrected to 'Practice Version'
            },
            legend: {
                visible: false
            },
            seriesDefaults: {
                type: 'column'
            },
            series: [
                {
                    name: 'Auto',
                    stack: '2021',
                    data: [1, 32, 34, 36, 45, 33, 34, 83, 36, 37, 44, 37, 35, 36, 46]
                },
                {
                    name: 'Silver Medals',
                    stack: '2021',
                    data: [19, 25, 21, 26, 28, 31, 35, 60, 31, 34, 32, 24, 40, 38, 29]
                },
                {
                    name: 'Auto',
                    stack: '2020',
                    data: [10, 32, 34, 36, 45, 33, 34, 83, 36, 37, 44, 37, 35, 36, 46]
                },
                {
                    name: 'Silver Medals',
                    stack: '2020',
                    data: [19, 25, 21, 26, 28, 31, 35, 60, 31, 34, 32, 24, 40, 38, 29]
                },
                {
                    name: 'Gold Medals',
                    stack: '2020',
                    data: [10, 32, 34, 36, 45, 33, 34, 83, 36, 37, 44, 37, 35, 36, 46]
                }
            ],
            valueAxis: {
                line: {
                    visible: false
                }
            },
            categoryAxis: {
                categories: categories,
                majorGridLines: {
                    visible: false
                }
            },
            tooltip: {
                visible: true,
                template: '#= series.name #: #= value #'
            }
        });
    }

    // Optional: Implement cleanup if needed
    // disconnectedCallback() {
    //     this.destroyChart();
    // }

    // destroyChart() {
    //     // Destroy the Kendo Chart instance
    // }



   /* @track wiredDataa = [];
    chartInitialized = false;


    @wire(getAllProjectsWithDetailsData)
    wiredData({ error, data }) {
        if (data) {
            debugger;
            this.wiredDataa = data;
            let tempMainData = data
            //this.processData(tempMainData);
            this.initializeChart(tempMainData);
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

    
    //1st
    /*initializeChart(projectsData) {
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
    }*/

        //2nd
    /*initializeChart(projectsData) {
        const ctx = this.template.querySelector('canvas').getContext('2d');

        const data = {
            labels: projectsData.map(project => project.label),
            datasets: [
                {
                    label: 'Total Week Taken',
                    data: projectsData.map(project => project.value),
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    stack: 'stack1'
                },
                {
                    label: 'Total Week Given',
                    data: projectsData.map(project => project.threshold),
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    stack: 'stack1'
                }
            ]
        };

        const options = {
            responsive: true,
            scales: {
                x: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Weeks'
                    }
                },
                y: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Projects'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.raw || 0;
                            return `${label}: ${value} weeks`;
                        }
                    }
                }
            }
        };

        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: options
        });

        console.log('Chart initialized with data:', data);
    } /


        initializeChart(projectsData) {
            debugger;
            if(projectsData != undefined) {
                const ctx = this.template.querySelector('canvas').getContext('2d');
        
                // Transforming the data to fit Chart.js dataset structure
                const transformedData = this.transformData(projectsData);
        
                const data = {
                    labels: transformedData.labels,
                    datasets: transformedData.datasets
                };
        
                const options = {
                    responsive: true,
                    scales: {
                        x: {
                            stacked: true,
                            title: {
                                display: true,
                                text: 'Projects'
                            }
                        },
                        y: {
                            stacked: true,
                            title: {
                                display: true,
                                text: 'Weeks'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    const label = context.dataset.label || '';
                                    const value = context.raw || 0;
                                    return `${label}: ${value} weeks`;
                                }
                            }
                        }
                    }
                };
        
                if (this.chart) {
                    this.chart.destroy();
                }
        
                this.chart = new Chart(ctx, {
                    type: 'bar',
                    data: data,
                    options: options
                });
        
                console.log('Chart initialized with data:', data);
            }
        }
    
        transformData(projectsData) {
            debugger;
            if(projectsData){

                const labels = projectsData.map(project => project.label);
                const datasets = [];
                projectsData.forEach((project, index) => {
                    project.values.forEach((value, stackIndex) => {
                        if (!datasets[stackIndex]) {
                            datasets[stackIndex] = {
                                label: `Stack ${stackIndex + 1}`,
                                data: [],
                                backgroundColor: this.getColor(stackIndex),
                                borderColor: this.getColor(stackIndex, true),
                                borderWidth: 1,
                                stack: 'stack1'
                            };
                        }
                        datasets[stackIndex].data[index] = value;
                    });
                });
            }
    
            return { labels, datasets };
        }
    
        getColor(index, border = false) {
            const colors = [
                'rgba(255, 99, 132, 0.5)',
                'rgba(54, 162, 235, 0.5)',
                'rgba(255, 206, 86, 0.5)',
                'rgba(75, 192, 192, 0.5)',
                'rgba(153, 102, 255, 0.5)',
                'rgba(255, 159, 64, 0.5)'
            ];
            const borderColors = [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ];
            return border ? borderColors[index % colors.length] : colors[index % colors.length];
        }


    calculateTotalWeeks(startDate) {
        const currentDate = new Date();
        startDate = new Date(startDate);
        // Calculate the difference in milliseconds
        const timeDifference = currentDate - startDate;
        // Calculate the number of weeks
        const weeksDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 7));
        return weeksDifference;

    }*/

}