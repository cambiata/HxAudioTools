package;

import audiotools.Wav16DSP;
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
		var w1 = Wav16Mono.fromFile('../assets/audio/mono/sample.wav');
		var w2 = Wav16Mono.fromFile('../assets/audio/mono/leadvox.wav');
		var w3 = new Wav16Mono(Wav16DSP.dspMix(w1.ints, w2.ints));
		w3.saveFile('MixWavNekoResult.wav');		
		trace('Wave files mixed together, and saved as "MixWavNekoResult.wav"');
	}
	
}