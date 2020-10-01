

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
        return usertype;
    }

    async StudentExists(ctx, rollno) {
        const buffer = await ctx.stub.getState(rollno);
        return (!!buffer && buffer.length > 0);
    }

    async AdmitAStudent(ctx, rollno, name) {
        var usertype = await this.getCurrentUserType(ctx);
        if( usertype != "admin"){
            throw new Error(`You don't have permission to do this`);
        }
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

    async AddGrade(ctx, rollno, semno, dict) {
        var usertype = await this.getCurrentUserType(ctx);
        if( usertype != "Faculty"){
            throw new Error(`You don't have permission to do this`);
        }
        const exists = await this.StudentExists(ctx, rollno);
        if (!exists) {
            throw new Error(`This student ${rollno} does not exist`);
        }
        var data = await ctx.stub.getState(rollno);
        data = JSON.parse(data.toString());
        var updateddata={};
        for(var key in data){
            if(key == "rollno"){
                continue;
            }
            updateddata[key] = data[key];
        }
        dict = JSON.parse(dict);
        var sgpa = await this.Calulate_sgpa(ctx,dict);
        dict['sgpa'] = sgpa;
        updateddata[semno]=dict;
        var cgpa = await this.Calulate_cgpa(ctx,semno,updateddata);
        updateddata['cgpa']=cgpa;
        const buffer = Buffer.from(JSON.stringify(updateddata));
        await ctx.stub.putState(rollno, buffer);
    }
    async Calulate_sgpa(ctx,dict){
        var usertype = await this.getCurrentUserType(ctx);
        if( usertype != "Faculty"){
            throw new Error(`You don't have permission to do this`);
        }
        var sgpa = 0;
        var count = 0;
        for(var key in dict){
            sgpa += dict[key];
            count +=1;
        }
        return sgpa/count;

    }
    async Calulate_cgpa(ctx,semno,data){
        var usertype = await this.getCurrentUserType(ctx);
        if( usertype != "Faculty"){
            throw new Error(`You don't have permission to do this`);
        }
        var cgpa = 0;
        for(var i = 1 ; i <= Number(semno);i++){
            cgpa += Number(data[i.toString()]['sgpa']);
        }
        return cgpa/Number(semno);

    }

    async deleteMySmartContract(ctx, rollno) {
        var usertype = await this.getCurrentUserType(ctx);
        if( usertype != "admin"){
            throw new Error(`You don't have permission to do this`);
        }
        const exists = await this.StudentExists(ctx, rollno);
        if (!exists) {
            throw new Error(`This student ${rollno} does not exist`);
        }
        await ctx.stub.deleteState(rollno);
    }

}

module.exports = MySmartContractContract;
