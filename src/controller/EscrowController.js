const dotenv = require('dotenv');
dotenv.config();

const StellarHandler = require('../handler/StellarHandler.js').StellarHandler;
const StellarDAO = require('../dao/StellarDAO.js').StellarDAO;

const MySQLDriver = require('../utilities/MySQLDriver').MySQLDriver;
const mysql_driver = new MySQLDriver();

class EscrowController {


    constructor(){
        console.log('create EscrowController');
        dotenv.config();
        this.stellar = new StellarHandler();
    }

    async createEscrowAccount(senderPub, receiverPub) {
        console.log('Start account creation');
        let result = await this.stellar.createEscrowAccount(senderPub, receiverPub);
        console.log(result);
        let conn = mysql_driver.getConnection();
        let stellar_dao = new StellarDAO(conn);
        await stellar_dao.insertEscrowAccountInfo(result.public, result.private, senderPub, receiverPub);

        let params = {
            result: true,
            escrowPub: result.public
        };
        return params;
    }



    async getEscrowInfo(operationId, requester){
        let escrowInfo = await this.stellar.getEscrowInfo(operationId).catch(err =>{
            let param = {
                result: false,
                msg: "operation ID is wrong"
            }
            return param;
        });
        if(!this.validateEscrowInfoRequest(requester, escrowInfo)){
            console.log('escrwoInfo: ' + JSON.stringify(escrowInfo));
            let param = {
                result: false,
                msg: "this operation is not for you"
            }
            return param;
        }
        let stellar_dao = new StellarDAO(mysql_driver.getConnection());
        let exist = await stellar_dao.existEscrowTransactionInfo(operationId);
        let txXDR;
        if(!exist){
            txXDR = await this.stellar.createEscrowTxXDR(escrowInfo.escrow, escrowInfo.sender, escrowInfo.receiver, escrowInfo.asset, escrowInfo.amount);
            await stellar_dao.insertEscrowTransactionInfo(operationId, escrowInfo.escrow, escrowInfo.sender, escrowInfo.receiver, escrowInfo.asset, escrowInfo.amount, txXDR.paymentXDR, txXDR.refundXDR);
        }

        let escrowTx = await stellar_dao.selectEscrowTransactionInfo(operationId);

        let param = {
            result: true,
            escrow: escrowTx.escrow,
            sender: escrowTx.sender,
            receiver: escrowTx.receiver,
            asset: escrowTx.asset,
            amount: escrowTx.amount,
            payment_status: escrowTx.payment_status,
            payment_xdr: escrowTx.payment_xdr,
            payment_signer: escrowTx.payment_signer,
            refund_status: escrowTx.refund_status,
            refund_xdr: escrowTx.refund_xdr,
            refund_signer: escrowTx.refund_signer

        }

        console.log(param);
        return param;
    }

    validateEscrowInfoRequest(requester, escrowInfo){
        if(escrowInfo.receiver == requester || escrowInfo.sender == requester){
            return true;
        } else{
            return false;
        }
    }

    async signEscrowInfo(operationId, type, signer, xdr, status){

        let escrowInfo = await this.stellar.getEscrowInfo(operationId).catch(err =>{
            let param = {
                result: false,
                msg: "operation ID is wrong"
            }
            return param;
        });
        if(!this.validateEscrowInfoRequest(signer, escrowInfo)){
            let param = {
                result: false,
                msg: "access wallet is wrong"
            }
            return param;
        }
        if(!this.validateSignEscrowTx(type, status)){
            let param = {
                result: false,
                msg: "type or status is wrong"
            }
            return param;
        }

        let stellar_dao = new StellarDAO(mysql_driver.getConnection());
        await stellar_dao.updateEscrowTransactionInfo(operationId, type, status, xdr, signer);

        if(status == 2){
            await this.stellar.processEscrowTx(escrowInfo.escrow, xdr);
        }

        let param = {
            result: true,
        }
        return param;
    }

    validateSignEscrowTx(type, status){
        let result = true;
        if(!(type == 'payment' || type == 'refund')){
            result = false;
        }
        if(!(status == 1 || status == 2)){
            result = false;
        }
        return result;
    }


    async testProcess(){
        let param = {
            result: true,
            msg: "test is done"
        }
        return param;
    }

}


module.exports.EscrowController = EscrowController;
