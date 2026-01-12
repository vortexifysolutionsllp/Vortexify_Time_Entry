import { LightningElement, wire, api, track } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import apexchartJs from '@salesforce/resourceUrl/apexchartJs';
import getAllProjectsWithDetailsData from '@salesforce/apex/AddModuleButtonHelper.appprojectDataWithDetails';

export default class ProjectLegionView extends LightningElement {
    @track wiredDataa = [];
    chartInitialized = false;
    chart;
    // @api startDate;
    // @api endDate;
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
                // console.log('tempMils--', JSON.stringify(tempMils));
                temLProjectLIst.push({
                    threshold: this.calculateDaysDifference(currentItem.Project_Start_Date__c, currentItem.Project_End_Date__c),
                    value: this.calculateTotalWeeks(currentItem.Project_Start_Date__c),
                    label: currentItem.Name,
                    milstones: this.createMapOFByMilestonesNames(tempMils),
                    Id: currentItem.Id,
                });
            } else {
                // console.log('Skipping project due to null values in properties.');
            }
        }
        // temLProjectLIst.unshift({
        //     threshold: 0,
        //     value: 0,
        //     label: 'Dummy Project'
        // });

        // console.log('Processed Data:', JSON.stringify(temLProjectLIst)); // Log processed data
        // this.initializeChart(this.transformDataForChart(temLProjectLIst));

        this.initializeChart(temLProjectLIst);
    }

    initializeChart(data) {
        debugger;
        const chartOptions = {
            chart: {
                type: 'bar',
                height: 350,
                stacked: true,
                // stackType: '100%'
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    dataLabels: {
                        total: {
                            enabled: true,
                            offsetX: 0,
                            style: {
                                fontSize: '13px',
                                fontWeight: 900
                            }
                        }
                    }
                },
            },
            stroke: {
                width: 1,
                colors: ['#000000']
            },
            title: {
                text: 'Project Details With Real & Expected Detail Time Lime Milestone Wise'
            },
            xaxis: {
                categories: data.map(project => project.label)
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return val + 'Days';
                    }
                }
            },
            fill: {
                opacity: 1
            },
            legend: {
                position: 'top',
                horizontalAlign: 'center',
                offsetX: 3
            },
            series: this.finaltransformData(this.pushDataasPerMilstonesName(data)),

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

    calculateTotalWeeks(startDate) {
        const currentDate = new Date();
        startDate = new Date(startDate);
        const timeDifference = currentDate - startDate;
        const weeksDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 7));
        return weeksDifference;
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

    // Assuming your provided JSON data is stored in a variable named 'projectsData'

    // Initialize a map to store milestones categorized by Name__c
    // Iterate through each project in the data

    // createMapOFByMilestonesNames(milestones) {
    //     debugger;
    //     let milestonesMapList = [];

    //     if (milestones && milestones.length > 0) {
    //         const milestonesMap = new Map(); // Create a single Map outside the loop
    //         milestones.forEach(milestone => {
    //             const milestoneName = milestone.Name__c;
    //             let daysBW = this.calculateDaysDifference(milestone.Expected_Start_Date__c, milestone.Expected_End_Date__c)
    //             if (milestoneName !== undefined) {
    //                 if (milestonesMap.has(milestoneName)) {
    //                     milestonesMap.get(milestoneName).push(daysBW);
    //                 } else {
    //                     milestonesMap.set(milestoneName, [daysBW]);
    //                 }
    //             }
    //         });

    //         // Push entries of the milestonesMap into milestonesMapList as objects
    //         milestonesMap.forEach((value, key) => {
    //             milestonesMapList.push({ name: key, data: value });
    //         });
    //     }

    //     return milestonesMapList;
    // }

    createMapOFByMilestonesNames(milestones) {
        let milestonesMapList = [];

        if (milestones && milestones.length > 0) {
            const milestonesMap = new Map(); // Create a single Map outside the loop
            milestones.forEach(milestone => {
                const milestoneName = milestone.Name__c;
                let daysBWReal = this.calculateDaysDifference(milestone.Real_Start_Date, milestone.Real_End_Date);
                let daysBWExpected = this.calculateDaysDifference(milestone.Expected_Start_Date__c, milestone.Expected_End_Date__c);

                if (milestoneName !== undefined) {
                    if (milestonesMap.has(milestoneName)) {
                        milestonesMap.get(milestoneName).real.push(daysBWReal);
                        milestonesMap.get(milestoneName).expected.push(daysBWExpected);
                    } else {
                        milestonesMap.set(milestoneName, {
                            real: [daysBWReal],
                            expected: [daysBWExpected]
                        });
                    }
                }
            });

            // Push entries of the milestonesMap into milestonesMapList as objects
            milestonesMap.forEach((value, key) => {
                milestonesMapList.push({
                    name: key,
                    dataReal: value.real,
                    dataExpected: value.expected
                });
            });
        }

        return milestonesMapList;
    }


    // pushDataasPerMilstonesName(data) {
    //     debugger
    //     const extractedData = [];
    //     // Iterate through each project in the provided data
    //     data.forEach(project => {
    //         // Check if the project has milestones
    //         if (project.milstones) {
    //             // Iterate through each milestone in the project
    //             project.milstones.forEach(milestone => {
    //                 // Find existing milestone in extractedData
    //                 const existingMilestone = extractedData.find(item => item.name === milestone.name);

    //                 if (existingMilestone) {
    //                     // If the milestone name already exists, push all numbers in data
    //                     existingMilestone.data.push(...milestone.data);
    //                 } else {
    //                     // If the milestone name doesn't exist, add a new entry
    //                     extractedData.push({ name: milestone.name, data: [...milestone.data] });
    //                 }
    //             });
    //         }
    //     });
    //     this.testFinalDATA = extractedData;
    //     console.log('test final data', JSON.stringify(this.testFinalDATA));
    //     return extractedData;
    // }

    //     pushDataasPerMilstonesName(data) {
    //     const extractedData = [];
    //     // Iterate through each project in the provided data
    //     data.forEach(project => {
    //         // Check if the project has milestones
    //         if (project.milstones) {
    //             // Iterate through each milestone in the project
    //             project.milstones.forEach(milestone => {
    //                 // Find existing milestone in extractedData
    //                 const existingMilestone = extractedData.find(item => item.name === milestone.name);

    //                 if (existingMilestone) {
    //                     // If the milestone name already exists, push data for both "Real" and "Expected" dates
    //                     existingMilestone.dataReal.push(...milestone.dataReal);
    //                     existingMilestone.dataExpected.push(...milestone.dataExpected);
    //                 } else {
    //                     // If the milestone name doesn't exist, add a new entry
    //                     extractedData.push({
    //                         name: milestone.name,
    //                         dataReal: [...milestone.dataReal],
    //                         dataExpected: [...milestone.dataExpected]
    //                     });
    //                 }
    //             });
    //         }
    //     });

    //     this.testFinalDATA = extractedData;
    //     console.log('test final data', JSON.stringify(this.testFinalDATA));
    //     return extractedData;
    // }


    // pushDataasPerMilstonesName(data) {
    //     const groupedData = [];

    //     // Iterate through each project in the provided data
    //     data.forEach(project => {
    //         // Check if the project has milestones
    //         if (project.milstones) {
    //             // Iterate through each milestone in the project
    //             project.milstones.forEach(milestone => {
    //                 // Find existing milestone in groupedData
    //                 const existingGroup = groupedData.find(item => item.name === milestone.name && item.group === project.label);
    //                 if (existingGroup) {
    //                     // If the milestone name and group already exist, push the data
    //                     existingGroup.data.push(this.calculateDaysDifference(milestone.Actual_Start_Date__c, milestone.Actual_End_Date__c));
    //                 } else {
    //                     // If the milestone name and group don't exist, add a new entry
    //                     groupedData.push({
    //                         name: milestone.name,
    //                         group: project.label,
    //                         data: [this.calculateDaysDifference(milestone.Actual_Start_Date__c, milestone.Actual_End_Date__c)]
    //                     });
    //                 }
    //             });
    //         }
    //     });

    //     // Log the final grouped data
    //     console.log('Grouped Data:', JSON.stringify(groupedData));
    //     return groupedData;
    // }


    pushDataasPerMilstonesName(data) {
        const extractedData = [];
        // Iterate through each project in the provided data
        data.forEach(project => {
            // Check if the project has milestones
            if (project.milstones) {
                // Iterate through each milestone in the project
                project.milstones.forEach(milestone => {
                    // Find existing milestone in extractedData
                    const existingMilestone = extractedData.find(item => item.name === milestone.name);
                    if (existingMilestone) {
                        // If the milestone name already exists, push data for both "Real" and "Expected" dates
                        existingMilestone.dataReal.push(...(milestone.dataReal.map(value => (value !== null && value !== undefined) ? value : 0)));
                        existingMilestone.dataExpected.push(...(milestone.dataExpected.map(value => (value !== null && value !== undefined) ? value : 0)));
                    } else {
                        // If the milestone name doesn't exist, add a new entry with zero-filled arrays
                        extractedData.push({
                            name: milestone.name,
                            dataReal: milestone.dataReal.map(value => (value !== null && value !== undefined) ? value : 0),
                            dataExpected: milestone.dataExpected.map(value => (value !== null && value !== undefined) ? value : 0)
                        });
                    }
                });
            }
        });

        this.testFinalDATA = extractedData;
        console.log('test final data', JSON.stringify(this.testFinalDATA));
        return extractedData;
    }


    transformDataForChart(data) {
        const transformedData = [];

        // Iterate through each milestone in the provided data
        data.forEach(milestone => {
            // Iterate through each entry in "dataReal" and "dataExpected" arrays
            for (let i = 0; i < Math.max(milestone.dataReal.length, milestone.dataExpected.length); i++) {
                const dataRealValue = (i < milestone.dataReal.length) ? milestone.dataReal[i] : 0;
                const dataExpectedValue = (i < milestone.dataExpected.length) ? milestone.dataExpected[i] : 0;

                // Determine the group based on "dataReal" and "dataExpected" values
                const group = (dataRealValue === 0 && dataExpectedValue === 0) ? 'zero' :
                    (dataRealValue > 0 && dataExpectedValue === 0) ? 'real' :
                        (dataRealValue === 0 && dataExpectedValue > 0) ? 'expected' : 'both';

                // Create an entry for the transformed data
                const entry = {
                    name: milestone.name,
                    group: group,
                    data: [dataRealValue, dataExpectedValue]
                };

                // Push the entry into the transformedData array
                transformedData.push(entry);
            }
        });

        return transformedData;
    }

    finaltransformData(inputData) {
        let transformedData = [];

        inputData.forEach((item) => {
            // Create actual data entry
            const actualEntry = {
                name: `${item.name} - Actual`,
                group: 'actual',
                data: item.dataReal,
            };

            // Create budget data entry
            const budgetEntry = {
                name: `${item.name} - Budget`,
                group: 'budget',
                data: item.dataExpected,
            };

            // Add entries to the transformed data array
            transformedData.push(actualEntry, budgetEntry);
        });

        console.log('Shiva Final',JSON.stringify(transformedData))
        return transformedData;
    }

}