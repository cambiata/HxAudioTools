package;

import audiotools.webaudio.pitch.PitchRecognizer;
import js.Lib;

/**
 * ...
 * @author Jonas Nyström
 */

class Main 
{	
	static function main() 
	{
		
		var pitches:Array<Float> = null;
		
		js.Browser.document.getElementById('btnPitch').onmousedown = function(e) {
			PitchRecognizer.getInstance();
			PitchRecognizer.getInstance().onPitch = function(currentFreq:Float, closestIndex:Int, maxVolume:Float) {
				var semitone = (currentFreq > 0) ? PitchRecognizer.getSemitoneDiff(currentFreq) : 0;
				var roundSemitone = Math.round(semitone);
				js.Browser.document.getElementById('lblPitch').textContent = '$currentFreq : $roundSemitone / $semitone';
				
				pitches.push(currentFreq);
				
			}
		}
		
		js.Browser.document.getElementById('btnPitchStart').onmousedown = function(e) {
			PitchRecognizer.getInstance().startAnalyzing();
		}

		js.Browser.document.getElementById('btnPitchStop').onmousedown = function(e) {
			PitchRecognizer.getInstance().stopAnalyzing();
		}	
		
		js.Browser.document.getElementById('btnStartRec').onmousedown = function(e) {
			//PitchRecognizer.getInstance().stopAnalyzing();
			pitches = [];
		}	
		
		js.Browser.document.getElementById('btnStopRec').onmousedown = function(e) {
			//PitchRecognizer.getInstance().stopAnalyzing();
			trace(pitches);
		}			
	}
	
	static var threeNotes = [177.3, 173.7, 173.7, 171.7, 171.7, 171.4, 171.1, 169.4, 169, 166.7, 166.5, 163, 145.9, 142.9, 138.4, 138.4, 138.4, 139, 143.7, 147.9, 147.9, 149.3, 149.3, 147.9, 149.6, 150.5, 150.5, 149.6];
	static var oneNote =  [192.3, 192.3, 192.3, 188.9, 188.9, 186.6, 184.1, 183.3, 183.2, 182.9, 182.4, 182.4, 0];
	static var oneNoteC =  [128.4, 127.3, 127.3, 125.5, 127, 127, 127, 128.6, 129.1, 129.1, 129.1, 129.2, 129.1];
	static var twoNotes =  [226.3, 220.9, 220.9, 217.1, 217.1, 212.9, 209.2, 198.4, 195.7, 195.4, 195.3, 193.5, 166.3, 165.9, 165.9, 165.8, 165.2, 165.2];
	
}