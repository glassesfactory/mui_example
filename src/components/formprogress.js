import React, {PropTypes, Component} from 'react';

import mui, {LinearProgress} from 'material-ui';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import Signal from '../signal';


class FormProgress extends Component {

  constructor(props){
    super(props);

    this.state = {completed: 0, style:{display: "none"}, active: false};

    this.handleUpdate = this.handleUpdate.bind(this);
    this.handleFinish = this.handleFinish.bind(this);
  }

  componentDidMount(){
    Signal.subscribe("progress_update", this.handleUpdate);
    Signal.subscribe("progress_finish", this.handleFinish);
  }

  componentWillUnmount(){
    Signal.unsubscribe("progress_update", this.handleUpdate);
    Signal.unsubscribe("progress_finish", this.handleFinish);
  }

  handleUpdate(signal, msg){
    this.setState(msg);
  }

  handleFinish(){
    this.setState({active: false})
  }

  getStyle(){
    if(!this.state.active){
      return {display: "none"}
    }
    const style = {
      position: "fixed",
      top: "64px",
      left: 0,
      width: "100%",
      display: "block",
      zIndex: 80
    }
    return style
  }

  render(){
    return (
      <MuiThemeProvider>
        <LinearProgress mode="determinate" value={this.state.completed} style={this.getStyle()} />
      </MuiThemeProvider>
    );
  }
}

export default FormProgress;
