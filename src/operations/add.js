import {div} from '@cycle/dom'
import {default as isolate} from '@cycle/isolate'
import xs from 'xstream'
import {html} from 'snabbdom-jsx';

function intent(sources) {
    return {
        value$: sources.DOM.select('.count').events('input').map(e => e.target.value),
        name$: sources.DOM.select('.name').events('input').map(e => e.target.value),
        player$: sources.DOM.select('.player').events('change').map(e => e.target.value)
    }
}

function model(actions) {
    const value$ = actions.value$.startWith(4);
    const name$ = actions.name$.startWith('unnamed');
    const player$ = actions.player$.startWith(0);
    return xs.combine(value$, name$, player$)
        .map(([value, name, player]) => ({value, name, player}));
}

function view(state$) {
    return state$.map(({value, name, player}) =>
        <div>
            Add 
            <input type="text" className="count" value={value}/> 
            copies of 
            <input type="text" className="name" value={name}/> 
            into 
            <select className="player">
                <option value="0">Player A's</option>
                <option value="1">Player B's</option>
            </select>
            deck
        </div>
    )
}

function createFxn(state$) {
    //TODO: It's probably not ideal to be creating a new function every time the state changes
    //   I only need it lazily, when they execute the test.
    return state$.map(({value, name, player}) => {
        return gamestate => {
            let cards = Array(value).fill(name);
            gamestate.libraries[player].push(...cards);
            return gamestate;
        }
    });
}

//TODO: i may want to have a props$ source to pass stuff in
function Component(sources) {
    const state$ = model(intent(sources))
    const sinks = {
        DOM: view(state$),
        value: state$,
        fxn: createFxn(state$)
    }

    return sinks;
}

export default sources => isolate(Component)(sources);