package;

import audiotools.webaudio.pitch.PitchRecognizer;
import js.Browser;
import js.Lib;
using Lambda;
using StringTools;

/**
 * ...
 * @author Jonas Nyström
 */

class Main 
{	
	static function main() 
	{
		
		var pitcher = new Pitcher();
		
		function getSemitoneDiff(fCurrent:Float, fRef:Float=440) {
			return 12*Math.log(fCurrent/fRef)/Math.log(2);
		} 			
		
		
		var pitches:Array<Float> = [];
		var semitones:Array<Float> = [];
		
		js.Browser.document.getElementById('btnPitch').onmousedown = function(e) {
			PitchRecognizer.getInstance();
			PitchRecognizer.getInstance().onPitch = function(currentFreq:Float, closestIndex:Int, maxVolume:Float) {
				var semitone = (currentFreq > 0) ? PitchRecognizer.getSemitoneDiff(currentFreq) : 0;
				var roundSemitone = Math.round(semitone);
				js.Browser.document.getElementById('lblPitch').textContent = '$currentFreq : $roundSemitone / $semitone';
				
				pitches.push(currentFreq);
				semitones.push(semitone);
				pitcher.addSemitone(semitone);
				
				
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
			semitones = [];
			Browser.document.getElementById('result').textContent = '';
		}	
		
		js.Browser.document.getElementById('btnStopRec').onmousedown = function(e) {
			//PitchRecognizer.getInstance().stopAnalyzing();
			trace(pitches);
			trace(semitones);
			Browser.document.getElementById('result').textContent = '';
		}
		
		/*
		//for (n in threeNotes) trace(getSemitoneDiff(n));
		var calc = new PitchSementsCalculator(treklang);
		var semitones = calc.getSemitonesRound();
		trace(semitones);
		//var wsemitones = calc.getSemitonesWindowed(10);
		//trace(wsemitones);
		//var t = calc.test();
		//trace(t);
		
		var pitcher = new Pitcher();
		for (st in semitones) {
			pitcher.addSemitone(st);
		}
		*/
		
	}
	
	static var treklang =  [50.2, 50.2, 202.6, 202.6, 203.9, 0, 172.1, 172.1, 172.1, 172.1, 173.2, 173.2, 171.8, 171.7, 171, 171, 138.2, 134.7, 134.6, 0];
	static var threeNotes = [177.3, 173.7, 173.7, 171.7, 171.7, 171.4, 171.1, 169.4, 169, 166.7, 166.5, 163, 145.9, 142.9, 138.4, 138.4, 138.4, 139, 143.7, 147.9, 147.9, 149.3, 149.3, 147.9, 149.6, 150.5, 150.5, 149.6];
	static var oneNote =  [192.3, 192.3, 192.3, 188.9, 188.9, 186.6, 184.1, 183.3, 183.2, 182.9, 182.4, 182.4, 0];
	static var oneNoteC =  [128.4, 127.3, 127.3, 125.5, 127, 127, 127, 128.6, 129.1, 129.1, 129.1, 129.2, 129.1];
	static var twoNotes =  [226.3, 220.9, 220.9, 217.1, 217.1, 212.9, 209.2, 198.4, 195.7, 195.4, 195.3, 193.5, 166.3, 165.9, 165.9, 165.8, 165.2, 165.2];
	static var gliss =  [139.4, 139.4, 139.4, 139.3, 139.4, 139.3, 139.3, 139.1, 139.6, 139.6, 139.8, 142.9, 145.5, 145.8, 146.9, 146.9, 146.9, 139.7, 138.6, 138.6, 138.2, 138.6, 144.3, 144.3, 143.2, 143.9, 143.2, 143, 138.4, 138.4, 138.3, 138.1, 138.3];	
}

class PitchSementsCalculator {
	var freqs:Array<Float>;
	
	public function new(frequencies:Array<Float>) {
		this.freqs = frequencies;
		// filter zeros
		this.freqs = this.freqs.filter(function(f) return (f > 0) );
		
	}
	
	public function getSemitones():Array<Float> {
		var result:Array<Float> = [];
		for (f in this.freqs) {
			var semitone = -getSemitoneDiff(f);
			result.push(semitone);
		}
		return result;
	}
	
	public function getSemitonesRound():Array<Int> {
		return this.getSemitones().map(function(s)  return Math.round(s) );
	}
	
	public function getSemitonesWindowed(windowsize = 4) {
		var result:Array<Float> = [];
		var wa = [];
		var sts = this.getSemitones();
		for (st in sts) {
			wa.push(st);
			if (wa.length >= windowsize) {
				var wround = roundWindow(wa);
				//trace([wround, wa.length]);
				result.push(wround);
				wa.shift();
			}
		}
		return result;
	}
	
	public function test() {
		
		var sts = this.getSemitones();
		var wa = [];

		var st = sts[0];
		var waRound = st;
		
		var result:Array<Float> = [];
		
		for (i in 1 ... sts.length-1) {

			st = sts[i];
			
			var diff = Math.abs(st - waRound);
			trace(diff);
			if (diff > 1) {
				trace(['NEW', Std.string(wa.length)]);
				wa = [];
				result.push(waRound);
			}
			wa.push(st);
			waRound = roundWindow(wa);
		}
		result.push(waRound);
		
		return result;
	}
	
	public function roundWindow(fs:Array<Float>): Float {
		var sum = .0;
		for (f in fs) sum += f;
		return sum / fs.length;
	}
	

	function getSemitoneDiff(fCurrent:Float, fRef:Float=440) {
		return 12*Math.log(fCurrent/fRef)/Math.log(2);
	} 		
	
	
}

class Pitcher {
	
	
	public function new() {
		
		
	}

	var waRound = -.1;
	var wa:Array<Float> = [];
	var result:Array<Float> = [];
	
	public function addSemitone(st:Float) {
		var diff = Math.abs(st - waRound);
		trace(diff);
		if (diff > 0.7) {
			
			if (wa.length > 1)
				Browser.document.getElementById('result').textContent += Std.string(waRound).substr(0, 5) + '(' + Std.string(wa.length) + '), ';
			//trace(result);
			//trace([waRound, wa.length]);
			wa = [];
			result.push(waRound);
		}
		wa.push(st);
		waRound = roundWindow(wa);
	}
	
	/*
	public function test() {
		
		var sts = this.getSemitones();
		var wa = [];

		var st = sts[0];
		var waRound = st;
		
		var result:Array<Float> = [];
		
		for (i in 1 ... sts.length-1) {

			st = sts[i];
			
			var diff = Math.abs(st - waRound);
			trace(diff);
			if (diff > 1) {
				trace(['NEW', Std.string(wa.length)]);
				wa = [];
				result.push(waRound);
			}
			wa.push(st);
			waRound = roundWindow(wa);
		}
		result.push(waRound);
		
		return result;
	}
	*/
	public function roundWindow(fs:Array<Float>): Float {
		var sum = .0;
		for (f in fs) sum += f;
		return sum / fs.length;
	}
	
	
	
}
