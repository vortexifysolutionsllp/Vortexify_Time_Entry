import { LightningElement, track } from 'lwc';

export default class AttendanceReport extends LightningElement {
    /** ------------------ FILTER STATE (UI only; no data filtering) ------------------ */
    @track selectedState = null;
    @track selectedBranch = null;
    @track startDate = null;
    @track endDate = null;

    stateOptions = [
        { label: 'UP', value: 'UP' },
        { label: 'Karnataka', value: 'Karnataka' }
    ];

    branchMap = {
        UP: [
            { label: 'Kanpur', value: 'Kanpur' },
            { label: 'Noida', value: 'Noida' }
        ],
        Karnataka: [
            { label: 'Bangalore', value: 'Bangalore' },
            { label: 'Mangalore', value: 'Mangalore' }
        ]
    };

    get branchOptions() {
        return this.selectedState ? this.branchMap[this.selectedState] : [];
    }
    get isBranchDisabled() {
        return !this.selectedState;
    }

    handleStateChange(e) {
        this.selectedState = e.detail.value;
        this.selectedBranch = null; // reset branch when state changes
    }
    handleBranchChange(e) {
        this.selectedBranch = e.detail.value;
    }
    handleStartDateChange(e) {
        this.startDate = e.detail.value;
    }
    handleEndDateChange(e) {
        this.endDate = e.detail.value;
        // ✅ Only control visibility by End Date
        this.showTable = !!this.endDate;
    }

    /** Show/hide static table */
    @track showTable = false;

    /** ------------------ TABLE (unchanged static data + logic) ------------------ */
    parentHeadings = [
        { id: 'shivam', name: 'Shivam' },
        { id: 'rahul', name: 'Rahul' },
        { id: 'neha', name: 'Neha' },
        { id: 'ananya', name: 'Ananya' },
        { id: 'amit', name: 'Amit' },
        { id: 'priya', name: 'Priya' },
        { id: 'saurabh', name: 'Saurabh' },
        { id: 'kiran', name: 'Kiran' }
    ];

    childHeadings = [
        { id: 'checkin', label: 'Check In' },
        { id: 'checkout', label: 'Check Out' },
        { id: 'activities', label: 'Total Activities' },
        { id: 'travel', label: 'Total Travel' },
        { id: 'time', label: 'Total Time Spent' }
    ];

    get childrenPerParent() {
        return this.childHeadings.length;
    }

    get columnsForRender() {
        const cols = [];
        this.parentHeadings.forEach(p => {
            this.childHeadings.forEach(c => {
                cols.push({
                    key: `${p.id}-${c.id}`,
                    parentId: p.id,
                    childId: c.id,
                    label: c.label
                });
            });
        });
        return cols;
    }

    // 🔒 Static data – not filtered, not regenerated
    tableData = [
        {
            id: 'row1',
            date: '29-08-2025',
            shivam: { checkin: '09:15 AM', checkout: '08:00 PM', activities: 5, travel: '20 km', time: '10h 45m' },
            rahul: { checkin: '10:15 AM', checkout: '06:00 PM', activities: 4, travel: '15 km', time: '7h 45m' },
            neha: { checkin: null, checkout: null, activities: 6, travel: '10 km', time: '7h 30m' },
            ananya: { checkin: '09:30 AM', checkout: '06:40 PM', activities: 3, travel: '12 km', time: '8h 10m' },
            amit: { checkin: '10:05 AM', checkout: '07:30 PM', activities: 5, travel: '18 km', time: '9h 15m' },
            priya: { checkin: '09:10 AM', checkout: '06:45 PM', activities: 6, travel: '14 km', time: '8h 45m' },
            saurabh: { checkin: '09:20 AM', checkout: '07:00 PM', activities: 4, travel: '11 km', time: '8h 00m' },
            kiran: { checkin: '09:45 AM', checkout: '08:50 PM', activities: 7, travel: '16 km', time: '8h 25m' }
        },
        {
            id: 'row2',
            date: '28-08-2025',
            shivam: { checkin: '09:50 AM', checkout: '06:40 PM', activities: 3, travel: '12 km', time: '9h 20m' },
            rahul: { checkin: '08:45 AM', checkout: '06:15 PM', activities: 5, travel: '18 km', time: '9h 30m' },
            neha: { checkin: '09:30 AM', checkout: '05:45 PM', activities: 7, travel: '14 km', time: '7h 15m' },
            ananya: { checkin: '10:20 AM', checkout: '07:15 PM', activities: 4, travel: '10 km', time: '7h 55m' },
            amit: { checkin: '09:00 AM', checkout: '06:50 PM', activities: 5, travel: '13 km', time: '8h 35m' },
            priya: { checkin: '09:40 AM', checkout: '06:30 PM', activities: 3, travel: '9 km', time: '7h 20m' },
            saurabh: { checkin: '08:55 AM', checkout: '06:10 PM', activities: 6, travel: '17 km', time: '9h 10m' },
            kiran: { checkin: '09:25 AM', checkout: '06:55 PM', activities: 5, travel: '20 km', time: '8h 40m' }
        },
        {
            id: 'row3',
            date: '27-08-2025',
            shivam: { checkin: '10:50 AM', checkout: '06:40 PM', activities: 4, travel: '12 km', time: '9h 20m' },
            rahul: { checkin: '09:45 AM', checkout: '08:15 PM', activities: 5, travel: '18 km', time: '9h 30m' },
            neha: { checkin: '10:30 AM', checkout: '08:45 PM', activities: 3, travel: '14 km', time: '7h 15m' },
            ananya: { checkin: '09:35 AM', checkout: '06:25 PM', activities: 6, travel: '11 km', time: '8h 35m' },
            amit: { checkin: '09:15 AM', checkout: '06:40 PM', activities: 5, travel: '15 km', time: '8h 50m' },
            priya: { checkin: '10:10 AM', checkout: '07:20 PM', activities: 4, travel: '13 km', time: '7h 45m' },
            saurabh: { checkin: '09:05 AM', checkout: '06:15 PM', activities: 7, travel: '12 km', time: '8h 30m' },
            kiran: { checkin: '09:55 AM', checkout: '07:05 PM', activities: 3, travel: '9 km', time: '7h 15m' }
        },
        {
            id: 'row4',
            date: '26-08-2025',
            shivam: { checkin: '09:50 AM', checkout: '06:40 PM', activities: 3, travel: '2 km', time: '6h 20m' },
            rahul: { checkin: '08:45 AM', checkout: '06:15 PM', activities: 5, travel: '8 km', time: '7h 30m' },
            neha: { checkin: '10:00 AM', checkout: '06:43 PM', activities: 7, travel: '1 km', time: '8h 15m' },
            ananya: { checkin: '09:20 AM', checkout: '06:30 PM', activities: 6, travel: '5 km', time: '7h 50m' },
            amit: { checkin: '09:40 AM', checkout: '07:10 PM', activities: 3, travel: '7 km', time: '7h 20m' },
            priya: { checkin: null, checkout: null, activities: 5, travel: '9 km', time: '7h 40m' },
            saurabh: { checkin: '09:25 AM', checkout: '06:35 PM', activities: 4, travel: '6 km', time: '7h 10m' },
            kiran: { checkin: '09:50 AM', checkout: '06:50 PM', activities: 3, travel: '4 km', time: '7h 30m' }
        },
        {
            id: 'row5',
            date: '25-08-2025',
            shivam: { checkin: null, checkout: null, activities: 2, travel: '10 km', time: '8h 10m' },
            rahul: { checkin: '09:25 AM', checkout: '07:33 PM', activities: 4, travel: '15 km', time: '7h 20m' },
            neha: { checkin: '09:50 AM', checkout: '07:45 PM', activities: 8, travel: '17 km', time: '6h 15m' },
            ananya: { checkin: '09:15 AM', checkout: '06:20 PM', activities: 5, travel: '12 km', time: '7h 55m' },
            amit: { checkin: '09:40 AM', checkout: '07:15 PM', activities: 3, travel: '9 km', time: '7h 30m' },
            priya: { checkin: '09:10 AM', checkout: '06:40 PM', activities: 6, travel: '11 km', time: '8h 05m' },
            saurabh: { checkin: '09:20 AM', checkout: '07:55 PM', activities: 4, travel: '13 km', time: '8h 20m' },
            kiran: { checkin: '09:45 AM', checkout: '09:00 PM', activities: 7, travel: '15 km', time: '8h 45m' }
        }
    ];

    // Parse HH:MM AM/PM string to minutes
    parseTimeToMinutes(timeStr) {
        if (!timeStr) return null;
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (modifier === 'PM' && hours !== 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        return hours * 60 + minutes;
    }

    get rowsForRender() {
        const cols = this.columnsForRender;
        return this.tableData.map(r => {
            const cells = cols.map(col => {
                const parent = r[col.parentId] || {};
                const rawValue = parent[col.childId];
                let badgeClass = '';
                let displayValue = rawValue;
                let hasTooltip = false;
                let tooltipText = '';

                // Check-in
                if (col.childId === 'checkin') {
                    if (!rawValue) {
                        badgeClass = 'absent-box';
                        displayValue = 'Absent';
                    } else {
                        const minutes = this.parseTimeToMinutes(rawValue);
                        const cutoff = this.parseTimeToMinutes('10:00 AM');
                        badgeClass = minutes < cutoff ? 'checkin-box-green' : 'checkin-box-orange';
                    }
                }

                // Checkout
                if (col.childId === 'checkout') {
                    const checkinVal = parent['checkin'];
                    if (!checkinVal) {
                        badgeClass = 'absent-box';
                        displayValue = 'Absent';
                    } else {
                        const checkinMin = this.parseTimeToMinutes(checkinVal);
                        const checkoutMin = this.parseTimeToMinutes(rawValue);
                        if (checkoutMin && checkinMin) {
                            const diff = checkoutMin - checkinMin;
                            badgeClass = diff > (10 * 60) ? 'checkout-box-green' : 'checkout-box-orange';
                        }
                    }
                }

                // Activities tooltip
                if (col.childId === 'activities') {
                    hasTooltip = true;
                    let sourcing = Math.floor((rawValue || 0) * 0.7);
                    let dsaMeet = (rawValue || 0) - sourcing;
                    tooltipText = { sourcing, dsaMeet };
                }

                // Travel tooltip
                if (col.childId === 'travel') {
                    hasTooltip = true;
                    const totalKm = parseInt((rawValue || '0').replace(' km', ''), 10);
                    tooltipText = {
                        local: `${Math.floor(totalKm * 0.5)} km`,
                        outstation: `${Math.floor(totalKm * 0.3)} km`,
                        clientVisit: `${Math.max(totalKm - Math.floor(totalKm * 0.8), 0)} km`
                    };
                }

                function parseDurationToMinutes(durationStr) {
                    if (!durationStr) return 0;
                    const hrMatch = durationStr.match(/(\d+)h/);
                    const minMatch = durationStr.match(/(\d+)m/);
                    const hours = hrMatch ? parseInt(hrMatch[1], 10) : 0;
                    const mins = minMatch ? parseInt(minMatch[1], 10) : 0;
                    return hours * 60 + mins;
                }

                function formatDuration(mins) {
                    if (!mins || mins <= 0) return '0m';
                    const hrs = Math.floor(mins / 60);
                    const minutes = mins % 60;
                    return hrs > 0 ? `${hrs}h ${minutes}m` : `${minutes}m`;
                }

                // Time tooltip
                if (col.childId === 'time') {
                    hasTooltip = true;
                    const totalMinutes = parseDurationToMinutes(rawValue);
                    if (!totalMinutes || totalMinutes <= 0) {
                        tooltipText = {};
                    } else {
                        const ratios = { withinBranch: 0.5, travel: 0.2, activity: 0.2, ideal: 0.1 };
                        const withinBranchMinutes = Math.round(totalMinutes * ratios.withinBranch);
                        const travelMinutes = Math.round(totalMinutes * ratios.travel);
                        const activityMinutes = Math.round(totalMinutes * ratios.activity);
                        const usedMinutes = withinBranchMinutes + travelMinutes + activityMinutes;
                        const idealMinutes = totalMinutes - usedMinutes;
                        tooltipText = {
                            withinBranch: formatDuration(withinBranchMinutes),
                            travel: formatDuration(travelMinutes),
                            activity: formatDuration(activityMinutes),
                            ideal: formatDuration(idealMinutes)
                        };
                    }
                }

                return {
                    key: `${r.id}-${col.key}`,
                    value: rawValue,
                    displayValue,
                    badgeClass,
                    isBadge: col.childId === 'checkin' || col.childId === 'checkout',
                    hasTooltip,
                    tooltipText,
                    isTimeColumn: col.childId === 'time',
                    isActivityColumn: col.childId === 'activities',
                    isTravelColumn: col.childId === 'travel'
                };
            });
            return { id: r.id, date: r.date, cells };
        });
    }
}