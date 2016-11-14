import React, {PropTypes, Component} from 'react';
import ReactDOM from 'react-dom';
import 'whatwg-fetch';

import mui, {TextField, RaisedButton, Drawer, Toggle, RadioButtonGroup, RadioButton} from 'material-ui';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import Signal from '../signal'

import FormProgress from './formprogress'
import Popupper from './popupper'
import Config from '../config.json';
import EXIF from 'exif-js';
import S3Uploader from '../s3uploader';
import ImageUtil from '../imageutil';

class MyForm extends Component {

  static get childContextTypes() {
    return {muiTheme: React.PropTypes.object};
  }

  constructor(props){
    super(props);
    let bass = {
      size: 0,
      weight: 0,
      latitude: 0,
      longitude: 0,
      image: null
    };
    this.state = {
      bass: bass,
      completed: 0,
      open: false,
      useGPS: false,
      gpsType: null,
      imageFile: null,
      location: null,
      radioHeight: 96
    };
    this.handleInput = this.handleInput.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.getGeoSuccess = this.getGeoSuccess.bind(this);
    this.handleImageInput = this.handleImageInput.bind(this);
    this.handleUseGPS = this.handleUseGPS.bind(this);
    this.handleSelectGPS = this.handleSelectGPS.bind(this);
    this.open = this.open.bind(this);
  }

  componentDidMount(){
    Signal.subscribe("add", this.open);
    this.setState({radioHeight: this.refs.pos_radios.scrollHeight});
  }

  componentWillUnmount(){
    Signal.unsbscribe("add", this.open);
  }

  open(){
    this.setState({open: !this.state.open});
  }

  handleSubmit(event) {
    // バリデーションする?
    Signal.notify("progress_update", {completed: 10, active: true});
    this.send();
  }

  handleSelectGPS(event){
    switch(event.target.value){
      case 'image':
        this.checkImageStatus();
        break;
        return
      case 'current':
        this.getCurrentGeo();
        break;
        return
      case 'address':
        break;
        return
    }
  }

  checkImageStatus(){
    if(this.state.imageFile && this.state.bass.latitude == 0){
      this.gpsFromImage(this.state.imageFile);
    }
    this.setState({gpsType: "image"});
  }

  getCurrentGeo(){
    navigator.geolocation.getCurrentPosition(this.getGeoSuccess, this.getGeoError);
  }

  //うまく取れた
  getGeoSuccess(position){
    let coords = position.coords;
    let bass = this.state.bass;
    bass.latitude = coords.latitude;
    bass.longitude = coords.longitude;

    this.setState({bass: bass}, this.geo2Location);
  }

  //しくった
  getGeoError(error){
    console.log(error);
  }

  send(){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    const bass = this.state.bass;

    let reqCtx = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(bass)
    }

    let _this = this;
    const url = '//' + Config.api_host + '/fishs/';
    fetch(url, reqCtx)
    .then(function(res){
      if(res.ok){
        res.json().then(function(json){
          _this.setState({open: false})
          Signal.notify("progress_update", {completed: 100})
          Signal.notify("post_complete");
          setTimeout(()=> {
            Signal.notify("progress_finish");
          }, 1000);
        });
      }
    })
    .catch(function(res){
      console.log(res);
    });
  }

  handleInput(event){
    let targetName = event.target.name;
    if (this.state.bass.hasOwnProperty(targetName)) {
      let bass = this.state.bass;
      bass[event.target.name] = event.target.value;
      this.setState(bass: bass);
    }
  }

  handleUseGPS(event, isInputChecked){
    this.setState({useGPS: isInputChecked});
  }

  isUseGPS(){
    if(this.state.useGPS) {
      const radioHeight = this.state.radioHeight;
      return {
        height: `${radioHeight}px`,
        opacity: 1,
        marginBottom: "1.5rem",
        visibility: "visible"
      }
    }
    return {
      height: 0,
      opacity: 0,
      marginBottom: 0,
      visibility: "hidden"
    }
  }

  gpsFromImage(file){
    let _this = this;
    new Promise((resolve, reject)=> {
      EXIF.getData(file, function(){
        const lats = EXIF.getTag(this, "GPSLatitude");
        const lngs = EXIF.getTag(this, "GPSLongitude");
        if(!lats||!lngs){
          reject();
          return
        }
        let lat = _this.angle2Deg(lats);
        let lng = _this.angle2Deg(lngs);
        const latlng ={
          lat: lat,
          lng: lng
        }
        resolve(latlng)
      });
    }).then((latlng)=>{
      let bass = this.state.bass;
      bass.latitude = latlng.lat;
      bass.longitude = latlng.lng;
      this.setState({bass: bass}, this.geo2Location);
    })
    .catch(()=>{
      // あらーと出す
    });
  }

  geo2Location(){
    const lat = this.state.bass.latitude;
    const lng = this.state.bass.longitude;
    const latlng = new google.maps.LatLng(lat, lng);
    const geocoder = new google.maps.Geocoder();
    const opts = {
      zoom: 16,
      center: latlng
    }
    let _this = this;
    //地名取る
    geocoder.geocode({'location': latlng}, (results, status)=> {
      if(status !== google.maps.GeocoderStatus.OK){
        console.error("woops...")
        return;
      }
      let geolocs = results[3].address_components;
      let locs = results[0].address_components.reverse();
      locs = locs.slice(2, locs.length);
      let geoloc = "";
      locs.map(function(obj){
        geoloc += obj.long_name;
      });
      _this.setState({location: geoloc});
    });
  }

  angle2Deg(angles){
    let deg = angles[0];
    let min = angles[1];
    let sec = angles[2];
    return deg + (min / 60) + (sec / 3600);
  }

  handleImageInput(event){
    let file = event.target.files[0];
    this.setState({imageFile: file});
    //file から GPS 情報を取る
    if(this.state.useGPS && this.state.gpsType == "image" && this.state.bass.latitude == 0){
      this.gpsFromImage(file);
    }
    let _this = this;
    // ios で死ぬのでリサイズ
    ImageUtil.resizeFile(file)
    .then((file)=>{
      //S3 にぶん投げる
      S3Uploader.img(file, "fishmans", "image/")
      .then((res)=>{
        const src = Config.s3_path + res.filename;
        let bass = _this.state.bass;
        bass.image = src;
        _this.setState({bass: bass});
      })
      .catch((err)=>{
        console.log(err);
      });
    })
    .catch(()=>{
      console.error("woops");
    });
  }

  render(){
    let image = null
    if(this.state.bass.image)
      image = <div><img src={this.state.bass.image} /></div>


    return (
      <MuiThemeProvider>
        <Popupper open={this.state.open} top={"64px"}>
          <div className="form">
            <div className="form__entry">
              <TextField hintText="size" onChange={this.handleInput} floatingLabelText="サイズ" name="size" style={{"width":"100%"}} />
            </div>
            <div className="form__entry">
              <TextField hintText="weight" onChange={this.handleInput}  floatingLabelText="重さ(g)" name="weight" style={{"width":"100%"}} />
            </div>
            <div className="form__entry">
              <Toggle
                label="位置情報を使う"
                onToggle={this.handleUseGPS}
              />
            </div>
            <div className="form__entry form__entry--togglable" style={this.isUseGPS()} ref="pos_radios">
              <RadioButtonGroup name="position_by" onChange={this.handleSelectGPS} style={{marginBottom:"1.5rem"}}>
                <RadioButton value="image" label="画像から" />
                <RadioButton value="current" label="現在位置から" />
                <RadioButton value="address" label="住所から" />
              </RadioButtonGroup>
              <div>釣った場所: {this.state.location}</div>
            </div>
            <div className="form__entry">
              {image}
              <RaisedButton containerElement="label" label="画像">
                <input type="file" name="image" onChange={this.handleImageInput} />
              </RaisedButton>
            </div>
            <div className="form__entry">
              <RaisedButton primary={true} label="保存" onTouchTap={this.handleSubmit} />
            </div>
          </div>
        </Popupper>
      </MuiThemeProvider>
    );
  }
}

export default MyForm;
