#!/usr/bin/env node
const fs = require('fs-extra')
const path = require('path')

const ABIs = {
  when: (new Date).toISOString(),
  contracts: {}
}

let names = [
  'TXValidator',
  'DeIDStore',
  'DeIDManager',
  'DeIDClaimer',
  'DeIDRegistry'
]

for (let name of names) {
  let source = path.resolve(__dirname, `../artifacts/contracts/${name}.sol/${name}.json`)
  let json = require(source)
  ABIs.contracts[name] = json.abi
}

fs.writeFileSync(path.resolve(__dirname, '../config/ABIs.json'), JSON.stringify(ABIs, null, 2))
