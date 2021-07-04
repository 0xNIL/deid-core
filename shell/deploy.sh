#!/usr/bin/env bash
# must be run from the root

export DEPLOY_NETWORK=$1
npx hardhat run scripts/deploy.js --network $1
