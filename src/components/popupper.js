import React, {PropTypes, Component} from 'react';

import mui, {LinearProgress} from 'material-ui';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import transitions from 'material-ui/styles/transitions';
import Signal from '../signal';

// const ThemeManager = require('material-ui/lib/styles/theme-manager');
const styles = {
  height: "calc(100% - 64px)",
  overflowY: "scroll",
}

class Poppupper extends Component {

  constructor(props){
    super(props);

    this.state = {open: false};
  }

  getStyle(){
    const y = this.state.open ? 0 : this.getY();
    const top = Number(this.props.top.replace("px", ""));
    const style = {
      position: "fixed",
      top: this.props.top,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "#ffffff",
      transform: `translate(0, ${y}px)`,
      transition: transitions.easeOut(null, 'transform', null),
      WebkitOverflowScrolling: 'touch',
      zIndex: 79
    };
    return style;
  }

  getY(){
    return window.innerHeight
  }

  componentWillReceiveProps(nextProps){
    if (nextProps.open !== null) {
      this.setState({
        open: nextProps.open,
      });
    }
  }

  render(){
    return (
      <div style={this.getStyle()}>
        <div style={styles}>
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default Poppupper;
