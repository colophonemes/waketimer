# waketimer

Figure out how long your screen has been locked/unlocked.


## Rationale

I often work long hours, and I'd like to set reminders based on how long the

## Usage

### Server

```
# install globally
npm install -g waketimer
# run
waketimer
# => 'waketimer server running'
```

### Client

```
const getWaketimerState = require('waketimer/client')

async function run () {
    const currentState = await getWaketimerState()
    console.log(currentState)
    // => { state: 'unlocked', time: 57673 }
}

```

## Requirements

Uses `async/await` so requires Node 8+

You'll also need the `Quartz` python library installed

```
pip install pyobjc-framework-Quartz
```

## Prior art

The ability to get data from `CGSessionCopyCurrentDictionary` is basically a direct crib of [agentcooper's node-osx-quartz](https://github.com/agentcooper/node-osx-quartz)
