package audiotools.webaudio.utils;
import audiotools.Wav16;
import js.html.audio.AudioBuffer;
import js.html.audio.AudioContext;
import js.html.Float32Array;

/**
 * AudioBufferUtils
 * @author Jonas Nyström
 */
class AudioBufferUtils 
{
	static public function createBufferFromWav16(wav16:Wav16, context:AudioContext):AudioBuffer {
		
		var stereo = Type.getClass(wav16) == Wav16Stereo;		
		var length = wav16.ints.length;
		
		var left:Float32Array = new Float32Array(length);
		var pos = 0;
		for (int in wav16.ints) {
			left[pos] = int / 32767;
			pos++;
		}		
		
		var right:Float32Array = null;
		if (stereo) {
			right = new Float32Array(length);
			var pos = 0;
			for (int in cast(wav16, Wav16Stereo).rightInts) {
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

}