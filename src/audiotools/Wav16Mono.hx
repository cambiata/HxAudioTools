package audiotools;
import audiotools.WavInts;
import format.wav.Reader;
import format.wav.Writer;
import haxe.io.Bytes;
import haxe.io.BytesInput;
import sys.io.File;

/**
 * WavData16Mono
 * @author Jonas Nyström
 */
class Wav16Mono 
{
	public var ints(default, null):WavInts;
	
	public function new(ints:WavInts) {
		this.ints = ints;
	}
	
	static public function fromBytes(wavData:Bytes) return new Wav16Mono(Wav16Tools.bytesToInts(wavData));
	
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