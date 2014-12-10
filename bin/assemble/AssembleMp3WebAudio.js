(function () { "use strict";
function $extend(from, fields) {
	function Inherit() {} Inherit.prototype = from; var proto = new Inherit();
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
var HxOverrides = function() { };
HxOverrides.__name__ = true;
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
	if(this.ch2 != null && this.ch2.length != this.ch1.length) throw "Stereo file ints must have same length";
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
audiotools.Wav16.prototype = {
	get_length: function() {
		return this.ch1.length;
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
	if(stereo && !w1.stereo) w1 = audiotools.Wav16Tools.toStereo(w1);
	if(stereo && !w2.stereo) w2 = audiotools.Wav16Tools.toStereo(w2);
	var resultCh1 = audiotools.Wav16DSP.dspMix(w1.ch1,w2.ch1,mixVol,w1vol,w2vol);
	var resultCh2 = null;
	if(stereo) resultCh2 = audiotools.Wav16DSP.dspMix(w1.ch2,w2.ch2,mixVol,w1vol,w2vol);
	return new audiotools.Wav16(resultCh1,resultCh2);
};
audiotools.Wav16DSP.wspMixInto = function(w1,w2,offset,w2Vol) {
	if(w2Vol == null) w2Vol = 1.0;
	if(offset == null) offset = 0;
	console.log("wsp-mixinto");
	if(w1.stereo != w2.stereo) {
		w1 = audiotools.Wav16Tools.toStereo(w1);
		w2 = audiotools.Wav16Tools.toStereo(w2);
	}
	audiotools.Wav16DSP.dspMixInto(w1.ch1,w2.ch1,offset,w2Vol);
	if(w1.stereo) audiotools.Wav16DSP.dspMixInto(w1.ch2,w2.ch2);
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
audiotools.Wav16DSP.dspMixInto = function(w1,w2,offset,w2vol) {
	if(w2vol == null) w2vol = 1.0;
	if(offset == null) offset = 0;
	console.log("mixinto");
	if(offset + w2.length > w1.length) throw "mixinto error";
	var _g1 = 0;
	var _g = w2.length;
	while(_g1 < _g) {
		var i = _g1++;
		var val1 = w1[offset + i];
		var val2 = w2[i] * w2vol | 0;
		var val3 = val1 + val2;
		if(i % 1000 == 0) console.log([i,val1,val2,val3]);
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
audiotools.Wav16Tools.toStereo = function(w) {
	if(w.stereo) return w;
	return new audiotools.Wav16(audiotools.Wav16Tools.copyChannel(w.ch1),audiotools.Wav16Tools.copyChannel(w.ch1));
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
audiotools.utils.BytesLoader = function(filename) {
	this.filename = filename;
};
audiotools.utils.BytesLoader.__name__ = true;
audiotools.utils.BytesLoader.prototype = {
	loadBytes: function() {
		var _g = this;
		var request = new XMLHttpRequest();
		request.open("GET",this.filename,true);
		request.responseType = "arraybuffer";
		request.onload = function(e) {
			var arrayBuffer = request.response;
			if(arrayBuffer != null) {
				var dataview = new DataView(arrayBuffer);
				var bytesData = new Array();
				var _g1 = 0;
				var _g2 = dataview.byteLength;
				while(_g1 < _g2) {
					var i = _g1++;
					bytesData.push(dataview.getUint8(i));
				}
				var bytes = haxe.io.Bytes.ofData(bytesData);
				_g.onLoaded(bytes,_g.filename);
			}
		};
		request.send(null);
		return this;
	}
	,onLoaded: function(bytes,filename) {
	}
	,setOnLoaded: function(callbck) {
		this.onLoaded = callbck;
		return this;
	}
	,__class__: audiotools.utils.BytesLoader
};
audiotools.utils.BytesLoaders = function(files) {
	this.loaders = files.map(function(file) {
		return new audiotools.utils.BytesLoader(file);
	});
	var _g = 0;
	var _g1 = this.loaders;
	while(_g < _g1.length) {
		var loader = _g1[_g];
		++_g;
		loader.onLoaded = $bind(this,this.onLoaderLoaded);
	}
};
audiotools.utils.BytesLoaders.__name__ = true;
audiotools.utils.BytesLoaders.prototype = {
	loadAll: function() {
		this.loadedCount = 0;
		this.loadedBytes = new haxe.ds.StringMap();
		var _g = 0;
		var _g1 = this.loaders;
		while(_g < _g1.length) {
			var loader = _g1[_g];
			++_g;
			loader.loadBytes();
		}
		return this;
	}
	,onLoaderLoaded: function(bytes,filename) {
		console.log("onLoaderLoaded " + filename);
		this.loadedBytes.set(filename,bytes);
		this.loadedCount++;
		if(this.loadedCount >= this.loaders.length) this.onLoaded(this.loadedBytes);
	}
	,onLoaded: function(loadedBytes) {
		console.log("ALL");
	}
	,setOnLoaded: function(onLoadedCallbck) {
		this.onLoaded = onLoadedCallbck;
		return this;
	}
	,__class__: audiotools.utils.BytesLoaders
};
audiotools.utils.Mp3Wav16Decoder = function(mp3Filename) {
	this.mp3filename = mp3Filename;
};
audiotools.utils.Mp3Wav16Decoder.__name__ = true;
audiotools.utils.Mp3Wav16Decoder.prototype = {
	decode: function() {
		this.getWavFile();
		return this;
	}
	,setContext: function(context) {
		this.context = context;
		return this;
	}
	,getWavFile: function() {
		var _g = this;
		if(this.context == null) {
			js.Lib.alert("No AudioContext!");
			throw "No AudioContext";
		}
		new audiotools.webaudio.Mp3ToBuffer(this.mp3filename,this.context).setLoadedHandler(function(buffer,filename) {
			_g.buffer = buffer;
			var wavBytes = null;
			var left = buffer.getChannelData(0);
			var leftInts;
			var this1;
			this1 = new Array(left.length);
			leftInts = this1;
			var pos = 0;
			var _g1 = 0;
			while(_g1 < left.length) {
				var n = left[_g1];
				++_g1;
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
				var _g11 = 0;
				while(_g11 < right.length) {
					var n1 = right[_g11];
					++_g11;
					rightInts[pos1] = n1 * 32767 | 0;
					pos1++;
				}
				w16 = new audiotools.Wav16(leftInts,rightInts);
			} else w16 = new audiotools.Wav16(leftInts);
			_g.converted(w16,_g.mp3filename);
		}).load();
	}
	,converted: function(wav16,mp3Filename) {
		console.log(wav16.ch1.length);
		console.log(this.mp3filename);
	}
	,setDecodedHandler: function(callbck) {
		this.converted = callbck;
		return this;
	}
	,__class__: audiotools.utils.Mp3Wav16Decoder
};
audiotools.utils.Mp3Wav16Decoders = function(mp3files) {
	this.decoders = mp3files.map(function(file) {
		return new audiotools.utils.Mp3Wav16Decoder(file);
	});
	if(audiotools.utils.Mp3Wav16Decoders.context == null) audiotools.utils.Mp3Wav16Decoders.context = audiotools.webaudio.utils.WebAudioTools.getAudioContext();
	Lambda.iter(this.decoders,function(decoder) {
		decoder.setContext(audiotools.utils.Mp3Wav16Decoders.context);
	});
	var _g = 0;
	var _g1 = this.decoders;
	while(_g < _g1.length) {
		var loader = _g1[_g];
		++_g;
		loader.converted = $bind(this,this.onDecoded);
	}
};
audiotools.utils.Mp3Wav16Decoders.__name__ = true;
audiotools.utils.Mp3Wav16Decoders.prototype = {
	onDecoded: function(wav16,mp3Filename) {
		this.decodedFiles.set(mp3Filename,wav16);
		console.log("decoded " + mp3Filename);
		this.decodedCount++;
		if(this.decodedCount >= this.decoders.length) this.allDecoded(this.decodedFiles);
	}
	,allDecoded: function(convertedFiles) {
		console.log("ALL DECODED");
	}
	,decodeAll: function() {
		this.decodedCount = 0;
		this.decodedFiles = new haxe.ds.StringMap();
		var _g = 0;
		var _g1 = this.decoders;
		while(_g < _g1.length) {
			var decoder = _g1[_g];
			++_g;
			decoder.decode();
		}
		return this;
	}
	,__class__: audiotools.utils.Mp3Wav16Decoders
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
examples.assemble = {};
examples.assemble.Main = function() { };
examples.assemble.Main.__name__ = true;
examples.assemble.Main.main = function() {
	var silent = audiotools.Wav16.create(1000,true);
	var mp3start = 49;
	var mp3end = 60;
	var files = ((function($this) {
		var $r;
		var _g = [];
		{
			var _g1 = mp3start;
			while(_g1 < mp3end) {
				var i = _g1++;
				_g.push(i);
			}
		}
		$r = _g;
		return $r;
	}(this))).map(function(i1) {
		return "piano/" + i1 + ".mp3";
	});
	var decoders = new audiotools.utils.Mp3Wav16Decoders(files);
	decoders.allDecoded = function(data) {
		console.log("all decoded");
		var w49 = data.get("piano/49.mp3");
		var w50 = data.get("piano/50.mp3");
		var w56 = data.get("piano/56.mp3");
		var w = audiotools.Wav16.create(w49.get_length() * 3,false);
		audiotools.Wav16DSP.wspMixInto(w,w49,0);
		audiotools.Wav16DSP.wspMixInto(w,w56,0);
		examples.assemble.Main.displayWave(w,0);
		audiotools.Wav16Tools.testplay(w);
	};
	decoders.decodeAll();
};
examples.assemble.Main.displayWave = function(wav16,index,text) {
	if(text == null) text = "";
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
		var x = this.i.readString(4);
		if(x != "fmt ") throw "expected fmt subchunk";
		var fmtlen = this.i.readInt32();
		var x1 = this.i.readUInt16();
		var format1;
		switch(x1) {
		case 1:
			format1 = format.wav.WAVEFormat.WF_PCM;
			break;
		default:
			console.log("only PCM (uncompressed) WAV files are supported");
			format1 = format.wav.WAVEFormat.WF_PCM;
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
haxe.ds.StringMap = function() {
	this.h = { };
};
haxe.ds.StringMap.__name__ = true;
haxe.ds.StringMap.__interfaces__ = [IMap];
haxe.ds.StringMap.prototype = {
	set: function(key,value) {
		this.h["$" + key] = value;
	}
	,get: function(key) {
		return this.h["$" + key];
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
haxe.io.Bytes.ofData = function(b) {
	return new haxe.io.Bytes(b.length,b);
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
function $iterator(o) { if( o instanceof Array ) return function() { return HxOverrides.iter(o); }; return typeof(o.iterator) == 'function' ? $bind(o,o.iterator) : o.iterator; }
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
examples.assemble.Main.main();
})();
