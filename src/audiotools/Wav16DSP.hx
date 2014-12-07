package audiotools;

/**
 * Wav16DSP
 * @author Jonas Nyström
 */
class Wav16DSP 
{

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