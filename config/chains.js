const chains = {

  // [chainId, progressiveChainId, active]

  // dev
  hardhat: [31337, 0, true],
  localhost: [1337, 0, true],

  // test
  ropsten: [3, 0, false],
  goerli: [5, 0, false],
  bsc_testnet: [97, 0, false],
  mumbai: [80001, 0, false],

  // prod
  matic: [137, 1, false],
  bsc_mainnet: [56, 2, false],
  ethereum: [1, 3, false],

  // future
  avalance: [43114, 7, false],
  fuji: [43113, 8, false]
}

module.exports = chains


