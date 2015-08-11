/** @jsx hJSX */
'use strict'

import Cycle    from '@cycle/core'
import CycleDOM from '@cycle/dom'

let { h, hJSX, makeDOMDriver } = CycleDOM
let { Rx } = Cycle;

let intent = DOM => {
  return {
    translationClick$: DOM.get('.post__translation', 'click')
  }
}

let model = (context, actions) => {
  let editing$ = actions.translationClick$.startWith(false).map(true);

  //let header$ = actions.textChange$.startWith('Hello world!')
  //let count$  = actions.count$.startWith(0).scan((acc, diff) => acc+diff)

  return Rx.Observable.combineLatest(editing$, context, (editing, ctx) => {
    let posts = ctx.posts.slice(0);

    posts.sort((a,b) => {
      if (a.post_url && !b.post_url)
        return -1;
      if (b.post_url && !a.post_url)
        return 1;

      return a.translation.toLowerCase().localeCompare(b.translation.toLowerCase());
    });

    let state = {
      editing: editing,
      posts: posts
    };

    return state;
  })
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
