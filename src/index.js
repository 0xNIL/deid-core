module.exports = {
  utils: require('./utils'),
  chains: require('../config/chains'),
  ABIs: require('../config/ABIs.json'),
  deployed: require('../config/deployed.json'),
  version: require('../package.json').version,
  helpers: require('./helpers')
}
