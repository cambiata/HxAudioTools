package audiotools;
import haxe.ds.Vector;
import haxe.io.Bytes;

/**
 * Wav16Stereo
 * @author Jonas Nyström
 */
class Wav16Stereo extends Wav16
{
	public var rightInts(default, null):Vector<Int>;
	public var leftInts(get, null):Vector<Int>;
	function get_leftInts() return this.ints;
	
	public function new(leftInts:Vector<Int>, rightInts:Vector<Int>) {
		this.rightInts = rightInts;
		super(leftInts);
	}
	
	static public function fromBytes(wavData:Bytes, stripHeader:Bool=true) {
		
		var intsArray = Wav16Tools.stereoToInts(wavData, stripHeader);
		return new Wav16Stereo(intsArray[0], intsArray[1]);
	}
	
}