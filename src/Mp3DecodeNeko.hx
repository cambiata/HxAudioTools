package;

import audiotools.utils.Mp3Decoder;
import audiotools.utils.Mp3Wav16Decoder;
import neko.Lib;
import sys.io.File;

/**
 * ...
 * @author Jonas Nyström
 */

class Mp3DecodeNeko 
{	
	static function main() 
	{
		/*
		new Mp3Decoder('sample.mp3').setConvertedHandler(function(bytes, mp3filename) {
			trace([bytes.length, mp3filename]);
			File.saveBytes('SampleNekoDecoded.wav', bytes);
		}).execute();		
		*/
		
		new Mp3Wav16Decoder('sample.mp3').setDecodedHandler(function(wav16, filename) {
			trace(Type.getClassName(Type.getClass(wav16)));
			trace(wav16.ints.length);
		}).execute(); 
	}
	
}