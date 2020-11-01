# Student-Managment-using-hyperledger
[![forthebadge made-with-javascript](https://forthebadge.com/images/badges/made-with-javascript.svg)](https://nodejs.org/en/) \
Hyperledger fabric based project for college student management.
## Prerequisites
- Docker
- Nodejs
- Python
- Openssl
- IBM Blockchain Extension vscode
# Setup
```bash
# Get repository
$ git clone https://github.com/YashSahsani/Student-Management-using-hyperledger.git && cd Student-Management-using-hyperledger
$ npm install
```
### Creating Fabric Enviroment 
- In vscode first you need to create a Faric Environment of 2 Orgs and 2 CA and 1 channel.
- Reference (https://www.youtube.com/watch?v=Ko45lwONvEU).
- After that you need to import Blockchain@0.0.14 file in packaged smart contract.
- Now you can connect to Fabric Enviroment and install the smart contract on both the peers.
- To interact with the smart contract you need to instantiate the smart contract.

### Getting Gateway config file And exporting wallet for API.
- From Fabric Gateway panel of ibm  blockchain extenstion you can export the config file of Org1 and Org2.
- Replace this file with API\gateway\ibpConnection_Org1.json and API\gateway\ibpConnection_Org2.json respectively.
- Similarly you can also export wallet from Wallet panel replace the directory with API\api\wallets\Org1 and API\api\wallets\Org2.

# Starting API
```bash
$ cd API\api\
$ node api.js
```

| Parameter | Example 
| - | - 
| `environment` | `localhost:3000`
| `usertype` | `Student or Faculty`

## API Endpoints
```bash
$ # Registering a user
$ curl -X POST -H "Content-Type: application/json" -d '{"userid":"{name}","password":"{password}","usertype":"{usertype}"}' http://{environment}/api/register-user/
$ # Example
$ curl -X POST -H "Content-Type: application/json" -d '{"userid":"Faculty1","password":"Faculty1pw","usertype":"Faculty"}' http://{environment}/api/register-user/
```
```bash
$ # Enrolling a user
$ curl -X POST -H "Content-Type: application/json" -d '{"userid":"{name}","password":"{password}","usertype":"{usertype}"}' http://{environment}/api/enroll-user/
$ # Example
$ curl -X POST -H "Content-Type: application/json" -d '{"userid":"Faculty1","password":"Faculty1pw","usertype":"Faculty"}' http://{environment}/api/enroll-user/
```
```bash
$ # To check if user is enrolled or not.
$ curl http://{environment}/api/is-user-enrolled/{name}/{usertype}
$ # Example
$ curl http://{environment}/api/is-user-enrolled/Faculty1/Faculty ; echo
```

```bash
$ # Login a user
$ curl -X POST -H "Content-Type: application/json" -d '{"userid":"{name}","password":"{password}"}' http://{environment}/api/login/{usertype}
$ # Example
$ curl -X POST -H "Content-Type: application/json" -d '{"userid":"Faculty1","password":"Faculty1pw"}' http://{environment}/api/login/Faculty
```
```bash
$ # To get current user id.
$ curl http://{environment}/api/current-user-id;echo
```
```bash
$ # To get current user type.
$ curl http://{environment}/api/current-user-type;echo
```
```bash
$ # Admit a Student (can only be done by identity having attribute usertype=admin)
$ curl -X POST -H "Content-Type: application/json" -d '{"userid":"{name}","rollno":"{rollno}","name":"{name}","usertype":"{usertype}"}' http://{environment}/api/AdmitAStudent
$ # Example
$ curl -X POST -H "Content-Type: application/json" -d '{"userid":"Faculty1","rollno":"18it112","name":"Yash Mahesh Sahsani","usertype":"Student"}' http://{environment}/api/AdmitAStudent
```
```bash
$ # Get Student Details
$ curl -X POST -H "Content-Type: application/json" -d '{"username":"{name}","rollno":"{rollno}","usertype":"{usertype}"}' http://{environment}/api/GetStudnetInfo | jq
$ # Example
$ curl -X POST -H "Content-Type: application/json" -d '{"username":"Student1","rollno":"18it112","usertype":"Student"}' http://{environment}/api/GetStudnetInfo | jq
```
```bash
$ # Add Student Details(only for usertype {Faculty} )
$ curl -X POST -H "Content-Type: application/json" -d '{"username":"{name}","rollno":"{rollno}","dict":{dictionary where key=subject_name and value=pointer},"semno":"{semno}","usertype":"{usertype}"}' http://{environment}/api/AddGrade/
$ # Example
$ curl -X POST -H "Content-Type: application/json" -d '{"username":"Faculty1","rollno":"18it112","dict":{"DAA":7.0,"Cryptography":4.0,"CN":5.0},"semno":"1","usertype":"Faculty"}' http://{environment}/api/AddGrade/
```
# TODO:
- [x] Create a Fabric Network.
- [x] Create a basic smart contract for POC.
- [x] Create API to interact with hyperledger fabric.
- [x] Create Forntend to interact with hyperledger.
- [ ] Upgrade hyperledger fabric version from 1.4 to 2.2.
