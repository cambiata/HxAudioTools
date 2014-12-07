package;

import audiotools.openfl.OpenflWav16Tools;
import audiotools.openfl.ui.WavSprite;
import audiotools.utils.BytesLoader;
import audiotools.utils.BytesLoaders;
import audiotools.Wav16DSP;
import audiotools.Wav16Mono;
import audiotools.Wav16Stereo;
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
			var w1 = Wav16Mono.fromBytes(aBytes[0]);
			var w2 = Wav16Mono.fromBytes(aBytes[1]);
			var w3 = new Wav16Mono(Wav16DSP.dspMix(w1.ints, w2.ints).dspReverse());	
			
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
				var soundBytearray = OpenflWav16Tools.intsToMono16ByteArray(w3.ints);
				sound.loadPCMFromByteArray(soundBytearray, w3.ints.length, 'short', false);		
				var soundChannel = sound.play();		
			#end
			
		}).loadBytes();		
		
		/*
		new BytesLoader('assets/audio/stereo/sample.wav').setOnLoaded(function(bytes:Bytes, filename:String) {
			trace('loaded $filename');
			var wStereo = Wav16Stereo.fromBytes(bytes);
			var ws = new WavSprite(wStereo);
			ws.x = 500; ws.y = 20; 
			this.addChild(ws);
		}).loadBytes();
		*/
	}
}
