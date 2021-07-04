const chai = require('chai')
const assert = chai.assert
const utils = require('../src/utils')

describe('#utils', function () {


  describe('fromAlphanumericStringToIntegerString', async function () {

    it('should convert a string id to a numeric id', async function () {
      assert.equal(utils.fromAlphanumericStringToIntegerString('a8y-3i_'), '26605063553462')
    })

    it('should throw if the string has out of range chars', function () {
      try {
        utils.fromAlphanumericStringToIntegerString('ax2B2_&')
        assert.isFalse(true)
      } catch (e) {
        assert.equal(e.message, 'Unsupported char found')
      }
    })

   })
  describe('fromIntegerStringToAlphanumericString', async function () {

    it('should convert a string id to a numeric id', async function () {
      let int = utils.fromAlphanumericStringToIntegerString('a8y-3i_')
      assert.equal(utils.fromIntegerStringToAlphanumericString(int), 'a8y-3i_')
    })

    it('should throw if the string has unsupported chars', function () {
      try {
        utils.fromIntegerStringToAlphanumericString('182737t63')
        assert.isFalse(true)
      } catch (e) {
        assert.equal(e.message, 'Unsupported digit found')
      }
    })

  })

  describe('stringToBytes32', async function () {

    it('should convert a string to a bytes32', async function () {

      let twitter = '0x7477697474657200000000000000000000000000000000000000000000000000'

      assert.equal(utils.stringToBytes32('twitter'), twitter)
    })

  })

  describe('bytes32ToString', async function () {

    it('should convert an hexstring to a string', async function () {

      assert.equal(utils.bytes32ToString('0x7477697474657200000000000000000000000000000000000000000000000000'), 'twitter')
    })

  })

  describe('stringToBytes', async function () {


    let description = 'Artist with a tendency to build disastrous scupltures'

    it('should convert a string to a bytes', async function () {

      assert.equal(
          utils.stringToBytes(description),
          '0x417274697374207769746820612074656e64656e637920746f206275696c6420646973617374726f757320736375706c7475726573'
      )

    })

    it('should convert an hexstring to a string', async function () {

      assert.equal(
          utils.bytesToString('0x417274697374207769746820612074656e64656e637920746f206275696c6420646973617374726f757320736375706c7475726573'), description)

    })

  })

})
