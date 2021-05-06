type EventTools = {
    stopPropagation: () => void
    stopImmediatePropagation: () => void
}

type Listener<K extends keyof WindowEventMap> = (ev: WindowEventMap[K], tool: EventTools) => any

let eventsMap = new WeakMap<HTMLElement, Map<keyof WindowEventMap, Set<Function>>>()

const internalFlag = new Set<keyof WindowEventMap>()
const triggerList = new Set<HTMLElement>()

const accumulateElement = (target: EventTarget | null) => {
    if (target) {
        let node: HTMLElement | null = target as HTMLElement
        while (node) {
            if (node === document.body) {
                return
            }
            triggerList.add(node)
            node = node.parentElement
        }
    }
}

const triggerEvent = <EventName extends keyof WindowEventMap>(
    eventName: EventName,
    event: WindowEventMap[EventName]
) => {
    let isStopImmediatePropagation = false
    let isStopPropagation = false

    const stopPropagation = () => {
        isStopPropagation = true
    }
    const stopImmediatePropagation = () => {
        isStopImmediatePropagation = true
    }

    for (const ele of triggerList) {
        if (isStopPropagation) {
            return
        }
        const eventMap = eventsMap.get(ele)
        const listeners = eventMap?.get(eventName)
        if (listeners) {
            for (const listener of listeners) {
                listener(event, { stopPropagation, stopImmediatePropagation })
                if (isStopImmediatePropagation) {
                    return
                }
            }
        }
    }
}

const internalEvent = <K extends keyof WindowEventMap>(eventName: K, event: WindowEventMap[K]) => {
    const { target } = event
    accumulateElement(target)
    triggerEvent(eventName, event)
    triggerList.clear()
}

const bindEvent = <Element extends HTMLElement, EventName extends keyof WindowEventMap>(
    element: Element,
    type: EventName,
    listener: Listener<EventName>
) => {
    if (!internalFlag.has(type)) {
        window.addEventListener(type, (event) => internalEvent(type, event))
        internalFlag.add(type)
    }
    let eventMap = eventsMap.get(element)
    if (!eventMap) {
        eventsMap.set(element, (eventMap = new Map()))
    }
    let listeners = eventMap.get(type)
    if (!listeners) {
        eventMap.set(type, (listeners = new Set()))
    }
    listeners.add(listener)
    return () => {
        listeners?.delete(listener)
    }
}

const removeListeners = <Element extends HTMLElement, EventName extends keyof WindowEventMap>(
    element: Element,
    type: EventName
) => {
    const eventMap = eventsMap.get(element)
    if (eventMap) {
        eventMap.set(type, new Set())
    }
}

const removeAllListeners = () => {
    eventsMap = new WeakMap<HTMLElement, Map<keyof WindowEventMap, Set<Function>>>()
}

export { bindEvent, removeListeners, removeAllListeners }
