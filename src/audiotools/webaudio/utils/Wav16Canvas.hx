package audiotools.webaudio.utils;
import js.html.CanvasElement;
import js.html.CanvasRenderingContext;

/**
 * Wav16CanvasWaveform
 * @author Jonas Nyström
 */
class Wav16Canvas 
{

	static public function drawWave(canvas:CanvasElement, wav16:Wav16, width:Float, height:Float ) {		
		var gr = canvas.getContext2d();					
		
		gr.beginPath();
		gr.rect(0, 0, width, height);
		gr.fillStyle = '#eeeeee';
		gr.fill();
		gr.lineWidth = 1;
		gr.strokeStyle = '#000077';
		gr.stroke();				
		
		
		
		var graphLeft = Wav16Tools.getWaveformSamples(wav16.ch1, Std.int(width));
		var graphRight:Array<Float> = null;		
		if (wav16.stereo) graphRight = Wav16Tools.getWaveformSamples(wav16.ch2, Std.int(width));
		
		var maxlevel = height / 2;				
		var incr:Float =  graphLeft.length / width;	
		
		if (wav16.stereo)
		{			
			var _y =  height * .25;
			var _x = 0;
			gr.beginPath();
			gr.moveTo(_x, _y);
			gr.lineTo(_x + width, _y);			
			gr.stroke();
			
			var incrPos:Float = 0;		
			var _width = Std.int(width);
			for (_x in 0..._width)
			{
				var samplepos = Math.round(incrPos);
				var sampleLeft = graphLeft[samplepos];
				var length = maxlevel * sampleLeft / 2;
				gr.beginPath();
				gr.moveTo(_x, _y - length);
				gr.lineTo(_x, _y + length);
				gr.stroke();
				incrPos += incr;
			}	
			
			var _y =  height * .75;
			var _x = 0;
			gr.beginPath();
			gr.moveTo(_x, _y);
			gr.lineTo(_x + width, _y);			
			gr.stroke();			
			var incrPos:Float = 0;		
			var _width = Std.int(width);
			for (_x in 0..._width)
			{
				var samplepos = Math.round(incrPos);
				var sampleLeft = graphRight[samplepos];
				var length = maxlevel * sampleLeft / 2;
				gr.beginPath();
				gr.moveTo(_x, _y - length);
				gr.lineTo(_x, _y + length);
				gr.stroke();
				incrPos += incr;
			}
		} else {		
			var _y =  height / 2;
			var _x = 0;
			gr.beginPath();
			gr.moveTo(_x, _y);
			gr.lineTo(_x + width, _y);			
			gr.stroke();
			//gr.lineStyle(LINEWIDTH, this.leftColor);
			var incrPos:Float = 0;		
			var _width = Std.int(width);
			for (_x in 0..._width)
			{
				var samplepos = Math.round(incrPos);
				var sampleLeft = graphLeft[samplepos];
				var length = maxlevel * sampleLeft;
				gr.beginPath();
				gr.moveTo(_x, _y - length);
				gr.lineTo(_x, _y + length);
				gr.stroke();
				incrPos += incr;
			}			
		}		
	}	
	
}