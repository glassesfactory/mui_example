const MAX = 1024;

class ImageUtil {
  'use strict';
  /*
   file インスタンスから画像をリサイズする
   Promise を返す。
  */
  static resizeFile(file, max){
    return new Promise((resolve, reject)=>{
      if(file.type.indexOf("image") < 0){
        // resolve?
        // not image.
        resolve(file);
        return;
      }

      if(!max){
        max = MAX;
      }
      // file インスタンスのバイナリから画像を読み込む
      let fr = new FileReader();
      fr.onload = (event)=> {
        let img = new Image();
        img.src = event.target.result;
        // 縦横どちらも max 値以下なら何もせずに終了
        if(img.naturalWidth < max && img.naturalHeight < max){
          resolve(file);
          return
        }
        let rect = ImageUtil.getMaxRect(img, max);
        let canvas = ImageUtil.img2Canvas(img, rect);
        let blob = ImageUtil.canvas2Blob(canvas, file.type);
        blob.name = file.name;
        blob.lastModified = file.lastModified;
        resolve(blob);
      };
      fr.onerror = ()=>{
        reject();
      }
      fr.readAsDataURL(file);
    });
  }

  //Image(imgタグ)を canvas に変換する
  static img2Canvas(img, rect){
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    //この時リサイズ
    canvas.width = rect.w;
    canvas.height = rect.h;
    ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, rect.w, rect.h);
    document.body.appendChild(canvas);
    return canvas;
  }

  // max 値に基づいてリサイズ
  static getMaxRect(img, max){
    let scale = 0;
    let destH = 0;
    let destW = 0;
    if(img.naturalWidth < img.naturalHeight){
      scale = max / img.naturalHeight;
      destH = max;
      destW = img.naturalWidth * scale;
    } else {
      scale = max / img.naturalWidth;
      destW = max;
      destH = img.naturalHeight * scale;
    }
    return {x: 0, y:0, w: destW, h: destH};
  }

  // canvas を blob に変換する
  static canvas2Blob(canvas, fileType){
    let base64 = canvas.toDataURL(fileType);
    let bin = atob(base64.replace(/^.*,/, ''));
    let buffer = new Uint8Array(bin.length);
    for(let i = 0; i < bin.length; i++){
      buffer[i] = bin.charCodeAt(i);
    }
    return new Blob([buffer.buffer], {type: fileType});
  }
}


export default ImageUtil;
