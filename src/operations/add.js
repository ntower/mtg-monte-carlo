import {div} from '@cycle/dom'
import {default as isolate} from '@cycle/isolate'
import xs from 'xstream'
import {html} from 'snabbdom-jsx';

function intent(sources) {
    return {
        value$: sources.DOM.select('.count').events('input').map(e => e.target.value),
        name$: sources.DOM.select('.name').events('input').map(e => e.target.value)
    }
}

function model(actions) {
    const value$ = actions.value$.startWith(0);
    const name$ = actions.name$.startWith('unnamed');
    return xs.combine(value$, name$)
        .map(([value, name]) => ({value, name}));
}

function view(state$) {
    return state$.map(({value, name}) =>
        <div>Add <input type="text" value={value}/> copies of <input type="text" value={name}/> into the deck</div>
    )
}

//TODO: i'll want to have a props$ source to pass stuff in
function Component(sources) {
    const state$ = model(intent(sources))
    const sinks = {
        DOM: view(state$),
        value: state$
    }

    return sinks;
}

export default sources => isolate(Component)(sources);