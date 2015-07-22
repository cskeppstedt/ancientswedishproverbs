/** @jsx hJSX */
'use strict';

import Cycle from '@cycle/core'
import { h, hJSX, makeDOMDriver } from '@cycle/dom'
import appFn from './app'

function client(responses) {
  let requests = appFn(responses)
  requests.DOM = requests.DOM.skip(2)
  return requests
}

Cycle.run(client, {
  DOM: makeDOMDriver('.app-container'),
  context: () => Cycle.Rx.Observable.just(window.appContext)
})
