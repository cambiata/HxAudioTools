(function () { "use strict";
var HxOverrides = function() { };
HxOverrides.__name__ = true;
HxOverrides.substr = function(s,pos,len) {
	if(pos != null && pos != 0 && len != null && len < 0) return "";
	if(len == null) len = s.length;
	if(pos < 0) {
		pos = s.length + pos;
		if(pos < 0) pos = 0;
	} else if(len < 0) len = s.length + len - pos;
	return s.substr(pos,len);
};
var Main = function() { };
Main.__name__ = true;
Main.main = function() {
	var pitcher = new Pitcher();
	var getSemitoneDiff = function(fCurrent,fRef) {
		if(fRef == null) fRef = 440;
		return 12 * Math.log(fCurrent / fRef) / Math.log(2);
	};
	var pitches = [];
	var semitones = [];
	window.document.getElementById("btnPitch").onmousedown = function(e) {
		if(audiotools.webaudio.pitch.PitchRecognizer.instance == null) audiotools.webaudio.pitch.PitchRecognizer.instance = new audiotools.webaudio.pitch.PitchRecognizer(null); else audiotools.webaudio.pitch.PitchRecognizer.instance;
		(audiotools.webaudio.pitch.PitchRecognizer.instance == null?audiotools.webaudio.pitch.PitchRecognizer.instance = new audiotools.webaudio.pitch.PitchRecognizer(null):audiotools.webaudio.pitch.PitchRecognizer.instance).onPitch = function(currentFreq,closestIndex,maxVolume) {
			var semitone;
			if(currentFreq > 0) semitone = audiotools.webaudio.pitch.PitchRecognizer.getSemitoneDiff(currentFreq); else semitone = 0;
			var roundSemitone = Math.round(semitone);
			window.document.getElementById("lblPitch").textContent = "" + currentFreq + " : " + roundSemitone + " / " + semitone;
			pitches.push(currentFreq);
			semitones.push(semitone);
			pitcher.addSemitone(semitone);
		};
	};
	window.document.getElementById("btnPitchStart").onmousedown = function(e1) {
		(audiotools.webaudio.pitch.PitchRecognizer.instance == null?audiotools.webaudio.pitch.PitchRecognizer.instance = new audiotools.webaudio.pitch.PitchRecognizer(null):audiotools.webaudio.pitch.PitchRecognizer.instance).startAnalyzing();
	};
	window.document.getElementById("btnPitchStop").onmousedown = function(e2) {
		(audiotools.webaudio.pitch.PitchRecognizer.instance == null?audiotools.webaudio.pitch.PitchRecognizer.instance = new audiotools.webaudio.pitch.PitchRecognizer(null):audiotools.webaudio.pitch.PitchRecognizer.instance).stopAnalyzing();
	};
	window.document.getElementById("btnStartRec").onmousedown = function(e3) {
		pitches = [];
		semitones = [];
		window.document.getElementById("result").textContent = "";
	};
	window.document.getElementById("btnStopRec").onmousedown = function(e4) {
		console.log(pitches);
		console.log(semitones);
		window.document.getElementById("result").textContent = "";
	};
};
var PitchSementsCalculator = function(frequencies) {
	this.freqs = frequencies;
	this.freqs = this.freqs.filter(function(f) {
		return f > 0;
	});
};
PitchSementsCalculator.__name__ = true;
PitchSementsCalculator.prototype = {
	getSemitones: function() {
		var result = [];
		var _g = 0;
		var _g1 = this.freqs;
		while(_g < _g1.length) {
			var f = _g1[_g];
			++_g;
			var semitone = -this.getSemitoneDiff(f);
			result.push(semitone);
		}
		return result;
	}
	,getSemitonesRound: function() {
		return this.getSemitones().map(function(s) {
			return Math.round(s);
		});
	}
	,getSemitonesWindowed: function(windowsize) {
		if(windowsize == null) windowsize = 4;
		var result = [];
		var wa = [];
		var sts = this.getSemitones();
		var _g = 0;
		while(_g < sts.length) {
			var st = sts[_g];
			++_g;
			wa.push(st);
			if(wa.length >= windowsize) {
				var wround = this.roundWindow(wa);
				result.push(wround);
				wa.shift();
			}
		}
		return result;
	}
	,test: function() {
		var sts = this.getSemitones();
		var wa = [];
		var st = sts[0];
		var waRound = st;
		var result = [];
		var _g1 = 1;
		var _g = sts.length - 1;
		while(_g1 < _g) {
			var i = _g1++;
			st = sts[i];
			var diff = Math.abs(st - waRound);
			console.log(diff);
			if(diff > 1) {
				console.log(["NEW",wa.length == null?"null":"" + wa.length]);
				wa = [];
				result.push(waRound);
			}
			wa.push(st);
			waRound = this.roundWindow(wa);
		}
		result.push(waRound);
		return result;
	}
	,roundWindow: function(fs) {
		var sum = .0;
		var _g = 0;
		while(_g < fs.length) {
			var f = fs[_g];
			++_g;
			sum += f;
		}
		return sum / fs.length;
	}
	,getSemitoneDiff: function(fCurrent,fRef) {
		if(fRef == null) fRef = 440;
		return 12 * Math.log(fCurrent / fRef) / Math.log(2);
	}
};
var Pitcher = function() {
	this.result = [];
	this.wa = [];
	this.waRound = -.1;
};
Pitcher.__name__ = true;
Pitcher.prototype = {
	addSemitone: function(st) {
		var diff = Math.abs(st - this.waRound);
		console.log(diff);
		if(diff > 0.7) {
			if(this.wa.length > 1) window.document.getElementById("result").textContent += (function($this) {
				var $r;
				var _this = Std.string($this.waRound);
				$r = HxOverrides.substr(_this,0,5);
				return $r;
			}(this)) + "(" + Std.string(this.wa.length) + "), ";
			this.wa = [];
			this.result.push(this.waRound);
		}
		this.wa.push(st);
		this.waRound = this.roundWindow(this.wa);
	}
	,roundWindow: function(fs) {
		var sum = .0;
		var _g = 0;
		while(_g < fs.length) {
			var f = fs[_g];
			++_g;
			sum += f;
		}
		return sum / fs.length;
	}
};
Math.__name__ = true;
var Std = function() { };
Std.__name__ = true;
Std.string = function(s) {
	return js.Boot.__string_rec(s,"");
};
var audiotools = {};
audiotools.webaudio = {};
audiotools.webaudio.Context = function() {
	this.context = audiotools.webaudio.Context.createAudioContext();
};
audiotools.webaudio.Context.__name__ = true;
audiotools.webaudio.Context.getInstance = function() {
	if(audiotools.webaudio.Context.instance == null) return audiotools.webaudio.Context.instance = new audiotools.webaudio.Context(); else return audiotools.webaudio.Context.instance;
};
audiotools.webaudio.Context.createAudioContext = function() {
	var context = null;
	
			if (typeof AudioContext == "function") {
				context = new AudioContext();
				console.log("USING STANDARD WEB AUDIO API");
			} else if ((typeof webkitAudioContext == "function") || (typeof webkitAudioContext == "object")) {
				context = new webkitAudioContext();
				console.log("USING WEBKIT AUDIO API");
			} else {
				alert("AudioContext is not supported.");
				throw new Error("AudioContext is not supported. :(");
			}
		;
	return context;
};
audiotools.webaudio.Context.prototype = {
	getContext: function() {
		return this.context;
	}
};
audiotools.webaudio.pitch = {};
audiotools.webaudio.pitch.PitchRecognizer = function(audioContext) {
	this.initialized = false;
	this.init($bind(this,this.onPitchHandler),audioContext);
};
audiotools.webaudio.pitch.PitchRecognizer.__name__ = true;
audiotools.webaudio.pitch.PitchRecognizer.getInstance = function(audioContext) {
	if(audiotools.webaudio.pitch.PitchRecognizer.instance == null) return audiotools.webaudio.pitch.PitchRecognizer.instance = new audiotools.webaudio.pitch.PitchRecognizer(audioContext); else return audiotools.webaudio.pitch.PitchRecognizer.instance;
};
audiotools.webaudio.pitch.PitchRecognizer.getSemitoneDiff = function(fCurrent,fRef) {
	if(fRef == null) fRef = 440;
	return -(12 * Math.log(fCurrent / fRef) / Math.log(2));
};
audiotools.webaudio.pitch.PitchRecognizer.prototype = {
	onPitchHandler: function(currentFreq,closestIndex,maxVolume) {
		if(this.onPitch != null) this.onPitch(currentFreq,closestIndex,maxVolume); else console.log([currentFreq,closestIndex,maxVolume]);
	}
	,startAnalyzing: function() {
		audiotools.webaudio.pitch.PitchRecognizer.analyzePitch = true;
	}
	,stopAnalyzing: function() {
		audiotools.webaudio.pitch.PitchRecognizer.analyzePitch = false;
	}
	,init: function(cbk,audioContext) {
		if(this.initialized) {
			js.Lib.alert("PitchRecognizer already initialized");
			return;
		}
		this.initialized = true;
		var audioContext1 = (audiotools.webaudio.Context.instance == null?audiotools.webaudio.Context.instance = new audiotools.webaudio.Context():audiotools.webaudio.Context.instance).getContext();
		var windowAudioContext =  window.AudioContext;
		windowAudioContext = audioContext1;
			

		console.log(window.AudioContext);
		console.log(audiotools.webaudio.pitch.PitchRecognizer.analyzePitch);

		//==================================================================================================
		/* Copyright 2014 Alejandro Pérez González de Martos

		   Licensed under the Apache License, Version 2.0 (the "License");
		   you may not use this file except in compliance with the License.
		   You may obtain a copy of the License at

			 http://www.apache.org/licenses/LICENSE-2.0

		   Unless required by applicable law or agreed to in writing, software
		   distributed under the License is distributed on an "AS IS" BASIS,
		   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
		   See the License for the specific language governing permissions and
		   limitations under the License.
		*/


		/* Internal parameters */
		var volumeThreshold = 134; // Amplitude threshold for detecting sound/silence [0-255], 128 = silence
		var nPitchValues = 5; // Number of pitches for pitch averaging logic

		/* Web Audio API variables */
		//var audioContext = null;
		var analyserNode = null;
		var processNode = null;
		var microphoneNode = null;
		var gainNode = null;
		var lowPassFilter1 = null;
		var lowPassFilter2 = null;
		var highPassFilter1 = null;
		var highPassFilter2 = null;

		/* Configurable parameters */
		var lowestFreq = 30; // Minimum tune = 44100/1024 = 43.07Hz
		var highestFreq = 4200; // Maximum tune C8 (4186.02 Hz)

		/* Tune variables */
		var twelfthRootOfTwo = 1.05946309435929526456182529; // 2^(1/12)
		var otthRootOfTwo = 1.0005777895; // 2^(1/1200)
		var refNoteLabels = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];
		var refFreq = 440;
		var refNoteIndex = 0;
		var noteFrequencies = [];
		var noteLabels = [];
		var pitchHistory = [];

		/* GUI variables */
		var pixelsPerCent = 3;
		var silenceTimeout = null;
		var minUpdateDelay = 100; // Pitch/GUI maximum update rate in milliseconds

		window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
		//window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.oAudioContext || window.msAudioContext;

		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

		if (/*window.requestAnimationFrame && */ window.AudioContext && navigator.getUserMedia) {
			try {
				navigator.getUserMedia({audio: true}, gotStream, function(err) {
				console.log("DEBUG: Error getting microphone input: " + err);
				});
			} catch (e) {
				console.log("DEBUG: Couldnt get microphone input: " + e);
			}
		} else {
			console.log("DEBUG: Web Audio API is not supported");
		}

		function gotStream(stream) {
			audioContext = new AudioContext();
			if (audioContext == null) alert("No AudioContext!");

			microphoneNode = audioContext.createMediaStreamSource(stream);
			analyserNode = audioContext.createAnalyser();
			analyserNode.fftSize = 2048;
			analyserNode.smoothingTimeConstant = 0.8;
			gainNode = audioContext.createGain();
			gainNode.gain.value = 1.5; // Set mic volume to 150% by default
			lowPassFilter1 = audioContext.createBiquadFilter();
			lowPassFilter2 = audioContext.createBiquadFilter();
			highPassFilter1 = audioContext.createBiquadFilter();
			highPassFilter2 = audioContext.createBiquadFilter();
			lowPassFilter1.Q.value = 0;
			lowPassFilter1.frequency.value = highestFreq;
			lowPassFilter1.type = "lowpass";
			lowPassFilter2.Q.value = 0;
			lowPassFilter2.frequency.value = highestFreq;
			lowPassFilter2.type = "lowpass";
			highPassFilter1.Q.value = 0;
			highPassFilter1.frequency.value = lowestFreq;
			highPassFilter1.type = "highpass";
			highPassFilter2.Q.value = 0;
			highPassFilter2.frequency.value = lowestFreq;
			highPassFilter2.type = "highpass";
			microphoneNode.connect(lowPassFilter1);
			lowPassFilter1.connect(lowPassFilter2);
			lowPassFilter2.connect(highPassFilter1);
			highPassFilter1.connect(highPassFilter2);
			highPassFilter2.connect(gainNode);
			gainNode.connect(analyserNode);

			initGui();
		}

		function initGui() {
			defineNoteFrequencies();
			updatePitch();
		}

		function updatePitch(time) {

			//console.log("updatePitch loop");

			if (audiotools.webaudio.pitch.PitchRecognizer.analyzePitch == false) {
				window.requestAnimationFrame(updatePitch);
				return;
			}

			//console.log("analyze pitch");


			var pitchInHz = 0.0;
			var volumeCheck = false;
			var maxVolume = 128;
			var inputBuffer = new Uint8Array(analyserNode.fftSize);
			//console.log(inputBuffer);
			analyserNode.getByteTimeDomainData(inputBuffer);

			// Check for volume on the first buffer quarter
			for (var i=0; i<inputBuffer.length/4; i++) {
				if (maxVolume < inputBuffer[i]) maxVolume = inputBuffer[i];

				if (!volumeCheck && inputBuffer[i] > volumeThreshold) {
					volumeCheck = true;
				}
			}


			if (volumeCheck) {
				pitchInHz = Yin_pitchEstimation(inputBuffer, audioContext.sampleRate);
			}

			// Pitch smoothing logic
			var allowedHzDifference = 5;
			if (pitchInHz != 0) {
				clearTimeout(silenceTimeout);
				silenceTimeout = null;
				if (pitchHistory.length >= nPitchValues) pitchHistory.shift();
				
				// Octave jumping fix: if current pitch is around twice the previous detected pitch, halve its value
				if (pitchHistory.length && Math.abs((pitchInHz/2.0)-pitchHistory[pitchHistory.length-1]) < allowedHzDifference) pitchInHz = pitchInHz/2.0;
				pitchInHz = Math.round(pitchInHz*10)/10;
				pitchHistory.push(pitchInHz);
				// Take the pitch history median as the current pitch
				var sortedPitchHistory = pitchHistory.slice(0).sort(function(a,b) {return a-b});
				pitchInHz = sortedPitchHistory[Math.floor((sortedPitchHistory.length-1)/2)];

				updateGui(pitchInHz, getClosestNoteIndex(pitchInHz), (maxVolume-128) / 128);

				if (pitchHistory.length < nPitchValues) {
					window.requestAnimationFrame(updatePitch);
				} else {
					setTimeout(function() {
						window.requestAnimationFrame(updatePitch);
					}, minUpdateDelay);
				}
			} else {
				if (silenceTimeout === null) {
					silenceTimeout = setTimeout(function() {
						pitchHistory = [];
						updateGui(0.0, -1, 0);
					}, 500);
				}
				window.requestAnimationFrame(updatePitch);
			}
		}

		function updateGui(currentFreq, closestIndex, maxVolume) {

			if (cbk != null) {
				cbk(currentFreq, closestIndex, maxVolume);
			} else {
				console.log(currentFreq, closestIndex, maxVolume);  
			}
		}

		function findRefNoteIndex(noteLabel) {
			for (var i=0; i<refNoteLabels.length; i++) {
				if (refNoteLabels[i] == noteLabel) return i;
			}
			return false;
		}

		function getClosestNoteIndex(f) {
			if (f == 0.0) return false;
			for (var i=0; i<noteFrequencies.length; i++) {
				if (f < noteFrequencies[i]) {
					if (i > 0 && (noteFrequencies[i]-f > f-noteFrequencies[i-1])) 
						return i-1;
					else 
						return i;
				}
			}
			return false;
		}

		function getCentDiff(fCurrent, fRef) {
			return 1200*Math.log(fCurrent/fRef)/Math.log(2);
		}

		function getSemituneDiff(fCurrent, fRef) {
			return 12*Math.log(fCurrent/fRef)/Math.log(2);
		}

		function defineNoteFrequencies() {

			var noteFreq = 0.0;
			var greaterNoteFrequencies = [];
			var greaterNoteLabels = [];
			var lowerNoteFrequencies = [];
			var lowerNoteLabels = [];
			var octave = 4;

			for (var i=0;;i++) {
				if ((i+9)%12 == 0) octave++;
				noteFreq = refFreq*Math.pow(twelfthRootOfTwo, i);
				// maximum note tune C8 (4186.02 Hz)
				if (noteFreq > 4187) break;
				greaterNoteFrequencies.push(noteFreq);
				greaterNoteLabels.push(octave + refNoteLabels[(refNoteIndex+i)%refNoteLabels.length]);
			}

			octave = 4;
			for (var i=-1;;i--) {
				if ((Math.abs(i)+2)%12 == 0) octave--;
				noteFreq = refFreq*Math.pow(twelfthRootOfTwo, i);
				// minimum note tune A0 (28Hz)
				if (noteFreq < 28) break;
				lowerNoteFrequencies.push(noteFreq);
				var relativeIndex = (refNoteIndex+i)%refNoteLabels.length;
				relativeIndex = (relativeIndex == 0) ? 0 : relativeIndex+(refNoteLabels.length);
				lowerNoteLabels.push(octave + refNoteLabels[relativeIndex]);
			}

			lowerNoteFrequencies.reverse();
			lowerNoteLabels.reverse();
			noteFrequencies = lowerNoteFrequencies.concat(greaterNoteFrequencies);
			noteLabels = lowerNoteLabels.concat(greaterNoteLabels);

		}

		//==================================================================================================

		// Yin Pitch Tracking Algorithm implemented by Alejandro PÃ©rez (2014)
		// (http://recherche.ircam.fr/equipes/pcm/cheveign/ps/2002_JASA_YIN_proof.pdf)			  

		// PARAMETERS
		var yinThreshold = 0.15; // allowed uncertainty (e.g 0.05 will return a pitch with ~95% probability)
		var yinProbability = 0.0; // READONLY: contains the certainty of the note found as a decimal (i.e 0.3 is 30%)

		function Yin_pitchEstimation(inputBuffer, sampleRate) {
			var yinBuffer = new Float32Array(Math.floor(inputBuffer.length/2));
			yinBuffer[0] = 1;
			var runningSum = 0;
			var pitchInHz = 0.0;
			var foundTau = false;
			var minTauValue;
			var minTau = 0;

			for (var tau=1; tau<Math.floor(inputBuffer.length/2); tau++) {
				// Step 1: Calculates the squared difference of the signal with a shifted version of itself.
				yinBuffer[tau] = 0;
				for (var i=0; i<Math.floor(inputBuffer.length/2); i++) {
					yinBuffer[tau] += Math.pow(((inputBuffer[i]-128)/128)-((inputBuffer[i+tau]-128)/128),2);
				}
				// Step 2: Calculate the cumulative mean on the normalised difference calculated in step 1.
				runningSum += yinBuffer[tau];
				yinBuffer[tau] = yinBuffer[tau]*(tau/runningSum);

				// Step 3: Check if the current normalised cumulative mean is over the threshold.
				if (tau > 1) {
					if (foundTau) {
						if (yinBuffer[tau] < minTauValue) {
							minTauValue = yinBuffer[tau];
							minTau = tau;
						}
						else break;
					}
					else if (yinBuffer[tau] < yinThreshold) {
						foundTau = true;
						minTau = tau;
						minTauValue = yinBuffer[tau];
					}
				}
			}

			if (minTau == 0) {
				yinProbability = 0;
				pitchInHz = 0.0;
			} else {
				// Step 4: Interpolate the shift value (tau) to improve the pitch estimate.
				minTau += (yinBuffer[minTau+1]-yinBuffer[minTau-1])/(2*((2*yinBuffer[minTau])-yinBuffer[minTau-1]-yinBuffer[minTau+1]));
				pitchInHz = sampleRate/minTau;
				yinProbability = 1-minTauValue;
			}

			return pitchInHz;
		}
		//==================================================================================================
		;
	}
};
var js = {};
js.Boot = function() { };
js.Boot.__name__ = true;
js.Boot.__string_rec = function(o,s) {
	if(o == null) return "null";
	if(s.length >= 5) return "<...>";
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) t = "object";
	switch(t) {
	case "object":
		if(o instanceof Array) {
			if(o.__enum__) {
				if(o.length == 2) return o[0];
				var str = o[0] + "(";
				s += "\t";
				var _g1 = 2;
				var _g = o.length;
				while(_g1 < _g) {
					var i = _g1++;
					if(i != 2) str += "," + js.Boot.__string_rec(o[i],s); else str += js.Boot.__string_rec(o[i],s);
				}
				return str + ")";
			}
			var l = o.length;
			var i1;
			var str1 = "[";
			s += "\t";
			var _g2 = 0;
			while(_g2 < l) {
				var i2 = _g2++;
				str1 += (i2 > 0?",":"") + js.Boot.__string_rec(o[i2],s);
			}
			str1 += "]";
			return str1;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( e ) {
			return "???";
		}
		if(tostr != null && tostr != Object.toString) {
			var s2 = o.toString();
			if(s2 != "[object Object]") return s2;
		}
		var k = null;
		var str2 = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) {
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str2.length != 2) str2 += ", \n";
		str2 += s + k + " : " + js.Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str2 += "\n" + s + "}";
		return str2;
	case "function":
		return "<function>";
	case "string":
		return o;
	default:
		return String(o);
	}
};
js.Lib = function() { };
js.Lib.__name__ = true;
js.Lib.alert = function(v) {
	alert(js.Boot.__string_rec(v,""));
};
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
Math.NaN = Number.NaN;
Math.NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY;
Math.POSITIVE_INFINITY = Number.POSITIVE_INFINITY;
Math.isFinite = function(i) {
	return isFinite(i);
};
Math.isNaN = function(i1) {
	return isNaN(i1);
};
String.__name__ = true;
Array.__name__ = true;
if(Array.prototype.map == null) Array.prototype.map = function(f) {
	var a = [];
	var _g1 = 0;
	var _g = this.length;
	while(_g1 < _g) {
		var i = _g1++;
		a[i] = f(this[i]);
	}
	return a;
};
if(Array.prototype.filter == null) Array.prototype.filter = function(f1) {
	var a1 = [];
	var _g11 = 0;
	var _g2 = this.length;
	while(_g11 < _g2) {
		var i1 = _g11++;
		var e = this[i1];
		if(f1(e)) a1.push(e);
	}
	return a1;
};
Main.treklang = [50.2,50.2,202.6,202.6,203.9,0,172.1,172.1,172.1,172.1,173.2,173.2,171.8,171.7,171,171,138.2,134.7,134.6,0];
Main.threeNotes = [177.3,173.7,173.7,171.7,171.7,171.4,171.1,169.4,169,166.7,166.5,163,145.9,142.9,138.4,138.4,138.4,139,143.7,147.9,147.9,149.3,149.3,147.9,149.6,150.5,150.5,149.6];
Main.oneNote = [192.3,192.3,192.3,188.9,188.9,186.6,184.1,183.3,183.2,182.9,182.4,182.4,0];
Main.oneNoteC = [128.4,127.3,127.3,125.5,127,127,127,128.6,129.1,129.1,129.1,129.2,129.1];
Main.twoNotes = [226.3,220.9,220.9,217.1,217.1,212.9,209.2,198.4,195.7,195.4,195.3,193.5,166.3,165.9,165.9,165.8,165.2,165.2];
Main.gliss = [139.4,139.4,139.4,139.3,139.4,139.3,139.3,139.1,139.6,139.6,139.8,142.9,145.5,145.8,146.9,146.9,146.9,139.7,138.6,138.6,138.2,138.6,144.3,144.3,143.2,143.9,143.2,143,138.4,138.4,138.3,138.1,138.3];
audiotools.webaudio.pitch.PitchRecognizer.analyzePitch = false;
Main.main();
})();
