const LockState = require('./LockState')
const dnode = require('dnode')
const dnodep = require('dnode-promise')
const {WAKETIMER_PORT} = require('./config')


const lockState = new LockState()
lockState.start()

var server = dnode(dnodep.toDnode({
  getState: () => lockState.get(),
}))

server.listen(WAKETIMER_PORT, () => console.info('waketimer server running'))

module.exports = server
