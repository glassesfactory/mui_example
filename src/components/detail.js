import 'whatwg-fetch';
import React, {PropTypes, Component} from 'react';

import {mui, Subheader} from 'material-ui';
import {Card, CardHeader, CardActions, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import ContentAdd from 'material-ui/svg-icons/content/add'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Signal from '../signal';
import Config from '../config.json';


const styles = {
  root: {
    paddingTop: "88px",
    paddingLeft: "16px",
    paddingRight: "16px",
    paddingBottom: "16px",
    maxWidth: "640px",
    margin: "0 auto"
  },
  gridList: {},
  map: {
    height: "300px"
  },
  point:{
    margin: 0,
    fontSize: "1rem",
    lineHeight: 1.5
  }
};

class Detail extends Component {

  constructor(props){
    super(props)
    this.state = {id: null, data: null};
  }

  componentDidMount(){
    // Signal.subscribe()
    this.setState({id: this.props.params.id}, function(){
      this.fetchDetail();
    });

  }

  componentWillReceiveProps(nextProps){
    if (nextProps.id !== null) {
      this.setState({
        id: nextProps.id,
      });
    }
  }

  fetchDetail(){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let reqCtx = {
      method: 'GET',
      headers: headers
    }
    let _this = this;
    const url = '//' + Config.api_host + '/fishs/' + this.state.id;
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

  componentDidUpdate(){
    if(!this.state.data || !window.google){
      return;
    }

    const lng = this.state.data.longitude;
    const lat = this.state.data.latitude;
    const latlng = new google.maps.LatLng(lat, lng);
    const geocoder = new google.maps.Geocoder();
    const opts = {
      zoom: 16,
      center: latlng
    }
    new google.maps.Map(document.getElementById('map'), opts);
    //地名取る
    geocoder.geocode({'location': latlng}, (results, status)=> {
      if(status !== google.maps.GeocoderStatus.OK){
        console.error("woops...")
        return;
      }
      let geolocs = results[3].address_components;
      let geoloc = geolocs[2].long_name + geolocs[1].long_name + geolocs[0].long_name;
      document.getElementById('locs').innerText = geoloc;
    });
  }

  render(){

    if(!this.state.data){
      return null
    }
    const data = this.state.data;
    return (
      <MuiThemeProvider>
        <div style={styles.root}>
          <Card>
            <CardMedia>
              <img src={data.image} />
            </CardMedia>
            <CardTitle title={data.size + "cm"} subtitle={data.weight + "g"} />
            <CardText>
              <header><h3 style={styles.point}>釣った場所</h3><span id="locs"></span></header>
              <div id="map" style={styles.map}></div>
            </CardText>
          </Card>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default Detail;
