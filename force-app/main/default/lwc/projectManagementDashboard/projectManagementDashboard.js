import { LightningElement } from 'lwc';
export default class ProjectManagementDashboard extends LightningElement {



    handleItemClick(event) {
    const selectedNavItem = event.target.dataset.id;
    // Implement logic to handle the clicked item, such as updating the content based on the selectedNavItem
    // For simplicity, let's just console.log the selected item here
    alert(selectedNavItem);
    console.log('Selected Item:', selectedNavItem);
  }

}