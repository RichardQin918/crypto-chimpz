/**
 * index.js
 *
 * This is the entry file for the application, only setup and boilerplate
 * code.
 */

// Needed for redux-saga es6 generator support
// import '@babel/polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {ConnectedRouter} from 'connected-react-router';
import history from 'utils/history';

import 'utils/fontawesome';
import 'sanitize.css/sanitize.css';
import 'styles/bootstrap.scss';
import 'styles/global.scss';

// Import root app
import App from 'containers/App';
import configureStore from './configureStore';

const initialState = {};
const store = configureStore(initialState, history);
const MOUNT_NODE = document.getElementById('root');

ReactDOM.render(
    <Provider store={store}>
        <ConnectedRouter history={history}>
            <App/>
        </ConnectedRouter>
    </Provider>,
    MOUNT_NODE,
)
