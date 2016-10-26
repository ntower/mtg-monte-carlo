import {run} from '@cycle/xstream-run'
import {makeDOMDriver} from '@cycle/dom'
import {App} from './app'
// import fromEvent from 'xstream/extra/fromEvent'

const main = App

const drivers = {
  DOM: makeDOMDriver('#app')
  // globalMouseMove: () => fromEvent(document, 'mousemove')
}

run(main, drivers)
