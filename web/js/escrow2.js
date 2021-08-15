const walletAddressElement = document.getElementById('wallet-address');
const srcAccElement = document.getElementById('source-acc');
const destAccElement = document.getElementById('dest-acc');
const amountElement = document.getElementById('amount');

const escrowInfoButton = document.getElementById('escrow-info-button');
const paymentButton = document.getElementById('payment-button');
const refundButton = document.getElementById('refund-button');
const operationIdInput = document.getElementById('operationID');
let walletAddress;
let operationId;
let payment_status;
let payment_xdr;
let payment_signer;
let refund_status;
let refund_xdr;
let refund_signer;



escrowInfoButton.onclick = async () => {
  let result = await getEscrowInfo(operationIdInput.value, walletAddress);
  operationId = operationIdInput.value;
  console.log(result);
  if(result.result){
    srcAccElement.innerHTML = result.sender;
    destAccElement.innerHTML = result.receiver;
    amountElement.innerHTML = result.amount;
    payment_status = result.payment_status;
    payment_xdr = result.payment_xdr;
    payment_signer = result.payment_signer;
    refund_status = result.refund_status;
    refund_xdr = result.refund_xdr;
    refund_signer = result.refund_signer;
    await activateButtonStatus();
  } else {
    alert(result.message);
  }

  console.log('Loading');
};

paymentButton.onclick = async () => {

  if (window.freighterApi.isConnected()) {
    let network = await window.freighterApi.getNetwork();
    let signedTransaction = await window.freighterApi.signTransaction(payment_xdr, network).catch(err =>{
      console.error(err);
    });
    console.log(signedTransaction);
    let result = await signEscrowInfo(operationId, 'payment', walletAddress, signedTransaction, payment_status + 1);
    if(result.result){
      paymentButton.disabled = true;
    }

  }
};

refundButton.onclick = async () => {

  if (window.freighterApi.isConnected()) {
    let network = await window.freighterApi.getNetwork();
    let signedTransaction = await window.freighterApi.signTransaction(refund_xdr, network).catch(err =>{
      console.error(err);
    });
    console.log(signedTransaction);
    let result = await signEscrowInfo(operationId, 'refund', walletAddress, signedTransaction, refund_status + 1);
    if(result.result){
      refundButton.disabled = true;
    }
  }
};

async function getEscrowInfo(operationId, requester){
  let data = {
    operationId: operationId,
    requester: requester
  };

  let response = await fetch('/escrow/getEscrowInfo', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-type': 'application/json; charset=UTF-8'
    }
  })
      .then(response => response.json())
      .then(json => {
        console.log(json);
        return json;
      });
  return response;

}


async function signEscrowInfo(operationId, type, signer, xdr, status){

  let data = {
    operationId: operationId,
    type: type,
    signer: signer,
    xdr: xdr,
    status: status
  };

  let response = await fetch('/escrow/signEscrowInfo', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-type': 'application/json; charset=UTF-8'
    }
  })
      .then(response => response.json())
      .then(json => {
        console.log(json);
        return json;
      });
  return response;

}

async function activateButtonStatus(){
  if((payment_status == 0 || (payment_status == 1 && payment_signer != walletAddress)) && refund_status != 2){
    paymentButton.disabled = false;
  }
  if((refund_status == 0 || (refund_status == 1 && refund_signer != walletAddress)) && payment_status != 2){
    refundButton.disabled = false;
  }

}



window.addEventListener('load', async (event) => {

  if (window.freighterApi.isConnected()) {
    //alert("User has Freighter!");
    let publicKey = await window.freighterApi.getPublicKey().catch(err =>{
      console.error(err);
    });
    walletAddress = publicKey;
    walletAddressElement.innerText = walletAddress;
    escrowInfoButton.disabled = false;
  }


  console.log('Loading');

});
