package audiotools.webaudio.utils;
import audiotools.Wav16;
import js.html.audio.AudioBuffer;
import js.html.audio.AudioContext;
import js.html.Float32Array;

/**
 * AudioBufferUtils
 * @author Jonas Nyström
 */
class WebAudioTools 
{
	static public function createBufferFromWav16(wav16:Wav16, context:AudioContext):AudioBuffer {
		
		var stereo = wav16.stereo;		
		var length = wav16.ch1.length;
		
		var left:Float32Array = new Float32Array(length);
		var pos = 0;
		for (int in wav16.ch1) {
			left[pos] = int / 32767;
			pos++;
		}		
		
		var right:Float32Array = null;
		if (stereo) {
			right = new Float32Array(length);
			var pos = 0;
			for (int in wav16.ch2) {
				right[pos] = int / 32767;
				pos++;
			}			
		}
		
		var newbuffer:AudioBuffer = null;
		
		if (stereo) {
			newbuffer = context.createBuffer(2, left.length, 44100);
			newbuffer.getChannelData(0).set(left);
			newbuffer.getChannelData(1).set(right);			
		} else {
			newbuffer = context.createBuffer(1, left.length, 44100);
			newbuffer.getChannelData(0).set(left);			
		}
		
		return newbuffer;
		
	}
	
	static public function getAudioContext():AudioContext
	{
		var context:AudioContext = null;
		untyped __js__ ('
			if (typeof AudioContext == "function") {
				context = new AudioContext();
				console.log("USING STANDARD WEB AUDIO API");
				//alert("Standard Web Audio Api");
			} else if ((typeof webkitAudioContext == "function") || (typeof webkitAudioContext == "object")) {
				context = new webkitAudioContext();
				console.log("USING WEBKIT AUDIO API");
				//alert("Using Webkit Web Audio Api");
			} else {
				alert("AudioContext is not supported.");
				throw new Error("AudioContext is not supported. :(");
			}
		');
		return context;
	}	
	

}