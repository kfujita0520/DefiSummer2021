/**
 * Wrapper for Stellar APIs
 */
const StellarSdk = require("stellar-sdk");
const dotenv = require('dotenv');
const {TransactionBuilder} = require("stellar-sdk");

class StellarHandler {

    constructor() {
        dotenv.config();
        if(process.env.STELLAR_ENVIRONMENT == "test"){
            console.log('Initialize StellarHandler');
            this.server = new StellarSdk.Server("https://horizon-testnet.stellar.org");
            this.passPhrase = StellarSdk.Networks.TESTNET;
        } else {
            //TODO
        }

    }

    async createEscrowAccount(senderPub, receiverPub) {
        const escrowKey = Keypair.random();
        console.log('Escrow', escrowKey.secret(), escrowKey.publicKey());
        await this.server.friendbot(escrowKey.publicKey()).call();
        let escrowAccount = await this.server.loadAccount(escrowKey.publicKey());

        let transaction = new StellarSdk.TransactionBuilder(escrowAccount, {
            fee: 100,
            networkPassphrase: this.passPhrase,
        })
            .addOperation(
                StellarSdk.Operation.setOptions({
                    signer: {
                        ed25519PublicKey: senderPub,
                        weight: 1
                    }
                }),
            )
            .addOperation(
                StellarSdk.Operation.setOptions({
                    masterWeight: 1,
                    lowThreshold: 2,
                    medThreshold: 2,
                    highThreshold: 2,
                    signer: {
                        ed25519PublicKey: receiverPub,
                        weight: 1
                    }
                })
            )
            .setTimeout(100)
            .build();
        transaction.sign(escrowKey);
        await this.server.submitTransaction(transaction)
            .then(console.log)
            .catch(function (error) {
                console.error("Error!", error);
            });

        let params = {
            public: escrowKey.publicKey(),
            private: escrowKey.secret()
        };
        return params;

    }

    async getEscrowInfo(operationId) {

        //TODO need to implement validation and error handling logic when invalid operationId is given
        console.log('Start getEscrowInfo');

        let sourceAcc;
        let escrowAcc;
        let destAcc;
        let asset;
        let amount;

        await this.server
            .operations()
            .operation(operationId)
            .call()
            .then(function (resp) {
                //console.log(resp);
                sourceAcc = resp.source_account;
                escrowAcc = resp.to;
                asset = resp.asset_type
                amount = resp.amount;
            })
            .catch(function (err) {
                console.error(err);
                throw err;
            });

        console.log('sender: ' + sourceAcc );
        console.log('escrow: ' + escrowAcc );
        console.log('asset: ' + asset );
        console.log('amount: ' + amount );

        await this.server.loadAccount(escrowAcc).then(account =>{
            //console.log('Account: ' + JSON.stringify(account));
            for (let i=0; i< account.signers.length; i++){
                //console.log('signer: ' + JSON.stringify(account.signers[i]));
                if(account.signers[i].type === 'ed25519_public_key' &&
                    account.signers[i].key !== escrowAcc &&
                    account.signers[i].key !== sourceAcc
                ){
                    destAcc = account.signers[i].key;
                    console.log('destination signer: ' + JSON.stringify(account.signers[i]));
                    break;
                }
            }
        })

        let params = {
            sender: sourceAcc,
            escrow: escrowAcc,
            receiver: destAcc,
            asset: asset,
            amount: amount
        };
        return params;

    }

    async createEscrowTxXDR(escrow, sender, receiver, asset, amount){
        let prePaymentXDR = await this.server.loadAccount(escrow)
            .then(account => {
                console.log('Start process');

                const prePaymentTx = new TransactionBuilder(account, {
                    fee: 100,
                    networkPassphrase: this.passPhrase,
                })
                    .addOperation(
                        StellarSdk.Operation.payment({
                            destination: receiver,
                            asset: StellarSdk.Asset.native(),
                            amount: amount,
                        }),
                    )
                    .setTimeout(0)
                    .build();

                console.log("prePaymentTx");
                console.log(prePaymentTx.toXDR());
                console.log(prePaymentTx);

                return prePaymentTx.toXDR();

            });

        let preRefundXDR = await this.server.loadAccount(escrow)
            .then(account => {
                console.log('Start process');

                const preRefundTx = new TransactionBuilder(account, {
                    fee: 100,
                    networkPassphrase: this.passPhrase,
                })
                    .addOperation(
                        StellarSdk.Operation.payment({
                            destination: sender,
                            asset: StellarSdk.Asset.native(),
                            amount: amount,
                        }),
                    )
                    .setTimeout(0)
                    .build();

                console.log("preRefundTx");
                console.log(preRefundTx.toXDR());
                console.log(preRefundTx);

                return preRefundTx.toXDR();

            });

        let params = {
            paymentXDR: prePaymentXDR,
            refundXDR: preRefundXDR,
        };
        return params;
    }

    async processEscrowTx(escrow, xdr){
        await this.server.loadAccount(escrow)
            .then(account => {
                console.log('Start process');

                let escrowTx = new StellarSdk.TransactionBuilder.fromXDR(xdr, this.passPhrase);
                console.log(escrowTx);

                this.server.submitTransaction(escrowTx).catch(function (error) {
                    console.error("Error!", error.response.data);
                });


            })
    }


}

module.exports.StellarHandler = StellarHandler;
