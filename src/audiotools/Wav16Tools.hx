package audiotools;
import format.wav.Data.WAVEHeader;
import haxe.io.Bytes;

/**
 * NewClass
 * @author Jonas Nyström
 */
class Wav16Tools 
{
	
	static  inline function inRange(val: Int, min:Int, max:Int):Bool return (val >= min && val <= max);
	
	static public function bytesToInts(wavData:Bytes): WavInts
	{
		var length = Std.int((wavData.length - (wavData.length % 2)) / 2);
		var result:WavInts = [];
		for (i in 0...length) {
			var pos = i * 2;
			var left = wavData.get(pos);
			var right = wavData.get(pos + 1);
			var val = ucharsToShort(right, left);
			result.push(val);
		}		
		return result;
	}	
	
	static public function intsToMono16Bytes(ints:WavInts):Bytes
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
	
	static public function ucharsToShort(ucharLeft:Int, ucharRight:Int):Int
	{
		if (ucharLeft < 0) ucharLeft += 256;
		if (ucharRight < 0) ucharLeft += 256;
		if (! Wav16Tools.inRange(ucharLeft, 0, 255)) throw 'ConversionTools: range error  ucharLeft: $ucharLeft';
		if (! Wav16Tools.inRange(ucharRight, 0, 255)) throw 'ConversionTools: range error ucharRight: $ucharRight';
		var negative:Bool = (ucharLeft & 128 == 128);
		var result = (! negative) ? (ucharLeft << 8) + ucharRight: -32768 + (((ucharLeft - 128) << 8) + ucharRight);
		return result;
	}		
	
	inline static public function shortToUChars(short:Int):Array<Int>
	{
		if (! inRange(short, -32767, 32767)) short = 32767; // throw 'ConversionTools: range error: $short';
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
	
	static public function createHeader(channels:Int=1, samplingRate:Int=44100, bitsPerSample:Int=16):WAVEHeader
	{
		return {
			format : format.wav.Data.WAVEFormat.WF_PCM,
			channels : channels,
			samplingRate : samplingRate,
			byteRate : Std.int(samplingRate * channels * bitsPerSample / 8),
			blockAlign : Std.int(channels * bitsPerSample / 8),
			bitsPerSample : bitsPerSample,			
		}
	}		
	
	static public function mix(w1:Wav16Mono, w2:Wav16Mono): Wav16Mono
	{
		var result:WavInts = [];
		for (pos in 0...w1.ints.length)
		{
			var v1 = w1.ints[pos];
			var v2 = w2.ints[pos];
			var v3 = Math.floor((v1 + v2) / 2);
			result.push(v3);
		}
		return new Wav16Mono(result);
	}	
}