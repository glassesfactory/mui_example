import React, {PropTypes, Component} from 'react';
import 'whatwg-fetch';
import AWS from 'aws-sdk';

import mui, {TextField, RaisedButton, Drawer} from 'material-ui';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import Signal from '../signal'

import FormProgress from './formprogress'
import Popupper from './popupper'
import Config from '../config.json';

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
    this.state = { bass: bass, completed: 0, open: false };
    this.handleInput = this.handleInput.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.getGeoSuccess = this.getGeoSuccess.bind(this);
    this.handleImageInput = this.handleImageInput.bind(this);
    this.open = this.open.bind(this);
  }

  componentDidMount(){
    Signal.subscribe("add", this.open);
  }

  componentWillUnmount(){
    Signal.unsbscribe("add", this.open);
  }

  open(){
    this.setState({open: !this.state.open});
  }

  handleSubmit(event) {
    // バリデーションする?
    Signal.notify("progress_update", {completed: 10, active: true})
    navigator.geolocation.getCurrentPosition(this.getGeoSuccess, this.getGeoError);
  }

  getGeoSuccess(position){

    let coords = position.coords;
    let bass = this.state.bass;
    bass.latitude = coords.latitude;
    bass.longitude = coords.longitude;

    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
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
    })
  }

  getGeoError(error){
    console.log(error);
  }

  handleInput(event){
    // console.log(event.target.name);
    // console.log(this.state.bass);
    let targetName = event.target.name;
    if (this.state.bass.hasOwnProperty(targetName)) {
      let bass = this.state.bass;
      bass[event.target.name] = event.target.value;
      this.setState(bass: bass);
    }
  }

  handleImageInput(event){
    let file = event.target.files[0];
    AWS.config.update({accessKeyId: Config.s3_key, secretAccessKey: Config.s3_secret});
    AWS.config.region = "ap-northeast-1";
    let bucket = new AWS.S3({params: {Bucket: 'fishmans'}});
    const filename = new Buffer(file.name + new Date().getTime()).toString('base64');
    let params = {
      Key: "image/" + filename,
      ContentType: file.type,
      Body: file
    }
    let _this = this;
    bucket.putObject(params, function(err, data){
      if(err != null){
        console.log("あばばばば", err);
        return
      }
      //
      let src = Config.s3_path + filename;
      let bass = _this.state.bass;
      bass.image = src;
      _this.setState({bass: bass});
      return
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
