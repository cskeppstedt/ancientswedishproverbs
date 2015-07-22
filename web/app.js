/** @jsx hJSX */
'use strict';
import Cycle from '@cycle/core'
import CycleDOM from '@cycle/dom'

let { h, hJSX, makeDOMDriver } = CycleDOM
let { Rx } = Cycle;

let app = (responses) => {
  let click$ = responses.DOM.get('h3', 'click')
    .map(ev => ev.currentTarget.innerText)
    .startWith('')

  let merged$ = responses.context.merge(click$).scan((acc, click) => {
    acc.click = click
    return acc
  })

  let vtree$ = merged$.map(({ posts, click }) => (
    <div>
      <h3>Hey there world: {click}</h3>
      <p>There are {posts ? posts.length.toString() : 'no'} posts in context</p>
    </div>
  ))

  return {
    DOM: vtree$
  };
}


module.exports = app
