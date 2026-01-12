import { LightningElement, track } from 'lwc';
import getAuditTrail from '@salesforce/apex/SetupAuditTrailController.getAuditTrail';
import getSections from '@salesforce/apex/SetupAuditTrailController.getSections';

const COLUMNS = [
    { label: 'Section', fieldName: 'Section', sortable: true },
    { label: 'Element', fieldName: 'Element', sortable: true },
    {
        label: 'Created',
        fieldName: 'CreatedDate',
        type: 'date',
        typeAttributes: {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        },
        sortable: true
    },
    {
        label: 'Last Updated',
        fieldName: 'CreatedDate',
        type: 'date',
        typeAttributes: {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }
    },
    { label: 'Remarks', fieldName: 'Remarks' }
];

export default class SetupAuditTrailViewer extends LightningElement {
    @track data = [];
    @track columns = COLUMNS;
    @track sectionOptions = [{ label: 'All', value: 'All' }];
    @track selectedSection = 'All';
    fullData = []; // raw rows from server

    connectedCallback() {
        this.loadSections();
        this.loadData();
    }

    // load dropdown options
    async loadSections() {
        try {
            const sections = await getSections();
            const opts = [{ label: 'All', value: 'All' }];
            if (sections && sections.length) {
                sections.forEach(sec => {
                    if (sec) opts.push({ label: sec, value: sec });
                });
            }
            this.sectionOptions = opts;
        } catch (err) {
            // set error state if needed
            this.sectionOptions = [{ label: 'All', value: 'All' }];
            console.error('Error loading sections', err);
        }
    }

    // load rows for last 7 days (server-side)
    async loadData() {
        try {
            const results = await getAuditTrail({ daysBack: 7 });
            this.fullData = (results || []).map(r => ({
                ...r,
                Section: r.Section ? r.Section.trim() : 'Unknown',
                Element: r.Element ? r.Element.trim() : '',
                Remarks: r.Remarks || '',
                MetadataType: r.MetadataType || this.mapSectionToMetadataType(r.Section),
                FullName: r.FullName || r.Element || ''
            }));
            this.applyFilter();
        } catch (err) {
            console.error('Error loading audit trail', err);
            this.fullData = [];
            this.data = [];
        }
    }

    applyFilter() {
        if (this.selectedSection === 'All') {
            this.data = this.fullData;
        } else {
            const sel = (this.selectedSection || '').trim();
            this.data = this.fullData.filter(r => {
                const sec = (r.Section || '').trim();
                return sec === sel;
            });
        }
    }

    handleSectionChange(event) {
        this.selectedSection = event.detail.value;
        this.applyFilter();
    }

    // basic mapping - mirror Apex heuristics (keeps client-side consistent)
    mapSectionToMetadataType(section) {
        if (!section) return 'Unknown';
        const s = section.toLowerCase();
        if (s.includes('apex')) return 'ApexClass';
        if (s.includes('flow')) return 'Flow';
        if (s.includes('object') || s.includes('objects')) return 'CustomObject';
        if (s.includes('layout')) return 'Layout';
        if (s.includes('field')) return 'CustomField';
        if (s.includes('profile')) return 'Profile';
        if (s.includes('permission set')) return 'PermissionSet';
        return 'Unknown';
    }

    handleAddToPackage() {
        const dt = this.template.querySelector('lightning-datatable');
        if (!dt) {
            alert('Datatable not found');
            return;
        }
        const selectedRows = dt.getSelectedRows();
        if (!selectedRows || selectedRows.length === 0) {
            alert('Select one or more rows to add to package.xml');
            return;
        }

        // group by metadata type
        const typeMap = {};
        selectedRows.forEach(r => {
            const mType =
                r.MetadataType && r.MetadataType !== 'Unknown'
                    ? r.MetadataType
                    : this.mapSectionToMetadataType(r.Section);
            const fullName = r.FullName || r.Element || '';
            if (!typeMap[mType]) {
                typeMap[mType] = new Set();
            }
            if (fullName) {
                typeMap[mType].add(fullName);
            }
        });

        // build xml fragment for types
        let typesXml = '';
        Object.keys(typeMap)
            .sort()
            .forEach(mType => {
                const members = Array.from(typeMap[mType]).sort();
                if (members.length === 0) return;
                typesXml += '  <types>\n';
                members.forEach(m => {
                    typesXml += `    <members>${this.escapeXml(m)}</members>\n`;
                });
                typesXml += `    <name>${mType}</name>\n`;
                typesXml += '  </types>\n';
            });

        const xml =
            '<?xml version="1.0" encoding="UTF-8"?>\n' +
            '<Package xmlns="http://soap.sforce.com/2006/04/metadata">\n' +
            typesXml +
            '  <version>58.0</version>\n' +
            '</Package>';

        // ✅ call safe download
        this.downloadFile(xml, 'package.xml');
    }

    // Helper method
    downloadFile(fileContent, fileName) {
        const element = document.createElement('a');
        element.href = 'data:text/xml;charset=utf-8,' + encodeURIComponent(fileContent);
        element.download = fileName;

        // Must append to DOM for LockerService to allow click
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }



    escapeXml(s) {
        if (!s) return '';
        return s
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    // header text showing the date range (last 7 days)
    get headerText() {
        const end = new Date();
        const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return `Changes between ${start.toLocaleDateString()} and ${end.toLocaleDateString()}`;
    }
}