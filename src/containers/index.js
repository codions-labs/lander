import React, {Component, Fragment} from 'react';
import {Route} from 'react-router-dom';

import {addLocaleData, IntlProvider} from 'react-intl';

import en from 'react-intl/locale-data/en';

import {flattenMessages} from '../utils/flatten-messages';

import Home from './home';
import Editor from './editor';
import Profile from './profile'
import Welcome from './welcome';

import {setActiveUser} from '../store/active-user';

import messages from '../locales';

addLocaleData([...en]);

export default class App extends Component {
  constructor(props) {
    super(props);

    if (window.blockstack.isUserSignedIn()) {
      const userData = window.blockstack.loadUserData();
      const {store} = this.props;
      store.dispatch(setActiveUser(userData.username));
    }
  }

  render() {
    let locale = 'en-US';

    return (
      <IntlProvider locale={locale} messages={flattenMessages(messages[locale])}>
        <Fragment>
          <Route exact path="/" component={Home}/>
          <Route exact path="/app/auth" component={props => {
            if (window.blockstack.isSignInPending()) {
              window.blockstack.handlePendingSignIn()
                .then(() => {
                  const {history} = props;
                  history.push('/app/editor');
                });
            }
            return null;
          }}/>
          <Route exact path="/app/welcome" component={Welcome}/>
          <Route exact path="/app/editor" component={props => {
            return <Editor {...props} />;
          }}/>
          <Route exact path="/:username" component={Profile}/>
        </Fragment>
      </IntlProvider>
    );
  }
}