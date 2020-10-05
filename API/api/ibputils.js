'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const path = require('path');
const { FileSystemWallet, Gateway, User, X509WalletMixin } = require('fabric-network');
//const PubNub = require('pubnub')
const FabricCAServices = require('fabric-ca-client');

var gateway;
var configdata;
var network;
var wallet;
var bLocalHost;
var ccp_org1;
var ccp_org2;
var orgMSPID;
var walletPath;
var contract = null;

const utils = {};


utils.connectGatewayFromConfig = async () => {
    console.log("*********************** connectGatewayFromConfig function: ********************* ");

const configPath =  '../gateway/config.json';
const configJSON = fs.readFileSync(configPath, 'utf8');
configdata = JSON.parse(configJSON);

// connect to the connection file
const PccpPath = '../gateway/ibpConnection_Org1.json';
const PccpJSON = fs.readFileSync(PccpPath, 'utf8');
ccp_org1 = JSON.parse(PccpJSON);
const AccpPath = '../gateway/ibpConnection_Org2.json';
const AccpJSON = fs.readFileSync(AccpPath, 'utf8');
ccp_org2 = JSON.parse(AccpJSON);



// A wallet stores a collection of identities for use
walletPath = path.join(process.cwd(), '/wallets/Org2');
wallet = new FileSystemWallet(walletPath);
console.log(`Wallet path: ${walletPath}`);

const peerIdentity = 'StudentApp';

    // A gateway defines the peers used to access Fabric networks
    gateway = new Gateway();

     try {

    let response;
    // Check to see if we've already enrolled the user.
    const userExists = await wallet.exists(peerIdentity);
    if (!userExists) {
      console.log('An identity for the user ' + peerIdentity + ' does not exist in the wallet');
      console.log('Run the registerUser.js application before retrying');
      response.error = 'An identity for the user ' + peerIdentity + ' does not exist in the wallet. Register ' + peerIdentity + ' first';
      return response;
    }
    //connect to Fabric Network, but starting a new gateway
    const gateway = new Gateway();
	var userid = process.env.FABRIC_USER_ID || "admin";
        var pwd = process.env.FABRIC_USER_SECRET || "adminpw";
        var usertype = process.env.FABRIC_USER_TYPE || "admin";
        console.log('user: ' + userid + ", pwd: ", pwd + ", usertype: ", usertype);
      //ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
          // Set up the MSP Id
     orgMSPID = ccp_org2.client.organization;
     console.log('MSP ID: ' + orgMSPID);
    //use our config file, our peerIdentity, and our discovery options to connect to Fabric network.
    await gateway.connect(ccp_org2, { wallet, identity: peerIdentity, discovery: configdata.gatewayDiscovery });
    //connect to our channel that has been created on IBM yash/Internship_projects Platform
    const network = await gateway.getNetwork('mychannel');
    console.log("here");
    //connect to our insurance contract that has been installed / instantiated on IBM yash/Internship_projects Platform
     contract = await network.getContract('Blockchain'); 
  } catch (error) {
    console.error(`Failed to submit transaction: ${error}`);
  }finally{
return contract;
}

}





utils.registerUser = async (userid, userpwd, usertype) => {
    console.log("\n------------  function registerUser ---------------");
    console.log("\n userid: " + userid + ", pwd: " + userpwd + ", usertype: " + usertype)
    let id ;
    let ccp;
    if(usertype == "Student"){
        id = configdata.StudentappAdmin;
        ccp = ccp_org2;
        walletPath = path.join(process.cwd(), '/wallets/Org2');
        wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);  
    }
    else if(usertype == "Faculty"){
        id = configdata.FacultyAppAdmin;
        console.log(id);
        ccp = ccp_org1;
        walletPath = path.join(process.cwd(), '/wallets/Org1');
        wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
    }
    else{
        return "Invalid Type";
    }
    /*const gateway = new Gateway();
    // Connect to gateway as admin
    await gateway.connect(ccp, { wallet, identity: id  , discovery: configdata.gatewayDiscovery });
    const orgs = ccp.organizations;
    const CAs = ccp.certificateAuthorities;
    console.log(CAs);
    orgMSPID = ccp.client.organization;
    const fabricCAKey = orgs[orgMSPID].certificateAuthorities[0];
    const caURL = CAs[fabricCAKey].url;
    console.log(caURL);
    const ca = new FabricCAServices(caURL, { trustedRoots: [], verify: false });
    const idSer = ca.newIdentityService(); 
    let client = gateway.getClient();
    let fabric_ca_client = client.getCertificateAuthority();
    let idService = fabric_ca_client.newIdentityService();
    let user = gateway.getCurrentIdentity();
    
    console.log(user);
    //  Register is done using admin signing authority*/
    var newUserDetails;
        newUserDetails = {
        enrollmentID: userid,
        enrollmentSecret: userpwd,
        role : "client",
        //affiliation: orgMSPID,
        //profile: 'tls',
        attrs: [
            {
                "name": "usertype",
                "value": usertype,
                "ecert": true
            }],
        maxEnrollments: 5
    };
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: id, discovery: configdata.gatewayDiscovery });
        console.log("Connected");
        // Get the CA client object from the gateway for interacting with the CA.
        const ca = gateway.getClient().getCertificateAuthority();
        const adminIdentity = gateway.getCurrentIdentity();
        console.log(`AdminIdentity: + ${adminIdentity}`); 

        // Register the user, enroll the user, and import the new identity into the wallet.
        //const secret = await ca.register({  enrollmentID: userName, role: 'client'}, adminIdentity);
      console.log(newUserDetails);
    await ca.register(newUserDetails, adminIdentity)
        .then(newPwd => {
            //  if a password was set in 'enrollmentSecret' field of newUserDetails,
            //  the same password is returned by "register".
            //  if a password was not set in 'enrollmentSecret' field of newUserDetails,
            //  then a generated password is returned by "register".
            console.log("\n---------------------------------------------------");
            console.log('\n Secret returned: ' + newPwd);
            console.log("\n---------------------------------------------------");

            return newPwd;
        }, error => {
            console.log("\n----------------------------------------");
            console.log('Error in register();  ERROR returned: ' + error);
            console.log("\n----------------------------------------");
            return error;
        });
}  //  end of function registerUser

utils.enrollUser = async (userid, userpwd, usertype) => {
    let ccp;
    let id;
    if(usertype == "Student"){
        id = configdata.StudentappAdmin;
        ccp = ccp_org2;
        console.log(id);

        walletPath = path.join(process.cwd(), '/wallets/Org2');
        wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);  
    }
    else if(usertype == "Faculty"){
        id = configdata.FacultyAppAdmin;
        ccp = ccp_org1;
        walletPath = path.join(process.cwd(), '/wallets/Org1');
        wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
    }
    else{
        return "Invalid Type";
    }
    console.log("\n------------  function enrollUser -----------------");
    console.log("\n userid: " + userid + ", pwd: " + userpwd + ", usertype:" + usertype);

    // get certification authority
    console.log('Getting CA');
    const orgs = ccp.organizations;
    const CAs = ccp.certificateAuthorities;
    orgMSPID = ccp.client.organization;
    const fabricCAKey = orgs[orgMSPID].certificateAuthorities[0];
    const caURL = CAs[fabricCAKey].url;
    const ca = new FabricCAServices(caURL, { trustedRoots: [], verify: false });
    var newUserDetails;
    newUserDetails = {
        enrollmentID: userid,
        enrollmentSecret: userpwd,
        role : "client",
        //affiliation: orgMSPID,
        //profile: 'tls',
        attrs: [
            {
                "name": "usertype",
                "value": usertype,
                "ecert": true
            }],
    };

    
    console.log("User Details: " + JSON.stringify(newUserDetails))
    return ca.enroll(newUserDetails).then(enrollment => {
        console.log("\n Successful enrollment; Data returned by enroll", enrollment.certificate);

        var identity = X509WalletMixin.createIdentity(orgMSPID, enrollment.certificate, enrollment.key.toBytes());

        return wallet.import(userid, identity).then(notused => {
            console.log("msg: Successfully enrolled user, " + userid + " and imported into the wallet");
        }, error => {
            console.log("error in wallet.import\n" + error);
            throw error;
        });
    }, error => {
        console.log("Error in enrollment " + error.toString());
        throw error;
    });
}

utils.isUserEnrolled = async (userid,usertype) => {
    if(usertype == "Faculty"){
        walletPath = path.join(process.cwd(), '/wallets/Org1');
        wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);  
    }
    else if(usertype == "Student"){
        walletPath = path.join(process.cwd(), '/wallets/Org2');
        wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
    }
    else{
        return "Invalid Type";
    }
    console.log("\n---------------  function isUserEnrolled ------------------------------------");
    console.log("\n userid: " + userid);
    console.log("\n---------------------------------------------------");

    return wallet.exists(userid).then(result => {
        console.log("is User Enrolled: " + result);
        console.log("\n---------------  end of function isUserEnrolled ------------------------------------");
        return result;
    }, error => {
        console.log("error in wallet.exists\n" + error);
        throw error;
    });
}

utils.getAllUsers = async (usertype) => {
    let id ;
    let ccp;
    if(usertype == "admin"){
        id = configdata.Admin;
        ccp = ccp_cou;
    }
    else{
        return "Invalid Type";
    }
    const gateway = new Gateway();

    // Connect to gateway as admin
    await gateway.connect(ccp, { wallet, identity: id, discovery: configdata.gatewayDiscovery });
    let client = gateway.getClient();
    let fabric_ca_client = client.getCertificateAuthority();
    let idService = fabric_ca_client.newIdentityService();
    let user = gateway.getCurrentIdentity();
    let userList = await idService.getAll(user);
    let identities = userList.result.identities;
    let result = [];
    let tmp;
    let attributes;

    // for all identities
    for (var i = 0; i < identities.length; i++) {
        tmp = {};
        tmp.id = identities[i].id;
        tmp.usertype = "";

        if (tmp.id == "admin")
            tmp.usertype = tmp.id;
        else {
            attributes = identities[i].attrs;
            // look through all attributes for one called "usertype"
            for (var j = 0; j < attributes.length; j++)
                if (attributes[j].name == "usertype") {
                    tmp.usertype = attributes[j].value;
                    break;
                }
        }
        result.push(tmp);
    }
    //console.log(result);
    return result;
} //  end of function getAllUsers

utils.setUserContext = async (userid, pwd,usertype) => {
    console.log('In function: setUserContext ....');

    // It is possible that the user has been registered and enrolled in Fabric CA earlier
    // and the certificates (in the wallet) could have been removed.  
    // Note that this case is not handled here.

    // Verify if user is already enrolled
    if(usertype == "Faculty"){
        walletPath = path.join(process.cwd(), '/wallets/Org1');
        wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);  
    }
    else if(usertype == "admin"){
        walletPath = path.join(process.cwd(), '/wallets/Org1');
        wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
    }
    else if(usertype == "Student"){
        walletPath = path.join(process.cwd(), '/wallets/Org2');
        wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
    }
    else{
        return "Invalid Type";
    }
    console.log(usertype);
    const userExists = await wallet.exists(userid);
    if (!userExists) {
        console.log("An identity for the user: " + userid + " does not exist in the wallet");
        console.log('Enroll user before retrying');
        throw ("Identity does not exist for userid: " + userid);
    }

    try {
        // Connect to gateway using application specified parameters
        console.log('Connect to Fabric gateway with userid:' + userid);
        let id ;
        let ccp;
    if(usertype == "Faculty"){
        id = configdata.FacultyappAdmin;
        ccp = ccp_org1;
        walletPath = path.join(process.cwd(), '/wallets/Org1');
        wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);  
    }
    else if(usertype == "admin"){
        id = configdata.Admin;
        ccp = ccp_org1;
        walletPath = path.join(process.cwd(), '/wallets/Org1');
        wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
    }
    else if(usertype == "Student"){
        id = configdata.StudentAppAdmin;
        ccp = ccp_org2;
        walletPath = path.join(process.cwd(), '/wallets/Org2');
        wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
    }
    else{
        return "Invalid Type";
    }
        let userGateway = new Gateway();
        await userGateway.connect(ccp, { identity: userid, wallet: wallet, discovery: configdata.gatewayDiscovery });

        // Access channel: channel_name
        console.log('Use network channel: ' + configdata["channel_name"]);
        network = await userGateway.getNetwork(configdata["channel_name"]);

        // Get addressability to the smart contract as specified in config
        contract = await network.getContract(configdata["smart_contract_name"]);
        console.log('Userid: ' + userid + ' connected to smartcontract: ' +
            configdata["smart_contract_name"] + ' in channel: ' + configdata["channel_name"]);

        console.log('Leaving setUserContext: ' + userid);
        return contract;
    }
    catch (error) { throw (error); }
}  //  end of UserContext(userid)

utils.AdmitAStudent = async function(userName,usertype,name,rollno) {
     let id ;
        let ccp;
        console.log(usertype);
        if(usertype == "Faculty"){
            id = configdata.FacultyappAdmin;
            ccp = ccp_org1;
            walletPath = path.join(process.cwd(), '/wallets/Org1');
            wallet = new FileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);  
        }
        else if(usertype == "admin"){
            id = configdata.Admin;
            ccp = ccp_org1;
            walletPath = path.join(process.cwd(), '/wallets/Org1');
            wallet = new FileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);
        }
        else if(usertype == "Student"){
            id = configdata.StudentAppAdmin;
            ccp = ccp_org2;
            walletPath = path.join(process.cwd(), '/wallets/Org2');
            wallet = new FileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);
        }
        else{
            return "Invalid Type";
        }
      try{ 

        const userGateway = new Gateway();
        await userGateway.connect(ccp, { wallet, identity: userName, discovery:configdata.gatewayDiscovery});

        console.log('Use network channel: ' + configdata["channel_name"]);
        network = await userGateway.getNetwork(configdata["channel_name"]);

        // Get addressability to the smart contract as specified in config
        contract = await network.getContract(configdata["smart_contract_name"]);
        console.log('Userid: ' + userName + ' connected to smartcontract: ' +
            configdata["smart_contract_name"] + ' in channel: ' + configdata["channel_name"]);

        await contract.submitTransaction('AdmitAStudent', rollno,name);
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await userGateway.disconnect();
        return "Transaction completed";

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        response.error = error.message;
        return response; 
    }
}


utils.AddGrade = async function(userName,usertype,rollno,semno,Dict){
    try{
         let id ;
        let ccp;
        console.log(usertype);
        if(usertype == "Faculty"){
            id = configdata.FacultyappAdmin;
            ccp = ccp_org1;
            walletPath = path.join(process.cwd(), '/wallets/Org1');
            wallet = new FileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);  
        }
        else if(usertype == "admin"){
            id = configdata.Admin;
            ccp = ccp_org1;
            walletPath = path.join(process.cwd(), '/wallets/Org1');
            wallet = new FileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);
        }
        else if(usertype == "Student"){
            id = configdata.StudentAppAdmin;
            ccp = ccp_org2;
            walletPath = path.join(process.cwd(), '/wallets/Org2');
            wallet = new FileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);
        }
        else{
            return "Invalid Type";
        }
        const userGateway = new Gateway();
        await userGateway.connect(ccp, { wallet, identity: userName, discovery:configdata.gatewayDiscovery});

        console.log('Use network channel: ' + configdata["channel_name"]);
        network = await userGateway.getNetwork(configdata["channel_name"]);

        // Get addressability to the smart contract as specified in config
        contract = await network.getContract(configdata["smart_contract_name"]);
        console.log('Userid: ' + userName + ' connected to smartcontract: ' +
        configdata["smart_contract_name"] + ' in channel: ' + configdata["channel_name"]);
        const result = await contract.submitTransaction('AddGrade', rollno,semno,Dict);

        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

        return result.toString();

    }catch(error){
        console.error(`Failed to evaluate transaction: ${error}`);
        response.error = error.message;
        return response;

    }

}


utils.GetStudentInfo = async function(userName,rollno,usertype) {

    try {
        let id ;
        let ccp;
        console.log(usertype);
        if(usertype == "Faculty"){
            id = configdata.FacultyappAdmin;
            ccp = ccp_org1;
            walletPath = path.join(process.cwd(), '/wallets/Org1');
            wallet = new FileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);  
        }
        else if(usertype == "admin"){
            id = configdata.Admin;
            ccp = ccp_org1;
            walletPath = path.join(process.cwd(), '/wallets/Org1');
            wallet = new FileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);
        }
        else if(usertype == "Student"){
            id = configdata.StudentAppAdmin;
            ccp = ccp_org2;
            walletPath = path.join(process.cwd(), '/wallets/Org2');
            wallet = new FileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);
        }
        else{
            return "Invalid Type";
        }
        
        const userGateway = new Gateway();
        await userGateway.connect(ccp, { wallet, identity: userName, discovery:configdata.gatewayDiscovery});

        console.log('Use network channel: ' + configdata["channel_name"]);
        network = await userGateway.getNetwork(configdata["channel_name"]);

        // Get addressability to the smart contract as specified in config
        contract = await network.getContract(configdata["smart_contract_name"]);
        console.log('Userid: ' + userName + ' connected to smartcontract: ' +
            configdata["smart_contract_name"] + ' in channel: ' + configdata["channel_name"]);
        
        const result = await contract.evaluateTransaction('GetStudentInfo',rollno);

        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

        return JSON.parse(result.toString());

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        response.error = error.message;
        return response;
    }
}


utils.SeeAll = async function(userName,usertype) {

    try {
        let id ;
        let ccp;
        console.log(usertype);
        if(usertype == "Faculty"){
            id = configdata.FacultyappAdmin;
            ccp = ccp_org1;
            walletPath = path.join(process.cwd(), '/wallets/Org1');
            wallet = new FileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);  
        }
        else if(usertype == "admin"){
            id = configdata.Admin;
            ccp = ccp_org1;
            walletPath = path.join(process.cwd(), '/wallets/Org1');
            wallet = new FileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);
        }
        else if(usertype == "Student"){
            id = configdata.StudentAppAdmin;
            ccp = ccp_org2;
            walletPath = path.join(process.cwd(), '/wallets/Org2');
            wallet = new FileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);
        }
        else{
            return "Invalid Type";
        }
        
        const userGateway = new Gateway();
        await userGateway.connect(ccp, { wallet, identity: "sneha", discovery:configdata.gatewayDiscovery});

        console.log('Use network channel: ' + configdata["channel_name"]);
        network = await userGateway.getNetwork(configdata["channel_name"]);

        // Get addressability to the smart contract as specified in config
        contract = await network.getContract(configdata["smart_contract_name"]);
        console.log('Userid: ' + userName + ' connected to smartcontract: ' +
            configdata["smart_contract_name"] + ' in channel: ' + configdata["channel_name"]);
        
        const result = await contract.evaluateTransaction('SeeAll');

        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

        return JSON.parse(result.toString());

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        response.error = error.message;
        return response;
    }
}

module.exports = utils;
