const ethers = require('ethers')

const utils = {

    alphanumericAlphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-',

    fromAlphanumericStringToIntegerString(str = '') {
        let result = ''
        for (let i = 0; i < str.length; i++) {
            let pos = this.alphanumericAlphabet.indexOf(str[i])
            if (pos === -1) {
                throw new Error('Unsupported char found')
            }
            if (pos < 10) {
                pos = `0${pos}`
            }
            result += pos
        }
        return result.replace(/^0/, '')
    },

    fromIntegerStringToAlphanumericString(str = '') {
        let result = ''
        if (str.length % 2) {
            str = '0' + str
        }
        if (/[^0-9]+/.test(str)) {
            throw new Error('Unsupported digit found')
        }
        for (let i = 0; i < str.length; i += 2) {
            let j = parseInt(str.substring(i, i + 2))
            result += this.alphanumericAlphabet.charAt(j)
        }
        return result
    },

    ECDSASign(ethers, hexPrivateKey, hash) {
        const signingKey = new ethers.utils.SigningKey(hexPrivateKey)
        const signedDigest = signingKey.signDigest(hash)
        return ethers.utils.joinSignature(signedDigest)
    },

    integerStringToBytes32(ethers, integerStr) {
        let hexstr = ethers.BigNumber.from(integerStr).toHexString()
        if (hexstr.length > 66) {
            throw new Error('Number too big')
        } else if (hexstr.length < 66) {
            hexstr = hexstr.substring(2)
            hexstr = '0x' + '0'.repeat(64 - hexstr.length) + hexstr
        }
        return hexstr
    },

    async sleep(millis) {
        return new Promise(resolve => setTimeout(resolve, millis))
    },

    stringToBytes32(str) {
        return ethers.utils.formatBytes32String(str)
    },

    bytes32ToString(bytes32) {
        return ethers.utils.parseBytes32String(bytes32)
    },

    stringToBytes(str) {
        let bytes = []
        for (var i = 0; i < str.length; ++i) {
            let code = str.charCodeAt(i)
            bytes = bytes.concat([code])
        }
        let s = '0x'
        bytes.forEach(function (byte) {
            s += ('0' + (byte & 0xFF).toString(16)).slice(-2)
        })
        return s
    },

    bytesToString(hex) {
        hex = hex.replace(/^0x/, '')
        for (var bytes = [], c = 0; c < hex.length; c += 2)
            bytes.push(parseInt(hex.substr(c, 2), 16))
        return Buffer.from(bytes).toString()
    }

}

module.exports = utils


