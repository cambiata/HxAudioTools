package audiotools;
import format.wav.Reader;
import format.wav.Writer;
import haxe.io.Bytes;
import haxe.io.BytesInput;
#if (sys)
import sys.io.File;
#end

/**
 * WavData16Mono
 * @author Jonas Nyström
 */
class Wav16Mono extends Wav16
{
	
	static public function fromBytes(wavData:Bytes, stripHeader:Bool=true) return new Wav16Mono(Wav16Tools.monoBytesToInts(wavData, stripHeader));
	
	#if (sys)
	static public function fromFile(filename:String) {
		return fromBytes(new Reader(new BytesInput(File.getBytes(filename))).read().data);		
	}
	
	public function saveFile(filename:String) {
		var header = Wav16Tools.createHeader();
		var data = Wav16Tools.intsToMono16Bytes(this.ints);				
		new Writer(File.write(filename, true)).write({ header: header, data: data });		
	}
	#end	
	
	
	
}