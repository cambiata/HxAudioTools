package examples.mix;

import audiotools.Wav16;
import audiotools.Wav16DSP;
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
		var w1 = Wav16.fromFile('../../assets/audio/mono/sample.wav');
		var w2 = Wav16.fromFile('../../assets/audio/mono/leadvox.wav');
		var w3 = new Wav16(Wav16DSP.dspMix(w1.ch1, w2.ch1));
		w3.saveFile('MixWavNekoResult.wav');		
		trace('Wave files mixed together, and saved as "MixWavNekoResult.wav"');
	}
	
}