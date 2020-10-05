/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { MySmartContractContract } = require('..');
const winston = require('winston');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext {

    constructor() {
        this.stub = sinon.createStubInstance(ChaincodeStub);
        this.clientIdentity = sinon.createStubInstance(ClientIdentity);
        this.logging = {
            getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
            setLevel: sinon.stub(),
        };
    }

}

describe('MySmartContractContract', () => {

    let contract;
    let ctx;

    beforeEach(() => {
        contract = new MySmartContractContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"my smart contract 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"my smart contract 1002 value"}'));
    });

    describe('#mySmartContractExists', () => {

        it('should return true for a my smart contract', async () => {
            await contract.mySmartContractExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a my smart contract that does not exist', async () => {
            await contract.mySmartContractExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createMySmartContract', () => {

        it('should create a my smart contract', async () => {
            await contract.createMySmartContract(ctx, '1003', 'my smart contract 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"my smart contract 1003 value"}'));
        });

        it('should throw an error for a my smart contract that already exists', async () => {
            await contract.createMySmartContract(ctx, '1001', 'myvalue').should.be.rejectedWith(/The my smart contract 1001 already exists/);
        });

    });

    describe('#readMySmartContract', () => {

        it('should return a my smart contract', async () => {
            await contract.readMySmartContract(ctx, '1001').should.eventually.deep.equal({ value: 'my smart contract 1001 value' });
        });

        it('should throw an error for a my smart contract that does not exist', async () => {
            await contract.readMySmartContract(ctx, '1003').should.be.rejectedWith(/The my smart contract 1003 does not exist/);
        });

    });

    describe('#updateMySmartContract', () => {

        it('should update a my smart contract', async () => {
            await contract.updateMySmartContract(ctx, '1001', 'my smart contract 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"my smart contract 1001 new value"}'));
        });

        it('should throw an error for a my smart contract that does not exist', async () => {
            await contract.updateMySmartContract(ctx, '1003', 'my smart contract 1003 new value').should.be.rejectedWith(/The my smart contract 1003 does not exist/);
        });

    });

    describe('#deleteMySmartContract', () => {

        it('should delete a my smart contract', async () => {
            await contract.deleteMySmartContract(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a my smart contract that does not exist', async () => {
            await contract.deleteMySmartContract(ctx, '1003').should.be.rejectedWith(/The my smart contract 1003 does not exist/);
        });

    });

});