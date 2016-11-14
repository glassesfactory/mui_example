'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link, browserHistory } from 'react-router';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
import Header from './components/header';
import MyForm from './components/myform';
import FormProgress from './components/formprogress';
import List from './components/list';
import Detail from './components/detail';
import S3Uploader from './s3uploader';
import Config from './config.json'

injectTapEventPlugin();
S3Uploader.setup({
  accessKeyId: Config.s3_key,
  secretAccessKey: Config.s3_secret
});

const NoMatch = React.createClass({
  componentDidMount(){
    console.log("nomatch")
    console.log(this.props.params);
  },
  render(){return (<div>not found</div>);}
});

const App = () => (
  <div>
    <Header />
    <FormProgress />
    <MyForm />
    <Router history={browserHistory}>
      <Route path="/" component={List} />
      <Route path="/:id" component={Detail} />
      <Route path="*" component={NoMatch} />
    </Router>

  </div>
);

ReactDOM.render(
  <App />,
  document.getElementById('app')
);
