/*
init    : () -> state
update  : (state, action) -> state
effects : (dispatch, state) -> {html, http}
*/

// import Type from 'union-type'
import curry from 'ramda/src/curry'
import merge from 'ramda/src/merge'
import assoc from 'ramda/src/assoc'
import h     from 'react-hyperscript'

const loadingGif = require('tutorial/loading.gif')
const errorGif = require("tutorial/error.gif")

const randomUrl = (topic) =>
  `http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&&rating=pg&tag=${topic}`

 // init : () -> state
const init = (topic="explosions") => {
  return { topic: topic, url: loadingGif, count: 0, pending: true}
}

// update : (dispatch, state, action) -> state
const update = curry((state, action) => {
  switch (action.type) {
    case 'setTopic':
      return assoc('topic', action.topic, state);
    case 'newGif':
      return merge(state, {
        url: action.url,
        pending: false
      })
    case 'errorGif':
      console.warn("ERROR:", state, action)
      return merge(state, {
        url: errorGif,
        pending: false
      })
    case 'anotherGif':
      return merge(state, {
        url: loadingGif,
        count: state.count + 1,
        pending: true
      })
    default:
      return state
  }
})

let view = curry((dispatch, state) => {
  return {
    html:
      h('div.giphy', [
        h('div.topic', [
            h('h2.topic', state.topic),
            h('input.topic-input', {
              value: state.topic,
              onChange: (e) => dispatch({type: 'setTopic', topic: e.target.value})
            })
        ]),
        h('img', {src: state.url}),
        h('button', {
          onClick: () => dispatch({type: 'anotherGif'})
        }, 'Gimme More!')
      ]),
    http: !state.pending ? [] :
      [{
        key: state.count,
        url: randomUrl(state.topic),
        method: 'get',
        onSuccess: (response) => {
          return dispatch({type: 'newGif', url: response.json.data.image_url})
        },
        onError: (response) => {
          return dispatch({type: 'errorGif', error: response})
        }
      }]
  }
})

export default {init, view, update}