package audiotools.webaudio;
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
	static public function createBufferFromWav16(wav16:Wav16, context:AudioContext, samplerate:Int=44100):AudioBuffer {
		
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
			newbuffer = context.createBuffer(2, left.length, samplerate);
			newbuffer.getChannelData(0).set(left);
			newbuffer.getChannelData(1).set(right);			
		} else {
			newbuffer = context.createBuffer(1, left.length, samplerate);
			newbuffer.getChannelData(0).set(left);			
		}
		
		return newbuffer;
		
	}
	
	static public function testplay(w:Wav16, context:AudioContext = null) {
		if (context == null) context = WebAudioTools.getAudioContext();
		var source = context.createBufferSource();		
		source.buffer = WebAudioTools.createBufferFromWav16(w, context, 48000); // STRANGE! 48000???
		source.connect(context.destination, 0, 0);				
		source.start(0);			
	}
	
	static var _context:AudioContext;
	
	static public function getAudioContext():AudioContext {
		if (_context == null) _context = createAudioContext();
		return _context;		
	}	
	
	static public function createAudioContext():AudioContext
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