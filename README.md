# Student-Managment-using-hyperledger
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
- Now you can connect to Faric Enviroment and install the smart contract on both the peers.
- To interact with the smart contract you need to instantiate the smart contract.

### Getting Gateway config file And exporting wallet for API.
- From Fabric Gateway panel of ibm  blockchain extenstion you can export the config file of Org1 and Org2.
- Replace this file with API\gateway\ibpConnection_Org1.json and API\gateway\ibpConnection_Org2.json respectively.
- Similarly you can also export wallet from Wallet panel replace the directory with API\api\wallets\Org1 and API\api\walletsOrg2.

# Starting API
```bash
$ cd API\api\
$ node api.js
```
