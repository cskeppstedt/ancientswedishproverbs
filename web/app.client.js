/** @jsx hJSX */
'use strict';

import Cycle from '@cycle/core'
import { h, hJSX, makeDOMDriver } from '@cycle/dom'
import appFn from './app/'
import SocketIO from 'socket.io-client'

require('./app/index.scss');

// SocketIO('http://localhost:5000', { path: '/proverbs/socket.io'})

function client(responses) {
  let requests = appFn(responses)
  requests.DOM = requests.DOM.skip(1)
  return requests
}

Cycle.run(client, {
  DOM: makeDOMDriver('.app-container'),
  context: () => Cycle.Rx.Observable.just(window.appContext)
})
