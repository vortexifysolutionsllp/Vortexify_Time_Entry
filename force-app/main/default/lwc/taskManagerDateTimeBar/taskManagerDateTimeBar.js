import { LightningElement, track } from 'lwc';

export default class TaskManagerDateTimeBar extends LightningElement {

    @track selectedMonth;
    @track selectedYear;
    @track selectedDate;

    @track numberOfDatesToBeShown = 7;
    @track dateList = [];

    todayDate = new Date();

    monthNames = [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
    ];

    days = [
        "Sunday","Monday","Tuesday","Wednesday",
        "Thursday","Friday","Saturday"
    ];

    //  FLAG → ensures auto open runs ONLY ONCE
    isAutoTriggered = false;

    connectedCallback() {
        this.prepareTimeSlots();

        //Auto-trigger today's selection (ONLY ON LOAD)
        setTimeout(() => {
            if (!this.isAutoTriggered) {
                this.isAutoTriggered = true;
                this.callParentMethod();
            }
        }, 0);
    }

    handlePrevClicked() {
        this.prepareTimeSlots('prev');
    }

    handleNextClicked() {
        this.prepareTimeSlots('next');
    }

    prepareTimeSlots(action) {

        if (this.dateList.length > 0) {
            if (action === 'next') {
                this.todayDate = new Date(this.dateList[this.numberOfDatesToBeShown - 1].d);
            } else if (action === 'prev') {
                this.todayDate = new Date(this.dateList[0].d);
            }
            this.dateList = [];
        }

        if (action === 'prev') {
            for (let i = 0; i < this.numberOfDatesToBeShown; i++) {
                this.todayDate.setDate(this.todayDate.getDate() - 1);
                this.pushDate(i === this.numberOfDatesToBeShown - 1);
            }
            this.dateList.reverse();
        } else {
            for (let i = 0; i < this.numberOfDatesToBeShown; i++) {
                if (!(i === 0 && !action)) {
                    this.todayDate.setDate(this.todayDate.getDate() + 1);
                }
                this.pushDate(i === 0);
            }
        }

        // default selected date = today
        this.selectedDate = this.dateList[0].fDate;
        this.selectedMonth = this.dateList[0].month.substring(0, 3);
        this.selectedYear = this.dateList[0].year;
        this.onNextPrevHandler();
    }

    pushDate(isSelected) {
        this.dateList.push({
            day: this.days[this.todayDate.getDay()].substring(0, 3),
            date: this.todayDate.getDate(),
            month_number: this.todayDate.getMonth() + 1,
            month: this.monthNames[this.todayDate.getMonth()],
            year: this.todayDate.getFullYear(),
            selected: isSelected,
            fDate: `${this.todayDate.getDate()}/${this.todayDate.getMonth() + 1}/${this.todayDate.getFullYear()}`,
            d: `${this.todayDate.getFullYear()}-${this.todayDate.getMonth() + 1}-${this.todayDate.getDate()}`
        });
    }

    ondatechoosedhandler(event) {
        this.selectedDate = event.target.dataset.id;

        this.dateList.forEach(item => item.selected = false);
        const selectedItem = this.dateList.find(item => item.fDate === this.selectedDate);
        if (selectedItem) {
            selectedItem.selected = true;
            this.selectedMonth = selectedItem.month.substring(0, 3);
            this.selectedYear = selectedItem.year;
        }

        this.callParentMethod();
    }

    onNextPrevHandler() {
        console.log('next prev handler', this.selectedDate)
        this.dateList.forEach(item => item.selected = false);
        const selectedItem = this.dateList.find(item => item.fDate === this.selectedDate);
        if (selectedItem) {
            selectedItem.selected = true;
            this.selectedMonth = selectedItem.month.substring(0, 3);
            this.selectedYear = selectedItem.year;
        }

        this.callParentMethod();
    }

    callParentMethod() {
        this.dispatchEvent(
            new CustomEvent('dateselected', {
                detail: { date: this.selectedDate }
            })
        );
    }
}