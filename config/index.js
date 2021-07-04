module.exports = {
  decoration: {
    reddit: "u/",
    twitter: "@",
    instagram: "@"
  },
  forPost: {
    twitter: (post) => `https://twitter.com/intent/tweet?text=${escape(post)}&source=webclient`,
    reddit: () => `https://redd.it/8u3ywj`
  },
  account: {
    twitter: 'tweedentity',
    reddit: 'tweedentity',
    instagram: 'tweedentity'
  },
  appId: {
    twitter: 1,
    reddit: 2,
    instagram: 3
  },
  appNickname: {
    1: 'twitter',
    2: 'reddit',
    3: 'instagram'
  },
  profileOnApp: {
    twitter: (username) => `https://twitter.com/${username}`,
    reddit: (username) => `https://www.reddit.com/user/${username}`
  },
  gasLimits: {
    tx: 290e3,
    txUsage: 195e3,
    callback: 180e3
  }
}
