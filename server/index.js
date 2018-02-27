const LockState = require('./LockState')
const dnode = require('dnode')
const dnodep = require('dnode-promise')

const lockState = new LockState()
lockState.start()

var server = dnode(dnodep.toDnode({
  getState: () => lockState.get(),
}))

server.listen(63375, () => console.info('waketimer server running'))

module.exports = server
