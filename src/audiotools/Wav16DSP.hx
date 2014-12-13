package audiotools;
import haxe.ds.Vector;

/**
 * Wav16DSP
 * @author Jonas Nyström
 */

class Wav16DSP 
{
	static public function wspMix(w1:Wav16, w2:Wav16, mixVol:Float = 1.0, w1vol:Float = 1.0, w2vol:Float = 1.0) {				
		var stereo = (w1.stereo || w2.stereo);
		if (stereo && !w1.stereo) w1.toStereo(); // = Wav16Tools.toStereo(w1);
		if (stereo && !w2.stereo) w2.toStereo(); //= Wav16Tools.toStereo(w2);
		
		var resultCh1 = dspMix(w1.ch1, w2.ch1, mixVol, w1vol, w2vol);
		var resultCh2:Vector<Int> = null;
		if (stereo) resultCh2 = dspMix(w1.ch2, w2.ch2, mixVol, w1vol, w2vol);		
		return new Wav16(resultCh1, resultCh2);
	}
	
	static public function wspMixInto(w1:Wav16, w2:Wav16, offset:Int = 0, w2Vol:Float=1.0) {		
		if (w1.stereo != w2.stereo) {
			w1.toStereo();// = Wav16Tools.toStereo(w1);
			w2.toStereo(); // = Wav16Tools.toStereo(w2);
		}
		dspMixInto(w1.ch1, w2.ch1, offset, w2Vol);
		if (w1.stereo) dspMixInto(w1.ch2, w2.ch2);		
		//return w1;
	}

	//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	
	static public function dspMix(w1:Vector<Int>, w2:Vector<Int>, mixVol:Float=1.0, w1vol:Float=1.0, w2vol:Float=1.0): Vector<Int>
	{	
		
		var result:Vector<Int> = new Vector<Int>(w1.length);
		for (pos in 0...w1.length)
		{			
			var v1 = w1.get(pos) * w1vol;
			var v2 = w2.get(pos) * w2vol;
			var v3 = Math.floor((v1 + v2) / mixVol);
			result.set(pos, v3);			
		}
		return result;
	}	
	
	static public function dspMixInto(w1:Vector<Int>, w2:Vector<Int>, offset:Int = 0, w2vol:Float=1.0) {		
		if (offset + w2.length > w1.length) throw "mixinto error";		
		for (i in 0...w2.length) {
			var val1 = w1.get(offset + i);
			var val2 =  Std.int(w2.get(i) * w2vol);
			var val3 = val1 + val2;
			w1.set(offset + i, val3);	
		}
	}
	
	static public function dspFadeIn(ints:Vector<Int>, length:Int, startLevel:Float=0.0):Vector<Int>
	{		
		var result =  new Vector<Int>(ints.length);
		var length = Std.int(Math.min(length, ints.length));
		for (pos in 0...length) {
			var int = ints[pos];
			var delta = interpolate(pos / length, startLevel, 1);
			var newInt = Std.int(int * delta);
			result.set(pos, newInt);
		}

		if (length < ints.length)
			for (pos in length+1...ints.length)
				result.set(pos, ints[pos]);
				
		return result;
	}
	
	static public function dspFadeOut(ints:Vector<Int>, length:Int, endLevel:Float=0.0):Vector<Int>
	{		
		var result =  new Vector<Int>(ints.length);
		var length = Std.int(Math.min(length, ints.length));
		var startPos = ints.length - length;
		if (startPos > 0)
			for (pos in 0...startPos-1)
				result.set(pos, ints[pos]);
		
		for (pos in startPos...ints.length) {
			var int = ints[pos];
			var delta = interpolate((pos - startPos) / length, 1, endLevel);
			var newInt = Std.int(int * delta);
			result.set(pos, newInt);
		}
			
		return result;
	}	
	
	static public function dspReverse(ints:Vector<Int>): Vector<Int> 
	{
		var result =  new Vector<Int>(ints.length);
		var len = ints.length-1;
		for (i in 0...ints.length) result.set(i,  ints[len - i]); // result.push();
		return result;
	}
	
	
	inline static function interpolate(f : Float, a : Float, b : Float) return (b - a) * f + a;	
	
}