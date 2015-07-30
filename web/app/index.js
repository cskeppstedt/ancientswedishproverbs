/** @jsx hJSX */
'use strict'

import Cycle    from '@cycle/core'
import CycleDOM from '@cycle/dom'

let { h, hJSX, makeDOMDriver } = CycleDOM
let { Rx } = Cycle;

let intent = DOM => {
  return {
    textChange$: DOM.get('input', 'input')
      .map(ev => ev.target.value),

    count$: Rx.Observable.merge(
        DOM.get('p', 'mousedown').map(ev => {
          ev.preventDefault()
          return +1
        }),
        DOM.get('p', 'mouseenter').map(ev => +1),
        DOM.get('p', 'mouseleave').map(ev => -1)
    )
  }
}

let model = (context, actions) => {
  let header$ = actions.textChange$.startWith('Hello world!')
  let count$  = actions.count$.startWith(0).scan((acc, diff) => acc+diff)

  return Rx.Observable.combineLatest(header$, count$, context, (header, count, ctx) => ({
    header: header,
    count: count,
    posts: ctx.posts
  }))
}

let view = state$ => {
  return state$.map(state => (
    <div>
      <h3>Hey there world: {state.header}</h3>
      <p>There are {state.posts ? state.posts.length.toString() : 'no'} posts in context</p>
      <input value={state.header} />
      <h4>Some counter: {state.count.toString()}</h4>
      <table>
        {state.posts.map(post => (
          <tr>
            <td>{post.original}</td>
            <td>{post.translation}</td>
          </tr>
        ))}
      </table>
    </div>
  ))
}

export default (responses) => {
  let actions = intent(responses.DOM)
  let vtree$  = view(model(responses.context, actions))

  return {
    DOM: vtree$
  }
}
