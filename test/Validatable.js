const {expect, assert} = require("chai");
const {assertThrowsMessage} = require('../src/helpers')
const {utils} = require('../src')

describe("Validatable", async function () {

  let Validatable
  let validatable

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
  })

  async function initNetworkAndDeploy() {
    Validatable = await ethers.getContractFactory("Validatable");
    validatable = await Validatable.deploy();
    await validatable.addValidator(1, twitterValidatorName, twitterValidator.address);
    await validatable.deployed();
  }

  describe('#constructor', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });

    it("should verify that the validator for groupId 1 is correctly set", async function () {
      assert.isTrue(await validatable.isValidatorForGroup(1, twitterValidator.address))
    });

  })

  describe('#addValidator', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });

    it("should add an validator", async function () {
      await expect(validatable.addValidator(2, instagramValidatorName, instagramValidator.address))
          .to.emit(validatable, 'ValidatorAdded')
          .withArgs(2, instagramValidator.address);
      assert.isTrue(await validatable.isValidatorForGroup(2, instagramValidator.address))
    });

    it('should throw if not called by owner', async function () {

      await assertThrowsMessage(
          validatable.connect(twitterValidator).addValidator(3, utils.stringToBytes32('some'), someOtherValidator.address),
          'caller is not the owner')
    })

    it('should throw if address(0)', async function () {

      await assertThrowsMessage(
          validatable.addValidator(2, utils.stringToBytes32('some'), addr0),
          'Validator can not be 0x0')
    })

    it('should throw if validator already set', async function () {

      await assertThrowsMessage(
          validatable.addValidator(1, twitterValidatorName, twitterValidator.address),
          'Validator already set')
    })

  })

  describe('#removeValidator', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });

    it("should remove an validator", async function () {
      await validatable.addValidator(2, instagramValidatorName, instagramValidator.address)
      await expect(validatable.removeValidator(1, twitterValidator.address))
          .to.emit(validatable, 'ValidatorRemoved')
          .withArgs(1, twitterValidator.address);
      assert.isTrue(await validatable.isValidatorForGroup(2, instagramValidator.address))
      assert.isFalse(await validatable.isValidatorForGroup(1, twitterValidator.address))
    });

    it('should throw if not called by owner', async function () {

      await assertThrowsMessage(
          validatable.connect(twitterValidator).removeValidator(1, twitterValidator.address),
          'caller is not the owner')
    })

    it('should throw if validator does not exist', async function () {

      await assertThrowsMessage(
          validatable.removeValidator(2, instagramValidator.address),
          'Validator not found')
    })

  })

  describe('#updateValidator', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });

    it("should update an validator", async function () {
      await expect(validatable.updateValidator(1, twitterValidator.address, someOtherValidator.address))
          .to.emit(validatable, 'ValidatorRemoved')
          .withArgs(1, twitterValidator.address)
          .to.emit(validatable, 'ValidatorAdded')
          .withArgs(1, someOtherValidator.address);
      assert.isTrue(await validatable.isValidatorForGroup(1, someOtherValidator.address))
      assert.isFalse(await validatable.isValidatorForGroup(1, twitterValidator.address))
    });

    it('should throw if not called by owner', async function () {

      await assertThrowsMessage(
          validatable.connect(twitterValidator).updateValidator(1, twitterValidator.address, someOtherValidator.address),
          'caller is not the owner')
    })

    it('should throw if new validator is 0x0', async function () {

      await assertThrowsMessage(
          validatable.updateValidator(1, twitterValidator.address, addr0),
          'New validator can not be 0x0')
    })

    it('should throw if new validator is equal to old validator', async function () {

      await assertThrowsMessage(
          validatable.updateValidator(1, twitterValidator.address, twitterValidator.address),
          'No changes')
    })

    it('should throw if updating a not existing validator', async function () {

      await assertThrowsMessage(
          validatable.updateValidator(2, instagramValidator.address, someOtherValidator.address),
          'Validator not found')
    })

    it('should throw if updating an validator with another existing validator', async function () {
      await validatable.addValidator(1, utils.stringToBytes32('some'), someOtherValidator.address)
      await assertThrowsMessage(
          validatable.updateValidator(1, twitterValidator.address, someOtherValidator.address),
          'New validator already set')
    })

  })

});
