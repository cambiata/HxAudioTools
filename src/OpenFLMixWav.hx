package;

import audiotools.openfl.OpenflWav16Tools;
import audiotools.openfl.ui.WavSprite;
import audiotools.utils.BytesLoader;
import audiotools.utils.BytesLoaders;
import audiotools.utils.Mp3Wav16Decoder;
import audiotools.Wav16;
import audiotools.Wav16DSP;
import audiotools.Wav16Tools;
import haxe.io.Bytes;
import openfl.display.Sprite;
import openfl.Lib;
import openfl.media.Sound;

using audiotools.Wav16DSP;


/**
 * ...
 * @author Jonas Nyström
 */

class OpenFLMixWav extends Sprite 
{
	public function new() 
	{
		super();
				
		new BytesLoaders(['assets/audio/mono/sample.wav', 'assets/audio/mono/leadvox.wav']).setOnLoaded(function(loadedBytes:Map<String, Bytes>) {
			var aBytes = Lambda.array(loadedBytes);
			var w1 = Wav16.fromFileBytes(aBytes[0]);
			var w2 = Wav16.fromFileBytes(aBytes[1]);
			var w3 = new Wav16(Wav16DSP.dspMix(w1.ch1, w2.ch1).dspReverse());	
			
			var ws1 = new WavSprite(w1, 0, 0, 0xaa0000);
			ws1.y = 20; ws1.x = 20;
			this.addChild(ws1);

			var ws2 = new WavSprite(w2, 0, 0, 0x0000aa);
			ws2.y = 140; ws2.x = 20;
			this.addChild(ws2);
			
			var ws3 = new WavSprite(w3, 0, 0, 0x00aa00);
			ws3.y = 260; ws3.x = 20;
			this.addChild(ws3);
			
			#if (! html5)
				var sound = new Sound();				
				var soundBytearray = OpenflWav16Tools.intsToMono16ByteArray(w3.ch1);
				sound.loadPCMFromByteArray(soundBytearray, w3.ch1.length, 'short', false);		
				var soundChannel = sound.play();		
			#end
		}).loadBytes();		
		
		new Mp3Wav16Decoder('assets/audio/stereo/sample.mp3').setDecodedHandler(function(wav16, filename) {			
			trace(wav16.ch1.length);			
			var ws1 = new WavSprite(wav16, 0, 0, 0xaa0000);
			ws1.y = 20; ws1.x = 420;
			this.addChild(ws1);			
		})
		.execute(); 		
		
	}
}
