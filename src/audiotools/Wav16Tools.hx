package audiotools;


import format.wav.Data.WAVEHeader;
import haxe.ds.Vector;
import haxe.io.Bytes;
import haxe.io.BytesData;

/**
 * NewClass
 * @author Jonas Nyström
 */
class Wav16Tools 
{
	static  inline function inRange(val: Int, min:Int, max:Int):Bool return (val >= min && val <= max);
	
	static public function monoBytesToInts(wavData:Bytes, stripWavfileHeader:Bool=true): Vector<Int>
	{
		var start = (stripWavfileHeader) ? 44 : 0;
		var length = Std.int((wavData.length - (wavData.length % 2)) / 2) - start;
		var result:Vector<Int> = new Vector<Int>(length);
		for (i in 0...length) {
			var pos = i * 2;
			var left = wavData.get(pos + start);
			var right = wavData.get(pos + start + 1);
			var val = ucharsToShort(right, left);
			result.set(i, val);
		}				
		return result;
	}	
	
	static public function stereoToInts(wavData:Bytes, stripWavfileHeader:Bool=true): Array<Vector<Int>>
	{		
		var start = (stripWavfileHeader) ? 44 : 0;
		var wavDataLength = wavData.length - start;
		var length = Std.int((wavDataLength - (wavDataLength % 2)) / 4)  ;		
		var resultLeft:Vector<Int> = new Vector<Int>(length);
		var resultRight:Vector<Int> = new Vector<Int>(length);
		var setpos = 0;
		for (i in 0...length*2) {
			var pos = i * 2;
			var left = wavData.get(pos + start);
			var right = wavData.get(pos + start + 1);
			var val = ucharsToShort(right, left);
			if (i % 2 == 0) 
				resultLeft.set(setpos, val);
			else {
				resultRight.set(setpos, val);				
				setpos++;
			}
		}		
		return [resultLeft, resultRight];
	}		
	
	static public function intsToMono16Bytes(ints:Vector<Int>):Bytes
	{
		var result:Bytes = Bytes.alloc(ints.length * 2);
		var pos = 0;
		for (v in ints)
		{
			var a = shortToUChars(v);
			result.set(pos++, a[1]);
			result.set(pos++, a[0]);
		}
		return result;
	}	
	
	static public function intsToStero16Bytes(leftInts:Vector<Int>, rightInts:Vector<Int>):Bytes
	{
		if (leftInts.length != rightInts.length) throw "Left and Right ints lengths differ!";
		var result:Bytes = Bytes.alloc(leftInts.length * 2 * 2);
		var pos = 0;
		for (i in 0...leftInts.length)
		{
			var v = leftInts.get(i);
			var a = shortToUChars(v);
			result.set(pos++, a[1]);
			result.set(pos++, a[0]);
			
			var v = rightInts.get(i);
			var a = shortToUChars(v);
			result.set(pos++, a[1]);
			result.set(pos++, a[0]);			
		}
		return result;
	}		
	
	static public function ucharsToShort(ucharLeft:Int, ucharRight:Int):Int
	{
		if (ucharLeft < 0) ucharLeft += 256;
		if (ucharRight < 0) ucharLeft += 256;
		if (! Wav16Tools.inRange(ucharLeft, 0, 255)) throw 'Range error  ucharLeft: $ucharLeft';
		if (! Wav16Tools.inRange(ucharRight, 0, 255)) throw 'Range error ucharRight: $ucharRight';
		var negative:Bool = (ucharLeft & 128 == 128);
		var result = (! negative) ? (ucharLeft << 8) + ucharRight: -32768 + (((ucharLeft - 128) << 8) + ucharRight);
		return result;
	}		
	
	inline static public function shortToUChars(short:Int):Array<Int>
	{
		if (! inRange(short, -32767, 32767)) {
			trace('Range error: $short');
			return [0, 0]; // throw 
		}
		var result = [0, 0];
		if  (short >= 0)
		{
			result = [(short ^ 255) >> 8, (short & 255)] ;	
		} else {
			var i2 = 32768 + short;
			result = [(i2 >> 8) | 128, i2 & 255];
		}
		return result;
	}
	
	static public function createHeader(stereo:Bool=false, samplingRate:Int=44100, bitsPerSample:Int=16):WAVEHeader
	{
		var channels = (stereo) ? 2 : 1;
		return {
			format : format.wav.Data.WAVEFormat.WF_PCM,
			channels : channels,
			samplingRate : samplingRate,
			byteRate : Std.int(samplingRate * channels * bitsPerSample / 8),
			blockAlign : Std.int(channels * bitsPerSample / 8),
			bitsPerSample : bitsPerSample,			
		}
	}		
	
	static public function getWaveformSamples(ints:Vector<Int>, nrOfSamples:Int, sampleAcc:Int=100): Array<Float>
	{				
		var windowSize = Math.floor(ints.length / nrOfSamples+1);
		var result: Array<Float> = [];
		for (i in 0...nrOfSamples)
		{
			var start = i * windowSize;
			var end = Std.int(Math.min(start + sampleAcc, ints.length-1));
			var maxlevel = 0.0;
			for (j in start...end)
			{						
				var level = Math.abs(ints.get(j)) / 32767;					
				if (level < 0.0001) level = 0;		
				if (j > ints.length) level = 0;
				maxlevel = Math.max(level, maxlevel);				
			}
			var sqr = Math.sqrt(maxlevel);
			result.push(sqr);
		}
		return result;
	}
	
	
	//static var SAMPLERATE:Int = #if flash 44100 #end #if js 48000 #end ;		
	static var SAMPLERATE:Int = #if js  48000 #else 48000 #end ;		
	
	static public function toSecs(samples:Int) return samples / SAMPLERATE;
	static public function toSamples(secs:Float) return Std.int(secs * SAMPLERATE);
	
	static public inline function copyChannel(ints:Vector<Int>): Vector<Int> {
		var result = new Vector<Int>(ints.length);
		for (i in 0...ints.length) result.set(i, ints.get(i));
		return result;
	}	
	
	
	static public function testplay(wav16:Wav16) {
		#if flash
			audiotools.flash.FlashAudioTools.testplay(wav16);
			return;
		#end
		#if js
			audiotools.webaudio.WATools.testplay(wav16);
			return;
		#end
		#if sys
			trace('Wav16Tools.testplay() not implemented - saves file to disk as "testfile.wav" instead');
			wav16.saveFile('testfile.wav');
			return;
		#end
	}
	
}