import {div} from '@cycle/dom'
import xs from 'xstream'
import sampleCombine from 'xstream/extra/sampleCombine';
import {html} from 'snabbdom-jsx';
import add from './operations/add';
import shuffle from './operations/shuffle';
import draw from './operations/draw';

const allOperations = [add, shuffle, draw];
const initializationOperations = [add, shuffle];
const testOperations = [draw, shuffle];

const actions = {
  add: (list, operation) => list.push(operation)
}

function intent(sources) {
  let initSelectValue$ = sources.DOM.select('.selectInit').events('change').map(e => e.target.value).startWith(initializationOperations[0].name);
  let addInitStep$ = sources.DOM.select('.addInit').events('click').mapTo('initSteps').compose(sampleCombine(initSelectValue$))
    
  let testSelectValue$ = sources.DOM.select('.selectTest').events('change').map(e => e.target.value).startWith(testOperations[0].name);
  let addTestStep$ = sources.DOM.select('.addTest').events('click').mapTo('testSteps').compose(sampleCombine(testSelectValue$));

  // let mouseDown$ = sources.DOM.select('.operation').events('mousedown').debug('mousedown');
  // let mouseUp$ = sources.DOM.select('.operation').events('mouseup').debug('mouseup');
  // mouseMove$: sources.globalMouseMove
  
  return xs.merge(addInitStep$, addTestStep$)
    .map(([arrayName, latestValue]) => 
      state => {
        actions.add(state[arrayName], allOperations.find(o => o.name === latestValue));
        return state;
      }
    )
}

function model(actions$) {
  return actions$.fold((state, actions) => {
    return actions(state)
  }, {initSteps: [], testSteps: []});
}

function view(state$, sources) {
    return state$
      .map(state => {
        let components = state.initSteps.map(step => step.component(sources).DOM);
        return xs.combine(...components);
      })
      .flatten()
      .map((...components) => 
        <div>
          <section>
            <p>Initialization</p>
            {components}
            <select className='selectInit'>
            {initializationOperations.map(op => <option value={op.name}>{op.name}</option>)}
            </select>
            <button className='addInit'>Insert step</button>
          </section>
          <section>
            <p>Test Procedure</p>
            <select className='selectTest'>
            {testOperations.map(op => <option value={op.name}>{op.name}</option>)}
            </select>
            <button className='addTest'>Insert step</button>
          </section>
          <section>
            <button className='run' disabled>Run</button>
          </section>
        </div>
      )
}


export function App (sources) {
  const actions = intent(sources);
  const state$ = model(actions);
  const sinks = {
    DOM: view(state$, sources)
  }

  return sinks;
}
