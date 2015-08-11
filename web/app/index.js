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
    <div className="ancient-app">
      <ol className="posts">
        {state.posts.map(post => (
          <li className="posts__post">
            <div className="post__translation">{post.translation}</div>
            <div className="post__original">{post.original}</div>
            <div className="post__action-bar">
              <a href="#" className="action-bar__publish">Publish</a>
              <span className="action-bar__divider" />
              <a href="#" className="action-bar__favorite">S</a>
            </div>
          </li>
        ))}
      </ol>
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
