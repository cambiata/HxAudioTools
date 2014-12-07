package audiotools;

/**
 * Wav16DSP
 * @author Jonas Nyström
 */
class Wav16DSP 
{

	static public function dspMix(w1:WavInts, w2:WavInts): WavInts
	{
		var result:WavInts = [];
		for (pos in 0...w1.length)
		{
			var v1 = w1[pos];
			var v2 = w2[pos];
			var v3 = Math.floor((v1 + v2) / 2);
			result.push(v3);
		}
		return result;
	}	
	
	static public function dspFadeIn(ints:WavInts, length:Int, startLevel:Float=0.0):WavInts
	{		
		var result = new WavInts();
		var length = Std.int(Math.min(length, ints.length));
		for (pos in 0...length)
		{
			var int = ints[pos];
			var delta = interpolate(pos / length, startLevel, 1);
			var newInt = Std.int(int * delta);
			result.push(newInt);
		}

		if (length < ints.length)
			for (pos in length+1...ints.length)
			{
				result.push(ints[pos]);
			}
			
		return result;
	}
	
	static public function dspFadeOut(ints:WavInts, length:Int, endLevel:Float=0.0):WavInts
	{		
		var result = new WavInts();
		var length = Std.int(Math.min(length, ints.length));
		var startPos = ints.length - length;
		if (startPos > 0)
			for (pos in 0...startPos-1)
			{
				result.push(ints[pos]);
			}
		
		for (pos in startPos...ints.length)
		{
			var int = ints[pos];
			var delta = interpolate((pos - startPos) / length, 1, endLevel);
			var newInt = Std.int(int * delta);
			result.push(newInt);
		}
			
		return result;
	}	
	
	static public function dspReverse(ints:WavInts): WavInts 
	{
		var result = new WavInts();
		var len = ints.length-1;
		for (i in 0...ints.length) result.push(ints[len - i]);
		return result;
	}
	
	
	inline static function interpolate(f : Float, a : Float, b : Float) return (b - a) * f + a;	
	
}