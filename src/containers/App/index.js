/**
 *
 * App
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 */
import React from 'react';
import { Helmet } from 'react-helmet';
import { Switch, Route } from 'react-router-dom';

import HomePage from 'containers/HomePage/Loadable';
import NotFoundPage from 'containers/NotFoundPage/Loadable';
import Header from 'components/Header';
import Footer from 'components/Footer';
import ReactGA from 'react-ga';
const TRACKING_ID = "G-TYHKB672T0";
ReactGA.initialize(TRACKING_ID);

export default function App() {
  return (
      <div>
        <Helmet
            titleTemplate="%s - Crypto Chimpz"
            defaultTitle="Crypto Chimpz – Community is Everything"
        >
        </Helmet>
        <Header />
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route path="" component={NotFoundPage} />
        </Switch>
        <Footer />
      </div>
  );
}
