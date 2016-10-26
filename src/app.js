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
        let initComponents = generateComponents(state.initSteps, sources);
        let testComponents = generateComponents(state.testSteps, sources);

        return xs.combine(
          xs.combine(...initComponents),
          xs.combine(...testComponents)
        );
      })
      .flatten()
      .map(([initComponents, testComponents]) => 
        <div>
          <section>
            <p>Initialization</p>
            {initComponents}
            <select className='selectInit'>
            {initializationOperations.map(op => <option value={op.name}>{op.name}</option>)}
            </select>
            <button className='addInit'>Insert step</button>
          </section>
          <section>
            <p>Test Procedure</p>
            {testComponents}
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

function generateComponents(steps, sources) {
  return steps.map(step => step.component(sources).DOM)
      .map(dom$ => dom$.map(dom => 
        <div className="operationContainer">
          <button disabled={steps.length===1}>move up</button>
          <button disabled={steps.length===1}>move down</button>
          {dom}
          <button>delete this step</button>
        </div>
      ));
}


export function App (sources) {
  const actions = intent(sources);
  const state$ = model(actions);
  const sinks = {
    DOM: view(state$, sources)
  }

  return sinks;
}
