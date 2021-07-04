// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const args = require('../arguments')
const fs = require('fs-extra')
const path = require('path')

const {chains, utils} = require('../src')
const {getSignature} = require('../src/helpers')

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

    // store
    const DeIDStore = await ethers.getContractFactory("DeIDStore");
    const tweedentities = await DeIDStore.deploy(
        currentChain[1]
    );
    await tweedentities.deployed();

    // claimer
    const DeIDClaimer = await ethers.getContractFactory("DeIDClaimer");
    const tweedentityClaimer = await DeIDClaimer.deploy(
        tweedentities.address
    );
    await tweedentityClaimer.deployed();

    // identity manager
    const DeIDManager = await ethers.getContractFactory("DeIDManager");
    const tweedentityManager = await DeIDManager.deploy(
        tweedentities.address,
        tweedentityClaimer.address
            [1, 2, 3],
        [validator, validator, validator]
    );

    const MANAGER_ROLE = await tweedentities.MANAGER_ROLE()
    await tweedentities.grantRole(MANAGER_ROLE, tweedentityManager.address)
    await tweedentities.grantRole(MANAGER_ROLE, tweedentityClaimer.address)
    await tweedentityClaimer.grantRole(MANAGER_ROLE, tweedentityManager.address)

    if (devMode) {
        const timestamp = (await ethers.provider.getBlock()).timestamp - 1
        const tid = 5876772
        const bob = (await ethers.getSigners())[3]
        const signature = await getSignature(ethers, tweedentityManager, bob.address, 1, tid, timestamp)
        await tweedentityManager.connect(bob).setIdentity(1, tid, timestamp, signature)
    }

    let names = [
        'DeIDStore',
        'DeIDManager',
        'DeIDClaimer'
    ]
    let bytes32Names = names.map(e => ethers.utils.formatBytes32String(e))

    let addresses = [
        tweedentities.address,
        tweedentityManager.address,
        tweedentityClaimer.address
    ]

    const Registry = await ethers.getContractFactory("DeIDRegistry");
    const registry = await Registry.deploy(
        bytes32Names,
        addresses
    );
    await registry.deployed();

    let res = {
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

