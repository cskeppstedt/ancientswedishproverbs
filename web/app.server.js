/** @jsx hJSX */
'use strict';

import Cycle from '@cycle/core'
import CycleDOM from '@cycle/dom'
import appFn from './app/'
import serialize from 'serialize-javascript'

let {h, hJSX, makeHTMLDriver} = CycleDOM
let {Rx} = Cycle

function wrapVTreeWithHTMLBoilerplate(vtree, context) {
  return (
    <html>
      <head>
        <title>cycle.js isomorphism test</title>
      </head>
      <body>
        <div className="app-container">{ vtree }</div>
        <script>
          { `window.appContext = ${serialize(context)}` }
        </script>
        <script src="http://localhost:8080/webpack-dev-server.js"></script>
        <script src="http://localhost:8080/assets/vendor.js"></script>
        <script src="http://localhost:8080/assets/app.js"></script>
      </body>
    </html>
  )
}

function wrapAppResultWithBoilerplate(appFn, context$) {
  return function wrappedAppFn(ext) {
    let vtree$ = appFn(ext).DOM;
    let wrappedVTree$ = Rx.Observable.combineLatest(vtree$, context$,
      wrapVTreeWithHTMLBoilerplate
    );
    return {
      DOM: wrappedVTree$
    };
  };
}

function prependDoctype(html) {
  return `<!doctype html>${html}`;
}

module.exports = context$ => {
  let wrappedAppFn = wrapAppResultWithBoilerplate(appFn, context$)
  let [requests, responses] = Cycle.run(wrappedAppFn, {
    DOM: makeHTMLDriver(),
    context: () => context$
  })

  let html$ = responses.DOM.get(':root').map(prependDoctype)

  return {
    html$
  }
}
