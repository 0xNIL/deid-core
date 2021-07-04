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

  let names
  let bytes32Names
  let addresses

  let owner, validator, org, bob, alice, mark, joe, bill, wikileaks, assange
  let addr0 = '0x0000000000000000000000000000000000000000'

  before(async function () {
    const signers = await ethers.getSigners()
    owner = signers[0];
    validator = signers[1];
    org = signers[2];
    bob = signers[3];
    alice = signers[4];
    wikileaks = signers[5];
    assange = signers[6];
    mark = signers[7];
    joe = signers[8];
    bill = signers[9];
  })

  async function initNetworkAndDeploy() {
    // store
    DeIDStore = await ethers.getContractFactory("DeIDStore");
    store = await DeIDStore.deploy(0);
    await store.deployed();
    //claimer
    DeIDClaimer = await ethers.getContractFactory("DeIDClaimer");
    claimer = await DeIDClaimer.deploy(store.address);
    await claimer.deployed();
    // identity manager

    const Validatable = await ethers.getContractFactory("Validatable");
    const validatable = await Validatable.deploy();
    await validatable.deployed();

    DeIDManager = await ethers.getContractFactory("DeIDManager");
    identity = await DeIDManager.deploy(store.address, claimer.address, validatable.address);
    await identity.deployed();

    const MANAGER_ROLE = await store.MANAGER_ROLE()
    await store.grantRole(MANAGER_ROLE, identity.address)
    await store.grantRole(MANAGER_ROLE, claimer.address)
    await claimer.grantRole(MANAGER_ROLE, identity.address)

    names = [
        'DeIDStore',
        'DeIDManager',
        'DeIDClaimer'
    ]
    bytes32Names = names.map(e => ethers.utils.formatBytes32String(e))

    addresses = [
        store.address,
        identity.address,
        claimer.address
    ]

    Registry = await ethers.getContractFactory("DeIDRegistry");
    registry = await Registry.deploy(
        bytes32Names,
        addresses
    );
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

      for (let i=0;i< names.length;i++) {
        assert.equal(await registry.registry(bytes32Names[i]), addresses[i])
      }

    });

  })

});
