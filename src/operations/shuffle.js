import {div} from '@cycle/dom'
import {default as isolate} from '@cycle/isolate'
import xs from 'xstream'
import {html} from 'snabbdom-jsx';

function intent(sources) {
    return {};
}

function model(actions) {
    return xs.empty();
}

function view(state$) {
    //TOOD: Some day we may want to allow shuffling of other zones
    return xs.from([<div>Shuffle the deck</div>]);
}

function Component(sources) {
    const sinks = {
        DOM: view(model(intent(sources)))
    }

    return sinks;
}

export default sources => isolate(Component)(sources);