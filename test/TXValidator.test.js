const {expect, assert} = require("chai");
const {assertThrowsMessage} = require('../src/helpers')
const {utils} = require('../src')

describe("TXValidator", async function () {

  let TXValidator
  let txValidator

  let addr0 = '0x0000000000000000000000000000000000000000'
  let owner, twitterValidator, instagramValidator, someOtherValidator
  let twitterValidatorName = utils.stringToBytes32('twitter')
  let instagramValidatorName = utils.stringToBytes32('instagram')

  before(async function () {
    const signers = await ethers.getSigners()
    owner = signers[0];
    twitterValidator = signers[1];
    instagramValidator = signers[2];
    someOtherValidator = signers[3];
    defaultValidator = signers[4];
  })

  async function initNetworkAndDeploy() {
    TXValidator = await ethers.getContractFactory("TXValidator");
    txValidator = await TXValidator.deploy(defaultValidator.address);
    await txValidator.addValidator(1, twitterValidatorName, twitterValidator.address);
    await txValidator.deployed();
  }

  describe('#constructor', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });

    it("should verify that the validator for groupId 1 is correctly set", async function () {
      assert.isTrue(await txValidator.isValidatorForGroup(1, twitterValidator.address))
    });

  })

  describe('#addValidator', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });

    it("should add an validator", async function () {
      await expect(txValidator.addValidator(2, instagramValidatorName, instagramValidator.address))
          .to.emit(txValidator, 'ValidatorAdded')
          .withArgs(2, instagramValidator.address);
      assert.isTrue(await txValidator.isValidatorForGroup(2, instagramValidator.address))
    });

    it('should throw if not called by owner', async function () {

      await assertThrowsMessage(
          txValidator.connect(twitterValidator).addValidator(3, utils.stringToBytes32('some'), someOtherValidator.address),
          'caller is not the owner')
    })

    it('should throw if address(0)', async function () {

      await assertThrowsMessage(
          txValidator.addValidator(2, utils.stringToBytes32('some'), addr0),
          'Validator can not be 0x0')
    })

    it('should throw if validator already set', async function () {

      await assertThrowsMessage(
          txValidator.addValidator(1, twitterValidatorName, twitterValidator.address),
          'Validator already set')
    })

  })

  describe('#removeValidator', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });

    it("should remove an validator", async function () {
      await txValidator.addValidator(2, instagramValidatorName, instagramValidator.address)
      await expect(txValidator.removeValidator(1, twitterValidator.address))
          .to.emit(txValidator, 'ValidatorRemoved')
          .withArgs(1, twitterValidator.address);
      assert.isTrue(await txValidator.isValidatorForGroup(2, instagramValidator.address))
      assert.isFalse(await txValidator.isValidatorForGroup(1, twitterValidator.address))
    });

    it('should throw if not called by owner', async function () {

      await assertThrowsMessage(
          txValidator.connect(twitterValidator).removeValidator(1, twitterValidator.address),
          'caller is not the owner')
    })

    it('should throw if validator does not exist', async function () {

      await assertThrowsMessage(
          txValidator.removeValidator(2, instagramValidator.address),
          'Validator not found')
    })

  })

  describe('#updateValidator', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });

    it("should update an validator", async function () {
      await expect(txValidator.updateValidator(1, twitterValidator.address, someOtherValidator.address))
          .to.emit(txValidator, 'ValidatorRemoved')
          .withArgs(1, twitterValidator.address)
          .to.emit(txValidator, 'ValidatorAdded')
          .withArgs(1, someOtherValidator.address);
      assert.isTrue(await txValidator.isValidatorForGroup(1, someOtherValidator.address))
      assert.isFalse(await txValidator.isValidatorForGroup(1, twitterValidator.address))
    });

    it('should throw if not called by owner', async function () {

      await assertThrowsMessage(
          txValidator.connect(twitterValidator).updateValidator(1, twitterValidator.address, someOtherValidator.address),
          'caller is not the owner')
    })

    it('should throw if new validator is 0x0', async function () {

      await assertThrowsMessage(
          txValidator.updateValidator(1, twitterValidator.address, addr0),
          'New validator can not be 0x0')
    })

    it('should throw if new validator is equal to old validator', async function () {

      await assertThrowsMessage(
          txValidator.updateValidator(1, twitterValidator.address, twitterValidator.address),
          'No changes')
    })

    it('should throw if updating a not existing validator', async function () {

      await assertThrowsMessage(
          txValidator.updateValidator(2, instagramValidator.address, someOtherValidator.address),
          'Validator not found')
    })

    it('should throw if updating an validator with another existing validator', async function () {
      await txValidator.addValidator(1, utils.stringToBytes32('some'), someOtherValidator.address)
      await assertThrowsMessage(
          txValidator.updateValidator(1, twitterValidator.address, someOtherValidator.address),
          'New validator already set')
    })

  })

});
