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

function intent(sources) {
  const initSelectValue$ = sources.DOM.select('.selectInit').events('change').map(e => e.target.value).startWith(initializationOperations[0].name);
  const addInitStep$ = sources.DOM.select('.addInit').events('click').mapTo('initSteps').compose(sampleCombine(initSelectValue$));
    
  const testSelectValue$ = sources.DOM.select('.selectTest').events('change').map(e => e.target.value).startWith(testOperations[0].name);
  const addTestStep$ = sources.DOM.select('.addTest').events('click').mapTo('testSteps').compose(sampleCombine(testSelectValue$));

  const add$ = xs.merge(addInitStep$, addTestStep$)
    .map(([arrayName, latestValue, remove]) => 
      state => {
        state[arrayName].push(allOperations.find(o => o.name === latestValue));
        return state;
      }
    );

  const remove$ = sources.DOM.select('.remove').events('click').debug('remove')
    .map(event =>
      state => {
        //TODO: support both lists
        const arrayName = 'initSteps';
        state[arrayName].splice(event.target.getAttribute('data-index'), 1);
        return state;
      }
    );

  const actions$ = xs.merge(add$, remove$);

  return actions$
}

function model(actions$) {
  return actions$.fold(
    (state, action) => action(state), 
    {initSteps: [], testSteps: []}
  );
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
      .map((dom$, index) => dom$.map(dom => 
        <div className="operationContainer">
          <button disabled={steps.length===1}>move up</button>
          <button disabled={steps.length===1}>move down</button>
          {dom}
          <button className="remove" attrs-data-index={index}>delete this step</button>
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
