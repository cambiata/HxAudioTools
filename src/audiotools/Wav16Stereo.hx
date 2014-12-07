package audiotools;
import audiotools.WavInts;
import haxe.io.Bytes;

/**
 * Wav16Stereo
 * @author Jonas Nyström
 */
class Wav16Stereo extends Wav16
{
	public var rightInts(default, null):WavInts;
	
	public function new(leftInts:WavInts, rightInts:WavInts) {
		this.rightInts = rightInts;
		super(leftInts);
	}
	
	static public function fromBytes(wavData:Bytes) {
		
		var intsArray = Wav16Tools.stereoToInts(wavData);
		return new Wav16Stereo(intsArray[0], intsArray[1]);
	}
	
}