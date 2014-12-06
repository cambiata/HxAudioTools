package;

import audiotools.openfl.OpenflWav16Tools;
import audiotools.utils.BytesLoader;
import audiotools.utils.BytesLoaders;
import audiotools.Wav16Mono;
import audiotools.Wav16Tools;
import haxe.io.Bytes;
import openfl.display.Sprite;
import openfl.Lib;
import openfl.media.Sound;

/**
 * ...
 * @author Jonas Nyström
 */

class OpenFLMixWav extends Sprite 
{

	public function new() 
	{
		super();
		
		new BytesLoaders(['assets/audio/mono/sample.data', 'assets/audio/mono/leadvox.data']).setOnLoaded(function(loadedBytes) {
			var aBytes = Lambda.array(loadedBytes);
			var w1 = Wav16Mono.fromBytes(aBytes[0]);
			var w2 = Wav16Mono.fromBytes(aBytes[1]);
			var w3 = Wav16Tools.mix(w1, w2);	
			
			var sound = new Sound();
			var soundBytearray = OpenflWav16Tools.intsToMono16ByteArray(w3.ints);
			sound.loadPCMFromByteArray(soundBytearray, w3.ints.length, 'short', false);		
			var soundChannel = sound.play();			
			
		}).loadBytes();
		
	}
}
