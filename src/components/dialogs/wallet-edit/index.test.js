import React from 'react';
import ReactDOM from 'react-dom';

import WalletEditDialog from './index';

it('Render dialog', () => {
  const props = {
    user: {
      draft: {
        wallets: {bitcoin: '', ethereum: ''}
      }
    },
    toggleUiProp: () => {
    },
    setWallet: () => {
    },
    saveDraft: () => {

    },
    saveDraftDone: () => {

    },
    saveDraftError: () => {

    }
  };

  const div = document.createElement('div');
  ReactDOM.render(<WalletEditDialog {...props} />, div);
});
