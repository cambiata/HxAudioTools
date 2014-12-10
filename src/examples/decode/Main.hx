package examples.decode;

import audiotools.utils.Mp3Decoder;
import audiotools.utils.Mp3Wav16Decoder;
import audiotools.utils.Mp3Wav16Decoders;
import audiotools.Wav16;
import audiotools.Wav16Tools;
using audiotools.Wav16DSP;
/**
 * ...
 * @author Jonas Nyström
 */

class Main 
{
	static function main() 
	{
		var decoders = new Mp3Wav16Decoders(['sample.mp3', 'leadvox.mp3']);		
		decoders.allDecoded = function(decodedFiles:Map<String, Wav16>) {
			var i = 0;
			for (filename in decodedFiles.keys()) {				
				var wav16 = decodedFiles.get(filename);				
				displayWave(wav16, i, filename);			
				i++;
			}							
			var w0 = decodedFiles.get('sample.mp3'); 
			var w1 = decodedFiles.get('leadvox.mp3'); 	
			
			var wMixedReverse = new Wav16(w0.ch1.dspMix(w1.ch1).dspReverse(),  w0.ch2.dspMix(w1.ch1).dspReverse());			
			displayWave(wMixedReverse, 2, 'decoded PCM data, mixed and reversed');					
			Wav16Tools.testplay(wMixedReverse);
		}		
		decoders.decodeAll();				
	}
	
	static function displayWave(wav16:Wav16, index:Int, text:String) {
		#if flash
		var ws = new audiotools.openfl.ui.WavSprite(wav16, 0, 0, 0xaa0000);
		ws.y = 120 * index + 20; ws.x = 20;
		flash.Lib.current.addChild(ws);			
		#end
		
		#if js
		var par = js.Browser.document.createParagraphElement();
		par.innerHTML = text;				
		js.Browser.document.body.appendChild(par);
		var canvas = js.Browser.document.createCanvasElement();
		canvas.setAttribute('width', '400px');
		canvas.setAttribute('height', '100px');
		js.Browser.document.body.appendChild(canvas);	
		js.Browser.document.body.appendChild(js.Browser.document.createBRElement());						
		audiotools.webaudio.utils.Wav16Canvas.drawWave(canvas, wav16, 400, 100);			
		#end
	}
	
	#if flash
	static var init = {		
		var stage = flash.Lib.current.stage;
		stage.scaleMode =  flash.display.StageScaleMode.NO_SCALE;
		stage.align =  flash.display.StageAlign.TOP_LEFT;		
	}
	#end	
}