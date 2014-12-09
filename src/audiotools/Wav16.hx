package audiotools;
import format.wav.Data.WAVE;
import format.wav.Reader;
import format.wav.Writer;
import haxe.ds.Vector;
import haxe.io.Bytes;
import haxe.io.BytesInput;
import haxe.macro.Format;

#if (sys)
import sys.io.File;
#end

/**
 * Wav16
 * @author Jonas Nyström
 */
class Wav16 
{

	public var ints(default, null):Vector<Int>;
	public var ints2(default, null):Vector<Int>;	
	public var stereo(default, null):Bool = false;
	
	public function new(channel1:Vector<Int>, channel2:Vector<Int>=null) {
		this.ints = channel1;
		this.ints2 = channel2;
		if (this.ints2 != null && this.ints2.length != this.ints.length) throw "Stereo file ints must have same length";
		this.stereo = (this.ints2 != null);
	}
	
	static public function fromFileBytes(wavfileBytes:Bytes):Wav16  {
		
		var wave:WAVE = new Reader(new BytesInput(wavfileBytes)).read();
		var stereo = wave.header.channels == 2;
		var data = wave.data;
		
		var w16:Wav16 = null;
		
		if (stereo) {
			var aInts = Wav16Tools.stereoToInts(data, false);
			w16 = new Wav16Stereo(aInts[0], aInts[1]);
		} else {
			var ints = Wav16Tools.monoBytesToInts(data, false);
			w16 = new Wav16Mono(ints);
		}
			
		return w16;
	}
	
	#if (sys)	
	static public function fromFile(wavFilename:String): Wav16 {
		return fromFileBytes(File.getBytes(wavFilename));
	}
	
	public function saveFile(filename:String) {		
		var header = Wav16Tools.createHeader(this.stereo);
		var data = (this.stereo) ? Wav16Tools.intsToStero16Bytes(this.ints, this.ints2) : Wav16Tools.intsToMono16Bytes(this.ints);				
		new Writer(File.write(filename, true)).write({ header: header, data: data });		
	}	
	#end
	
	
	
	
	
}