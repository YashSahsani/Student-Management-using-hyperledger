/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class MySmartContractContract extends Contract {

    async getCurrentUserId(ctx) {

        let id = [];
        id.push(ctx.clientIdentity.getID());
        var begin = id[0].indexOf("/CN=");
        var end = id[0].lastIndexOf("::/C=");
        let userid = id[0].substring(begin + 4, end);
        return userid;
    }
    async getCurrentUserType(ctx) {

        let userid = await this.getCurrentUserId(ctx);

        if (userid == "admin") {
            return userid;
        }
        const usertype =  await ctx.clientIdentity.getAttributeValue("usertype");
        const mspid = await ctx.clientIdentity.getMSPID();
        var buffer = {usertype,mspid};
        const asset = JSON.parse(buffer.toString());
        return asset;
    }

    async StudentExists(ctx, rollno) {
        const buffer = await ctx.stub.getState(rollno);
        return (!!buffer && buffer.length > 0);
    }

    async AdmitAStudent(ctx, rollno, name) {
        const exists = await this.StudentExists(ctx, rollno);
        if (exists) {
            throw new Error(`This student  ${rollno} already exists`);
        }
        const asset = { name,rollno };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(rollno, buffer);
    }

    async GetStudentInfo(ctx, rollno) {
        const exists = await this.StudentExists(ctx, rollno);
        if (!exists) {
            throw new Error(`This student ${rollno} does not exist`);
        }
        const buffer = await ctx.stub.getState(rollno);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }

    async AddGrade(ctx, rollno, semno,grade) {
        const exists = await this.StudentExists(ctx, rollno);
        if (!exists) {
            throw new Error(`This student ${rollno} does not exist`);
        }
        var data = await ctx.stub.getState(rollno);
        var updateddata={};
        for(var key in data){
            updateddata[key] = data[key];
        }
        updateddata[semno]=grade;
        const buffer = Buffer.from(JSON.stringify(updateddata));
        await ctx.stub.putState(rollno, buffer);
    }

    async deleteMySmartContract(ctx, rollno) {
        const exists = await this.StudentExists(ctx, rollno);
        if (!exists) {
            throw new Error(`This student ${rollno} does not exist`);
        }
        await ctx.stub.deleteState(rollno);
    }

}

module.exports = MySmartContractContract;
