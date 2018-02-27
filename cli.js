#!/usr/bin/env node
const { spawn } = require('child_process')
const EventEmitter = require('events')
const program = require('commander')
const console = require('better-console')
const connection = require('./client/connection')
const exec = require('./lib/exec')
const {WAKETIMER_PORT} = require('./server/config')

// cli program

// kill the listener
program
  .command('kill')
  .action(kill)

program
  .command('run')
  .description('run scripts in response to waketimer events')
  .option('-L, --lockscript <scriptpath>', 'script to run on lock')
  .option('-U, --unlockscript <scriptpath>', 'script to run on unlock')
  .action(run)


program
  .command('get')
  .description('get current lockstate')
  .action(async () => {
    const state = await get()
    console.log(state.state, state.time)
  })

program
  .command('start')
  .description('start waketimer server')
  .action(start)

program.parse(process.argv)

async function run (command) {
  // start the server as a background process if needed
  // this will error and fail to start if the server is already running

  // connect to the server
  const remote = await connection()
  const events = new EventEmitter()

  // set a state variable to hold our current state
  let state = {state: 'unknown', time: 0}

  // register event handlers
  if (command.lockscript) events.on('locked', () => doExec(command.lockscript))
  if (command.unlockscript) events.on('unlocked', () => doExec(command.unlockscript))

  // check state, then keep checking it
  checkState()
  const poll = setInterval(checkState, 2500)

  // spawn will keep our process alive, so we just kill it

  // utilities
  async function checkState () {
    const nextState = await remote.getState()
    if (nextState.state !== state.state) {
      events.emit(nextState.state)
    }
    state = nextState
  }
}

async function get () {
  try {
    const remote = await connection()
    const state = await remote.getState()
    remote.client.end()
    return state
  } catch (err) {
    if (err.code === 'ECONNREFUSED') console.warn(`server not started, run: waketimer start`)
    else throw err
  }
}

async function kill () {
  const killScript = `kill $(lsof -t -i :${WAKETIMER_PORT})`
  try {
    await exec(killScript)
  } catch (err) {
    console.warn(`No waketimer instance running on ${WAKETIMER_PORT}`)
  }
}

function start () {
  console.info('starting waketimer')
  spawn('node', ['./server'], {
    detached: true,
    stdio: 'ignore'
  }).unref()
}

async function connect () {
  try {
    return await connection()
  } catch (err) {

  }
}

async function doExec (script) {
  if (!script) return
  try {
    const res = await exec(script)
    console.log(res) // send result to stdout
  } catch (err) {
    console.error(err)
  }
}
