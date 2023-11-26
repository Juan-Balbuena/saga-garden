import React from 'react';
import ReactDOM from 'react-dom/client';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import createSagaMiddleware from 'redux-saga';
import { takeLatest, put } from 'redux-saga/effects';
import axios from 'axios';
import logger from 'redux-logger';

import App from './App';

// this startingPlantArray should eventually be removed
const startingPlantArray = [
  { id: 1, name: 'Rose' },
  { id: 2, name: 'Tulip' },
  { id: 3, name: 'Oak' }
];

const plantList = (state = startingPlantArray, action) => {
  switch (action.type) {
    case 'ADD_PLANT':
      return [ ...state, action.payload ]
    
    case 'SET_PLANTS':
      return action.payload  
    default:
      return state;
  }
};

function* fetchPlants() {
  try {
    const response = yield axios.get('/api/plant')
    const action = { type: 'SET_PLANTS', payload: response.data};
    yield put(action);
  } catch (error) {
    console.log('error in fetchPlants', error);
  }
}

function* sendPlantToServer(action){
  try {
    yield axios.post('/api/plant', action.payload)
    yield put ({ type: 'FETCH_PLANTS'})
  } catch (error) {
    console.log('Error in addPlant', error);
  }
}

function* removePlant(action){
  try {
    yield axios.delete(`/api/plant/${action.payload}`);
    yield put ({ type: 'FETCH_PLANTS' });
  } catch (error){
    alert('something went wrong');
    console.log('error in removePlant', error);
  }
}

function* rootSaga() {
  yield takeLatest('FETCH_PLANTS', fetchPlants);
  yield takeLatest('SEND_PLANT_TO_SERVER', sendPlantToServer);
  yield takeLatest('REMOVE_PLANT', removePlant);
}

const sagaMiddleware = createSagaMiddleware();

const store = createStore(
  combineReducers({ plantList }),
  applyMiddleware(sagaMiddleware, logger),
);

sagaMiddleware.run(rootSaga);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);