import {div} from '@cycle/dom'
import xs from 'xstream'
import sampleCombine from 'xstream/extra/sampleCombine';
import {html} from 'snabbdom-jsx';
import {default as AddComponent} from './operations/add';
import {default as ShuffleComponent} from './operations/shuffle';

const operations = [{
  name: 'Add',
  component: AddComponent
}, {
  name: 'Shuffle',
  component: ShuffleComponent
}];

const actions = {
  add: (list, operation) => list.push(operation)
}

function intent(sources) {
  let initSelectValue$ = sources.DOM.select('.selectInit').events('change').map(e => e.target.value).startWith(operations[0].name);
  let addInitStep$ = sources.DOM.select('.addInit').events('click').mapTo('initSteps').compose(sampleCombine(initSelectValue$))
    
  let testSelectValue$ = sources.DOM.select('.selectTest').events('change').map(e => e.target.value).startWith(operations[0].name);
  let addTestStep$ = sources.DOM.select('.addTest').events('click').mapTo('testSteps').compose(sampleCombine(testSelectValue$))
  
  return xs.merge(addInitStep$, addTestStep$)
    .map(([arrayName, latestValue]) => 
      state => {
        actions.add(state[arrayName], operations.find(o => o.name === latestValue));
        return state;
      }
    )
    .debug();
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
            {operations.map(op => <option value={op.name}>{op.name}</option>)}
            </select>
            <button className='addInit'>Insert step</button>
          </section>
          <section>
            <p>Test Procedure</p>
            <select className='selectTest'>
            {operations.map(op => <option value={op.name}>{op.name}</option>)}
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
