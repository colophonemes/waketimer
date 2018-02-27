const exec = require('../lib/exec')
const console = require('better-console')
const Timers = require('node-timers')

// globals
const DEFAULT_POLL_INTERVAL_SECONDS = 10
const defaults = {pollInterval: DEFAULT_POLL_INTERVAL_SECONDS}

function LockState ({pollInterval} = defaults) {
  // constructor stuff
  this.locked
  this.timer = Timers.simple()
  this.pollInterval = pollInterval || DEFAULT_POLL_INTERVAL_SECONDS
  this.runningPoll

  this.start = () => {
    // get an initial value
    checkScreenLockstate()
    // start polling
    poll()
  }

  this.stop = () => this.runningPoll && clearInterval(this.runningPoll)


  this.get = () => {
    let state = 'unknown'
    if (this.locked === true) state = 'locked'
    if (this.locked === false) state = 'unlocked'
    return {
      state,
      time: this.timer.time()
    }
  }

  poll = () => {
    this.runningPoll = setInterval(checkScreenLockstate, this.pollInterval * 1000)
  }

  checkScreenLockstate = async () => {
    const dictionary = await this.getCGSessionDictionary()
    const nextLocked = Boolean(dictionary['CGSSessionScreenIsLocked'])
    if (this.locked !== nextLocked) {
      this.timer.reset()
      this.timer.start()
    }
    this.locked = nextLocked
  }

  this.getCGSessionDictionary = async () => {
    const pythonCommand = `
      python -c 'import sys,Quartz; d=Quartz.CGSessionCopyCurrentDictionary(); print(d)'
    `
    const rxNSDictionaryEntry = /(\w+)\s+=\s+\"?([^\"]+)\"?;/
    const NSDictionaryRaw = await exec(pythonCommand)
    return NSDictionaryRaw
      .split('\n')
      .map(a => a.match(rxNSDictionaryEntry))
      .filter(a => a)
      .reduce((collector, a) => { collector[a[1]] = a[2]; return collector }, {})
  }
}

module.exports = LockState
