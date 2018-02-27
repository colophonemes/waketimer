const connection = require('./connection')
// IIFE wrapper
async function getWaketimerState () {
  const remote = await connection()
  const state = await remote.getState()
  remote.client.end()
  return state
}

module.exports = getWaketimerState
