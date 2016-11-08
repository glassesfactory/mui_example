import React, {PropTypes, Component} from 'react';

import mui, {AppBar, IconButton} from 'material-ui';
import {browserHistory} from 'react-router';
import ContentAdd from 'material-ui/svg-icons/content/add'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Signal from '../signal'


class Header extends Component {

  handleAdd(){
    Signal.notify("add")
  }

  handleTitleTap(){
    browserHistory.push('/');
  }

  render(){
    return (
      <MuiThemeProvider>
        <header className="header">
          <AppBar title="fishlog" onTitleTouchTap={this.handleTitleTap} iconElementLeft={<IconButton onTouchTap={this.handleAdd}><ContentAdd /></IconButton>} style={{"boxShadow": "none", "position": "fixed"}} />
        </header>
      </MuiThemeProvider>
    );
  }
}

export default Header;
