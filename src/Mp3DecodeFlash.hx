package;

import audio.flash.SoundTools;
import audiotools.openfl.OpenflWav16Tools;
import audiotools.openfl.ui.WavSprite;
import audiotools.openfl.utils.ByteArrayTools;
import audiotools.utils.Mp3Decoder;
import audiotools.utils.Mp3Wav16Decoder;
import audiotools.utils.Mp3Wav16Decoders;
import audiotools.Wav16;
import audiotools.Wav16Mono;
import audiotools.Wav16Stereo;
import flash.display.StageAlign;
import flash.display.StageScaleMode;
import flash.Lib;
import flash.media.Sound;
import flash.net.FileReference;
using audiotools.Wav16DSP;
/**
 * ...
 * @author Jonas Nyström
 */

class Mp3DecodeFlash 
{
	
	static function main() 
	{
		var stage = Lib.current.stage;
		stage.scaleMode = StageScaleMode.NO_SCALE;
		stage.align = StageAlign.TOP_LEFT;
		
		var decoders = new Mp3Wav16Decoders(['sample.mp3', 'leadvox.mp3']);		
		decoders.allDecoded = function(decodedFiles:Map<String, Wav16>) {
			var i = 0;
			for (filename in decodedFiles.keys()) {				
				var wav16 = decodedFiles.get(filename);				
				var ws = new WavSprite(wav16, 0, 0, 0xaa0000);
				ws.y = 120 * i + 20; ws.x = 20;
				Lib.current.addChild(ws);								
				trace(wav16.ints.length);				
				i++;
			}				
			
			var w0 = cast(decodedFiles.get('sample.mp3'), Wav16Stereo);
			var w1 = cast(decodedFiles.get('leadvox.mp3'), Wav16Stereo);			
			w0.leftInts.dspMix(w1.ints).dspReverse();			
			var wMixedReverse = new Wav16Stereo(w0.leftInts.dspMix(w1.leftInts).dspReverse(),  w0.rightInts.dspMix(w1.rightInts).dspReverse());
			var ws = new WavSprite(wMixedReverse, 0, 0, 0x0000aa, 0x0000aa);
			ws.y = 120 * 2 + 20; ws.x = 20;
			Lib.current.addChild(ws);	
			
			SoundTools.buildSound(OpenflWav16Tools.intsToStereo16ByteArray(wMixedReverse.leftInts, wMixedReverse.rightInts), SoundTools.stereo16format(wMixedReverse.ints.length), function(sound) {
				sound.play(0);
			});
			
		}		
		decoders.startDecoding();				
		
		
		
	}
	
}