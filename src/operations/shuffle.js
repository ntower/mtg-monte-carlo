import {div} from '@cycle/dom'
import {default as isolate} from '@cycle/isolate'
import xs from 'xstream'
import {html} from 'snabbdom-jsx';

function intent(sources) {
    return {
        player$: sources.DOM.select('.player').events('change').map(e => e.target.value)
    };
}

function model(actions) {
    const player$ = actions.player$.startWith(0);
    return player$;
}

function view(state$) {
    return xs.from([
        <div>
            Shuffle             
            <select className="player">
                <option value="0">Player A's</option>
                <option value="1">Player B's</option>
            </select>
            deck
        </div>
    ]);
}

function createFxn(state$) {
    return state$.map(({player}) => {
        return gamestate => {
            gamestate.libraries[player] = fisherYatesShuffle(gamestate.libraries[player]);
            return gamestate;
        }
    });
}

function fisherYatesShuffle(deck) {
	let length = deck.length;
	for (let i = length - 1; i > 0; i--) {
		let j = Math.floor(Math.random() * (i + 1));
		swap(deck, i, j);
	}
    
	return deck;
}

function swap(array, indexA, indexB) {
	[array[indexA], array[indexB]] = [array[indexB], array[indexA]];
}

function Component(sources) {
    const state$ = model(intent(sources))
    const sinks = {
        DOM: view(state$),
        fxn: createFxn(state$)
    }

    return sinks;
}

export default sources => isolate(Component)(sources);