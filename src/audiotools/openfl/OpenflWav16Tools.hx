package audiotools.openfl;
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


class ByteArrayTools
{
	static public function toBytes(byteArray:ByteArray):Bytes 
	{
		#if (flash)
			var bytes = Bytes.ofData(byteArray);
		#elseif (html5)
			byteArray.position = 0;
			var arrayBytes = new Array<Int>();
			for (i in 0...byteArray.length) arrayBytes.push(byteArray.readByte());
			var bytes = Bytes.ofData(arrayBytes);
		#else // if neko & cpp
			var bytes:Bytes = byteArray;
		#end
		return bytes;
	}
	
	static public function fromBytes(bytes:Bytes):ByteArray
	{
		#if (flash)	
			var byteArray:ByteArray = bytes.getData(); // entry.data.getData();
		#elseif (html5)
			var bytesData:BytesData = bytes.getData();
			var byteArray:ByteArray = new ByteArray();
			for (i in 0...bytesData.length) byteArray.writeByte(bytesData[i]);
		#else
			var byteArray = ByteArray.fromBytes(bytes);
		#end		
		return byteArray;
	}
	
}