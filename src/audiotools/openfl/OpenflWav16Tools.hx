package audiotools.openfl;
import audiotools.openfl.utils.ByteArrayTools;
import audiotools.Wav16Tools;
import format.wav.Writer;
import haxe.ds.Vector;
import haxe.io.Bytes;
import haxe.io.BytesData;
import flash.utils.ByteArray;
import format.wav.*;
import haxe.io.BytesOutput;


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
		
		var data  = Wav16Tools.intsToStero16Bytes(leftInts, rightInts);
		
		// add header
		/*
		var header = Wav16Tools.createHeader((rightInts != null));		
		var bytesOutput = new BytesOutput();		
		new Writer(bytesOutput).write({ header: header, data: data });				//new Writer(File.write(filename, true)).write({ header: header, data: data });		
		var bytes = bytesOutput.getBytes();		
		*/
		
		return ByteArrayTools.fromBytes(data);
	}
}

