package examples.assemble;

import audiotools.utils.BytesLoader;
import audiotools.utils.Mp3Wav16Decoder;
import audiotools.Wav16;
import audiotools.Wav16DSP;
import audiotools.Wav16Tools;
import audiotools.webaudio.WebAudioTools;

using Lambda;
/**
 * ...
 * @author Jonas Nyström
 */

class Main 
{
	#if flash
	static var init = {		
		var stage = flash.Lib.current.stage;
		stage.scaleMode =  flash.display.StageScaleMode.NO_SCALE;
		stage.align =  flash.display.StageAlign.TOP_LEFT;		
	}
	#end
	
	static function main() 
	{		
		var mp3start = 49;
		var mp3end = 60;		
		var files = [for (i in mp3start...mp3end) i].map(function(i) return 'piano/$i.mp3');
		
		Mp3Wav16Decoders.decodeAllMap(files).handle(function(data) {
			trace('all decoded');			
			var w49:Wav16  = data.get('piano/49.mp3');						
			var w50:Wav16  = data.get('piano/50.mp3');						
			var w56:Wav16  = data.get('piano/56.mp3');						
			var w = Wav16.create(w49.length * 3, false);
			Wav16DSP.wspMixInto(w, w49, 0);
			Wav16DSP.wspMixInto(w, w56, 0);	
			Wav16DSP.wspMixInto(w, w50, Wav16Tools.toSamples(2));
			displayWave(w, 0);
			Wav16Tools.testplay(w);		
		});
	}
	
	static function displayWave(wav16:Wav16, index:Int, text:String='') {
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
	
}