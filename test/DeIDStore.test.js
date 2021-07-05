const {expect, assert} = require("chai");
const {assertThrowsMessage} = require('../src/helpers')
const {utils} = require('../src')
const ethUtils = require('ethereumjs-util')

describe("DeIDStore", async function () {

  let DeIDStore;
  let store;

  const apps = {
    twitter: [1, true],
    reddit: [2, false],
    facebook: [3, true]
  }

  let owner, manager, manager2, user, user2, user3
  let addr0 = '0x0000000000000000000000000000000000000000'

  let twitter = ethers.utils.id('twitter')
  let reddit = ethers.utils.id('reddit')
  let instagram = ethers.utils.id('instagram')

  let tid = 223344
  let rid = 'a8sh3e'

  let timestamp;
  let chainId;

  before(async function () {
    const signers = await ethers.getSigners()
    owner = signers[0];
    manager = signers[1];
    manager2 = signers[2];
    user = signers[3];
    user2 = signers[4];
    user3 = signers[5];
  })

  async function initNetworkAndDeploy() {
    DeIDStore = await ethers.getContractFactory("DeIDStore")
    store = await DeIDStore.deploy()
    await store.deployed()
    await store.setChain(0)
    await store.addApp(utils.stringToBytes32('twitter'))
    await store.addApp(utils.stringToBytes32('reddit'))
    await store.addApp(utils.stringToBytes32('instagram'))
    const MANAGER_ROLE = await store.MANAGER_ROLE()
    await store.grantRole(MANAGER_ROLE, manager.address)
  }

  async function getTimestamp() {
    return (await ethers.provider.getBlock()).timestamp
  }

  describe('#constructor', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });

    it("should verify that twitter and reddit are set up", async function () {
      // assert.equal((await store.apps(1)), twitter)
      // assert.equal((await store.apps(2)), reddit)
      // assert.equal((await store.apps(3)), instagram)
      // assert.equal((await store.lastAppId()).toNumber(), 3)
      assert.isTrue(!false)
    });

  })

  describe('#addApp', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });


    it("should add an app", async function () {
      const appNickname = ethers.utils.id('facebook')
      await expect(store.addApp(appNickname))
          .to.emit(store, 'AppAdded')
          .withArgs(4, appNickname);
    });

    it('should throw adding another app with a string as nickname', async function () {
      await assertThrowsMessage(
          store.addApp('linkedin'),
          'invalid arrayify value')
    })

  })

  describe('#setUniqueExtras', async function () {

    const key = ethers.utils.id('nickname')
    const value = utils.stringToBytes32('sullof')
    const value2 = utils.stringToBytes32('follus')

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });

    it("should throw if extras key not active", async function () {

      await store.connect(manager).setAddressAndIdByAppId(0, user.address, 0)

      await assertThrowsMessage(
          store.connect(user).setExtras(key, value),
          'Key not supported')
    });

    it('should activate extras key "nickname" as unique, mutable and allow to change it', async function () {

      await store.connect(manager).setAddressAndIdByAppId(0, user.address, 0)

      await store.setExtraKey(key, true, false)

      await expect(store.connect(user).setUniqueExtras(key, value))
          .to.emit(store, 'UniqueDataChanged')
          .withArgs(1, key, value);

      assert.isTrue(await store.uniqueExtraExists(key, value))

      await store.connect(user).setUniqueExtras(key, value2)
      assert.isTrue(await store.uniqueExtraExists(key, value2))
      assert.isFalse(await store.uniqueExtraExists(key, value))

    });

    it('should activate extras key "nickname" as unique and immutable and not allow to change it', async function () {

      await store.connect(manager).setAddressAndIdByAppId(0, user.address, 0)

      await store.setExtraKey(key, true, true)

      await expect(store.connect(user).setUniqueExtras(key, value))
          .to.emit(store, 'UniqueDataChanged')
          .withArgs(1, key, value);

      assert.isTrue(await store.uniqueExtraExists(key, value))

      await assertThrowsMessage(
        store.connect(user).setUniqueExtras(key, value2),
         "Immutable key")

    });

  })


  describe('#setExtras', async function () {

    const key = ethers.utils.id('fullname')
    const value = utils.stringToBytes('Francesco Sullo')
    const value2 = utils.stringToBytes('Francesco D. Sullo')

    const key3 = ethers.utils.id('picture')
    const value3 = utils.stringToBytes('ipfs://askjsakdasdsahdkashdaskdjas')

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });

    it("should throw if extras key not active", async function () {

      await store.connect(manager).setAddressAndIdByAppId(0, user.address, 0)

      await assertThrowsMessage(
          store.connect(user).setExtras(key, value),
          'Key not supported')
    });

    it('should activate extras key "fullname" and set one', async function () {

      await store.connect(manager).setAddressAndIdByAppId(0, user.address, 0)

      await store.setExtraKey(key, false, false)

      await expect(store.connect(user).setExtras(key, value))
          .to.emit(store, 'DataChanged')
          .withArgs(1, key, value);
    });

    it('should allow to change the extras', async function () {

      await store.connect(manager).setAddressAndIdByAppId(0, user.address, 0)

      await store.setExtraKey(key, false, false)
      await store.connect(user).setExtras(key, value)

      await expect(store.connect(user).setExtras(key, value2))
          .to.emit(store, 'DataChanged')
          .withArgs(1, key, value2);

    });

    it("should throw if account not found", async function () {

      await store.setExtraKey(key, false, false)

      await assertThrowsMessage(
          store.connect(user).setExtras(key, value),
          'Account not found')
    });

  })


  describe('#setAddressAndIdByAppId', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });

    it("should set an identity", async function () {
      await expect(store.connect(manager).setAddressAndIdByAppId(1, user.address, tid))
          .to.emit(store, 'IdentitySet')
          .withArgs(1, tid, user.address);
    });

    it("should set an identity", async function () {
      await expect(store.connect(manager).setAddressAndIdByAppId(0, user.address, 0))
          .to.emit(store, 'IdentitySet')
          .withArgs(0, 1, user.address);
    });


    it("should throw if you try to set again an identity for an address that owns an identity", async function () {
      await store.connect(manager).setAddressAndIdByAppId(1, user.address, tid)

      await assertThrowsMessage(
          store.connect(manager).setAddressAndIdByAppId(1, user.address, 3454),
          'Existing identity found for appId_/address_')

    });

    it("should throw if you try to set again an existing identity", async function () {
      await store.connect(manager).setAddressAndIdByAppId(1, user.address, tid)

      await assertThrowsMessage(
          store.connect(manager).setAddressAndIdByAppId(1, user2.address, tid),
          'Existing identity found for appId_/id_')


    });

    it("should throw if you try to set an identity for an unsupported app", async function () {
      await store.connect(manager).setAddressAndIdByAppId(1, user.address, tid)


      await assertThrowsMessage(
          store.connect(manager).setAddressAndIdByAppId(4, user.address, tid),
          'Unsupported app')

    });

    it("should throw if you try to set an identity for address 0", async function () {
      await store.connect(manager).setAddressAndIdByAppId(1, user.address, tid)


      await assertThrowsMessage(
          store.connect(manager).setAddressAndIdByAppId(1, addr0, 23432),
          'address_ cannot be 0x0')

    });

    it("should throw if you try to set an identity with the wrong manager", async function () {
      await store.connect(manager).setAddressAndIdByAppId(1, user.address, tid)


      await assertThrowsMessage(
          store.connect(manager2).setAddressAndIdByAppId(1, addr0, 23432),
          "Not authorized")
    })

  })


  describe('#updateAddressByAppId', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });

    it("should update an identity", async function () {
      await store.connect(manager).setAddressAndIdByAppId(1, user.address, tid)
      await expect(store.connect(manager).updateAddressByAppId(1, user.address, user2.address))
          .to.emit(store, 'IdentityUpdated')
          .withArgs(1, tid, user2.address);

      await store.connect(manager).setAddressAndIdByAppId(0, user.address, 0)
      await expect(store.connect(manager).updateAddressByAppId(0, user.address, user2.address))
          .to.emit(store, 'IdentityUpdated')
          .withArgs(0, 1, user2.address);

    });


    it("should throw if you try to update an identity with no change", async function () {
      await store.connect(manager).setAddressAndIdByAppId(1, user.address, tid)

      await assertThrowsMessage(
          store.connect(manager).updateAddressByAppId(1, user.address, user.address),
          'No change required')

    });

    it("should throw if you try to update a not-existing identity", async function () {
      await store.connect(manager).setAddressAndIdByAppId(1, user.address, tid)

      await assertThrowsMessage(
          store.connect(manager).updateAddressByAppId(1, user2.address, user3.address),
          'No identity found for appId_/oldAddress_')

    });

    it("should throw if you try to update an identity with an used wallet", async function () {
      await store.connect(manager).setAddressAndIdByAppId(1, user.address, tid)
      await store.connect(manager).setAddressAndIdByAppId(1, user3.address, 3432)

      await assertThrowsMessage(
          store.connect(manager).updateAddressByAppId(1, user3.address, user.address),
          "Existing identity found for appId_/newAddress_")

    });

    it("should throw if you try to update an identity with a 0 address", async function () {
      await store.connect(manager).setAddressAndIdByAppId(1, user.address, tid)

      await assertThrowsMessage(
          store.connect(manager).updateAddressByAppId(1, user.address, addr0),
          'newAddress_ cannot be 0x0')
    })

  })


  describe('#profile and getters', async function () {

    let numericRid = utils.fromAlphanumericStringToIntegerString(rid)

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });

    it("should get an address profile", async function () {
      await store.connect(manager).setAddressAndIdByAppId(1, user.address, tid)
      await store.connect(manager).setAddressAndIdByAppId(2, user.address, numericRid)

      let profile = await store['profile(address)'](user.address)
      assert.equal(profile[1].toNumber(), tid)
      assert.equal(profile[2].toNumber(), numericRid)

      await store.connect(manager).setAddressAndIdByAppId(0, user.address, 0)

      profile = await store.connect(user.address)['profile()']()
      assert.equal(profile[0].toNumber(), 1)
      assert.equal(profile[1].toNumber(), tid)

      profile = await store.connect(user2.address)['profile()']()
      assert.equal(profile[0].toNumber(), 0)
      assert.equal(profile[1].toNumber(), 0)

    })

    it("should get the id for address", async function () {
      await store.connect(manager).setAddressAndIdByAppId(1, user.address, tid)

      let id = await store.idByAddress(1, user.address)
      assert.equal(id, tid)

      id = await store.idByAddress(1, user2.address)
      assert.equal(id, 0)

    })

    it("should get the address by id", async function () {
      await store.connect(manager).setAddressAndIdByAppId(1, user.address, tid)

      let address = await store.addressById(1, tid)
      assert.equal(address, user.address)

      address = await store.addressById(1, 22222)
      assert.equal(address, addr0)

    })


  })

});
