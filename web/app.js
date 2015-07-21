/** @jsx hJSX */
'use strict';
import 'babel/polyfill';

import Cycle from '@cycle/core'
import CycleDOM from '@cycle/dom'

let {Rx} = Cycle;
let {h, hJSX} = CycleDOM;

let app = (ext) => {
  let vtree$ = Rx.Observable.just(
    <h3>Hey world</h3>
  )

  return {
    DOM: vtree$
  };
}


module.exports = app
