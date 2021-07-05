#!/usr/bin/env bash
# must be run from the root

npx hardhat verify --show-stack-traces --network $1 $2
npx hardhat verify --show-stack-traces --network $1 $3
npx hardhat verify --show-stack-traces --network $1 $4
npx hardhat verify --show-stack-traces --network $1 $5
npx hardhat verify --show-stack-traces --network $1 $6
