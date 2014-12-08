package audiotools.webaudio;


import js.Browser;
import js.html.audio.AudioBuffer;
import js.html.audio.AudioContext;
import js.html.Blob;
import js.html.DOMURL;
import js.html.Float32Array;
import js.html.rtc.MediaStream;
import js.html.XMLHttpRequest;
import js.Lib;

/**
 * Mp3Decoder
 * @author Jonas Nyström
 */
class Mp3ToBuffer {
	var url:String;
	var context:AudioContext;
	public var audioBuffer(default, null):AudioBuffer;	
	public function new(url:String, context:AudioContext) {		
		this.url = url;
		this.context = context;
	}	
	public function load() {
		var request = new XMLHttpRequest();
		request.open('GET', this.url, true);
		request.responseType = "arraybuffer";
		request.onload = function (_) {			
			this.context.decodeAudioData(
				request.response,
				function(buffer) {
					trace("Loaded and decoded track...");		
					this.audioBuffer = buffer;
					this.onLoaded(this.audioBuffer, this.url);
					if (buffer == null) {
						Lib.alert('error decoding file data: ' + url);						
						return false;
					}
					return true;
				},
				function(error) {
					Lib.alert('decodeAudioData error ' + error);		
					return false;
				}
			);	
		}		
		request.onprogress = function (e) {
			if (e.total != 0) {
				//trace(e.loaded);
			}		
		}
		request.onerror = function (e) {
			Lib.alert('BufferLoader: XHR error');
		}		
		request.send();				
	}
	
	dynamic public function onLoaded(audioBuffer:AudioBuffer, filename:String) {
		trace(audioBuffer);
		trace(filename);
	}
	
	public function setLoadedHandler(callbck:AudioBuffer->String->Void) {
		this.onLoaded = callbck;
		return this;
	}
}