var dnode = require('dnode')
var dnodep = require('dnode-promise')
const {WAKETIMER_PORT} = require('../server/config')


const connection = () => new Promise ((resolve, reject) => {
  const client = dnode.connect(WAKETIMER_PORT)
  client.on('remote', (_methods) => {
    // promisify remote RPC calls
    const remote = dnodep.toPromise(_methods)
    resolve(Object.assign({client}, remote))
  })
  client.on('error', reject)
})

module.exports = connection
