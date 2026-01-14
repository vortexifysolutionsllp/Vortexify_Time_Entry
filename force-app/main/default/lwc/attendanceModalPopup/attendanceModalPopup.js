import LightningModal from 'lightning/modal';
import { api } from 'lwc';
export default class AttendanceModalPopup extends LightningModal {
    @api header;
    @api checkInTime;
    @api checkOutTime;

    handleClose() {
        this.close();
    }
}
