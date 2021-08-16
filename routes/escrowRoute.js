const express = require('express');
const router = express.Router();
const path = require('path');
const EscrowController = require('../src/controller/EscrowController.js').EscrowController;

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log('test');
    res.sendFile(path.join(__dirname,'../web/ProcessTransaction.html'));

});

router.post('/createAccount', function(req, res, next){

    console.log('/escrow/createAccount POST: ' + JSON.stringify(req.body));

    let ipaddr = req.socket.remoteAddress;
    let sender = req.body.sender;
    let receiver = req.body.receiver;

    console.log("IP is: " + ipaddr);

    let escrowCtr = new EscrowController();
    escrowCtr.createEscrowAccount(sender, receiver).then(result => {
        console.log(JSON.stringify(result));
        res.json(result);
    }).catch(error => {
        console.log('Error: ' + JSON.stringify(error));
        let param = {
            result: false,
            msg: "internal error"
        }
        console.log(JSON.stringify(param));
        res.json(param);
    });

});

router.post('/getEscrowInfo', function(req, res, next){

    console.log('/escrow/getEscrowInfo POST: ' + JSON.stringify(req.body));

    let ipaddr = req.socket.remoteAddress;
    let operationId = req.body.operationId;
    let requester = req.body.requester;

    console.log("IP is: " + ipaddr);
    console.log("operationId is: " + operationId);
    console.log("requester is: " + requester);

    let escrowCtr = new EscrowController();
    escrowCtr.getEscrowInfo(operationId, requester).then(result => {
        console.log(JSON.stringify(result));
        res.json(result);
    }).catch(error => {
        console.log('Error: ' + JSON.stringify(error));
        let param = {
            result: false,
            msg: "internal error"
        }
        console.log(JSON.stringify(param));
        res.json(param);
    });

});

router.post('/signEscrowInfo', function(req, res, next){

    console.log('/escrow/signEscrowInfo POST: ' + JSON.stringify(req.body));

    let ipaddr = req.socket.remoteAddress;
    let operationId = req.body.operationId;
    let type = req.body.type;
    let signer = req.body.signer;
    let xdr = req.body.xdr;
    let status = req.body.status;
    console.log("IP is: " + ipaddr);


    let escrowCtr = new EscrowController();
    escrowCtr.signEscrowInfo(operationId, type, signer, xdr, status).then(result => {
        console.log(JSON.stringify(result));
        res.json(result);
    }).catch(error => {
        console.log('Error: ' + JSON.stringify(error));
        let param = {
            result: false,
            msg: "internal error"
        }
        console.log(JSON.stringify(param));
        res.json(param);
    });


});

router.post('/test', function(req, res, next){

    console.log('/escrow/test POST: ' + JSON.stringify(req.body));

    let ipaddr = req.socket.remoteAddress;
    let test = req.body.test;
    console.log("IP is: " + ipaddr);


    let escrowCtr = new EscrowController();
    escrowCtr.testProcess().then(result => {
        console.log(JSON.stringify(result));
        res.json(result);
    });

});




module.exports = router;
