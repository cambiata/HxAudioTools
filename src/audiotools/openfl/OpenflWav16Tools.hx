package audiotools.openfl;
import audiotools.openfl.utils.ByteArrayTools;
import audiotools.Wav16Tools;
import audiotools.WavInts;
import haxe.io.Bytes;
import haxe.io.BytesData;
import openfl.utils.ByteArray;



/**
 * Wav16ToolsFlash
 * @author Jonas Nyström
 */
class OpenflWav16Tools 
{

	static public function intsToMono16ByteArray(ints:WavInts):ByteArray  
	{
		return ByteArrayTools.fromBytes(Wav16Tools.intsToMono16Bytes(ints));	
	}
}

