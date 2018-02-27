var dnode = require('dnode')
var dnodep = require('dnode-promise')

const connection = () => new Promise ((resolve, reject) => {
  const client = dnode.connect(63375)
  client.on('remote', (_methods) => {
    // promisify remote RPC calls
    const remote = dnodep.toPromise(_methods)
    resolve(Object.assign({client}, remote))
  })
  client.on('error', reject)
})

module.exports = connection
