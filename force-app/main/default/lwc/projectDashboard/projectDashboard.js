import { LightningElement, track, wire } from 'lwc';
import getProjectDetails from '@salesforce/apex/ProjectDashboardController.AllprojectsData';


export default class ProjectDashboard extends LightningElement {
    @track allProjectsList = [];
    @track allMilstonesList = [];
    @track ModuleList = [];
    @track selectedProject = [];
    @track selectedMilestone;
    @track selectedModule;
    @track wiredResult;
    @track selectedProjectName;
    @track selectedProjId;
    @track isshowProjectResourceTable = false;
    @track ProjectHealthWrapperList;
    @track SelecTedProjectHealthWrapper;
    @track isShowRightDataView;
    @track ishShowModuleView;
    @track ishShowMemberCardView;
    @track ishShowJiraTaskView;
    @track isShowModuleComp;
    @track isShowProjectDetails = true;
    @track isShowOverAllProjectDetails = true
    @track filters = {
        startDate: '',
        endDate: '',
        projectName: '',
        activeProject: false,
        status: ''
    };


    @wire(getProjectDetails)
    wiredData(result) {
        this.wiredResult = result;
        if (result.data) {
            console.log('project dashboard wired data', result.data);
            let wrapperdata = result.data;
            this.isShowRightDataView = true;
            this.PrepareProjectsData(wrapperdata);
        } else if (result.error) {
            console.error('Error:', result.error);
        }
    }

    PrepareProjectsData(response) {
        debugger;
        let todaydate = new Date();
        //this.allProjectsList = response.Allprojects;
        let tempallProjectsList = response.Allprojects.map((proj, index) => {
            // Check if both start and end dates are not null
            if (proj.Project_Start_Date__c && proj.Project_End_Date__c) {
                return {
                    ...proj,
                    remainingDaysCount: this.getDaysDifference(todaydate, proj.Project_End_Date__c),
                    Index: index + 1,
                    miles_stones_tobe_closed: response.projectWrapperData.map((projwrapp) => {
                        if (projwrapp.MilesstoneTobeClose) {
                            projwrapp.MilesstoneTobeClose[0].Name__c;
                        }

                    }),

                    miles_stones_tobe_opned:response.projectWrapperData.map((projwrapp) => {
                        if (projwrapp.MilesstoneTobeOpen) {
                            projwrapp.MilesstoneTobeOpen[0].Name__c;
                        }

                    }),
                    // last_jira_task:response.projectWrapperData.map((projwrapp)=>{
                    //     if(projwrapp.projectId){
                    //         projwrapp.LastJiraTask;
                    //     }
                    // }),

                    last_jira_task:response.projectWrapperData.map(projwrapp=>{
                            projwrapp.LastJiraTask[0];
                    })

                    
                    //delayRateFlagColor:response.projectWrapperData.find(projj => projj.projectId == proj.Id).delayRateFlagColor
                };
            } else {
                return null; // Return null if either start or end date is null
            }
        }).filter(proj => proj !== null);
        this.allProjectsList = tempallProjectsList;
        console.log('tempallProjectsList---',JSON.stringify(tempallProjectsList));
        this.selectedProject = this.allProjectsList[0];
        this.selectedProjectName = this.selectedProject.Name;
        this.SelecTedProjectHealthWrapper = response.projectWrapperData.find(proj => proj.projectId == this.selectedProject.Id);
        this.isShowModuleComp = true;
        // this.PrepareMilstones(response.allMilestonesWithModules, this.selectedProject.Id)

    }

    // PrepareProjectsData(response) {
    //     try {
    //         debugger;
    //         let todaydate = new Date();

    //         if (!response || !response.Allprojects || !Array.isArray(response.Allprojects)) {
    //             throw new Error('Invalid response or Allprojects data.');
    //         }

    //         // Process projects list
    //         let tempallProjectsList = response.Allprojects.map((proj, index) => {
    //             try {
    //                 // Check if both start and end dates are not null
    //                 if (proj.Project_Start_Date__c && proj.Project_End_Date__c) {
    //                     let remainingDaysCount = this.getDaysDifference(todaydate, proj.Project_End_Date__c);

    //                     let projectWrapperData = response.projectWrapperData || [];

    //                     let getMilestoneData = (wrapperData, key) =>
    //                         wrapperData
    //                             .filter(projwrapp => projwrapp[key] && projwrapp[key].length > 0)
    //                             .map(projwrapp => projwrapp[key][0].Name__c || 'NA');

    //                     let getLastTaskData = (wrapperData, key) =>
    //                         wrapperData
    //                             .filter(projwrapp => projwrapp.LastJiraTask)
    //                             .map(projwrapp => projwrapp.LastJiraTask[0][key] || 'NA');
                        

    //                     // let miles_stones_tobe_closed = getMilestoneData(projectWrapperData, 'MilesstoneTobeClose');
    //                     // let miles_stones_tobe_opned = getMilestoneData(projectWrapperData, 'MilesstoneTobeOpen');
    //                     // let last_task_created = getLastTaskData(projectWrapperData, 'Name');
    //                     // let last_task_created_at = getLastTaskData(projectWrapperData, 'Estimated_Start_Date__c');
    //                     // let last_task_created_for = getLastTaskData(projectWrapperData, 'Team_Member_Name__c');
    //                     // let last_task_number = getLastTaskData(projectWrapperData, 'Name');
    //                     // let last_task_module = getLastTaskData(projectWrapperData, 'Module_Name__c');

    //                     // let last_conversation = projectWrapperData
    //                     //     .filter(projwrapp => projwrapp.LastEmail && projwrapp.LastEmail.length > 0)
    //                     //     .map(projwrapp => projwrapp.LastEmail[0].ToAddress || 'NA');

    //                     // let last_conversation_at = projectWrapperData
    //                     //     .filter(projwrapp => projwrapp.LastEmail && projwrapp.LastEmail.length > 0)
    //                     //     .map(projwrapp => projwrapp.LastEmail[0].MessageDate || 'NA');

    //                     // let current_milestone = projectWrapperData
    //                     //     .filter(projwrapp => projwrapp.currentMilesStone && projwrapp.currentMilesStone.length > 0)
    //                     //     .map(projwrapp => projwrapp.currentMilesStone[0].Name__c || 'NA');

    //                     return {
    //                         ...proj,
    //                         remainingDaysCount,
    //                         Index: index + 1,
    //                         // miles_stones_tobe_closed,
    //                         // miles_stones_tobe_opned,
    //                         // last_task_created,
    //                         // last_task_number,
    //                         // last_task_module,
    //                         // last_conversation,
    //                         // last_task_created_at,
    //                         // last_task_created_for,
    //                         // current_milestone,
    //                         // last_conversation_at
    //                     };
    //                 } else {
    //                     return null; // Return null if either start or end date is null
    //                 }
    //             } catch (innerError) {
    //                 console.error('Error processing project:', proj, innerError);
    //                 return null;
    //             }
    //         }).filter(proj => proj !== null);

    //         // Assign processed list to component variables
    //         this.allProjectsList = tempallProjectsList;
    //         console.log('this.allProjectsList---', JSON.stringify(this.allProjectsList));
    //         this.selectedProject = this.allProjectsList[0];
    //         this.selectedProjectName = this.selectedProject ? this.selectedProject.Name : 'Project Not Selected';
    //         this.isShowModuleComp = true;
    //     } catch (error) {
    //         console.error('Error in PrepareProjectsData:', error);
    //         // Handle the error accordingly, e.g., show a message to the user
    //     }
    // }


    queryOnchangeHandler(event) {
        debugger;
        const { name, value, type, checked } = event.target;
        if (type === 'checkbox') {
            this.filters[name] = checked;
        } else {
            this.filters[name] = value;
        }
        this.applyFilters();
    }

    applyFilters() {
        const { startDate, endDate, projectName, activeProject, status } = this.filters;
        this.allProjectsList = this.wiredResult.data.Allprojects.filter(item => {
            let isValid = true;
            if (startDate && item.Project_Start_Date__c < startDate) {
                isValid = false;
            }
            if (endDate && item.Project_End_Date__c > endDate) {
                isValid = false;
            }
            if (projectName && !item.Name.toLowerCase().includes(projectName.toLowerCase())) {
                isValid = false;
            }
            if (activeProject && !item.Active__c) {
                isValid = false;
            }
            if (status && item.Status__c !== status) {
                isValid = false;
            }
            return isValid;
        });
    }

    handleclearFilter() {
        debugger;
        this.filters = {
            startDate: '',
            endDate: '',
            projectName: '',
            activeProject: false,
            status: ''
        };
        this.template.querySelectorAll('lightning-input, lightning-combobox').forEach(input => {
            if (input.type === 'checkbox') {
                input.checked = false;
            } else {
                input.value = null;
            }
        });
        this.allProjectsList = this.wiredResult.data.Allprojects;
    }



    get projectStatusOptions() {
        return [
            { label: 'New', value: 'new' },
            { label: 'In Progress', value: 'inProgress' },
            { label: 'Completed', value: 'completed' },
            { label: 'Delayed', value: 'delayed' },
        ];
    }

    viewModuleComp() {
        debugger
        this.isShowRightDataView = false;
        const projectId = event.currentTarget.dataset.id;
        this.ishShowModuleView = true;

    }


    handleChange(event) {
        this.value = event.detail.value;
    }


    showProjectResourceTable(event) {
        this.isshowProjectResourceTable = true;

    }

    PrepareMilstones(milstones, projectId) {
        debugger;
        let tempallMilstonesList;
        return tempallMilstonesList = milstones.find(mile => mile.Project__c === projectId);
    }

    opemModuleComp() {
        debugger;
        this.isShowModuleComp = true;
        this.isShowProjectDetails = false;

    }


    handleProjectClick(event) {
        debugger
        const projectId = event.currentTarget.dataset.id;
        this.selectedProject = this.allProjectsList.find(project => project.Id === projectId);
        this.selectedProjectName = this.selectedProject.Name;
        this.SelecTedProjectHealthWrapper = this.wiredResult.data.projectWrapperData.find(proj => proj.projectId === projectId);
        // this.SelecTedProjectHealthWrapper = this.wiredResult.data.projectWrapperData.find(proj => proj.projectId ==projectId);
        if (this.SelecTedProjectHealthWrapper) {
            this.isShowModuleComp = true;
        }
        //this.allMilstonesList = this.PrepareMilstones(this.wiredResult.data.allMilestonesWithModules, projectId);

        this.isShowProjectDetails = true
        this.isShowOverAllProjectDetails = false
        const projectClickEvent = new CustomEvent('projectclick', {
            detail: { projectId }
        });
        this.dispatchEvent(projectClickEvent);
    }

    getDaysDifference(date1, date2) {
        // Convert input to Date objects if they are not already
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        // Check if the dates are valid
        if (isNaN(d1) || isNaN(d2)) {
            throw new Error('Invalid date');
        }
        // Calculate the difference in time
        const diffTime = Math.abs(d2 - d1);
        // Convert the difference in time to days
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }
}