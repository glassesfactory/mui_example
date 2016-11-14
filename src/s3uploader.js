import AWS from 'aws-sdk';

class S3Uploader {
  static initialized = false;

  static setup(config, region){
    AWS.config.update(config);
    if(!region){
      region = "ap-northeast-1";
    }
    AWS.config.region = region;
    S3Uploader.initialized = true;
  }

  static appendixer(){
    return new Date().getTime();
  }

  static img(file, bucketName, dirPath){
    if(!S3Uploader.initialized){
      return
    }
    const bucket = new AWS.S3({params: {Bucket: bucketName}});
    const filename = new Buffer(file.name + S3Uploader.appendixer()).toString('base64');
    const params = {
      Key: dirPath + filename,
      ContentType: file.type,
      Body: file
    };
    return new Promise((resolve, reject)=>{
      bucket.putObject(params, function(err, data){
        if(err != null){
          reject(err);
          return
        }
        console.log(filename);
        const result = {
          data: data,
          filename: filename
        }
        resolve(result);
      });
    });

  }
}


export default S3Uploader;
