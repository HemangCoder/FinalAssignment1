@isTest
public with sharing class CreateContactContentVersion_Test {
    @TestSetup
    static void makeData(){
        Account acc = new Account(Name = 'Test');
        INSERT acc;
        
        List<Contact> conList = new List<Contact>();
        Contact con1 = new Contact(FirstName = 'Test1', LastName = 'Star', AccountId = acc.Id);
        Contact con2 = new Contact(FirstName = 'Test2', LastName = 'Star', AccountId = acc.Id);

        conList.add(con1);
        conList.add(con2);

        INSERT conList;
    }

    @isTest
    public static void test_getContacts(){
        Account acc = [SELECT Id, Name FROM Account WHERE Name ='Test'];
        List<Contact> conList = CreateContactContentVersion.getContacts(acc.Id);

        System.assertEquals(2,conList.size());
    }

    @isTest
    public static void test_getDocuments(){
        Test.startTest();
        
        List<Document_Type__mdt> documentList = [SELECT Id, Label FROM Document_Type__mdt];
        List<Document_Type__mdt> test_documentList = CreateContactContentVersion.getDocuments();

        System.assertEquals(documentList.size(),test_documentList.size());
        
        Test.stopTest();
    }
    
    @isTest
    public static void test_createFiles(){
        
        Test.startTest();
        
        List<Document_Type__mdt> documentList = [SELECT Id, Label FROM Document_Type__mdt];
        List<Id> documentIds = new List<Id>();
        for(Document_Type__mdt doc : documentList){
            documentIds.add(doc.Id);
        }
        List<Contact> conList = [SELECT Id, FirstName, LastName, Description, Email FROM Contact];
        CreateContactContentVersion.createFiles((String)JSON.serialize(conList),(String)JSON.serialize(documentIds));
        List<ContentVersion> fileList = [SELECT Id FROM ContentVersion];
        
        System.assertEquals(6, fileList.size());
        
        Test.stopTest();
    }
}
