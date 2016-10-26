import {div} from '@cycle/dom'
import {default as isolate} from '@cycle/isolate'
import xs from 'xstream'
import {html} from 'snabbdom-jsx';

function intent(sources) {
    return {
        player$: sources.DOM.select('.player').events('change').map(e => e.target.value),
        value$: sources.DOM.select('.count').events('input').map(e => e.target.value),
    };
}

function model(actions) {
    const player$ = actions.player$.startWith(0);
    const value$ = actions.player$.startWith(1);
    return xs.combine(value$, player$)
        .map(([value, player]) => ({value, player}));
}

function view(state$) {
    return state$.map(({player, value}) => 
        <div className="operation">             
            <select className="player">
                <option value="0">Player A</option>
                <option value="1">Player B</option>
            </select>
            draws
            <input type="text" className="count" value={value}/>
            {value === 1 ? 'card' : 'cards'}
        </div>
    );
}

function createFxn(state$) {
    return state$.map(({player, value}) => {
        return gamestate => {
            for (let i = 0; i < value; i++) {
                let card = gamestate.libraries[player].pop();
                if (card) {
                    gamestate.hands[player].push(card);
                } else {
                    gamestate.failedToDraw += 1; 
                }
            }
            return gamestate;
        }
    });
}

function Component(sources) {
    const state$ = model(intent(sources))
    const sinks = {
        DOM: view(state$),
        fxn: createFxn(state$)
    }

    return sinks;
}

export default {
    name: 'draw',
    component: sources => isolate(Component)(sources)
}