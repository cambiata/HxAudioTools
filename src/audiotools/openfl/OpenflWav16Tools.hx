package audiotools.openfl;
import audiotools.openfl.utils.ByteArrayTools;
import audiotools.Wav16Tools;
import haxe.ds.Vector;
import haxe.io.Bytes;
import haxe.io.BytesData;
import flash.utils.ByteArray;



/**
 * Wav16ToolsFlash
 * @author Jonas Nyström
 */
class OpenflWav16Tools 
{

	static public function intsToMono16ByteArray(ints:Vector<Int>):ByteArray  
	{
		return ByteArrayTools.fromBytes(Wav16Tools.intsToMono16Bytes(ints));	
	}
	
	static public function intsToStereo16ByteArray(leftInts:Vector<Int>, rightInts:Vector<Int>):ByteArray {
		return ByteArrayTools.fromBytes(Wav16Tools.intsToStero16Bytes(leftInts, rightInts));
	}
}

