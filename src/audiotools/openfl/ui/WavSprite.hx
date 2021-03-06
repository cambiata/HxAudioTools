package audiotools.openfl.ui;

/**
 * WavSprite
 * @author Jonas Nyström
 */
import audiotools.Wav16;
import format.wav.Reader;
import format.wav.Data;
import audiotools.openfl.utils.ByteArrayTools;
import haxe.ds.Vector;
import haxe.io.Bytes;
import haxe.io.BytesInput;
import haxe.macro.Format;
import audiotools.Wav16Tools;

#if (openfl)
import openfl.display.Sprite;
import openfl.Lib;
import openfl.utils.ByteArray;
#else
import flash.display.Sprite;
import flash.Lib;
import flash.utils.ByteArray;
#end


/**
 * WavSprite
 * @author Jonas Nyström
 */
class WavSprite extends ResizeSprite
{
	/*
	var leftInts:Vector<Int>;
	var rightInts:Vector<Int>;
	*/
	var wav16:Wav16;
	
	var graphSamplesLeft:Array<Float>;
	var graphSamplesRight:Array<Float>;
	var stereo:Bool;
	
	/*
	public function new(wavfile:ByteArray)
	{		
		var wavFile:WAVE = new Reader(new BytesInput(ByteArrayTools.toBytes(wavfile))).read();		
		var wavHeader = wavFile.header;	
		this.stereo = (wavHeader.channels > 1);				

		if (stereo) {			
			var ints = WavTools.stereo16bitToInts(wavFile.data);		
			this.leftInts = ints[0];		
			this.rightInts = ints[1];
			this.graphSamplesLeft = WavTools.getWaveformSamples(leftInts, 1000);
			this.graphSamplesRight = WavTools.getWaveformSamples(rightInts, 1000);
		} else {
			this.leftInts = WavTools.mono16bitToInts(wavFile.data);
			this.graphSamplesLeft = WavTools.getWaveformSamples(leftInts, 1000);
		}		
		 super();
	}
	*/
	
	
	
	
	public function new(wav16:Wav16, width:Float = 0, height:Float = 100, leftColor:Int=0x0000aa, rightColor:Int=0xaa0000,  autosize:Float=3.0) {
		/*
		this.wav16 = wav16;
		this.graphSamplesLeft = Wav16Tools.getWaveformSamples(this.wav16.ints, 1000);
		this.stereo = Std.is(wav16, Wav16Stereo);
		
		if (stereo) {
			this.graphSamplesRight = Wav16Tools.getWaveformSamples(cast(wav16, Wav16Stereo).rightInts, 1000);
		}
		*/

		this.init(wav16, false);
		
		this.leftColor = leftColor;
		this.rightColor = rightColor;
		
		if (width == 0) {
			var autowidth = this.wav16.ch1.length / 44100 * autosize * 10;
			super(0, 0, autowidth, 100, 0x000000, 0.2);
		} else
			super(0, 0, width, height, 0x000000, 0.2);
	}
	
	function init(wav16:Wav16, redraw:Bool = true){
		this.wav16 = wav16;
		this.graphSamplesLeft = Wav16Tools.getWaveformSamples(this.wav16.ch1, 1000);
		this.stereo = wav16.stereo;		
		if (stereo) {
			this.graphSamplesRight = Wav16Tools.getWaveformSamples(wav16.ch2, 1000);
		}		
		
		if (redraw) this._draw();
	}
	
	
	static var LINEWIDTH:Float = 1.4;
	var leftColor:Int;
	var rightColor:Int;
	
	override public function draw(width:Float, height:Float, background:Sprite ) {
		var gr = background.graphics;
		gr.clear();
		
		if (width > this.graphSamplesLeft.length) {
			this.graphSamplesLeft = Wav16Tools.getWaveformSamples(this.wav16.ch1, Math.floor(width + 500));
			if (stereo) this.graphSamplesRight = Wav16Tools.getWaveformSamples(wav16.ch2, Math.floor(width + 500));
		}
		
		var maxlevel = height / 2;				
		var incr:Float =  this.graphSamplesLeft.length / width;		
		if (stereo)
		{
			var _y =  height * .25;
			var _x = 0;
			gr.lineStyle(1, 0x555555);
			gr.moveTo(_x, _y);
			gr.lineTo(_x + width, _y);			
			
			gr.lineStyle(LINEWIDTH, this.leftColor);
			var incrPos:Float = 0;		
			var _width = Std.int(width);
			for (_x in 0..._width)
			{
				var samplepos = Math.round(incrPos);
				var sampleLeft = this.graphSamplesLeft[samplepos];
				var length = maxlevel * sampleLeft / 2;
				gr.moveTo(_x, _y - length);
				gr.lineTo(_x, _y + length);
				incrPos += incr;
			}	
			
			var _y =  height * .75;
			var _x = 0;
			gr.lineStyle(1, 0x555555);
			gr.moveTo(_x, _y);
			gr.lineTo(_x + width, _y);			
			
			gr.lineStyle(LINEWIDTH, this.rightColor);
			var incrPos:Float = 0;		
			var _width = Std.int(width);
			for (_x in 0..._width)
			{
				var samplepos = Math.round(incrPos);
				var sampleLeft = this.graphSamplesLeft[samplepos];
				var length = maxlevel * sampleLeft / 2;
				gr.moveTo(_x, _y - length);
				gr.lineTo(_x, _y + length);
				incrPos += incr;
			}	
			
		} else {		
			
			var _y =  height / 2;
			var _x = 0;
			gr.lineStyle(1, 0x555555);
			gr.moveTo(_x, _y);
			gr.lineTo(_x + width, _y);			
			
			gr.lineStyle(LINEWIDTH, this.leftColor);
			var incrPos:Float = 0;		
			var _width = Std.int(width);
			for (_x in 0..._width)
			{
				var samplepos = Math.round(incrPos);
				var sampleLeft = this.graphSamplesLeft[samplepos];
				var length = maxlevel * sampleLeft;
				gr.moveTo(_x, _y - length);
				gr.lineTo(_x, _y + length);
				incrPos += incr;
			}			
		}		
	}
	
	override public function redraw(w:Float, h:Float, sprite:Sprite) 
	{
		//super.redraw(w, h, sprite);
	}
	
	
	public function getInts():Array<Vector<Int>>
	{
		if (stereo) return [this.wav16.ch1, this.wav16.ch2];
		return [this.wav16.ch1];
	}
	
	public function getStereo():Bool return this.stereo;
}