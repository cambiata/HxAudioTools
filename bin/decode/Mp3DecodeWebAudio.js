(function () { "use strict";
function $extend(from, fields) {
	function Inherit() {} Inherit.prototype = from; var proto = new Inherit();
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
var HxOverrides = function() { };
HxOverrides.__name__ = true;
HxOverrides.indexOf = function(a,obj,i) {
	var len = a.length;
	if(i < 0) {
		i += len;
		if(i < 0) i = 0;
	}
	while(i < len) {
		if(a[i] === obj) return i;
		i++;
	}
	return -1;
};
HxOverrides.remove = function(a,obj) {
	var i = HxOverrides.indexOf(a,obj,0);
	if(i == -1) return false;
	a.splice(i,1);
	return true;
};
HxOverrides.iter = function(a) {
	return { cur : 0, arr : a, hasNext : function() {
		return this.cur < this.arr.length;
	}, next : function() {
		return this.arr[this.cur++];
	}};
};
var Lambda = function() { };
Lambda.__name__ = true;
Lambda.iter = function(it,f) {
	var $it0 = $iterator(it)();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		f(x);
	}
};
var IMap = function() { };
IMap.__name__ = true;
Math.__name__ = true;
var Std = function() { };
Std.__name__ = true;
Std.string = function(s) {
	return js.Boot.__string_rec(s,"");
};
Std["int"] = function(x) {
	return x | 0;
};
var StringTools = function() { };
StringTools.__name__ = true;
StringTools.fastCodeAt = function(s,index) {
	return s.charCodeAt(index);
};
var audiotools = {};
audiotools.Wav16 = function(channel1,channel2) {
	this.stereo = false;
	this.ch1 = channel1;
	this.ch2 = channel2;
	if(this.ch2 != null && this.ch2.length != this.ch1.length) throw "Stereo file channels must have same length";
	this.stereo = this.ch2 != null;
};
audiotools.Wav16.__name__ = true;
audiotools.Wav16.fromFileBytes = function(wavfileBytes) {
	var wave = new format.wav.Reader(new haxe.io.BytesInput(wavfileBytes)).read();
	var stereo = wave.header.channels == 2;
	var data = wave.data;
	var w16 = null;
	if(stereo) {
		var aInts = audiotools.Wav16Tools.stereoToInts(data,false);
		w16 = new audiotools.Wav16(aInts[0],aInts[1]);
	} else {
		var ints = audiotools.Wav16Tools.monoBytesToInts(data,false);
		w16 = new audiotools.Wav16(ints);
	}
	return w16;
};
audiotools.Wav16.create = function(lengthSamples,stereo,prefill) {
	if(prefill == null) prefill = true;
	if(stereo == null) stereo = false;
	var getChannel = function() {
		var ch;
		var this1;
		this1 = new Array(lengthSamples);
		ch = this1;
		if(prefill) {
			var _g = 0;
			while(_g < lengthSamples) {
				var i = _g++;
				ch[i] = 0;
			}
		}
		return ch;
	};
	return new audiotools.Wav16(getChannel(),stereo?getChannel():null);
};
audiotools.Wav16.createSecs = function(lengthSecs,stereo,prefill) {
	if(prefill == null) prefill = true;
	if(stereo == null) stereo = false;
	return audiotools.Wav16.create(audiotools.Wav16Tools.toSamples(lengthSecs),stereo,prefill);
};
audiotools.Wav16.prototype = {
	get_length: function() {
		return this.ch1.length;
	}
	,toStereo: function() {
		if(this.stereo) return;
		var this1;
		this1 = new Array(this.ch1.length);
		this.ch2 = this1;
		var _g1 = 0;
		var _g = this.ch1.length;
		while(_g1 < _g) {
			var i = _g1++;
			this.ch2[i] = this.ch1[i];
		}
	}
	,__class__: audiotools.Wav16
};
audiotools.Wav16DSP = function() { };
audiotools.Wav16DSP.__name__ = true;
audiotools.Wav16DSP.wspMix = function(w1,w2,mixVol,w1vol,w2vol) {
	if(w2vol == null) w2vol = 1.0;
	if(w1vol == null) w1vol = 1.0;
	if(mixVol == null) mixVol = 1.0;
	var stereo = w1.stereo || w2.stereo;
	if(stereo && !w1.stereo) w1.toStereo();
	if(stereo && !w2.stereo) w2.toStereo();
	var resultCh1 = audiotools.Wav16DSP.dspMix(w1.ch1,w2.ch1,mixVol,w1vol,w2vol);
	var resultCh2 = null;
	if(stereo) resultCh2 = audiotools.Wav16DSP.dspMix(w1.ch2,w2.ch2,mixVol,w1vol,w2vol);
	return new audiotools.Wav16(resultCh1,resultCh2);
};
audiotools.Wav16DSP.wspMixInto = function(w1,w2,offset,w2length,w2Vol) {
	if(w2Vol == null) w2Vol = 1.0;
	if(w2length == null) w2length = -1;
	if(offset == null) offset = 0;
	if(w1.stereo != w2.stereo) {
		w1.toStereo();
		w2.toStereo();
	}
	audiotools.Wav16DSP.dspMixInto(w1.ch1,w2.ch1,offset,w2length,w2Vol);
	if(w1.stereo) audiotools.Wav16DSP.dspMixInto(w1.ch2,w2.ch2,offset,w2length,w2Vol);
};
audiotools.Wav16DSP.dspMix = function(w1,w2,mixVol,w1vol,w2vol) {
	if(w2vol == null) w2vol = 1.0;
	if(w1vol == null) w1vol = 1.0;
	if(mixVol == null) mixVol = 1.0;
	var result;
	var this1;
	this1 = new Array(w1.length);
	result = this1;
	var _g1 = 0;
	var _g = w1.length;
	while(_g1 < _g) {
		var pos = _g1++;
		var v1 = w1[pos] * w1vol;
		var v2 = w2[pos] * w2vol;
		var v3 = Math.floor((v1 + v2) / mixVol);
		result[pos] = v3;
	}
	return result;
};
audiotools.Wav16DSP.dspMixInto = function(w1,w2,offset,w2length,w2vol,soften) {
	if(soften == null) soften = 500;
	if(w2vol == null) w2vol = 1.0;
	if(w2length == null) w2length = -1;
	if(offset == null) offset = 0;
	var length;
	if(w2length > 0) length = Std["int"](Math.min(w2.length,w2length)); else length = w2.length;
	if(offset + length > w1.length) throw "Wav16DSP Error: dspMixInto - ";
	var softenstart = length - soften;
	var _g = 0;
	while(_g < length) {
		var i = _g++;
		var val1 = w1[offset + i];
		var val2 = w2[i] * w2vol | 0;
		if(i > softenstart) {
			var delta = (length - i) / soften;
			val2 = val2 * delta | 0;
		}
		var val3 = val1 + val2;
		w1[offset + i] = val3;
	}
};
audiotools.Wav16DSP.dspFadeIn = function(ints,length,startLevel) {
	if(startLevel == null) startLevel = 0.0;
	var result;
	var this1;
	this1 = new Array(ints.length);
	result = this1;
	var length1 = Std["int"](Math.min(length,ints.length));
	var _g = 0;
	while(_g < length1) {
		var pos = _g++;
		var $int = ints[pos];
		var delta = (1 - startLevel) * (pos / length1) + startLevel;
		var newInt = $int * delta | 0;
		result[pos] = newInt;
	}
	if(length1 < ints.length) {
		var _g1 = length1 + 1;
		var _g2 = ints.length;
		while(_g1 < _g2) {
			var pos1 = _g1++;
			result[pos1] = ints[pos1];
		}
	}
	return result;
};
audiotools.Wav16DSP.dspFadeOut = function(ints,length,endLevel) {
	if(endLevel == null) endLevel = 0.0;
	var result;
	var this1;
	this1 = new Array(ints.length);
	result = this1;
	var length1 = Std["int"](Math.min(length,ints.length));
	var startPos = ints.length - length1;
	if(startPos > 0) {
		var _g1 = 0;
		var _g = startPos - 1;
		while(_g1 < _g) {
			var pos = _g1++;
			result[pos] = ints[pos];
		}
	}
	var _g11 = startPos;
	var _g2 = ints.length;
	while(_g11 < _g2) {
		var pos1 = _g11++;
		var $int = ints[pos1];
		var delta = (endLevel - 1) * ((pos1 - startPos) / length1) + 1;
		var newInt = $int * delta | 0;
		result[pos1] = newInt;
	}
	return result;
};
audiotools.Wav16DSP.dspReverse = function(ints) {
	var result;
	var this1;
	this1 = new Array(ints.length);
	result = this1;
	var len = ints.length - 1;
	var _g1 = 0;
	var _g = ints.length;
	while(_g1 < _g) {
		var i = _g1++;
		result[i] = ints[len - i];
	}
	return result;
};
audiotools.Wav16DSP.interpolate = function(f,a,b) {
	return (b - a) * f + a;
};
audiotools.Wav16Tools = function() { };
audiotools.Wav16Tools.__name__ = true;
audiotools.Wav16Tools.inRange = function(val,min,max) {
	return val >= min && val <= max;
};
audiotools.Wav16Tools.monoBytesToInts = function(wavData,stripWavfileHeader) {
	if(stripWavfileHeader == null) stripWavfileHeader = true;
	var start;
	if(stripWavfileHeader) start = 44; else start = 0;
	var length = ((wavData.length - wavData.length % 2) / 2 | 0) - start;
	var result;
	var this1;
	this1 = new Array(length);
	result = this1;
	var _g = 0;
	while(_g < length) {
		var i = _g++;
		var pos = i * 2;
		var left = wavData.b[pos + start];
		var right = wavData.b[pos + start + 1];
		var val = audiotools.Wav16Tools.ucharsToShort(right,left);
		result[i] = val;
	}
	return result;
};
audiotools.Wav16Tools.stereoToInts = function(wavData,stripWavfileHeader) {
	if(stripWavfileHeader == null) stripWavfileHeader = true;
	var start;
	if(stripWavfileHeader) start = 44; else start = 0;
	var wavDataLength = wavData.length - start;
	var length = (wavDataLength - wavDataLength % 2) / 4 | 0;
	var resultLeft;
	var this1;
	this1 = new Array(length);
	resultLeft = this1;
	var resultRight;
	var this2;
	this2 = new Array(length);
	resultRight = this2;
	var setpos = 0;
	var _g1 = 0;
	var _g = length * 2;
	while(_g1 < _g) {
		var i = _g1++;
		var pos = i * 2;
		var left = wavData.b[pos + start];
		var right = wavData.b[pos + start + 1];
		var val = audiotools.Wav16Tools.ucharsToShort(right,left);
		if(i % 2 == 0) resultLeft[setpos] = val; else {
			resultRight[setpos] = val;
			setpos++;
		}
	}
	return [resultLeft,resultRight];
};
audiotools.Wav16Tools.intsToMono16Bytes = function(ints) {
	var result = haxe.io.Bytes.alloc(ints.length * 2);
	var pos = 0;
	var _g = 0;
	while(_g < ints.length) {
		var v = ints[_g];
		++_g;
		var a = audiotools.Wav16Tools.shortToUChars(v);
		result.set(pos++,a[1]);
		result.set(pos++,a[0]);
	}
	return result;
};
audiotools.Wav16Tools.intsToStero16Bytes = function(leftInts,rightInts) {
	if(leftInts.length != rightInts.length) throw "Left and Right ints lengths differ!";
	var result = haxe.io.Bytes.alloc(leftInts.length * 2 * 2);
	var pos = 0;
	var _g1 = 0;
	var _g = leftInts.length;
	while(_g1 < _g) {
		var i = _g1++;
		var v = leftInts[i];
		var a = audiotools.Wav16Tools.shortToUChars(v);
		result.set(pos++,a[1]);
		result.set(pos++,a[0]);
		var v1 = rightInts[i];
		var a1 = audiotools.Wav16Tools.shortToUChars(v1);
		result.set(pos++,a1[1]);
		result.set(pos++,a1[0]);
	}
	return result;
};
audiotools.Wav16Tools.ucharsToShort = function(ucharLeft,ucharRight) {
	if(ucharLeft < 0) ucharLeft += 256;
	if(ucharRight < 0) ucharLeft += 256;
	if(!(ucharLeft >= 0 && ucharLeft <= 255)) throw "Range error  ucharLeft: " + ucharLeft;
	if(!(ucharRight >= 0 && ucharRight <= 255)) throw "Range error ucharRight: " + ucharRight;
	var negative = (ucharLeft & 128) == 128;
	var result;
	if(!negative) result = (ucharLeft << 8) + ucharRight; else result = -32768 + ((ucharLeft - 128 << 8) + ucharRight);
	return result;
};
audiotools.Wav16Tools.shortToUChars = function($short) {
	if(!($short >= -32767 && $short <= 32767)) {
		console.log("Range error: " + $short);
		return [0,0];
	}
	var result = [0,0];
	if($short >= 0) result = [($short ^ 255) >> 8,$short & 255]; else {
		var i2 = 32768 + $short;
		result = [i2 >> 8 | 128,i2 & 255];
	}
	return result;
};
audiotools.Wav16Tools.createHeader = function(stereo,samplingRate,bitsPerSample) {
	if(bitsPerSample == null) bitsPerSample = 16;
	if(samplingRate == null) samplingRate = 44100;
	if(stereo == null) stereo = false;
	var channels;
	if(stereo) channels = 2; else channels = 1;
	return { format : format.wav.WAVEFormat.WF_PCM, channels : channels, samplingRate : samplingRate, byteRate : samplingRate * channels * bitsPerSample / 8 | 0, blockAlign : channels * bitsPerSample / 8 | 0, bitsPerSample : bitsPerSample};
};
audiotools.Wav16Tools.getWaveformSamples = function(ints,nrOfSamples,sampleAcc) {
	if(sampleAcc == null) sampleAcc = 100;
	var windowSize = Math.floor(ints.length / nrOfSamples + 1);
	var result = [];
	var _g = 0;
	while(_g < nrOfSamples) {
		var i = _g++;
		var start = i * windowSize;
		var end = Std["int"](Math.min(start + sampleAcc,ints.length - 1));
		var maxlevel = 0.0;
		var _g1 = start;
		while(_g1 < end) {
			var j = _g1++;
			var level = Math.abs(ints[j]) / 32767;
			if(level < 0.0001) level = 0;
			if(j > ints.length) level = 0;
			maxlevel = Math.max(level,maxlevel);
		}
		var sqr = Math.sqrt(maxlevel);
		result.push(sqr);
	}
	return result;
};
audiotools.Wav16Tools.toSecs = function(samples) {
	return samples / audiotools.Wav16Tools.SAMPLERATE;
};
audiotools.Wav16Tools.toSamples = function(secs) {
	return secs * audiotools.Wav16Tools.SAMPLERATE | 0;
};
audiotools.Wav16Tools.copyChannel = function(ints) {
	var result;
	var this1;
	this1 = new Array(ints.length);
	result = this1;
	var _g1 = 0;
	var _g = ints.length;
	while(_g1 < _g) {
		var i = _g1++;
		result[i] = ints[i];
	}
	return result;
};
audiotools.Wav16Tools.testplay = function(wav16) {
	audiotools.webaudio.utils.WebAudioTools.testplay(wav16);
	return;
};
audiotools.utils = {};
audiotools.utils.Mp3Decoder = function() { };
audiotools.utils.Mp3Decoder.__name__ = true;
audiotools.utils.Mp3Decoder.setContext = function(context) {
	audiotools.utils.Mp3Wav16Decoder.context = context;
};
audiotools.utils.Mp3Decoder.prototype = {
	getWavFile: function(filename) {
		var f = new tink.core.FutureTrigger();
		if(audiotools.utils.Mp3Decoder.context == null) {
			js.Lib.alert("No AudioContext!");
			f.trigger(tink.core.Outcome.Failure({ filename : filename, message : "No AudioContext!"}));
		}
		new audiotools.webaudio.Mp3ToBuffer(filename,audiotools.utils.Mp3Decoder.context).setLoadedHandler(function(buffer,filename1) {
			var bytes = null;
			var left = buffer.getChannelData(0);
			var leftInts;
			var this1;
			this1 = new Array(left.length);
			leftInts = this1;
			var pos = 0;
			var _g = 0;
			while(_g < left.length) {
				var n = left[_g];
				++_g;
				leftInts[pos] = n * 32767 | 0;
				pos++;
			}
			if(buffer.numberOfChannels > 1) {
				var right = buffer.getChannelData(1);
				var rightInts;
				var this2;
				this2 = new Array(right.length);
				rightInts = this2;
				var pos1 = 0;
				var _g1 = 0;
				while(_g1 < right.length) {
					var n1 = right[_g1];
					++_g1;
					rightInts[pos1] = n1 * 32767 | 0;
					pos1++;
				}
				bytes = audiotools.Wav16Tools.intsToStero16Bytes(leftInts,rightInts);
			} else bytes = audiotools.Wav16Tools.intsToMono16Bytes(leftInts);
			f.trigger(tink.core.Outcome.Success({ filename : filename1, bytes : bytes}));
		}).load();
		return f.future;
	}
	,__class__: audiotools.utils.Mp3Decoder
};
audiotools.utils.Mp3Wav16Decoder = function() { };
audiotools.utils.Mp3Wav16Decoder.__name__ = true;
audiotools.utils.Mp3Wav16Decoder.decode = function(filename) {
	var f = new tink.core.FutureTrigger();
	if(audiotools.utils.Mp3Wav16Decoder.context == null) {
		js.Lib.alert("No AudioContext!");
		f.trigger(tink.core.Outcome.Failure({ filename : filename, message : "No AudioContext!"}));
	}
	new audiotools.webaudio.Mp3ToBuffer(filename,audiotools.utils.Mp3Wav16Decoder.context).setLoadedHandler(function(buffer,filename1) {
		var wavBytes = null;
		var left = buffer.getChannelData(0);
		var leftInts;
		var this1;
		this1 = new Array(left.length);
		leftInts = this1;
		var pos = 0;
		var _g = 0;
		while(_g < left.length) {
			var n = left[_g];
			++_g;
			leftInts[pos] = n * 32767 | 0;
			pos++;
		}
		var w16 = null;
		if(buffer.numberOfChannels > 1) {
			var right = buffer.getChannelData(1);
			var rightInts;
			var this2;
			this2 = new Array(right.length);
			rightInts = this2;
			var pos1 = 0;
			var _g1 = 0;
			while(_g1 < right.length) {
				var n1 = right[_g1];
				++_g1;
				rightInts[pos1] = n1 * 32767 | 0;
				pos1++;
			}
			w16 = new audiotools.Wav16(leftInts,rightInts);
		} else w16 = new audiotools.Wav16(leftInts);
		f.trigger(tink.core.Outcome.Success({ filename : filename1, w16 : w16}));
	}).load();
	return f.future;
};
audiotools.utils.Mp3Wav16Decoders = function() { };
audiotools.utils.Mp3Wav16Decoders.__name__ = true;
audiotools.utils.Mp3Wav16Decoders.setContext = function(context) {
	audiotools.utils.Mp3Wav16Decoder.context = context;
};
audiotools.utils.Mp3Wav16Decoders.decodeAll = function(filenames) {
	return tink.core._Future.Future_Impl_.fromMany((function($this) {
		var $r;
		var _g = [];
		{
			var _g1 = 0;
			while(_g1 < filenames.length) {
				var filename = filenames[_g1];
				++_g1;
				_g.push(audiotools.utils.Mp3Wav16Decoder.decode(filename));
			}
		}
		$r = _g;
		return $r;
	}(this)));
};
audiotools.utils.Mp3Wav16Decoders.decodeAllMap = function(filenames) {
	var f = new tink.core.FutureTrigger();
	var result = new haxe.ds.StringMap();
	var this1 = audiotools.utils.Mp3Wav16Decoders.decodeAll(filenames);
	this1(function(items) {
		Lambda.iter(items,function(item) {
			switch(item[1]) {
			case 0:
				var wav16file = item[2];
				result.set(wav16file.filename,wav16file.w16);
				break;
			case 1:
				var wav16Error = item[2];
				break;
			}
		});
		f.trigger(result);
	});
	return f.future;
};
audiotools.webaudio = {};
audiotools.webaudio.Mp3ToBuffer = function(url,context) {
	this.url = url;
	this.context = context;
};
audiotools.webaudio.Mp3ToBuffer.__name__ = true;
audiotools.webaudio.Mp3ToBuffer.prototype = {
	load: function() {
		var _g = this;
		var request = new XMLHttpRequest();
		request.open("GET",this.url,true);
		request.responseType = "arraybuffer";
		request.onload = function(_) {
			_g.context.decodeAudioData(request.response,function(buffer) {
				console.log("Loaded and decoded track...");
				_g.audioBuffer = buffer;
				_g.onLoaded(_g.audioBuffer,_g.url);
				if(buffer == null) {
					js.Lib.alert("error decoding file data: " + _g.url);
					return false;
				}
				return true;
			},function(error) {
				js.Lib.alert("decodeAudioData error " + Std.string(error));
				return false;
			});
		};
		request.onprogress = function(e) {
			if(e.total != 0) {
			}
		};
		request.onerror = function(e1) {
			js.Lib.alert("BufferLoader: XHR error");
		};
		request.send();
	}
	,onLoaded: function(audioBuffer,filename) {
		console.log(audioBuffer);
		console.log(filename);
	}
	,setLoadedHandler: function(callbck) {
		this.onLoaded = callbck;
		return this;
	}
	,__class__: audiotools.webaudio.Mp3ToBuffer
};
audiotools.webaudio.utils = {};
audiotools.webaudio.utils.Wav16Canvas = function() { };
audiotools.webaudio.utils.Wav16Canvas.__name__ = true;
audiotools.webaudio.utils.Wav16Canvas.drawWave = function(canvas,wav16,width,height) {
	var gr = canvas.getContext("2d");
	gr.beginPath();
	gr.rect(0,0,width,height);
	gr.fillStyle = "#eeeeee";
	gr.fill();
	gr.lineWidth = 1;
	gr.strokeStyle = "#000077";
	gr.stroke();
	var graphLeft = audiotools.Wav16Tools.getWaveformSamples(wav16.ch1,width | 0);
	var graphRight = null;
	if(wav16.stereo) graphRight = audiotools.Wav16Tools.getWaveformSamples(wav16.ch2,width | 0);
	var maxlevel = height / 2;
	var incr = graphLeft.length / width;
	if(wav16.stereo) {
		var _y = height * .25;
		var _x = 0;
		gr.beginPath();
		gr.moveTo(_x,_y);
		gr.lineTo(_x + width,_y);
		gr.stroke();
		var incrPos = 0;
		var _width = width | 0;
		var _g = 0;
		while(_g < _width) {
			var _x1 = _g++;
			var samplepos = Math.round(incrPos);
			var sampleLeft = graphLeft[samplepos];
			var length = maxlevel * sampleLeft / 2;
			gr.beginPath();
			gr.moveTo(_x1,_y - length);
			gr.lineTo(_x1,_y + length);
			gr.stroke();
			incrPos += incr;
		}
		var _y1 = height * .75;
		var _x2 = 0;
		gr.beginPath();
		gr.moveTo(_x2,_y1);
		gr.lineTo(_x2 + width,_y1);
		gr.stroke();
		var incrPos1 = 0;
		var _width1 = width | 0;
		var _g1 = 0;
		while(_g1 < _width1) {
			var _x3 = _g1++;
			var samplepos1 = Math.round(incrPos1);
			var sampleLeft1 = graphRight[samplepos1];
			var length1 = maxlevel * sampleLeft1 / 2;
			gr.beginPath();
			gr.moveTo(_x3,_y1 - length1);
			gr.lineTo(_x3,_y1 + length1);
			gr.stroke();
			incrPos1 += incr;
		}
	} else {
		var _y2 = height / 2;
		var _x4 = 0;
		gr.beginPath();
		gr.moveTo(_x4,_y2);
		gr.lineTo(_x4 + width,_y2);
		gr.stroke();
		var incrPos2 = 0;
		var _width2 = width | 0;
		var _g2 = 0;
		while(_g2 < _width2) {
			var _x5 = _g2++;
			var samplepos2 = Math.round(incrPos2);
			var sampleLeft2 = graphLeft[samplepos2];
			var length2 = maxlevel * sampleLeft2;
			gr.beginPath();
			gr.moveTo(_x5,_y2 - length2);
			gr.lineTo(_x5,_y2 + length2);
			gr.stroke();
			incrPos2 += incr;
		}
	}
};
audiotools.webaudio.utils.WebAudioTools = function() { };
audiotools.webaudio.utils.WebAudioTools.__name__ = true;
audiotools.webaudio.utils.WebAudioTools.createBufferFromWav16 = function(wav16,context,samplerate) {
	if(samplerate == null) samplerate = 44100;
	var stereo = wav16.stereo;
	var length = wav16.ch1.length;
	var left = new Float32Array(length);
	var pos = 0;
	var _g = 0;
	var _g1 = wav16.ch1;
	while(_g < _g1.length) {
		var $int = _g1[_g];
		++_g;
		left[pos] = $int / 32767;
		pos++;
	}
	var right = null;
	if(stereo) {
		right = new Float32Array(length);
		var pos1 = 0;
		var _g2 = 0;
		var _g11 = wav16.ch2;
		while(_g2 < _g11.length) {
			var int1 = _g11[_g2];
			++_g2;
			right[pos1] = int1 / 32767;
			pos1++;
		}
	}
	var newbuffer = null;
	if(stereo) {
		newbuffer = context.createBuffer(2,left.length,samplerate);
		newbuffer.getChannelData(0).set(left);
		newbuffer.getChannelData(1).set(right);
	} else {
		newbuffer = context.createBuffer(1,left.length,samplerate);
		newbuffer.getChannelData(0).set(left);
	}
	return newbuffer;
};
audiotools.webaudio.utils.WebAudioTools.testplay = function(w,context) {
	if(context == null) context = audiotools.webaudio.utils.WebAudioTools.getAudioContext();
	var source = context.createBufferSource();
	source.buffer = audiotools.webaudio.utils.WebAudioTools.createBufferFromWav16(w,context,48000);
	source.connect(context.destination,0,0);
	source.start(0);
};
audiotools.webaudio.utils.WebAudioTools.getAudioContext = function() {
	if(audiotools.webaudio.utils.WebAudioTools._context == null) audiotools.webaudio.utils.WebAudioTools._context = audiotools.webaudio.utils.WebAudioTools.createAudioContext();
	return audiotools.webaudio.utils.WebAudioTools._context;
};
audiotools.webaudio.utils.WebAudioTools.createAudioContext = function() {
	var context = null;
	
			if (typeof AudioContext == "function") {
				context = new AudioContext();
				console.log("USING STANDARD WEB AUDIO API");
				//alert("Standard Web Audio Api");
			} else if ((typeof webkitAudioContext == "function") || (typeof webkitAudioContext == "object")) {
				context = new webkitAudioContext();
				console.log("USING WEBKIT AUDIO API");
				//alert("Using Webkit Web Audio Api");
			} else {
				alert("AudioContext is not supported.");
				throw new Error("AudioContext is not supported. :(");
			}
		;
	return context;
};
var examples = {};
examples.decode = {};
examples.decode.Main = function() { };
examples.decode.Main.__name__ = true;
examples.decode.Main.main = function() {
	audiotools.utils.Mp3Wav16Decoders.setContext(audiotools.webaudio.utils.WebAudioTools.getAudioContext());
	var decoder = audiotools.utils.Mp3Wav16Decoder.decode("sample.mp3");
	decoder(function(data) {
		console.log("decoded...");
	});
	var this1 = audiotools.utils.Mp3Wav16Decoders.decodeAll(["sample.mp3","leadvox.mp3"]);
	this1(function(items) {
		var _g = 0;
		while(_g < items.length) {
			var item = items[_g];
			++_g;
			switch(item[1]) {
			case 0:
				var wav16file = item[2];
				console.log(wav16file.filename);
				break;
			case 1:
				var wav16error = item[2];
				console.log(wav16error.message);
				break;
			}
		}
	});
};
examples.decode.Main.displayWave = function(wav16,index,text) {
	var par;
	var _this = window.document;
	par = _this.createElement("p");
	par.innerHTML = text;
	window.document.body.appendChild(par);
	var canvas;
	var _this1 = window.document;
	canvas = _this1.createElement("canvas");
	canvas.setAttribute("width","400px");
	canvas.setAttribute("height","100px");
	window.document.body.appendChild(canvas);
	window.document.body.appendChild((function($this) {
		var $r;
		var _this2 = window.document;
		$r = _this2.createElement("br");
		return $r;
	}(this)));
	audiotools.webaudio.utils.Wav16Canvas.drawWave(canvas,wav16,400,100);
};
var format = {};
format.wav = {};
format.wav.WAVEFormat = { __ename__ : true, __constructs__ : ["WF_PCM"] };
format.wav.WAVEFormat.WF_PCM = ["WF_PCM",0];
format.wav.WAVEFormat.WF_PCM.__enum__ = format.wav.WAVEFormat;
format.wav.Reader = function(i) {
	this.i = i;
	i.set_bigEndian(false);
};
format.wav.Reader.__name__ = true;
format.wav.Reader.prototype = {
	readInt: function() {
		return this.i.readInt32();
	}
	,read: function() {
		if(this.i.readString(4) != "RIFF") throw "RIFF header expected";
		var len = this.i.readInt32();
		if(this.i.readString(4) != "WAVE") throw "WAVE signature not found";
		if(this.i.readString(4) != "fmt ") throw "expected fmt subchunk";
		var fmtlen = this.i.readInt32();
		var format1;
		var _g = this.i.readUInt16();
		switch(_g) {
		case 1:
			format1 = format.wav.WAVEFormat.WF_PCM;
			break;
		default:
			throw "only PCM (uncompressed) WAV files are supported";
		}
		var channels = this.i.readUInt16();
		var samplingRate = this.i.readInt32();
		var byteRate = this.i.readInt32();
		var blockAlign = this.i.readUInt16();
		var bitsPerSample = this.i.readUInt16();
		if(fmtlen > 16) this.i.read(fmtlen - 16);
		var nextChunk = this.i.readString(4);
		while(nextChunk != "data") {
			this.i.read(this.i.readInt32());
			nextChunk = this.i.readString(4);
		}
		if(nextChunk != "data") throw "expected data subchunk";
		var datalen = this.i.readInt32();
		var data = this.i.readAll();
		if(data.length > datalen) data = data.sub(0,datalen);
		return { header : { format : format1, channels : channels, samplingRate : samplingRate, byteRate : byteRate, blockAlign : blockAlign, bitsPerSample : bitsPerSample}, data : data};
	}
	,__class__: format.wav.Reader
};
format.wav.Writer = function(output) {
	this.o = output;
	this.o.set_bigEndian(false);
};
format.wav.Writer.__name__ = true;
format.wav.Writer.prototype = {
	write: function(wav) {
		var hdr = wav.header;
		this.o.writeString("RIFF");
		this.o.writeInt32(36 + wav.data.length);
		this.o.writeString("WAVE");
		this.o.writeString("fmt ");
		this.o.writeInt32(16);
		this.o.writeUInt16(1);
		this.o.writeUInt16(hdr.channels);
		this.o.writeInt32(hdr.samplingRate);
		this.o.writeInt32(hdr.byteRate);
		this.o.writeUInt16(hdr.blockAlign);
		this.o.writeUInt16(hdr.bitsPerSample);
		this.o.writeString("data");
		this.o.writeInt32(wav.data.length);
		this.o.write(wav.data);
	}
	,writeInt: function(v) {
		this.o.writeInt32(v);
	}
	,__class__: format.wav.Writer
};
var haxe = {};
haxe.ds = {};
haxe.ds.Option = { __ename__ : true, __constructs__ : ["Some","None"] };
haxe.ds.Option.Some = function(v) { var $x = ["Some",0,v]; $x.__enum__ = haxe.ds.Option; return $x; };
haxe.ds.Option.None = ["None",1];
haxe.ds.Option.None.__enum__ = haxe.ds.Option;
haxe.ds.StringMap = function() {
	this.h = { };
};
haxe.ds.StringMap.__name__ = true;
haxe.ds.StringMap.__interfaces__ = [IMap];
haxe.ds.StringMap.prototype = {
	set: function(key,value) {
		this.h["$" + key] = value;
	}
	,__class__: haxe.ds.StringMap
};
haxe.io = {};
haxe.io.Bytes = function(length,b) {
	this.length = length;
	this.b = b;
};
haxe.io.Bytes.__name__ = true;
haxe.io.Bytes.alloc = function(length) {
	var a = new Array();
	var _g = 0;
	while(_g < length) {
		var i = _g++;
		a.push(0);
	}
	return new haxe.io.Bytes(length,a);
};
haxe.io.Bytes.ofString = function(s) {
	var a = new Array();
	var i = 0;
	while(i < s.length) {
		var c = StringTools.fastCodeAt(s,i++);
		if(55296 <= c && c <= 56319) c = c - 55232 << 10 | StringTools.fastCodeAt(s,i++) & 1023;
		if(c <= 127) a.push(c); else if(c <= 2047) {
			a.push(192 | c >> 6);
			a.push(128 | c & 63);
		} else if(c <= 65535) {
			a.push(224 | c >> 12);
			a.push(128 | c >> 6 & 63);
			a.push(128 | c & 63);
		} else {
			a.push(240 | c >> 18);
			a.push(128 | c >> 12 & 63);
			a.push(128 | c >> 6 & 63);
			a.push(128 | c & 63);
		}
	}
	return new haxe.io.Bytes(a.length,a);
};
haxe.io.Bytes.prototype = {
	set: function(pos,v) {
		this.b[pos] = v & 255;
	}
	,sub: function(pos,len) {
		if(pos < 0 || len < 0 || pos + len > this.length) throw haxe.io.Error.OutsideBounds;
		return new haxe.io.Bytes(len,this.b.slice(pos,pos + len));
	}
	,getString: function(pos,len) {
		if(pos < 0 || len < 0 || pos + len > this.length) throw haxe.io.Error.OutsideBounds;
		var s = "";
		var b = this.b;
		var fcc = String.fromCharCode;
		var i = pos;
		var max = pos + len;
		while(i < max) {
			var c = b[i++];
			if(c < 128) {
				if(c == 0) break;
				s += fcc(c);
			} else if(c < 224) s += fcc((c & 63) << 6 | b[i++] & 127); else if(c < 240) {
				var c2 = b[i++];
				s += fcc((c & 31) << 12 | (c2 & 127) << 6 | b[i++] & 127);
			} else {
				var c21 = b[i++];
				var c3 = b[i++];
				var u = (c & 15) << 18 | (c21 & 127) << 12 | (c3 & 127) << 6 | b[i++] & 127;
				s += fcc((u >> 10) + 55232);
				s += fcc(u & 1023 | 56320);
			}
		}
		return s;
	}
	,toString: function() {
		return this.getString(0,this.length);
	}
	,__class__: haxe.io.Bytes
};
haxe.io.BytesBuffer = function() {
	this.b = new Array();
};
haxe.io.BytesBuffer.__name__ = true;
haxe.io.BytesBuffer.prototype = {
	addBytes: function(src,pos,len) {
		if(pos < 0 || len < 0 || pos + len > src.length) throw haxe.io.Error.OutsideBounds;
		var b1 = this.b;
		var b2 = src.b;
		var _g1 = pos;
		var _g = pos + len;
		while(_g1 < _g) {
			var i = _g1++;
			this.b.push(b2[i]);
		}
	}
	,getBytes: function() {
		var bytes = new haxe.io.Bytes(this.b.length,this.b);
		this.b = null;
		return bytes;
	}
	,__class__: haxe.io.BytesBuffer
};
haxe.io.Input = function() { };
haxe.io.Input.__name__ = true;
haxe.io.Input.prototype = {
	readByte: function() {
		throw "Not implemented";
	}
	,readBytes: function(s,pos,len) {
		var k = len;
		var b = s.b;
		if(pos < 0 || len < 0 || pos + len > s.length) throw haxe.io.Error.OutsideBounds;
		while(k > 0) {
			b[pos] = this.readByte();
			pos++;
			k--;
		}
		return len;
	}
	,set_bigEndian: function(b) {
		this.bigEndian = b;
		return b;
	}
	,readAll: function(bufsize) {
		if(bufsize == null) bufsize = 16384;
		var buf = haxe.io.Bytes.alloc(bufsize);
		var total = new haxe.io.BytesBuffer();
		try {
			while(true) {
				var len = this.readBytes(buf,0,bufsize);
				if(len == 0) throw haxe.io.Error.Blocked;
				total.addBytes(buf,0,len);
			}
		} catch( e ) {
			if( js.Boot.__instanceof(e,haxe.io.Eof) ) {
			} else throw(e);
		}
		return total.getBytes();
	}
	,readFullBytes: function(s,pos,len) {
		while(len > 0) {
			var k = this.readBytes(s,pos,len);
			pos += k;
			len -= k;
		}
	}
	,read: function(nbytes) {
		var s = haxe.io.Bytes.alloc(nbytes);
		var p = 0;
		while(nbytes > 0) {
			var k = this.readBytes(s,p,nbytes);
			if(k == 0) throw haxe.io.Error.Blocked;
			p += k;
			nbytes -= k;
		}
		return s;
	}
	,readUInt16: function() {
		var ch1 = this.readByte();
		var ch2 = this.readByte();
		if(this.bigEndian) return ch2 | ch1 << 8; else return ch1 | ch2 << 8;
	}
	,readInt32: function() {
		var ch1 = this.readByte();
		var ch2 = this.readByte();
		var ch3 = this.readByte();
		var ch4 = this.readByte();
		if(this.bigEndian) return ch4 | ch3 << 8 | ch2 << 16 | ch1 << 24; else return ch1 | ch2 << 8 | ch3 << 16 | ch4 << 24;
	}
	,readString: function(len) {
		var b = haxe.io.Bytes.alloc(len);
		this.readFullBytes(b,0,len);
		return b.toString();
	}
	,__class__: haxe.io.Input
};
haxe.io.BytesInput = function(b,pos,len) {
	if(pos == null) pos = 0;
	if(len == null) len = b.length - pos;
	if(pos < 0 || len < 0 || pos + len > b.length) throw haxe.io.Error.OutsideBounds;
	this.b = b.b;
	this.pos = pos;
	this.len = len;
	this.totlen = len;
};
haxe.io.BytesInput.__name__ = true;
haxe.io.BytesInput.__super__ = haxe.io.Input;
haxe.io.BytesInput.prototype = $extend(haxe.io.Input.prototype,{
	readByte: function() {
		if(this.len == 0) throw new haxe.io.Eof();
		this.len--;
		return this.b[this.pos++];
	}
	,readBytes: function(buf,pos,len) {
		if(pos < 0 || len < 0 || pos + len > buf.length) throw haxe.io.Error.OutsideBounds;
		if(this.len == 0 && len > 0) throw new haxe.io.Eof();
		if(this.len < len) len = this.len;
		var b1 = this.b;
		var b2 = buf.b;
		var _g = 0;
		while(_g < len) {
			var i = _g++;
			b2[pos + i] = b1[this.pos + i];
		}
		this.pos += len;
		this.len -= len;
		return len;
	}
	,__class__: haxe.io.BytesInput
});
haxe.io.Output = function() { };
haxe.io.Output.__name__ = true;
haxe.io.Output.prototype = {
	writeByte: function(c) {
		throw "Not implemented";
	}
	,writeBytes: function(s,pos,len) {
		var k = len;
		var b = s.b;
		if(pos < 0 || len < 0 || pos + len > s.length) throw haxe.io.Error.OutsideBounds;
		while(k > 0) {
			this.writeByte(b[pos]);
			pos++;
			k--;
		}
		return len;
	}
	,set_bigEndian: function(b) {
		this.bigEndian = b;
		return b;
	}
	,write: function(s) {
		var l = s.length;
		var p = 0;
		while(l > 0) {
			var k = this.writeBytes(s,p,l);
			if(k == 0) throw haxe.io.Error.Blocked;
			p += k;
			l -= k;
		}
	}
	,writeFullBytes: function(s,pos,len) {
		while(len > 0) {
			var k = this.writeBytes(s,pos,len);
			pos += k;
			len -= k;
		}
	}
	,writeUInt16: function(x) {
		if(x < 0 || x >= 65536) throw haxe.io.Error.Overflow;
		if(this.bigEndian) {
			this.writeByte(x >> 8);
			this.writeByte(x & 255);
		} else {
			this.writeByte(x & 255);
			this.writeByte(x >> 8);
		}
	}
	,writeInt32: function(x) {
		if(this.bigEndian) {
			this.writeByte(x >>> 24);
			this.writeByte(x >> 16 & 255);
			this.writeByte(x >> 8 & 255);
			this.writeByte(x & 255);
		} else {
			this.writeByte(x & 255);
			this.writeByte(x >> 8 & 255);
			this.writeByte(x >> 16 & 255);
			this.writeByte(x >>> 24);
		}
	}
	,writeString: function(s) {
		var b = haxe.io.Bytes.ofString(s);
		this.writeFullBytes(b,0,b.length);
	}
	,__class__: haxe.io.Output
};
haxe.io.Eof = function() {
};
haxe.io.Eof.__name__ = true;
haxe.io.Eof.prototype = {
	toString: function() {
		return "Eof";
	}
	,__class__: haxe.io.Eof
};
haxe.io.Error = { __ename__ : true, __constructs__ : ["Blocked","Overflow","OutsideBounds","Custom"] };
haxe.io.Error.Blocked = ["Blocked",0];
haxe.io.Error.Blocked.__enum__ = haxe.io.Error;
haxe.io.Error.Overflow = ["Overflow",1];
haxe.io.Error.Overflow.__enum__ = haxe.io.Error;
haxe.io.Error.OutsideBounds = ["OutsideBounds",2];
haxe.io.Error.OutsideBounds.__enum__ = haxe.io.Error;
haxe.io.Error.Custom = function(e) { var $x = ["Custom",3,e]; $x.__enum__ = haxe.io.Error; return $x; };
var js = {};
js.Boot = function() { };
js.Boot.__name__ = true;
js.Boot.getClass = function(o) {
	if((o instanceof Array) && o.__enum__ == null) return Array; else return o.__class__;
};
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
js.Boot.__interfLoop = function(cc,cl) {
	if(cc == null) return false;
	if(cc == cl) return true;
	var intf = cc.__interfaces__;
	if(intf != null) {
		var _g1 = 0;
		var _g = intf.length;
		while(_g1 < _g) {
			var i = _g1++;
			var i1 = intf[i];
			if(i1 == cl || js.Boot.__interfLoop(i1,cl)) return true;
		}
	}
	return js.Boot.__interfLoop(cc.__super__,cl);
};
js.Boot.__instanceof = function(o,cl) {
	if(cl == null) return false;
	switch(cl) {
	case Int:
		return (o|0) === o;
	case Float:
		return typeof(o) == "number";
	case Bool:
		return typeof(o) == "boolean";
	case String:
		return typeof(o) == "string";
	case Array:
		return (o instanceof Array) && o.__enum__ == null;
	case Dynamic:
		return true;
	default:
		if(o != null) {
			if(typeof(cl) == "function") {
				if(o instanceof cl) return true;
				if(js.Boot.__interfLoop(js.Boot.getClass(o),cl)) return true;
			}
		} else return false;
		if(cl == Class && o.__name__ != null) return true;
		if(cl == Enum && o.__ename__ != null) return true;
		return o.__enum__ == cl;
	}
};
js.Lib = function() { };
js.Lib.__name__ = true;
js.Lib.alert = function(v) {
	alert(js.Boot.__string_rec(v,""));
};
var tink = {};
tink.core = {};
tink.core._Callback = {};
tink.core._Callback.Callback_Impl_ = function() { };
tink.core._Callback.Callback_Impl_.__name__ = true;
tink.core._Callback.Callback_Impl_._new = function(f) {
	return f;
};
tink.core._Callback.Callback_Impl_.invoke = function(this1,data) {
	this1(data);
};
tink.core._Callback.Callback_Impl_.fromNiladic = function(f) {
	return function(r) {
		f();
	};
};
tink.core._Callback.Callback_Impl_.fromMany = function(callbacks) {
	return function(v) {
		var _g = 0;
		while(_g < callbacks.length) {
			var callback = callbacks[_g];
			++_g;
			callback(v);
		}
	};
};
tink.core._Callback.CallbackLink_Impl_ = function() { };
tink.core._Callback.CallbackLink_Impl_.__name__ = true;
tink.core._Callback.CallbackLink_Impl_._new = function(link) {
	return link;
};
tink.core._Callback.CallbackLink_Impl_.dissolve = function(this1) {
	if(this1 != null) this1();
};
tink.core._Callback.CallbackLink_Impl_.toCallback = function(this1) {
	var f = this1;
	return function(r) {
		f();
	};
};
tink.core._Callback.CallbackLink_Impl_.fromFunction = function(f) {
	return f;
};
tink.core._Callback.CallbackLink_Impl_.fromMany = function(callbacks) {
	return function() {
		var _g = 0;
		while(_g < callbacks.length) {
			var cb = callbacks[_g];
			++_g;
			if(cb != null) cb();
		}
	};
};
tink.core._Callback.Cell = function() {
};
tink.core._Callback.Cell.__name__ = true;
tink.core._Callback.Cell.get = function() {
	if(tink.core._Callback.Cell.pool.length > 0) return tink.core._Callback.Cell.pool.pop(); else return new tink.core._Callback.Cell();
};
tink.core._Callback.Cell.prototype = {
	free: function() {
		this.cb = null;
		tink.core._Callback.Cell.pool.push(this);
	}
	,__class__: tink.core._Callback.Cell
};
tink.core._Callback.CallbackList_Impl_ = function() { };
tink.core._Callback.CallbackList_Impl_.__name__ = true;
tink.core._Callback.CallbackList_Impl_._new = function() {
	return [];
};
tink.core._Callback.CallbackList_Impl_.get_length = function(this1) {
	return this1.length;
};
tink.core._Callback.CallbackList_Impl_.add = function(this1,cb) {
	var cell;
	if(tink.core._Callback.Cell.pool.length > 0) cell = tink.core._Callback.Cell.pool.pop(); else cell = new tink.core._Callback.Cell();
	cell.cb = cb;
	this1.push(cell);
	return function() {
		if(HxOverrides.remove(this1,cell)) {
			cell.cb = null;
			tink.core._Callback.Cell.pool.push(cell);
		}
		cell = null;
	};
};
tink.core._Callback.CallbackList_Impl_.invoke = function(this1,data) {
	var _g = 0;
	var _g1 = this1.slice();
	while(_g < _g1.length) {
		var cell = _g1[_g];
		++_g;
		if(cell.cb != null) cell.cb(data);
	}
};
tink.core._Callback.CallbackList_Impl_.clear = function(this1) {
	var _g = 0;
	var _g1 = this1.splice(0,this1.length);
	while(_g < _g1.length) {
		var cell = _g1[_g];
		++_g;
		cell.cb = null;
		tink.core._Callback.Cell.pool.push(cell);
	}
};
tink.core.Either = { __ename__ : true, __constructs__ : ["Left","Right"] };
tink.core.Either.Left = function(a) { var $x = ["Left",0,a]; $x.__enum__ = tink.core.Either; return $x; };
tink.core.Either.Right = function(b) { var $x = ["Right",1,b]; $x.__enum__ = tink.core.Either; return $x; };
tink.core._Error = {};
tink.core._Error.ErrorCode_Impl_ = function() { };
tink.core._Error.ErrorCode_Impl_.__name__ = true;
tink.core.TypedError = function(code,message,pos) {
	if(code == null) code = 500;
	this.code = code;
	this.message = message;
	this.pos = pos;
};
tink.core.TypedError.__name__ = true;
tink.core.TypedError.withData = function(code,message,data,pos) {
	if(code == null) code = 500;
	var ret = new tink.core.TypedError(code,message,pos);
	ret.data = data;
	return ret;
};
tink.core.TypedError.prototype = {
	printPos: function() {
		return this.pos.className + "." + this.pos.methodName + ":" + this.pos.lineNumber;
	}
	,toString: function() {
		var ret = "Error: " + this.message;
		if(this.pos != null) ret += " " + this.printPos();
		return ret;
	}
	,throwSelf: function() {
		throw this;
	}
	,__class__: tink.core.TypedError
};
tink.core._Future = {};
tink.core._Future.Future_Impl_ = function() { };
tink.core._Future.Future_Impl_.__name__ = true;
tink.core._Future.Future_Impl_._new = function(f) {
	return f;
};
tink.core._Future.Future_Impl_.handle = function(this1,callback) {
	return this1(callback);
};
tink.core._Future.Future_Impl_.gather = function(this1) {
	var op = new tink.core.FutureTrigger();
	var self = this1;
	return tink.core._Future.Future_Impl_._new(function(cb) {
		if(self != null) {
			this1($bind(op,op.trigger));
			self = null;
		}
		return op.future(cb);
	});
};
tink.core._Future.Future_Impl_.first = function(this1,other) {
	return tink.core._Future.Future_Impl_.async(function(cb) {
		this1(cb);
		other(cb);
	});
};
tink.core._Future.Future_Impl_.map = function(this1,f,gather) {
	if(gather == null) gather = true;
	var ret = tink.core._Future.Future_Impl_._new(function(callback) {
		return this1(function(result) {
			var data = f(result);
			callback(data);
		});
	});
	if(gather) return tink.core._Future.Future_Impl_.gather(ret); else return ret;
};
tink.core._Future.Future_Impl_.flatMap = function(this1,next,gather) {
	if(gather == null) gather = true;
	var ret = tink.core._Future.Future_Impl_.flatten(tink.core._Future.Future_Impl_.map(this1,next,gather));
	if(gather) return tink.core._Future.Future_Impl_.gather(ret); else return ret;
};
tink.core._Future.Future_Impl_.merge = function(this1,other,merger,gather) {
	if(gather == null) gather = true;
	return tink.core._Future.Future_Impl_.flatMap(this1,function(t) {
		return tink.core._Future.Future_Impl_.map(other,function(a) {
			return merger(t,a);
		},false);
	},gather);
};
tink.core._Future.Future_Impl_.flatten = function(f) {
	return tink.core._Future.Future_Impl_._new(function(callback) {
		var ret = null;
		ret = f(function(next) {
			ret = next(function(result) {
				callback(result);
			});
		});
		return ret;
	});
};
tink.core._Future.Future_Impl_.fromTrigger = function(trigger) {
	return trigger.future;
};
tink.core._Future.Future_Impl_.ofMany = function(futures,gather) {
	if(gather == null) gather = true;
	var ret = tink.core._Future.Future_Impl_.sync([]);
	var _g = 0;
	while(_g < futures.length) {
		var f = [futures[_g]];
		++_g;
		ret = tink.core._Future.Future_Impl_.flatMap(ret,(function(f) {
			return function(results) {
				return tink.core._Future.Future_Impl_.map(f[0],(function() {
					return function(result) {
						return results.concat([result]);
					};
				})(),false);
			};
		})(f),false);
	}
	if(gather) return tink.core._Future.Future_Impl_.gather(ret); else return ret;
};
tink.core._Future.Future_Impl_.fromMany = function(futures) {
	return tink.core._Future.Future_Impl_.ofMany(futures);
};
tink.core._Future.Future_Impl_.lazy = function(l) {
	return tink.core._Future.Future_Impl_._new(function(cb) {
		var data = l();
		cb(data);
		return null;
	});
};
tink.core._Future.Future_Impl_.sync = function(v) {
	return tink.core._Future.Future_Impl_._new(function(callback) {
		callback(v);
		return null;
	});
};
tink.core._Future.Future_Impl_.async = function(f,lazy) {
	if(lazy == null) lazy = false;
	if(lazy) return tink.core._Future.Future_Impl_.flatten(tink.core._Future.Future_Impl_.lazy(tink.core._Lazy.Lazy_Impl_.ofFunc((function(f1,f2,a1) {
		return function() {
			return f1(f2,a1);
		};
	})(tink.core._Future.Future_Impl_.async,f,false)))); else {
		var op = new tink.core.FutureTrigger();
		f($bind(op,op.trigger));
		return op.future;
	}
};
tink.core._Future.Future_Impl_.or = function(a,b) {
	return tink.core._Future.Future_Impl_.first(a,b);
};
tink.core._Future.Future_Impl_.either = function(a,b) {
	return tink.core._Future.Future_Impl_.first(tink.core._Future.Future_Impl_.map(a,tink.core.Either.Left,false),tink.core._Future.Future_Impl_.map(b,tink.core.Either.Right,false));
};
tink.core._Future.Future_Impl_.and = function(a,b) {
	return tink.core._Future.Future_Impl_.merge(a,b,function(a1,b1) {
		return { a : a1, b : b1};
	});
};
tink.core._Future.Future_Impl_._tryFailingFlatMap = function(f,map) {
	return tink.core._Future.Future_Impl_.flatMap(f,function(o) {
		switch(o[1]) {
		case 0:
			var d = o[2];
			return map(d);
		case 1:
			var f1 = o[2];
			return tink.core._Future.Future_Impl_.sync(tink.core.Outcome.Failure(f1));
		}
	});
};
tink.core._Future.Future_Impl_._tryFlatMap = function(f,map) {
	return tink.core._Future.Future_Impl_.flatMap(f,function(o) {
		switch(o[1]) {
		case 0:
			var d = o[2];
			return tink.core._Future.Future_Impl_.map(map(d),tink.core.Outcome.Success);
		case 1:
			var f1 = o[2];
			return tink.core._Future.Future_Impl_.sync(tink.core.Outcome.Failure(f1));
		}
	});
};
tink.core._Future.Future_Impl_._tryFailingMap = function(f,map) {
	return tink.core._Future.Future_Impl_.map(f,function(o) {
		return tink.core.OutcomeTools.flatMap(o,tink.core._Outcome.OutcomeMapper_Impl_.withSameError(map));
	});
};
tink.core._Future.Future_Impl_._tryMap = function(f,map) {
	return tink.core._Future.Future_Impl_.map(f,function(o) {
		return tink.core.OutcomeTools.map(o,map);
	});
};
tink.core._Future.Future_Impl_._flatMap = function(f,map) {
	return tink.core._Future.Future_Impl_.flatMap(f,map);
};
tink.core._Future.Future_Impl_._map = function(f,map) {
	return tink.core._Future.Future_Impl_.map(f,map);
};
tink.core._Future.Future_Impl_.trigger = function() {
	return new tink.core.FutureTrigger();
};
tink.core.FutureTrigger = function() {
	var _g = this;
	this.list = [];
	this.future = tink.core._Future.Future_Impl_._new(function(callback) {
		if(_g.list == null) {
			callback(_g.result);
			return null;
		} else return tink.core._Callback.CallbackList_Impl_.add(_g.list,callback);
	});
};
tink.core.FutureTrigger.__name__ = true;
tink.core.FutureTrigger.prototype = {
	asFuture: function() {
		return this.future;
	}
	,trigger: function(result) {
		if(this.list == null) return false; else {
			var list = this.list;
			this.list = null;
			this.result = result;
			tink.core._Callback.CallbackList_Impl_.invoke(list,result);
			tink.core._Callback.CallbackList_Impl_.clear(list);
			return true;
		}
	}
	,__class__: tink.core.FutureTrigger
};
tink.core._Lazy = {};
tink.core._Lazy.Lazy_Impl_ = function() { };
tink.core._Lazy.Lazy_Impl_.__name__ = true;
tink.core._Lazy.Lazy_Impl_._new = function(r) {
	return r;
};
tink.core._Lazy.Lazy_Impl_.get = function(this1) {
	return this1();
};
tink.core._Lazy.Lazy_Impl_.ofFunc = function(f) {
	var result = null;
	return function() {
		if(f != null) {
			result = f();
			f = null;
		}
		return result;
	};
};
tink.core._Lazy.Lazy_Impl_.map = function(this1,f) {
	return tink.core._Lazy.Lazy_Impl_.ofFunc(function() {
		return f(this1());
	});
};
tink.core._Lazy.Lazy_Impl_.flatMap = function(this1,f) {
	return tink.core._Lazy.Lazy_Impl_.ofFunc(function() {
		var this2 = f(this1());
		return this2();
	});
};
tink.core._Lazy.Lazy_Impl_.ofConst = function(c) {
	return function() {
		return c;
	};
};
tink.core.Outcome = { __ename__ : true, __constructs__ : ["Success","Failure"] };
tink.core.Outcome.Success = function(data) { var $x = ["Success",0,data]; $x.__enum__ = tink.core.Outcome; return $x; };
tink.core.Outcome.Failure = function(failure) { var $x = ["Failure",1,failure]; $x.__enum__ = tink.core.Outcome; return $x; };
tink.core.OutcomeTools = function() { };
tink.core.OutcomeTools.__name__ = true;
tink.core.OutcomeTools.sure = function(outcome) {
	switch(outcome[1]) {
	case 0:
		var data = outcome[2];
		return data;
	case 1:
		var failure = outcome[2];
		if(js.Boot.__instanceof(failure,tink.core.TypedError)) return failure.throwSelf(); else throw failure;
		break;
	}
};
tink.core.OutcomeTools.toOption = function(outcome) {
	switch(outcome[1]) {
	case 0:
		var data = outcome[2];
		return haxe.ds.Option.Some(data);
	case 1:
		return haxe.ds.Option.None;
	}
};
tink.core.OutcomeTools.toOutcome = function(option,pos) {
	switch(option[1]) {
	case 0:
		var value = option[2];
		return tink.core.Outcome.Success(value);
	case 1:
		return tink.core.Outcome.Failure(new tink.core.TypedError(404,"Some value expected but none found in " + pos.fileName + "@line " + pos.lineNumber,{ fileName : "Outcome.hx", lineNumber : 37, className : "tink.core.OutcomeTools", methodName : "toOutcome"}));
	}
};
tink.core.OutcomeTools.orUse = function(outcome,fallback) {
	switch(outcome[1]) {
	case 0:
		var data = outcome[2];
		return data;
	case 1:
		return fallback();
	}
};
tink.core.OutcomeTools.orTry = function(outcome,fallback) {
	switch(outcome[1]) {
	case 0:
		return outcome;
	case 1:
		return fallback();
	}
};
tink.core.OutcomeTools.equals = function(outcome,to) {
	switch(outcome[1]) {
	case 0:
		var data = outcome[2];
		return data == to;
	case 1:
		return false;
	}
};
tink.core.OutcomeTools.map = function(outcome,transform) {
	switch(outcome[1]) {
	case 0:
		var a = outcome[2];
		return tink.core.Outcome.Success(transform(a));
	case 1:
		var f = outcome[2];
		return tink.core.Outcome.Failure(f);
	}
};
tink.core.OutcomeTools.isSuccess = function(outcome) {
	switch(outcome[1]) {
	case 0:
		return true;
	default:
		return false;
	}
};
tink.core.OutcomeTools.flatMap = function(o,mapper) {
	return tink.core._Outcome.OutcomeMapper_Impl_.apply(mapper,o);
};
tink.core._Outcome = {};
tink.core._Outcome.OutcomeMapper_Impl_ = function() { };
tink.core._Outcome.OutcomeMapper_Impl_.__name__ = true;
tink.core._Outcome.OutcomeMapper_Impl_._new = function(f) {
	return { f : f};
};
tink.core._Outcome.OutcomeMapper_Impl_.apply = function(this1,o) {
	return this1.f(o);
};
tink.core._Outcome.OutcomeMapper_Impl_.withSameError = function(f) {
	return tink.core._Outcome.OutcomeMapper_Impl_._new(function(o) {
		switch(o[1]) {
		case 0:
			var d = o[2];
			return f(d);
		case 1:
			var f1 = o[2];
			return tink.core.Outcome.Failure(f1);
		}
	});
};
tink.core._Outcome.OutcomeMapper_Impl_.withEitherError = function(f) {
	return tink.core._Outcome.OutcomeMapper_Impl_._new(function(o) {
		switch(o[1]) {
		case 0:
			var d = o[2];
			{
				var _g = f(d);
				switch(_g[1]) {
				case 0:
					var d1 = _g[2];
					return tink.core.Outcome.Success(d1);
				case 1:
					var f1 = _g[2];
					return tink.core.Outcome.Failure(tink.core.Either.Right(f1));
				}
			}
			break;
		case 1:
			var f2 = o[2];
			return tink.core.Outcome.Failure(tink.core.Either.Left(f2));
		}
	});
};
tink.core._Pair = {};
tink.core._Pair.Pair_Impl_ = function() { };
tink.core._Pair.Pair_Impl_.__name__ = true;
tink.core._Pair.Pair_Impl_._new = function(a,b) {
	return { a : a, b : b};
};
tink.core._Pair.Pair_Impl_.get_a = function(this1) {
	return this1.a;
};
tink.core._Pair.Pair_Impl_.get_b = function(this1) {
	return this1.b;
};
tink.core._Pair.Pair_Impl_.toBool = function(this1) {
	return this1 != null;
};
tink.core._Pair.Pair_Impl_.isNil = function(this1) {
	return this1 == null;
};
tink.core._Pair.Pair_Impl_.nil = function() {
	return null;
};
tink.core._Pair.MPair_Impl_ = function() { };
tink.core._Pair.MPair_Impl_.__name__ = true;
tink.core._Pair.MPair_Impl_._new = function(a,b) {
	return { a : a, b : b};
};
tink.core._Pair.MPair_Impl_.get_a = function(this1) {
	return this1.a;
};
tink.core._Pair.MPair_Impl_.get_b = function(this1) {
	return this1.b;
};
tink.core._Pair.MPair_Impl_.set_a = function(this1,v) {
	return this1.a = v;
};
tink.core._Pair.MPair_Impl_.set_b = function(this1,v) {
	return this1.b = v;
};
function $iterator(o) { if( o instanceof Array ) return function() { return HxOverrides.iter(o); }; return typeof(o.iterator) == 'function' ? $bind(o,o.iterator) : o.iterator; }
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
if(Array.prototype.indexOf) HxOverrides.indexOf = function(a,o,i) {
	return Array.prototype.indexOf.call(a,o,i);
};
Math.NaN = Number.NaN;
Math.NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY;
Math.POSITIVE_INFINITY = Number.POSITIVE_INFINITY;
Math.isFinite = function(i) {
	return isFinite(i);
};
Math.isNaN = function(i1) {
	return isNaN(i1);
};
String.prototype.__class__ = String;
String.__name__ = true;
Array.__name__ = true;
var Int = { __name__ : ["Int"]};
var Dynamic = { __name__ : ["Dynamic"]};
var Float = Number;
Float.__name__ = ["Float"];
var Bool = Boolean;
Bool.__ename__ = ["Bool"];
var Class = { __name__ : ["Class"]};
var Enum = { };
audiotools.Wav16Tools.SAMPLERATE = 44100;
tink.core._Callback.Cell.pool = [];
tink.core._Error.ErrorCode_Impl_.BadRequest = 400;
tink.core._Error.ErrorCode_Impl_.Unauthorized = 401;
tink.core._Error.ErrorCode_Impl_.PaymentRequired = 402;
tink.core._Error.ErrorCode_Impl_.Forbidden = 403;
tink.core._Error.ErrorCode_Impl_.NotFound = 404;
tink.core._Error.ErrorCode_Impl_.MethodNotAllowed = 405;
tink.core._Error.ErrorCode_Impl_.Gone = 410;
tink.core._Error.ErrorCode_Impl_.NotAcceptable = 406;
tink.core._Error.ErrorCode_Impl_.Timeout = 408;
tink.core._Error.ErrorCode_Impl_.Conflict = 409;
tink.core._Error.ErrorCode_Impl_.OutOfRange = 416;
tink.core._Error.ErrorCode_Impl_.ExpectationFailed = 417;
tink.core._Error.ErrorCode_Impl_.I_am_a_Teapot = 418;
tink.core._Error.ErrorCode_Impl_.AuthenticationTimeout = 419;
tink.core._Error.ErrorCode_Impl_.UnprocessableEntity = 422;
tink.core._Error.ErrorCode_Impl_.InternalError = 500;
tink.core._Error.ErrorCode_Impl_.NotImplemented = 501;
tink.core._Error.ErrorCode_Impl_.ServiceUnavailable = 503;
tink.core._Error.ErrorCode_Impl_.InsufficientStorage = 507;
tink.core._Error.ErrorCode_Impl_.BandwidthLimitExceeded = 509;
examples.decode.Main.main();
})();
