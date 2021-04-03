import VideoProvider from './video-provider.js';
/**
 * Video Manager for Camera Modal
 */
class ModalVideoManager {
    constructor (canvas) {
        this._videoProvider = new VideoProvider();

        this._frameTimeout = 16;

        this._canvas = canvas;
        // These values are double the stage dimensions so that the resulting
        // image does not have to get sized down to accomodate double resolution
        this._canvasWidth = 960; // Double Stage Width
        this._canvasHeight = 720; // Double Stage Height
    }

    enableVideo (onPermissionSuccess, onVideoLoaded) {
        const thisContext = this;
        this._videoProvider.enableVideo(onVideoLoaded).then(() => {
            if (onPermissionSuccess) onPermissionSuccess();
            const ctx = thisContext._canvas.getContext('2d');
            ctx.scale(-1, 1);
            ctx.translate(thisContext._canvasWidth * -1, 0);

            if (onVideoLoaded) {
                thisContext._videoProvider.video.onloadeddata = () => {
                    onVideoLoaded();
                };
            }

            thisContext._drawFrames();
        });
    }

    _drawFrames () {
        const video = this._videoProvider.video;
        this._videoFeedInterval = setInterval(() => {
            let ctx = this._canvas.getContext('2d');
            ctx.drawImage(video,
                // source x, y, width, height
                0, 0, video.videoWidth, video.videoHeight,
                // dest x, y, width, height
                0, 0, this._canvasWidth, this._canvasHeight
            )
            let image = ctx.getImageData(0, 0, this._canvasWidth, this._canvasHeight)
            let data = image.data;
            let newColor = {r:0 ,g:0 ,b:0, a:0};

            for (let i = 0; i < data.length; i += 4) {
                let r = data[i], g = data[i+1], b = data[i+2];
            
                // If its white then change it
                if(r >= 128 && g >= 128 && b >= 128){ 
                    // Change the white to whatever.
                    data[i] = newColor.r;
                    data[i+1] = newColor.g;
                    data[i+2] = newColor.b;
                    data[i+3] = newColor.a;
                }
            }
            ctx.putImageData(image,0,0);
            //console.log(data);
        }, this._frameTimeout);
    }

    takeSnapshot () {
        clearInterval(this._videoFeedInterval);
        return this._canvas.toDataURL('image/png');
    }

    clearSnapshot () {
        this._drawFrames();
    }

    disableVideo () {
        this._videoProvider.disableVideo();
    }
}

export default ModalVideoManager;
