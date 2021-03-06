import React, {Component} from 'react';

import {Form, Button} from 'react-bootstrap';

import * as blockStack from 'blockstack';

import {userSession, getUsername} from '../../../../blockstack-config';

import {extractAccounts} from '../../../../helper/extract-user-props';

import ProfilePhoto from '../../../profile-photo';

import PhotoUploadDialog from '../../../../components/dialogs/photo-upload'

import Spinner from '../../../../components/elements/spinner';

import {dataModel} from '../../../../constants';

import showError from '../../../../utils/show-error';

import {putDraftFile, putPublishedFile, putFlagFile, getFlagFile, setFlagLocal} from '../../../../dbl';

class WelcomePage extends Component {

  constructor(props) {
    super(props);

    this.state = {
      step: 1,
      name: '',
      description: '',
      photo: '',
      uploadWindow: false,
      creating: false,
      loaded: false
    }
  }

  componentDidMount() {
    const {history} = this.props;

    if (!userSession.isUserSignedIn()) {
      history.push('/');
      return;
    }

    const userData = userSession.loadUserData();

    getFlagFile().then(resp => {
      if (JSON.parse(resp) === 'ok') {
        setFlagLocal(getUsername(), 'ok');
        history.push('/app/editor');
        return;
      }

      this.setState({loaded: true});
      this.focusInput();
    });

    const profile = new blockStack.Person(userData.profile);

    if (profile.name()) {
      this.setState({name: profile.name()});
    }

    if (profile.description()) {
      this.setState({description: profile.description()});
    }

    if (profile.avatarUrl()) {
      this.setState({photo: profile.avatarUrl()});
    }
  }

  focusInput = () => {
    setTimeout(() => {
      const e = document.querySelector('.focus-on');
      if (e) {
        e.focus();
      }
    }, 400);
  };

  nameChanged = (e) => {
    this.setState({name: e.target.value});
  };

  next1 = () => {
    const {name} = this.state;
    if (!name.trim()) {
      this.focusInput();
      return;
    }

    this.setState({step: 2}, () => {
      this.focusInput();
    });
  };

  next2 = () => {
    const {description} = this.state;
    if (!description.trim()) {
      this.focusInput();
      return;
    }

    this.setState({step: 3});
  };

  back1 = () => {
    this.setState({step: 1}, () => {
      this.focusInput();
    });
  };

  back2 = () => {
    this.setState({step: 2}, () => {
      this.focusInput();
    });
  };

  descriptionChanged = (e) => {
    this.setState({description: e.target.value});
  };

  create = () => {
    const {name, description, photo} = this.state;

    const accounts = extractAccounts('social');
    const wallets = extractAccounts('wallet');

    const data = dataModel();

    const newData = Object.assign({}, data, {name, description, photo, accounts, wallets});

    this.setState({creating: true});

    const prms1 = putDraftFile(newData);
    const prms2 = putPublishedFile(newData);

    return Promise.all([prms1, prms2]).then(() => {
      return putFlagFile('ok').then(() => {
        setFlagLocal(getUsername(), 'ok');
        setTimeout(() => {
          window.location.href = '/app/editor'
        }, 200);
      });
    }).catch(() => {
      showError('Could not create your page. Please try again.');
    }).then(() => {
      this.setState({creating: false});
    })
  };

  render() {
    const {step, name, description, photo, creating, loaded, uploadWindow} = this.state;

    if (!loaded) {
      return <Spinner/>;
    }

    return (
      <>
        <div className="main-wrapper-welcome">
          <div className="inner-wrapper">
            <div className="section-header">
              <h1>Welcome</h1>
            </div>


            {step === 1 &&
            <>
              <div className="section-sub-header">
                Let's start building your page
              </div>

              <div className="welcome-form">
                <Form.Group controlId="formName">
                  <Form.Label className="text-muted">Your name:</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your name here"
                    className="focus-on"
                    maxLength={30}
                    value={name}
                    onChange={this.nameChanged}
                    onKeyPress={
                      (e) => {
                        if (e.key === 'Enter') {
                          this.next1();
                        }
                      }
                    }
                  />
                </Form.Group>
              </div>
              <div className="form-buttons">
                <Button variant="primary" type="button" onClick={this.next1}>
                  Next
                </Button>
              </div>
            </>
            }

            {step === 2 &&
            <>
              <div className="section-sub-header">
                Tell your visitors a little about yourself
              </div>
              <div className="welcome-form">
                <Form.Group controlId="formDescription">
                  <Form.Label className="text-muted">Short description:</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Describe yourself"
                    className="focus-on"
                    maxLength={60}
                    value={description}
                    onChange={this.descriptionChanged}
                    onKeyPress={
                      (e) => {
                        if (e.key === 'Enter') {
                          this.next2();
                        }
                      }
                    }
                  />
                  <Form.Text className="text-muted">
                    e.g. Time traveler and blogger
                  </Form.Text>
                </Form.Group>
              </div>
              <div className="form-buttons">
                <Button variant="secondary" type="button" className="btn-back" onClick={this.back1}>
                  Back
                </Button>
                <Button variant="primary" type="button" onClick={this.next2}>
                  Next
                </Button>
              </div>
            </>
            }
            {step === 3 &&
            <>
              <div className="section-sub-header">
                Set your profile photo
              </div>
              <div className="set-profile-image">
                <ProfilePhoto imageUrl={photo}/>
                <Button variant="outline-primary" onClick={() => {
                  this.setState({uploadWindow: true});
                }}>Upload new photo</Button>
              </div>
              <div className="form-buttons">
                <Button variant="secondary" type="button" className="btn-back" disabled={creating} onClick={this.back2}>
                  Back
                </Button>
                <Button variant="primary" type="button" disabled={creating} onClick={this.create}>
                  Next {creating ? '...' : ''}
                </Button>
              </div>
              {uploadWindow &&
              <PhotoUploadDialog connected={false} afterHide={() => {
                this.setState({uploadWindow: false});
              }} afterSave={(url) => {
                this.setState({photo: url, uploadWindow: false});
              }}/>
              }
            </>
            }
          </div>
        </div>
      </>
    )
  }
}

export default WelcomePage;
