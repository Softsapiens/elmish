// this isnt ready yet. html effects should be wrapped in a [] though, right?
//


import curry from 'ramda/src/curry'
import merge from 'ramda/src/merge'
import reduce from 'ramda/src/reduce'
import __ from 'ramda/src/__'
import evolve from 'ramda/src/evolve'
import adjust from 'ramda/src/adjust'
import map from 'ramda/src/map'
import omit from 'ramda/src/omit'
import pipe from 'ramda/src/pipe'
import call from 'ramda/src/call'
import prop from 'ramda/src/prop'
import append from 'ramda/src/append'
import pick from 'ramda/src/pick'
import addIndex from 'ramda/src/addIndex'

import h from 'react-hyperscript'

import concatEffects from 'elmish/utils/concatEffects'


const mapIndexed = addIndex(map)


const callInit = pipe(prop('init'), call)

// The component abstraction takes care of a few things:
// - less boilerplate. no need to define init and update.
// - wiring up children and forwarding actions.
// - concatenating all effects.
const component = curry((fn, children) => {

  const kind = fn()

  const init = () => {
    const state = (kind.init && apply(kind.init, arguments) || {}
    return children ? merge(state, {
      $child_states: map(callInit, children)
    }) : state
  }

  const update = curry((state, action) => {
    if (action.type === 'child_action') {
      const fn = children[action.index].update(__, action.action)
      return evolve({
        $child_states: adjust(fn, action.index)
      }, state)
    } else if (kind.update) {
      return kind.update(state, action)
    } else {
      console.warn('Unknown action:', action)
      return state
    }
  })

  const declare = curry((dispatch, state, props) => {

    const declareEach = (child, index) => {
      const childDispatch = (action) => dispatch({type: 'child_action', index, action})
      return child.declare(childDispatch, state.$child_states[index])
    }
    const effects = children ? pipe(
      mapIndexed(declareEach),
      concatEffects
    )(children) : {}

    return kind.declare ? kind.declare(effects, dispatch, state, props) : effects
  })

  return { init, update, declare }

}

export default component
