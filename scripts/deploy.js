// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const args = require('../arguments')
const fs = require('fs-extra')
const path = require('path')

const chains = require('../config/chains')
const {getSignature} = require('../src/helpers')
const utils = require('../src/utils')

async function main() {
    // Hardhat always runs the compile task when running scripts with its command
    // line interface.
    //
    // If this script is run directly using `node` you may want to call compile
    // manually to make sure everything is compiled
    // await hre.run('compile');

    const [deployer] = await ethers.getSigners();

    console.log(
        "Deploying contracts with the account:",
        deployer.address
    );

    console.log("Account balance:", (await deployer.getBalance()).toString());

    const res = await deploy(hre.ethers)

    console.log(JSON.stringify(res, null, 2));

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.

async function deploy(ethers) {

    const devMode = process.env.DEPLOY_NETWORK === 'localhost'

    const currentChain = chains[process.env.DEPLOY_NETWORK]

    if (!currentChain) {
        throw new Error('Unsupported chain')
    }

    let [
        validator
    ] = args;

    if (devMode) {
        validator = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8'
    }

    let argumentsDir = path.resolve(__dirname, '../tmp/arguments', process.env.DEPLOY_NETWORK)

    await fs.ensureDir(argumentsDir)

    // const storeAddress = 0x62c6E5fE163aBC080Ae60203952e97D7c37C24b1

    // store
    const DeIDStore = await ethers.getContractFactory("DeIDStore");
    const store = await DeIDStore.deploy(
        currentChain[1]
    );
    await store.deployed();

    const storeAddress = store.address

    await fs.writeFile(
        path.join(argumentsDir, 'DeIDStore.js'),
        `module.exports = [
    '${currentChain[1]}'
]`)

    // claimer
    const DeIDClaimer = await ethers.getContractFactory("DeIDClaimer");
    const claimer = await DeIDClaimer.deploy(
        storeAddress
    );
    await claimer.deployed();

    await fs.writeFile(
        path.join(argumentsDir, 'DeIDClaimer.js'),
        `module.exports = [
    '${storeAddress}'
]`)

    // txValidator
    const TXValidator = await ethers.getContractFactory("TXValidator");
    const txValidator = await TXValidator.deploy();
    await txValidator.deployed();

    await txValidator.addValidator(1, utils.stringToBytes32('0xnil'), validator)
    await txValidator.addValidator(2, utils.stringToBytes32('0xnil'), validator)
    await txValidator.addValidator(3, utils.stringToBytes32('0xnil'), validator)

//     await fs.writeFile(
//         path.join(argumentsDir, 'TXValidator.js'),
//         `module.exports = [
//     '${validator}'
// ]`)

    // identity manager
    const DeIDManager = await ethers.getContractFactory("DeIDManager");
    const manager = await DeIDManager.deploy(
        storeAddress,
        claimer.address,
        txValidator.address
    );

    await fs.writeFile(
        path.join(argumentsDir, 'DeIDManager.js'),
        `module.exports = [
    '${storeAddress}',
    '${claimer.address}',
    '${txValidator.address}'
]`)

    const MANAGER_ROLE = await store.MANAGER_ROLE()
    await store.grantRole(MANAGER_ROLE, manager.address)
    await store.grantRole(MANAGER_ROLE, claimer.address)
    await claimer.grantRole(MANAGER_ROLE, manager.address)

    if (devMode) {
        const timestamp = (await ethers.provider.getBlock()).timestamp - 1
        const tid = 5876772
        const bob = (await ethers.getSigners())[3]
        const signature = await getSignature(ethers, manager, bob.address, 1, tid, timestamp)
        await manager.connect(bob).setIdentity(1, tid, timestamp, signature)
    }

    let names = [
        'TXValidator',
        'DeIDStore',
        'DeIDManager',
        'DeIDClaimer'
    ]
    let bytes32Names = names.map(e => utils.stringToBytes32(e))

    let addresses = [
        txValidator.address,
        storeAddress,
        manager.address,
        claimer.address
    ]

    const Registry = await ethers.getContractFactory("DeIDRegistry");
    const registry = await Registry.deploy();
    await registry.deployed();

    for (let i=0;i< names.length;i++) {
        await registry.setData(bytes32Names[i], addresses[i])
    }


    let res = {
        TxValidator: txValidator.address,
        DeIDStore: storeAddress,
        DeIDManager: manager.address,
        DeIDClaimer: claimer.address,
        DeIDRegistry: registry.address
    }

    const deployedJson = require('../config/deployed.json')
    let currentJson = deployedJson.DeIDRegistry[currentChain[0]]
    deployedJson.DeIDRegistry[currentChain[0]] = {
        address: registry.address,
        when: (new Date).toISOString()
    }
    if (currentJson) {
        let old = {}
        old[currentChain[0]] = currentJson
        deployedJson.DeIDRegistry.previousVersions.push(old)
    }

    fs.writeFileSync(path.resolve(__dirname, '../config/deployed.json'), JSON.stringify(deployedJson, null, 2))

    return res

}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

