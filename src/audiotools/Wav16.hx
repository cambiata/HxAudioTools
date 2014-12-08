package audiotools;
import haxe.ds.Vector;

/**
 * Wav16
 * @author Jonas Nyström
 */
class Wav16 
{

	public var ints(default, null):Vector<Int>;
	
	public function new(ints:Vector<Int>) {
		this.ints = ints;
	}
	
}