const {assert} = require("chai");
const utils = require('./utils')
const Tx = require('ethereumjs-tx')
const ethers = require('ethers')

module.exports = {

  async assertThrowsMessage(promise, message) {
    try {
      await promise
      assert.isTrue(false)
      console.error('This did not throw: ', message)
    } catch (e) {
      const shouldBeTrue = e.message.indexOf(message) > -1
      if (!shouldBeTrue) {
        console.error('Expected: ', message)
        console.error(e.message)
      }
      assert.isTrue(shouldBeTrue)
    }
  },

  async getSignature(ethers, contract, address, appId, id, timestamp) {
    const hash = await contract['encodeForSignature(address,uint256,uint256,uint256)'](address, appId, id, timestamp)
    return utils.ECDSASign(
        ethers,
        '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
        hash
    )
  },

  async getSignature2(ethers, contract, address, appId, id, timestamp) {
    const hash = await contract['encodeForSignature(address,uint256[],uint256[],uint256)'](address, appId, id, timestamp)
    return utils.ECDSASign(
        ethers,
        '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
        hash
    )
  },

  async getSignature3(ethers, contract, address, appId, id, timestamp) {
    const hash = await contract['encodeForSignature(address,uint256,uint256[],uint256)'](address, appId, id, timestamp)
    return utils.ECDSASign(
        ethers,
        '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
        hash
    )
  },

  async sendEths({
                   to,
                   from,
                   fromPrivateKey,
                   value,
                   gasPrice = 20000000000,
                   gasLimit = ethers.utils.hexlify(21000),
                 }) {
    const txCount = await provider.getTransactionCount(from)
    // build the transaction
    const tx = new Tx({
      nonce: ethers.utils.hexlify(txCount),
      to,
      value: ethers.utils.parseEther(value).toHexString(),
      gasLimit,
      gasPrice,
    })
    // sign the transaction
    tx.sign(Buffer.from(fromPrivateKey, 'hex'))
    // send the transaction
    const {hash} = await provider.sendTransaction('0x' + tx.serialize().toString('hex'))
    await provider.waitForTransaction(hash)
  }
}
