package;

import audiotools.Wav16Mono;
import audiotools.Wav16Tools;
import format.wav.Data.WAVE;
import format.wav.Reader;
import format.wav.Writer;
import haxe.io.BytesInput;
import haxe.io.BytesOutput;
import haxe.macro.Format;
import neko.Lib;
import sys.io.File;

/**
 * ...
 * @author Jonas Nyström
 */

class NekoMixWav 
{
	
	static function main() 
	{			
		var w1 = Wav16Mono.fromFile('../audio/mono/sample.wav');
		var w2 = Wav16Mono.fromFile('../audio/mono/leadvox.wav');
		var w3 = Wav16Tools.mix(w1, w2);
		w3.saveFile('mix2.wav');		
	}
	
}