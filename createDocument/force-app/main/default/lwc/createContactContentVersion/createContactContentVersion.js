import { LightningElement, track, api, wire } from 'lwc';
import getContacts from '@salesforce/apex/CreateContactContentVersion.getContacts';
import getDocuments from '@salesforce/apex/CreateContactContentVersion.getDocuments';
import createFiles from '@salesforce/apex/CreateContactContentVersion.createFiles';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CurrentPageReference } from 'lightning/navigation';


export default class CreateContactContentVersion extends LightningElement {
    @api recordId;
    @track conlist;
    @track documenttype;
    @track error;
    @api isLoadedConnected = false;
    @api isLoadedContacts = false;
    value = [];
    options = [];
    selectedRecords = [];
    
    pageSizeOptions = [5, 10, 25, 50, 75, 100];
    totalRecords = 0; //Total no.of records
    pageSize; //No.of records to be displayed per page
    totalPages; //Total no.of pages
    pageNumber = 1; //Page number    
    recordsToDisplay = []; 

    get bDisableFirst() {
        //disable first button or not
        return this.pageNumber == 1;
    }

    get bDisableLast() {
        //disable last button or not
        return this.pageNumber == this.totalPages;
    }

    handleRecordsPerPage(event) {
        this.pageSize = event.target.value;
        this.paginationHelper();
    }

    previousPage() {
        this.pageNumber = this.pageNumber - 1;
        this.paginationHelper();
    }

    nextPage() {
        this.pageNumber = this.pageNumber + 1;
        this.paginationHelper();
    }

    firstPage() {
        this.pageNumber = 1;
        this.paginationHelper();
    }

    lastPage() {
        this.pageNumber = this.totalPages;
        this.paginationHelper();
    }

    paginationHelper() {
        this.recordsToDisplay = [];
        // calculate total pages
        this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
        // set page number 
        if (this.pageNumber <= 1) {
            this.pageNumber = 1;
        } else if (this.pageNumber >= this.totalPages) {
            this.pageNumber = this.totalPages;
        }
        // set records to display on current page 
        for (let i = (this.pageNumber - 1) * this.pageSize; i < this.pageNumber * this.pageSize; i++) {
            if (i === this.totalRecords) {
                break;
            }
            this.recordsToDisplay.push(this.conlist[i]);
        }
    }

    @track columns = [{
        label: 'First Name',
        fieldName: 'FirstName',
        type: 'text'
    },
    {
        label: 'Last Name',
        fieldName: 'LastName',
        type: 'text'
    },
    {
        label: 'Email',
        fieldName: 'Email',
        type: 'email',
    },
    {
        label: 'Phone',
        fieldName: 'Phone',
        type: 'phone',
    }];

    @wire(CurrentPageReference)
    currentPageReference;

    connectedCallback(){
        //TO get document types
        this.isLoadedConnected = true;
        getDocuments()
        .then(data=>{
            this.documenttype = data;
            this.isLoadedConnected = false;
            let stringified = JSON.stringify(this.documenttype);
            let b = JSON.parse(stringified);
            this.options = [];
            for(let i=0; i<this.documenttype.length; i++){
                let opt = {label:b[i].Label , value: b[i].Id};
                this.options.push(opt);
            }            
        })
        .catch(error=>{
            this.error = error;
            var err = JSON.stringify(error);
            const obj = JSON.parse(err);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Failure',
                    message:  obj.body.message,
                    variant: 'error',
                })
            );
        })
    }


    handleChange(e) {
        //assign document types selected list
        this.value = e.detail.value;
    }

    handleFetch(event){
        //fetch the contacts associated with account id 
        this.isLoadedContacts = true;
        getContacts({recordId : this.currentPageReference.state.c__id})
        .then(data=>{
            this.conlist = data;
            this.isLoadedContacts = false;
            this.totalRecords = data.length; // update total records count                 
            this.pageSize = this.pageSizeOptions[0]; //set pageSize with default value as first option
            this.paginationHelper();
        })
        .catch(error=>{
            this.error = error;
            var err = JSON.stringify(error);
            const obj = JSON.parse(err);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Failure',
                    message:  obj.body.message,
                    variant: 'error',
                })
            );
        });
    }

    getSelectedRecords(event) {    
        //get list of selected records    
        const selectedRows = event.detail.selectedRows;

        for(let i=0; i< this.recordsToDisplay.length; i++){
            if(this.selectedRecords.includes(this.recordsToDisplay[i])){
                this.selectedRecords.pop(this.recordsToDisplay[i]);
            }
        }

        for (let i = 0; i < selectedRows.length; i++) {
            if(!this.selectedRecords.includes(selectedRows[i])){
                this.selectedRecords.push(selectedRows[i]);
            }
        }  

    }

    handleDocument(event) { 
        //pass the list of documents and selected values
        createFiles({conListString:JSON.stringify(this.selectedRecords),documentTypeListString:JSON.stringify(this.value)})
        .then(result=>{
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message:  'Files created successfully.',
                    variant: 'success',
                })
            );

        })
        .catch(error=>{
            this.error = error;
            var err = JSON.stringify(error);
            const obj = JSON.parse(err);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Failure',
                    message:  obj.body.message,
                    variant: 'error',
                })
            );
        })
    }
}