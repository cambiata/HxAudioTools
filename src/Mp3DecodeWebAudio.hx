package;

import audiotools.utils.Mp3Decoder;
import audiotools.utils.Mp3Wav16Decoder;
import audiotools.Wav16Tools;
import audiotools.webaudio.Mp3ToBuffer;
import haxe.ds.Vector;
import haxe.io.Bytes;
import haxe.Json;
import js.Browser;
import js.html.audio.AudioBuffer;
import js.html.audio.AudioContext;
import js.html.Float32Array;
import js.Lib;

/**
 * ...
 * @author Jonas Nyström
 */

class Mp3DecodeWebAudio 
{
	static function main() 
	{
		var context = new AudioContext();
		/*
		new Mp3Decoder('sample.mp3').setConvertedHandler(function(bytes:Bytes, mp3filename:String) {
			trace(bytes.length);
			trace(mp3filename);			
		}).setContext(context)
		.execute();			
		*/
		
		new Mp3Wav16Decoder('sample.mp3').setConvertedHandler(function(wav16, filename) {
			trace(Type.getClassName(Type.getClass(wav16)));
			trace(wav16.ints.length);
		})
		.setContext(context)
		.execute(); 			
		
	}
}


