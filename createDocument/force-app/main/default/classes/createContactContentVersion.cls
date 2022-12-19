public with sharing class CreateContactContentVersion {

    //To get associated contacts list from an account
    @AuraEnabled
    public static List<Contact> getContacts(Id recordId){
        List<Contact> con = [SELECT FirstName, LastName, Email, Phone, Description, Account.Name FROM Contact WHERE AccountId = :recordId];
        return con;
    }

    //To get document types
    @AuraEnabled
    public static List<Document_Type__mdt> getDocuments(){
        List<Document_Type__mdt> listDocument = [SELECT Id, Label FROM Document_Type__mdt];
        return listDocument;
       
    }

    //To create files 
    @AuraEnabled
    public static void createFiles(String conListString, String documentTypeListString){
        List<Contact> conList = (List<Contact>)JSON.deserialize(conListString,List<Contact>.class);

        List<Id> documentTypeListIds = (List<Id>)JSON.deserialize(documentTypeListString,List<Id>.class);
        List<Document_Type__mdt> documentTypeList = [SELECT Id, Label FROM Document_Type__mdt WHERE Id IN :documentTypeListIds];

        List<ContentVersion> fileList = new List<ContentVersion>();
        for(Contact con : conList){
            for(Document_Type__mdt doc : documentTypeList){
                ContentVersion file1 = new ContentVersion(Title=con.FirstName+' '+doc.Label, VersionData=Blob.valueOf(con.FirstName+'\n'+con.LastName+'\n'+con.Description+'\n'+con.Account.Name), PathOnClient=doc.Label);
                fileList.add(file1);
            }
            
        }

        INSERT fileList;
    }
}