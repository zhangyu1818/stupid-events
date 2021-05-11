# stupid-events

Just a stupid imitation of the React v17 event system.

## Installation

```shell
yarn add stupid-events
```

## Usage

```javascript
import { bindEvent, removeListeners, removeAllListeners } from 'stupid-events';

const ele = document.querySelector('button');

const removeListener = bindEvent(
    ele, 
    'click', 
    (event, { stopPropagation, stopImmediatePropagation }) => {
        console.log('trigger');
    }
);

// remove event listener
removeListener();

// remove element all click listeners
removeListeners(ele, 'click');

// remove stupid-events all listeners
removeListeners();
```

## How it works

Like React v17, it starts from the initial element that triggers the event and traverses to the upper level, collects all the elements that need to trigger the event into the queue, and then traverses the queue to call the event in turn.

However, it has no concept of priority, so I call it stupid-events, maybe can do some interesting things.
