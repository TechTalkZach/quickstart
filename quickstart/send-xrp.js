
// *** Define HTML Form Fields **
const xls = document.getElementById("xls")
const tn = document.getElementById("tn")
const dn = document.getElementById("dn")
const standbyResultField = document.getElementById('standbyResultField');
const operationalResultsField = document.getElementById('operationalResultField');
const standbyAccountField = document.getElementById('standbyAccountField');
const standbyPubKeyField = document.getElementById('standbyPubKeyField');
const standbyPrivKeyField = document.getElementById('standbyPrivKeyField');
const standbyBalanceField = document.getElementById('standbyBalanceField');
const standbySeedField = document.getElementById('standbySeedField');
const operationalAccountField = document.getElementById('operationalAccountField');
const operationalPubKeyField = document.getElementById('operationalPubKeyField');
const operationalPrivKeyField = document.getElementById('operationalPrivKeyField');
const operationalSeedField = document.getElementById('operationalSeedField');
const operationalBalanceField = document.getElementById('operationalBalanceField');


// ************* Get the Preferred Network **************
function getNet() {
    let net
      if (xls.checked) net = "wss://xls20-sandbox.rippletest.net:51233"
       if (tn.checked) net = "wss://s.altnet.rippletest.net:51233"
       if (dn.checked) net = "wss://s.devnet.rippletest.net:51233"
       return net
    } // End of getNet()

// *******************************************************              
// ************* Get Account *****************************  
// *******************************************************

async function getAccount(type) {
  let net = getNet()
  
  const client = new xrpl.Client(net)
    results = 'Connecting to ' + net + '....'
    
    // This uses the default faucet for Testnet/Devnet
    let faucetHost = null
    if(document.getElementById("xls").checked) {
        faucetHost = "faucet-nft.ripple.com"
    } 
    if (type == 'standby') {
      standbyResultField.value = results
    } else {
      operationalResultField.value = results
    }
    await client.connect()
    
    results += '\nConnected, funding wallet.'
    if (type == 'standby') {
      standbyResultField.value = results
    } else {
      operationalResultField.value = results
    }
    
    // -----------------------------------Create and fund a test account wallet
   const my_wallet = (await client.fundWallet(null, { faucetHost })).wallet
    
    results += '\nGot a wallet.'
    if (type == 'standby') {
      standbyResultField.value = results
    } else {
      operationalResultField.value = results
    }       
  
    // -----------------------------------Get the current balance.
    const my_balance = (await client.getXrpBalance(my_wallet.address))  
    
    if (type == 'standby') {
      standbyAccountField.value = my_wallet.address
      standbyPubKeyField.value = my_wallet.publicKey
      standbyPrivKeyField.value = my_wallet.privateKey
      standbyBalanceField.value = 
          (await client.getXrpBalance(my_wallet.address))
      standbySeedField.value = my_wallet.seed
      results += '\nStandby account created.'
      standbyResultField.value = results
    } else {
      operationalAccountField.value = my_wallet.address
      operationalPubKeyField.value = my_wallet.publicKey
      operationalPrivKeyField.value = my_wallet.privateKey
      operationalSeedField.value = my_wallet.seed
      operationalBalanceField.value = 
          (await client.getXrpBalance(my_wallet.address))
      results += '\nOperational account created.'
      operationalResultField.value = results
    }
    // --------------- Capture the seeds for both accounts for ease of reload.
    seeds.value = standbySeedField.value + '\n' + operationalSeedField.value
    client.disconnect()
  } // End of getAccount

  // *******************************************************
// ********** Get Accounts from Seeds ******************** 
// *******************************************************

async function getAccountsFromSeeds() {
    let net = getNet()
    const client = new xrpl.Client(net)
    results = 'Connecting to ' + getNet() + '....'
    standbyResultField.value = results
    await client.connect()
    results += '\nConnected, finding wallets.\n'
    standbyResultField.value = results
  
    // -----------------------------------Find the test account wallets    
    var lines = seeds.value.split('\n');

    const standby_wallet = xrpl.Wallet.fromSeed(lines[0])
    const operational_wallet = xrpl.Wallet.fromSeed(lines[1])
  
    // -----------------------------------Get the current balance.
    const standby_balance = (await client.getXrpBalance(standby_wallet.address))
    const operational_balance = (await client.getXrpBalance(operational_wallet.address))  
    
    // ------------------Populate the fields for Standby and Operational accounts
    standbyAccountField.value = standby_wallet.address
    standbyPubKeyField.value = standby_wallet.publicKey
    standbyPrivKeyField.value = standby_wallet.privateKey
    standbySeedField.value = standby_wallet.seed
    standbyBalanceField.value = (await client.getXrpBalance(standby_wallet.address))
  
    operationalAccountField.value = operational_wallet.address
    operationalPubKeyField.value = operational_wallet.publicKey
    operationalPrivKeyField.value = operational_wallet.privateKey
    operationalSeedField.value = operational_wallet.seed
    operationalBalanceField.value = (await client.getXrpBalance(operational_wallet.address))
  
   client.disconnect()
        
  } // End of getAccountsFromSeeds()

  // // *******************************************************
// ******************** Send XRP *************************
// *******************************************************

async function sendXRP() {
      
    results  = "Connecting to the selected ledger.\n"
    standbyResultField.value = results
    let net = getNet()
    results = 'Connecting to ' + getNet() + '....'
    const client = new xrpl.Client(net)
    await client.connect()
  
    results  += "\nConnected. Sending XRP.\n"
    standbyResultField.value = results
  
    const standby_wallet = xrpl.Wallet.fromSeed(standbySeedField.value)
    const operational_wallet = xrpl.Wallet.fromSeed(operationalSeedField.value)
    const sendAmount = standbyAmountField.value
    
    results += "\nstandby_wallet.address: = " + standby_wallet.address
    standbyResultField.value = results
  
    // ------------------------------------------------------- Prepare transaction
    // Note that the destination is hard coded.
    const prepared = await client.autofill({
      "TransactionType": "Payment",
      "Account": standby_wallet.address,
      "Amount": xrpl.xrpToDrops(sendAmount),
      "Destination": standbyDestinationField.value
    })
  
    // ------------------------------------------------ Sign prepared instructions
    const signed = standby_wallet.sign(prepared)
  
    // -------------------------------------------------------- Submit signed blob
    const tx = await client.submitAndWait(signed.tx_blob)
  
     results  += "\nBalance changes: " + 
        JSON.stringify(xrpl.getBalanceChanges(tx.result.meta), null, 2)
     standbyResultField.value = results

    standbyBalanceField.value = 
      (await client.getXrpBalance(standby_wallet.address))
    operationalBalanceField.value = 
      (await client.getXrpBalance(operational_wallet.address))                 
    client.disconnect()
  
  } // End of sendXRP()

  // *******************************************
// ****** Reciprocal Transactions ************

// ******************************************* 
// *****Send XRP from Operational account ****
// *******************************************
      
async function oPsendXRP() {

    results  = "Connecting to the selected ledger.\n"
    operationalResultField.value = results
    let net = getNet()
    results = 'Connecting to ' + getNet() + '....'
    const client = new xrpl.Client(net)
    await client.connect()
  
    results  += "\nConnected. Sending XRP.\n"
    operationalResultField.value = results
  
    const operational_wallet = xrpl.Wallet.fromSeed(operationalSeedField.value)
    const standby_wallet = xrpl.Wallet.fromSeed(standbySeedField.value)
    const sendAmount = operationalAmountField.value
    
    results += "\noperational_wallet.address: = " + operational_wallet.address
    operationalResultField.value = results
  
    // ------------------------------------------------------- Prepare transaction
    // Note that the destination is hard coded.
    const prepared = await client.autofill({
      "TransactionType": "Payment",
      "Account": operational_wallet.address,
      "Amount": xrpl.xrpToDrops(operationalAmountField.value),
      "Destination": operationalDestinationField.value
    })
  
    // ------------------------------------------------ Sign prepared instructions
    const signed = operational_wallet.sign(prepared)
  
    // -------------------------------------------------------- Submit signed blob
    const tx = await client.submitAndWait(signed.tx_blob)
  
     results  += "\nBalance changes: " + 
        JSON.stringify(xrpl.getBalanceChanges(tx.result.meta), null, 2)
     operationalResultField.value = results
     
    standbyBalanceField.value = 
      (await client.getXrpBalance(standby_wallet.address))
    operationalBalanceField.value = 
      (await client.getXrpBalance(operational_wallet.address))                 
  
    client.disconnect()
  
  } // End of oPsendXRP()




