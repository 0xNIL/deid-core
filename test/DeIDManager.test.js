const {expect, assert} = require("chai");
const {assertThrowsMessage, getSignature} = require('../src/helpers')
const {utils} = require('../src')

describe("DeIDManager", async function () {

  let DeIDStore
  let store
  let DeIDClaimer
  let claimer
  let TXValidator
  let txValidator
  let DeIDManager
  let identity

  const apps = {
    twitter: [1, true],
    reddit: [2, false],
    facebook: [3, true]
  }

  let owner, validator, org, bob, alice, mark, joe, bill, wikileaks, assange
  let signature
  let tid = '273645362718263746'
  let addr0 = '0x0000000000000000000000000000000000000000'

  const rid = 'fxP8r3'
  let timestamp;
  let chainId;

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
    await initNetworkAndDeploy()
    chainId = await txValidator.getChainId()
  })

  async function initNetworkAndDeploy() {
    DeIDStore = await ethers.getContractFactory("DeIDStore");
    store = await DeIDStore.deploy(0);
    await store.deployed();
    DeIDClaimer = await ethers.getContractFactory("DeIDClaimer");
    claimer = await DeIDClaimer.deploy(store.address);
    await claimer.deployed();
    TXValidator = await ethers.getContractFactory("TXValidator");
    txValidator = await TXValidator.deploy(validator.address);
    await txValidator.deployed();
    await txValidator.addValidator(1, utils.stringToBytes32('tweedentityV2'), validator.address)
    DeIDManager = await ethers.getContractFactory("DeIDManager");
    identity = await DeIDManager.deploy(store.address, claimer.address, txValidator.address);
    await identity.deployed();
    const MANAGER_ROLE = await store.MANAGER_ROLE()
    await store.grantRole(MANAGER_ROLE, identity.address)
    await store.grantRole(MANAGER_ROLE, claimer.address)
    await claimer.grantRole(MANAGER_ROLE, identity.address)
  }

  async function getTimestamp() {
    return (await ethers.provider.getBlock()).timestamp
  }

  //

  describe('#constructor', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });

    it("should verify that the manager can manage store and claimer", async function () {
      // assert.equal(await store.managers(identity.address), true)
      // assert.equal(await claimer.managers(identity.address), true)
      assert.equal(await identity.storeSet(), true)
      assert.equal(await identity.claimerSet(), true)
    });

  })

  describe('#setIdentity', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });


    it("should set up a default identity", async function () {

      await expect(identity.connect(bob).setMyIdentity())
          .to.emit(store, 'IdentitySet')
          .withArgs(0, 1, bob.address);

      await assertThrowsMessage(
          identity.connect(bob).setMyIdentity(),
          'Existing identity found for appId_/address_')

    });

    it("should set up a twitter identity", async function () {

      timestamp = await getTimestamp()
      tid = 637800044

      signature = await getSignature(ethers, identity, bob.address, 1, tid, timestamp)
      await expect(identity.connect(bob).setIdentity(1, tid, timestamp, signature))
          .to.emit(store, 'IdentitySet')
          .withArgs(1, tid, bob.address);

      assert.equal(await store.addressById(1, tid), bob.address)
      assert.equal(await store.idByAddress(1, bob.address), tid)
    });

    it("should set up a reddit identity", async function () {

      let numericRid = utils.fromAlphanumericStringToIntegerString(rid)
      timestamp = await getTimestamp()

      signature = getSignature(ethers, identity, bob.address, 2, numericRid, timestamp)
      await expect(identity.connect(bob).setIdentity(2, numericRid, timestamp, signature))
          .to.emit(store, 'IdentitySet')
          .withArgs(2, numericRid, bob.address);
    });


    it("should set up a twitter and a reddit identity", async function () {

      let numericRid = utils.fromAlphanumericStringToIntegerString('1nihr8b3')
      timestamp = await getTimestamp()

      signature = getSignature(ethers, identity, bob.address, 1, tid, timestamp)
      let signature2 = getSignature(ethers, identity, bob.address, 2, numericRid, timestamp)

      await expect(identity.connect(bob).setMultipleIdentities([1, 2], [tid, numericRid], timestamp, [signature, signature2]))
          .to.emit(store, 'IdentitySet')
          .withArgs(1, tid, bob.address)
          .to.emit(store, 'IdentitySet')
          .withArgs(2, numericRid, bob.address);
    });

    it("should set up a twitter and a primary identity", async function () {

      let numericRid = utils.fromAlphanumericStringToIntegerString('1nihr8b3')
      timestamp = await getTimestamp()

      signature = getSignature(ethers, identity, bob.address, 1, tid, timestamp)

      await expect(identity.connect(bob).setMultipleIdentities([1, 0], [tid, 0], timestamp, [signature, 0x0]))
          .to.emit(store, 'IdentitySet')
          .withArgs(1, tid, bob.address)
          .to.emit(store, 'IdentitySet')
          .withArgs(0, 1, bob.address);
    });

    it('should throw if app not supported', async function () {

      tid = 54433433
      timestamp = await getTimestamp()
      signature = getSignature(ethers, identity, bob.address, 6, tid, timestamp)

      await assertThrowsMessage(
          identity.connect(bob).setIdentity(6, tid, timestamp, signature),
          'Unsupported app')
    })

    it('should throw if already set', async function () {

      tid = '342343543456545676'
      timestamp = await getTimestamp()
      signature = getSignature(ethers, identity, bob.address, 1, tid, timestamp)

      await identity.connect(bob).setIdentity(1, tid, timestamp, signature)

      await assertThrowsMessage(
          identity.connect(bob).setIdentity(1, tid, timestamp, signature),
          'Existing identity found for appId_/address_')

      timestamp = await getTimestamp()
      signature = getSignature(ethers, identity, bob.address, 1, 87676, timestamp)

      await assertThrowsMessage(
          identity.connect(bob).setIdentity(1, 87676, timestamp, signature),
          'Existing identity found for appId_/address_')

      timestamp = await getTimestamp()
      signature = getSignature(ethers, identity, alice.address, 1, tid, timestamp)

      await assertThrowsMessage(
          identity.connect(alice).setIdentity(1, tid, timestamp, signature),
          'Existing identity found for appId_/id_')
    })

    it('should throw if the signature is expired', async function () {

      timestamp = (await getTimestamp() - 100)
      signature = getSignature(ethers, identity, alice.address, 1, tid, timestamp)

      await txValidator.updateTimestampValidFor(1, 5);

      await assertThrowsMessage(
          identity.connect(alice).setIdentity(1, tid, timestamp, signature),
          'Signature expired')
    })

  })

  describe('#updateIdentity', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });

    it("should update an identity", async function () {

      tid = 98786376453

      timestamp = await getTimestamp()
      signature = getSignature(ethers, identity, bob.address, 1, tid, timestamp)

      await identity.connect(bob).setIdentity(1, tid, timestamp, signature)

      await expect(identity.connect(bob).updateIdentity(1, alice.address))
          .to.emit(store, 'IdentityUpdated')
          .withArgs(1, tid, alice.address);
    });

    it('should throw if not already set', async function () {

      await assertThrowsMessage(
          identity.connect(mark).updateIdentity(1, joe.address),
          'No identity found for appId_/oldAddress_')
    })

    it('should throw if trying to update with an address that already owns an id', async function () {

      timestamp = await getTimestamp()

      signature = getSignature(ethers, identity, bob.address, 1, tid, timestamp)
      await identity.connect(bob).setIdentity(1, tid, timestamp, signature)

      timestamp = await getTimestamp()

      signature = getSignature(ethers, identity, alice.address, 1, 123, timestamp)
      await identity.connect(alice).setIdentity(1, 123, timestamp, signature)

      await assertThrowsMessage(
          identity.connect(bob).updateIdentity(1, alice.address),
          'Existing identity found for appId_/newAddress_')
    })

  })

  describe('#claimIdentity', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();
      await identity.deployed();
    });

    tid = '203434323454345676'

    it("should claim an identity", async function () {

      timestamp = await getTimestamp()
      signature = getSignature(ethers, identity, bob.address, 1, tid, timestamp)

      await identity.connect(bob).setIdentity(1, tid, timestamp, signature)

      timestamp = await getTimestamp()
      signature = getSignature(ethers, identity, alice.address, 1, tid, timestamp)

      await expect(identity.connect(alice).claimIdentity(1, tid, timestamp, signature))
          .to.emit(claimer, 'ClaimStarted')
          .withArgs(1, tid, alice.address);
    });

    it('should throw if identity does not exist', async function () {

      timestamp = await getTimestamp()
      signature = getSignature(ethers, identity, alice.address, 1, tid, timestamp)

      await assertThrowsMessage(
          identity.connect(alice).claimIdentity(1, tid, timestamp, signature),
          'Claimed identity not found')
    })


    it('should throw if claimer already has an identity', async function () {

      timestamp = await getTimestamp()
      signature = getSignature(ethers, identity, bob.address, 1, tid, timestamp)

      await identity.connect(bob).setIdentity(1, tid, timestamp, signature)

      let tid2 = '83746453635262'

      timestamp = await getTimestamp()
      signature = getSignature(ethers, identity, alice.address, 1, tid2, timestamp)

      await identity.connect(alice).setIdentity(1, tid2, timestamp, signature)

      timestamp = await getTimestamp()
      signature = getSignature(ethers, identity, alice.address, 1, tid, timestamp)

      await assertThrowsMessage(
          identity.connect(alice).claimIdentity(1, tid, timestamp, signature),
          'Claimer owns some identity')
    })

    it('should throw if joe claims an identity already claimed by alice', async function () {

      timestamp = await getTimestamp()
      signature = getSignature(ethers, identity, bob.address, 1, tid, timestamp)

      await identity.connect(bob).setIdentity(1, tid, timestamp, signature)

      timestamp = await getTimestamp()
      signature = getSignature(ethers, identity, alice.address, 1, tid, timestamp)

      await identity.connect(alice).claimIdentity(1, tid, timestamp, signature)

      timestamp = await getTimestamp()
      signature = getSignature(ethers, identity, joe.address, 1, tid, timestamp)

      await assertThrowsMessage(
          identity.connect(joe).claimIdentity(1, tid, timestamp, signature),
          'Active claim found for identity')
    })

    it("should cancel a claim", async function () {

      timestamp = await getTimestamp()
      signature = getSignature(ethers, identity, bob.address, 1, tid, timestamp)

      await identity.connect(bob).setIdentity(1, tid, timestamp, signature)

      timestamp = await getTimestamp()
      signature = getSignature(ethers, identity, alice.address, 1, tid, timestamp)

      await identity.connect(alice).claimIdentity(1, tid, timestamp, signature)

      await expect(claimer.connect(alice).cancelActiveClaim(1))
          .to.emit(claimer, 'ClaimCanceled')
          .withArgs(1, tid, alice.address);
    });

    it("should claim an identity and try to get it too early", async function () {

      timestamp = await getTimestamp()
      signature = getSignature(ethers, identity, bob.address, 1, tid, timestamp)

      await identity.connect(bob).setIdentity(1, tid, timestamp, signature)

      timestamp = await getTimestamp()
      signature = getSignature(ethers, identity, joe.address, 1, tid, timestamp)

      await identity.connect(joe).claimIdentity(1, tid, timestamp, signature)

      await assertThrowsMessage(
          identity.connect(joe).updateClaimedIdentity(1, tid, timestamp, signature),
          'Probation time not passed yet')

    });

    it("should claim an identity and try to get it too late", async function () {

      timestamp = await getTimestamp()
      signature = getSignature(ethers, identity, bob.address, 1, tid, timestamp)

      await identity.connect(bob).setIdentity(1, tid, timestamp, signature)

      timestamp = await getTimestamp()
      signature = getSignature(ethers, identity, joe.address, 1, tid, timestamp)

      await identity.connect(joe).claimIdentity(1, tid, timestamp, signature)

      await claimer.updateProbationTimes(2, 1)
      await utils.sleep(5000)

      await assertThrowsMessage(
          identity.connect(joe).updateClaimedIdentity(1, tid, timestamp, signature),
          'Claim is expired')

    });


    it("should claim an identity and get it", async function () {

      timestamp = await getTimestamp()
      signature = getSignature(ethers, identity, bob.address, 1, tid, timestamp)
      await identity.connect(bob).setIdentity(1, tid, timestamp, signature)

      timestamp = await getTimestamp()
      signature = getSignature(ethers, identity, joe.address, 1, tid, timestamp)

      await identity.connect(joe).claimIdentity(1, tid, timestamp, signature)

      await claimer.updateProbationTimes(2, 10)
      await utils.sleep(5000)

      timestamp = await getTimestamp()
      signature = getSignature(ethers, identity, joe.address, 1, tid, timestamp)

      await expect(identity.connect(joe).updateClaimedIdentity(1, tid, timestamp, signature))
          .to.emit(store, 'IdentityUpdated')
          .withArgs(1, tid, joe.address);

    });

  })

});
