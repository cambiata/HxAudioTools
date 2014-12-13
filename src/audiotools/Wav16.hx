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

	public var ch1(default, null):Vector<Int>;
	public var ch2(default, null):Vector<Int>;	
	public var stereo(default, null):Bool = false;
	
	public function new(channel1:Vector<Int>, channel2:Vector<Int>=null) {
		this.ch1 = channel1;
		this.ch2 = channel2;
		if (this.ch2 != null && this.ch2.length != this.ch1.length) throw "Stereo file ints must have same length";
		this.stereo = (this.ch2 != null);
	}
	
	public var length(get, null):Int;
	function get_length() return this.ch1.length;
	
	static public function fromFileBytes(wavfileBytes:Bytes):Wav16  {
		
		var wave:WAVE = new Reader(new BytesInput(wavfileBytes)).read();
		var stereo = wave.header.channels == 2;
		var data = wave.data;
		
		var w16:Wav16 = null;
		
		if (stereo) {
			var aInts = Wav16Tools.stereoToInts(data, false);
			w16 = new Wav16(aInts[0], aInts[1]);
		} else {
			var ints = Wav16Tools.monoBytesToInts(data, false);
			w16 = new Wav16(ints);
		}
			
		return w16;
	}
	
	static public function create(lengthSamples:Int, stereo = false, prefill = true) {
		function getChannel() {
			var ch = new Vector<Int>(lengthSamples);
			if (prefill) for (i in 0...lengthSamples) ch.set(i, 0);
			return ch;
		}
		
		return new  Wav16(getChannel(), (stereo) ? getChannel() : null);
	}
	
	#if (sys)	
	static public function fromFile(wavFilename:String): Wav16 {
		return fromFileBytes(File.getBytes(wavFilename));
	}
	
	public function saveFile(filename:String) {		
		var header = Wav16Tools.createHeader(this.stereo);
		var data = (this.stereo) ? Wav16Tools.intsToStero16Bytes(this.ch1, this.ch2) : Wav16Tools.intsToMono16Bytes(this.ch1);				
		new Writer(File.write(filename, true)).write({ header: header, data: data });		
	}	
	#end
	
	public function toStereo() {
		if (this.stereo) return;
		this.ch2 = new Vector<Int>(this.ch1.length);
		for (i in 0...this.ch1.length) this.ch2.set(i, this.ch1.get(i));
	}		
	
	
	
}