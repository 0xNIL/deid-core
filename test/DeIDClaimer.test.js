const {expect, assert} = require("chai");
const {assertThrowsMessage} = require('../src/helpers')
const {utils} = require('../src')

describe("DeIDClaimer", async function () {

  let DeIDStore
  let store
  let DeIDClaimer
  let claimer

  const apps = {
    twitter: [1, true],
    reddit: [2, false],
    facebook: [3, true]
  }

  let owner, manager, user, user2, user3, user4, user5
  let addr0 = '0x0000000000000000000000000000000000000000'

  let twitter = ethers.utils.formatBytes32String('twitter')
  let reddit = ethers.utils.formatBytes32String('reddit')

  let tid = 223344
  let rid = 'a8sh3e'

  let timestamp;
  let chainId;

  before(async function () {
    const signers = await ethers.getSigners()
    owner = signers[0];
    manager = signers[1];
    user = signers[3];
    user2 = signers[4];
    user3 = signers[5];
    user4 = signers[6]
    user5 = signers[7]
  })

  async function initNetworkAndDeploy() {
    DeIDStore = await ethers.getContractFactory("DeIDStore");
    store = await DeIDStore.deploy(0);
    await store.deployed();
    DeIDClaimer = await ethers.getContractFactory("DeIDClaimer");
    claimer = await DeIDClaimer.deploy(store.address);
    await claimer.deployed();
    const MANAGER_ROLE = await store.MANAGER_ROLE()
    await store.grantRole(MANAGER_ROLE, manager.address)
    await claimer.grantRole(MANAGER_ROLE, manager.address)
  }

  async function getTimestamp() {
    return (await ethers.provider.getBlock()).timestamp
  }

  //

  describe('#constructor', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });

    it("should verify that the claimer can manage the store", async function () {
      assert.equal(await claimer.storeSet(), true)
    });

  })

  describe('#setClaim and cancelActiveClaim', async function () {


    beforeEach(async function () {
      await initNetworkAndDeploy();
    });


    it("should set a claim", async function () {
      await store.connect(manager).setAddressAndIdByAppId(1, user.address, tid)
      await expect(claimer.connect(manager).setClaim(1, tid, user2.address))
          .to.emit(claimer, 'ClaimStarted')
          .withArgs(1, tid, user2.address)

      assert.equal(await claimer.claimByAddress(1, user2.address), tid)
    });

    it("should set a claim", async function () {
      await store.connect(manager).setAddressAndIdByAppId(1, user.address, tid)
      await claimer.connect(manager).setClaim(1, tid, user2.address)
      await expect(claimer.connect(user2).cancelActiveClaim(1))
          .to.emit(claimer, 'ClaimCanceled')
          .withArgs(1, tid, user2.address)
    });


    it("should throw if you try to set a claim with wrong manager", async function () {
      await store.connect(manager).setAddressAndIdByAppId(1, user.address, tid)

      await assertThrowsMessage(
          claimer.connect(user4).setClaim(1, tid, user2.address),
          "Not authorized")

    });


    it("should throw if you try to set a claim with 0x0", async function () {
      await store.connect(manager).setAddressAndIdByAppId(1, user.address, tid)

      await assertThrowsMessage(
          claimer.connect(manager).setClaim(1, tid, addr0),
          'claimer_ cannot be 0x0')

    });


    it("should throw if you try to set a not existing claim", async function () {
      await store.connect(manager).setAddressAndIdByAppId(1, user.address, tid)

      let tid2 = 34323

      await assertThrowsMessage(
          claimer.connect(manager).setClaim(1, tid2, user2.address),
          'Claimed identity not found')

    });


    it("should throw if you try to set a claim if owns identity", async function () {
      await store.connect(manager).setAddressAndIdByAppId(1, user.address, tid)

      let tid2 = 34323
      await store.connect(manager).setAddressAndIdByAppId(1, user3.address, tid2)

      await assertThrowsMessage(
          claimer.connect(manager).setClaim(1, tid, user3.address),
          'Claimer owns some identity')

    });


    it("should throw if you try to set a claim if an active claim exists", async function () {
      await store.connect(manager).setAddressAndIdByAppId(1, user.address, tid)

      await claimer.connect(manager).setClaim(1, tid, user4.address)

      await assertThrowsMessage(
          claimer.connect(manager).setClaim(1, tid, user5.address),
          'Active claim found for identity')

    });


    it("should throw if you try to set a claim with wrong params", async function () {
      await store.connect(manager).setAddressAndIdByAppId(1, user.address, tid)
      let tid2 = 34323
      await store.connect(manager).setAddressAndIdByAppId(1, user3.address, tid2)
      await claimer.connect(manager).setClaim(1, tid2, user4.address)

      await assertThrowsMessage(
          claimer.connect(manager).setClaim(1, tid, user4.address),
          'Active claim found for claimer')

    })

  })


});
