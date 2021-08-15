const mysql = require('mysql');
const JSONCircular = require('flatted');

class StellarDAO {

    constructor(con) {
        this.con = con;
    }


    async insertEscrowAccountInfo(escrowPubKey, escrowSecretKey, sourcePubKey, destPubKey) {
        return new Promise((resolve, reject) => {
            console.log('start insertEscrowAccountInfo');
            let sql = "INSERT INTO escrow_account (escrowpub, escrowsecret, source, destination, time) VALUES (?, ?, ?, ?, ?)";
            let values = [escrowPubKey, escrowSecretKey, sourcePubKey, destPubKey, new Date()];
            console.log('StellarDAO insertEscrowAccountInfo: ' + sql + ' ' + JSON.stringify(values));
            return this.con.query(sql, values, function (err, result) {
                if (err) {
                    console.error(err);
                    return reject(err);
                }
                console.log('Query Result: ' + JSON.stringify(result));
                resolve(result);
            });
        });

    }

    async insertEscrowTransactionInfo(operationId, escrow, sender, receiver, asset, amount, payment_xdr, refund_xdr) {
        return new Promise((resolve, reject) => {
            console.log('start insertEscrowTransactionInfo');
            let sql = "INSERT INTO escrow_transaction (operationid, escrow, sender, receiver, asset, amount, payment_status, payment_xdr, refund_status, refund_xdr, time) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            let values = [operationId, escrow, sender, receiver, asset, amount, 0, payment_xdr, 0, refund_xdr, new Date()];
            console.log('StellarDAO insertEscrowTransactionInfo: ' + sql + ' ' + JSON.stringify(values));


             return this.con.query(sql, values, function (err, result) {
                if (err) {
                    console.error(err);
                    return reject(err);
                }
                console.log('Query Result: ' + JSON.stringify(result));
                resolve(result);
            });
        });

    }


    async existEscrowTransactionInfo(operationId){
        return new Promise((resolve, reject) => {
            console.log('start existEscrowTransactionInfo');
            let sql = "SELECT COUNT(*) AS NUM FROM escrow_transaction where operationid = ?";
            let values = [operationId];
            console.log('StellarDAO validateOperationId: ' + sql + ' ' + JSON.stringify(values));

           this.con.query(sql, values, function (err, result) {
                if (err) {
                    console.error(err.stack);
                    return reject(err);
                }
                console.log('Query Result: ' + JSON.stringify(result));
                if (result[0].NUM == 0){
                    resolve(false);
                } else{
                    resolve(true);
                }
            });
        });
    }


    async selectEscrowTransactionInfo(operationId) {
        return new Promise((resolve, reject) => {
            let sql = "SELECT operationid, escrow, sender, receiver, asset, amount, payment_status, payment_xdr, payment_signer, refund_status, refund_xdr, refund_signer " +
                "FROM escrow_transaction WHERE operationid = ?";
            let values = [operationId];
            console.log('StellarDAO selectEscrowTransactionInfo: ' + sql);
            return this.con.query(sql, values, function (err, result) {
                if (err) {
                    console.error(err);
                    return reject(err);
                }
                console.log('Query Result: ' + JSON.stringify(result));
                let output = result[0];
                let param = {
                    operationId: operationId,
                    escrow: output.escrow,
                    sender: output.sender,
                    receiver: output.receiver,
                    asset: output.asset,
                    amount: output.amount,
                    payment_status: output.payment_status,
                    payment_xdr: output.payment_xdr,
                    payment_signer: output.payment_signer,
                    refund_status: output.refund_status,
                    refund_xdr: output.refund_xdr,
                    refund_signer: output.refund_signer

                }
                resolve(param);
            });
        });
    }

    async updateEscrowTransactionInfo(operationId, type, status, xdr, signer){
        return new Promise((resolve, reject) => {
            let sql;
            if(type == "payment"){
                sql = "UPDATE escrow_transaction SET payment_status = ?, payment_xdr = ?, payment_signer = ?, time = ? WHERE operationid = ?";
            } else { //type == refund
                sql = "UPDATE escrow_transaction SET refund_status = ?, refund_xdr = ?, refund_signer = ?, time = ? WHERE operationid = ?";
            }
            let values = [status, xdr, signer, new Date(), operationId];
            console.log('StellarDAO updateEscrowTransactionInfo: ' + sql + ' ' + JSON.stringify(values));
            this.con.query(sql, values, function (err, result) {
                if (err) {
                    console.error(err);
                    return reject(err);
                }
                console.log('Query Result: ' + JSON.stringify(result));
                resolve(result);
            });
        });
    }

}



module.exports.StellarDAO = StellarDAO;
