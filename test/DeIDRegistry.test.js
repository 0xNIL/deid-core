const {expect, assert} = require("chai");
const {assertThrowsMessage} = require('../src/helpers')
const {utils} = require('../src')

describe("DeIDRegistry", async function () {

  let DeIDStore
  let store
  let DeIDClaimer
  let claimer
  let DeIDManager
  let identity
  let Registry
  let registry
  let TXValidator
  let txValidator

  let names
  let bytes32Names
  let addresses

  let owner, validator
  let addr0 = '0x0000000000000000000000000000000000000000'

  before(async function () {
    const signers = await ethers.getSigners()
    owner = signers[0];
    validator = signers[1];
  })

  async function initNetworkAndDeploy() {
    // store
    DeIDStore = await ethers.getContractFactory("DeIDStore");
    store = await DeIDStore.deploy();
    await store.deployed();
    //claimer
    DeIDClaimer = await ethers.getContractFactory("DeIDClaimer");
    claimer = await DeIDClaimer.deploy();
    await claimer.deployed();
    // identity manager

    TXValidator = await ethers.getContractFactory("TXValidator");
    txValidator = await TXValidator.deploy();
    await txValidator.deployed();

    DeIDManager = await ethers.getContractFactory("DeIDManager");
    identity = await DeIDManager.deploy();
    await identity.deployed();

    Registry = await ethers.getContractFactory("DeIDRegistry");
    registry = await Registry.deploy();
    await registry.deployed();

  }

  async function getTimestamp() {
    return (await ethers.provider.getBlock()).timestamp
  }

  describe('#constructor', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });

    it("should verify that all the contracts are set", async function () {

      names = [
        'TXValidator',
        'DeIDStore',
        'DeIDManager',
        'DeIDClaimer'
      ]
      bytes32Names = names.map(e => utils.stringToBytes32(e))

      addresses = [
        txValidator.address,
        store.address,
        identity.address,
        claimer.address
      ]

      for (let i=0;i< names.length;i++) {
        await registry.setData(bytes32Names[i], addresses[i])
      }

      for (let i=0;i< names.length;i++) {
        assert.equal(await registry.registry(bytes32Names[i]), addresses[i])
      }

    });

  })

});
