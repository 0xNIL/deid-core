const {expect, assert} = require("chai");
const {assertThrowsMessage} = require('../src/helpers')
const {utils} = require('../src')

describe.skip("Tmp", async function () {

  let Tmp;
  let tmp;

  let owner, manager, user

  const id = (v) => ethers.utils.id(v)

  before(async function () {
    const signers = await ethers.getSigners()
    owner = signers[0];
    manager = signers[1];
    user = signers[2]
  })

  async function initNetworkAndDeploy() {
    Tmp = await ethers.getContractFactory("Tmp");
    tmp = await Tmp.deploy();
    await tmp.deployed();
  }


  describe('#testing gas consumption', async function () {

    beforeEach(async function () {
      await initNetworkAndDeploy();
    });

    it("should set to false", async function () {
      await tmp.set(id('12'), id('sadasda'))
      await tmp.setToFalse(id('12'), id('sadasda'))
    });

    it("should delete", async function () {
      await tmp.set(id('12'), id('sadasda'))
      await tmp.deleteBool(id('12'), id('sadasda'))
    });

  })

});
