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
	public var leftInts(get, null):WavInts;
	function get_leftInts() return this.ints;
	
	public function new(leftInts:WavInts, rightInts:WavInts) {
		this.rightInts = rightInts;
		super(leftInts);
	}
	
	static public function fromBytes(wavData:Bytes, stripHeader:Bool=true) {
		
		var intsArray = Wav16Tools.stereoToInts(wavData, stripHeader);
		return new Wav16Stereo(intsArray[0], intsArray[1]);
	}
	
}