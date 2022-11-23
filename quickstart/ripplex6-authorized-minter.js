// *******************************************************
// ****************  Set Minter  *************************
// *******************************************************

async function setMinter(type) {    
  let net = getNet()
  const client = new xrpl.Client(net)
  results = 'Connecting to ' + getNet() + '....'
  document.getElementById('standbyResultField').value = results
  await client.connect()
  results += '\nConnected, finding wallet.'
  document.getElementById('standbyResultField').value = results
  my_wallet = xrpl.Wallet.fromSeed(standbySeedField.value)
  document.getElementById('standbyResultField').value = results

  tx_json = {
    "TransactionType": "AccountSet",
    "Account": my_wallet.address,
    "NFTokenMinter": standbyMinterField.value,
    "SetFlag": xrpl.AccountSetAsfFlags.asfAuthorizedNFTokenMinter
    } 
    results += '\n Set Minter.' 
    document.getElementById('standbyResultField').value = results
      
    const prepared = await client.autofill(tx_json)
    const signed = my_wallet.sign(prepared)
    const result = await client.submitAndWait(signed.tx_json)
    if (result.result.meta.TransactionResult == "tesSUCCESS") {
    results += '\nAccount setting succeeded.'
    results += JSON.stringify(result,null,2)
    document.getElementById('standbyResultField').value = results
    } else {
    throw 'Error sending transaction: ${result}'
    results += '\nAccount setting failed.'
    document.getElementById('standbyResultField').value = results
    }
      
  client.disconnect()
} // End of configureAccount()

// *******************************************************
// ****************  Mint Other  *************************
// *******************************************************

async function mintOther() {
  results = 'Connecting to ' + getNet() + '....'
  document.getElementById('standbyResultField').value = results
  let net = getNet()
  const standby_wallet = xrpl.Wallet.fromSeed(standbySeedField.value)
  const client = new xrpl.Client(net)
  await client.connect()
  results += '\nConnected. Minting NFToken.'
  document.getElementById('standbyResultField').value = results
      
  // This version adds the "Issuer" field.
  // ------------------------------------------------------------------------
  const transactionBlob = {
    "TransactionType": "NFTokenMint",
    "Account": standby_wallet.classicAddress,
    "URI": xrpl.convertStringToHex(standbyTokenUrlField.value),
    "Flags": parseInt(standbyFlagsField.value),
    "TransferFee": parseInt(standbyTransferFeeField.value),
    "Issuer": standbyIssuerField.value,
    "NFTokenTaxon": 0 //Required, but if you have no use for it, set to zero.
  }

  // ----------------------------------------------------- Submit signed blob 
  const tx = await client.submitAndWait(transactionBlob, { wallet: standby_wallet} )
  const nfts = await client.request({
    method: "account_nfts",
    account: standby_wallet.classicAddress  
  })
        
  // ------------------------------------------------------- Report results
  results += '\n\nTransaction result: '+ tx.result.meta.TransactionResult
  results += '\n\nnfts: ' + JSON.stringify(nfts, null, 2)
  document.getElementById('standbyBalanceField').value = 
    (await client.getXrpBalance(standby_wallet.address))
  document.getElementById('standbyResultField').value = results    
  client.disconnect()
} //End of mintToken()

// *******************************************************
// *********** Operational Set Minter  *******************
// *******************************************************

async function oPsetMinter(type) {    
  let net = getNet()
  const client = new xrpl.Client(net)
  results = 'Connecting to ' + getNet() + '....'
  document.getElementById('operationalResultField').value = results
  await client.connect()
  results += '\nConnected, finding wallet.'
  document.getElementById('operationalResultField').value = results
  my_wallet = xrpl.Wallet.fromSeed(operationalSeedField.value)
  document.getElementById('operationalResultField').value = results

  tx_json = {
    "TransactionType": "AccountSet",
    "Account": my_wallet.address,
    "NFTokenMinter": operationalMinterField.value,
    "SetFlag": xrpl.AccountSetAsfFlags.asfAuthorizedNFTokenMinter
  } 
    results += '\n Set Minter.' 
    document.getElementById('operationalResultField').value = results
      
    const prepared = await client.autofill(tx_json)
    const signed = my_wallet.sign(prepared)
    const result = await client.submitAndWait(signed.tx_json)
    if (result.result.meta.TransactionResult == "tesSUCCESS") {
    results += '\nAccount setting succeeded.'
    results += JSON.stringify(result,null,2)
    document.getElementById('operationalResultField').value = results
    } else {
    throw 'Error sending transaction: ${result}'
    results += '\nAccount setting failed.'
    document.getElementById('operationalResultField').value = results
    }
      
  client.disconnect()
} // End of configureAccount()

// *******************************************************
// ************** Operational Mint Other *****************
// *******************************************************
      
async function oPmintOther() {
  results = 'Connecting to ' + getNet() + '....'
  document.getElementById('operationalResultField').value = results
  let net = getNet()
  const operational_wallet = xrpl.Wallet.fromSeed(operationalSeedField.value)
  const client = new xrpl.Client(net)
  await client.connect()
  results += '\nConnected. Minting NFToken.'
  document.getElementById('operationalResultField').value = results

  // This version adds the "Issuer" field.
  // ------------------------------------------------------------------------
  const transactionBlob = {
    "TransactionType": 'NFTokenMint',
    "Account": operational_wallet.classicAddress,
    "URI": xrpl.convertStringToHex(operationalTokenUrlField.value),
    "Flags": parseInt(operationalFlagsField.value),
    "Issuer": operationalIssuerField.value,
    "TransferFee": parseInt(operationalTransferFeeField.value),
    "NFTokenTaxon": 0 //Required, but if you have no use for it, set to zero.
  }
      
  // ----------------------------------------------------- Submit signed blob 
  const tx = await client.submitAndWait(transactionBlob, { wallet: operational_wallet} )
  const nfts = await client.request({
    method: "account_nfts",
    account: operational_wallet.classicAddress  
  })
        
  // ------------------------------------------------------- Report results
  results += '\n\nTransaction result: '+ tx.result.meta.TransactionResult
  results += '\n\nnfts: ' + JSON.stringify(nfts, null, 2)
  document.getElementById('operationalBalanceField').value = 
    (await client.getXrpBalance(operational_wallet.address))
  document.getElementById('operationalResultField').value = results    

  client.disconnect()
} //End of oPmintToken

