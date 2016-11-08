import 'whatwg-fetch';
import React, {PropTypes, Component} from 'react';
import { browserHistory, Link } from 'react-router'
import mui from 'material-ui';
import {GridList, GridTile} from 'material-ui/GridList';
import ContentAdd from 'material-ui/svg-icons/content/add'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Signal from '../signal';
import Config from '../config.json';


const styles = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingTop: "64px"
  },
  gridList: {
    width: "100%",
    maxWidth: "640px"
  }
};

class List extends Component {

  constructor(props){
    super(props)
    this.state = {data: []};
  }

  componentDidMount(){
    // Signal.subscribe()
    this.fetchList();
  }

  handleTap(event){
    browserHistory.push('/' + event.id);
  }

  fetchList(){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let reqCtx = {
      method: 'GET',
      headers: headers
    }
    let _this = this;
    const url = '//' + Config.api_host + '/fishs/';
    fetch(url, reqCtx)
    .then(function(res){
      if(res.ok){
        res.json().then(function(json){
          _this.setState({data: json});
        });
      }
    })
    .catch(function(res){
      console.log(res);
    })
  }

  render(){
    const entries = this.state.data.map((entry)=> (
      <GridTile
        key={entry.id}
        title={entry.size}
        subtitle={entry.weight}
        onTouchTap={() =>this.handleTap(entry)}
      ><img src={entry.image} /></GridTile>
      )
    )
    return (
      <MuiThemeProvider>
        <div style={styles.root}>
          <GridList style={styles.gridList} cellHeight={320}>
            {entries}
          </GridList>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default List;
