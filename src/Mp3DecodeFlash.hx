package;

import audiotools.openfl.utils.ByteArrayTools;
import audiotools.utils.Mp3Decoder;
import audiotools.utils.Mp3Wav16Decoder;
import flash.display.StageAlign;
import flash.display.StageScaleMode;
import flash.Lib;
import flash.media.Sound;
import flash.net.FileReference;

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
		
		/*
		new Mp3Decoder('../assets/audio/stereo/sample.mp3').setConvertedHandler(function(bytes, mp3filename) {
			trace([bytes.length, mp3filename]);
			new FileReference().save(ByteArrayTools.fromBytes(bytes), 'SampleFlashDecoded.wav');
		}).execute();	
		*/
		
		new Mp3Wav16Decoder('sample.mp3').setConvertedHandler(function(wav16, filename) {
			trace(Type.getClassName(Type.getClass(wav16)));
			trace(wav16.ints.length);
		}).execute(); 		
		
		
	}
	
}