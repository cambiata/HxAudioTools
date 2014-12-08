package;

import audiotools.utils.Mp3Decoder;
import audiotools.utils.Mp3Wav16Decoder;
import audiotools.utils.Mp3Wav16Decoders;
import audiotools.Wav16;
import audiotools.Wav16DSP;
import audiotools.Wav16Mono;
import audiotools.Wav16Stereo;
import audiotools.Wav16Tools;
import audiotools.webaudio.Mp3ToBuffer;
import audiotools.webaudio.utils.WebAudioTools;
import audiotools.webaudio.utils.Wav16Canvas;
import haxe.ds.Vector;
import haxe.io.Bytes;
import haxe.Json;
import js.Browser;
import js.html.ArrayBuffer;
import js.html.audio.AudioBuffer;
import js.html.audio.AudioContext;
import js.html.CanvasElement;
import js.html.CanvasRenderingContext2D;
import js.html.Float32Array;
import js.Lib;

using audiotools.Wav16DSP;

/**
 * ...
 * @author Jonas Nyström
 */

class Mp3DecodeWebAudio 
{
	static function main() 
	{
		
		var context = WebAudioTools.getAudioContext();
		
		var decoders = new Mp3Wav16Decoders(['sample.mp3', 'leadvox.mp3'], context);		
		decoders.allDecoded = function(decodedFiles:Map<String, Wav16>) {
			for (filename in decodedFiles.keys()) {
				var canvas = createElements(filename);
				var wav16 = decodedFiles.get(filename);
				Wav16Canvas.drawWave(canvas, wav16, 400, 100);						
				trace(wav16.ints.length);				
			}				
			var w0 = cast(decodedFiles.get('sample.mp3'), Wav16Stereo);
			var w1 = cast(decodedFiles.get('leadvox.mp3'), Wav16Mono);			
			w0.leftInts.dspMix(w1.ints).dspReverse();			
			var w3 = new Wav16Stereo(w0.leftInts.dspMix(w1.ints).dspReverse(),  w0.rightInts.dspMix(w1.ints).dspReverse());
			
			var canvas = createElements('decoded PCM data, mixed and reversed');
			Wav16Canvas.drawWave(canvas, w3, 400, 100);
			
			var source = context.createBufferSource();
			source.buffer = WebAudioTools.createBufferFromWav16(w3, context);
			source.connect(context.destination, 0, 0);				
			source.start(0);		
			
		}		
		decoders.startDecoding();		
	}
	
	static function createElements(filename:String):CanvasElement {
		var par = Browser.document.createParagraphElement();
		par.innerHTML = filename;				
		Browser.document.body.appendChild(par);
		var canvas = Browser.document.createCanvasElement();
		canvas.setAttribute('width', '400px');
		canvas.setAttribute('height', '100px');
		Browser.document.body.appendChild(canvas);	
		Browser.document.body.appendChild(Browser.document.createBRElement());				
		return canvas;		
	}
	

	
}


