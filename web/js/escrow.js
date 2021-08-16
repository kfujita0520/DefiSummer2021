
const srcAccInput = document.getElementById('source-acc');
const destAccInput = document.getElementById('dest-acc');
const walletAddrElement = document.getElementById('wallet-addr');

const enableButton = document.getElementById('enable-button');
const initiateEscrowButton = document.getElementById('initiate-escrow-button');


initiateEscrowButton.onclick = async () => {
  let result = await createEscrowAccount(srcAccInput.value, destAccInput.value);
  if(result.result){
    document.getElementById('escrow_acc').innerHTML = result.escrowPub;
  } else{
    alert(result.msg);
  }
};

async function createEscrowAccount(sender, receiver){
  let data = {
    sender: sender,
    receiver: receiver
  };

  let response = await fetch('/escrow/createAccount', {
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




enableButton.onclick = async () => {
  if (window.freighterApi.isConnected()) {
    //alert("User has Freighter!");
    let publicKey = await window.freighterApi.getPublicKey().catch(err =>{
      console.error(err);
    });
    walletAddrElement.innerText = publicKey;
  }

  console.log('Loading');
};



window.addEventListener('load', async (event) => {

  if (window.freighterApi.isConnected()) {
    //alert("User has Freighter!");
    let publicKey = await window.freighterApi.getPublicKey().catch(err =>{
      console.error(err);
    });
    walletAddrElement.innerText = publicKey;
  }

  console.log('Loading');

});
