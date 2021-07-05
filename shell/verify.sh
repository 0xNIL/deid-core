#!/usr/bin/env bash
# must be run from the root

npx hardhat verify --show-stack-traces --network $1 $2
npx hardhat verify --show-stack-traces --network $1 --constructor-args tmp/arguments/$1/DeIDStore.js $3
npx hardhat verify --show-stack-traces --network $1 --constructor-args tmp/arguments/$1/DeIDManager.js $4
npx hardhat verify --show-stack-traces --network $1 --constructor-args tmp/arguments/$1/DeIDClaimer.js $5
npx hardhat verify --show-stack-traces --network $1 $6
