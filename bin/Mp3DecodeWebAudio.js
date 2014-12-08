(function () { "use strict";
function $extend(from, fields) {
	function Inherit() {} Inherit.prototype = from; var proto = new Inherit();
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
Math.__name__ = ["Math"];
var Mp3DecodeWebAudio = function() { };
Mp3DecodeWebAudio.__name__ = ["Mp3DecodeWebAudio"];
Mp3DecodeWebAudio.main = function() {
	var context = new AudioContext();
	new audiotools.utils.Mp3Wav16Decoder("sample.mp3").setConvertedHandler(function(wav16,filename) {
		console.log(Type.getClassName(Type.getClass(wav16)));
		console.log(wav16.ints.length);
	}).setContext(context).execute();
};
var Std = function() { };
Std.__name__ = ["Std"];
Std.string = function(s) {
	return js.Boot.__string_rec(s,"");
};
Std["int"] = function(x) {
	return x | 0;
};
var Type = function() { };
Type.__name__ = ["Type"];
Type.getClass = function(o) {
	if(o == null) return null;
	if((o instanceof Array) && o.__enum__ == null) return Array; else return o.__class__;
};
Type.getClassName = function(c) {
	var a = c.__name__;
	return a.join(".");
};
var audiotools = {};
audiotools.Wav16 = function(ints) {
	this.ints = ints;
};
audiotools.Wav16.__name__ = ["audiotools","Wav16"];
audiotools.Wav16.prototype = {
	__class__: audiotools.Wav16
};
audiotools.Wav16Stereo = function(leftInts,rightInts) {
	this.rightInts = rightInts;
	audiotools.Wav16.call(this,leftInts);
};
audiotools.Wav16Stereo.__name__ = ["audiotools","Wav16Stereo"];
audiotools.Wav16Stereo.fromBytes = function(wavData,stripHeader) {
	if(stripHeader == null) stripHeader = true;
	var intsArray = audiotools.Wav16Tools.stereoToInts(wavData,stripHeader);
	return new audiotools.Wav16Stereo(intsArray[0],intsArray[1]);
};
audiotools.Wav16Stereo.__super__ = audiotools.Wav16;
audiotools.Wav16Stereo.prototype = $extend(audiotools.Wav16.prototype,{
	get_leftInts: function() {
		return this.ints;
	}
	,__class__: audiotools.Wav16Stereo
});
audiotools.Wav16Tools = function() { };
audiotools.Wav16Tools.__name__ = ["audiotools","Wav16Tools"];
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
	if(!($short >= -32767 && $short <= 32767)) throw "Range error: " + $short;
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
audiotools.utils = {};
audiotools.utils.Mp3Decoder = function(mp3Filename) {
	this.mp3filename = mp3Filename;
};
audiotools.utils.Mp3Decoder.__name__ = ["audiotools","utils","Mp3Decoder"];
audiotools.utils.Mp3Decoder.prototype = {
	execute: function() {
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
			var bytes = null;
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
			if(buffer.numberOfChannels > 1) {
				var right = buffer.getChannelData(1);
				var rightInts;
				var this2;
				this2 = new Array(right.length);
				rightInts = this2;
				var pos1 = 0;
				var _g2 = 0;
				while(_g2 < right.length) {
					var n1 = right[_g2];
					++_g2;
					rightInts[pos1] = n1 * 32767 | 0;
					pos1++;
				}
				bytes = audiotools.Wav16Tools.intsToStero16Bytes(leftInts,rightInts);
			} else bytes = audiotools.Wav16Tools.intsToMono16Bytes(leftInts);
			_g.converted(bytes,_g.mp3filename);
		}).load();
	}
	,converted: function(bytes,mp3Filename) {
		console.log(bytes.length);
		console.log(this.mp3filename);
	}
	,setConvertedHandler: function(callbck) {
		this.converted = callbck;
		return this;
	}
	,__class__: audiotools.utils.Mp3Decoder
};
audiotools.utils.Mp3Wav16Decoder = function(mp3Filename) {
	this.mp3filename = mp3Filename;
};
audiotools.utils.Mp3Wav16Decoder.__name__ = ["audiotools","utils","Mp3Wav16Decoder"];
audiotools.utils.Mp3Wav16Decoder.prototype = {
	execute: function() {
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
			if(buffer.numberOfChannels > 1) {
				var right = buffer.getChannelData(1);
				var rightInts;
				var this2;
				this2 = new Array(right.length);
				rightInts = this2;
				var pos1 = 0;
				var _g2 = 0;
				while(_g2 < right.length) {
					var n1 = right[_g2];
					++_g2;
					rightInts[pos1] = n1 * 32767 | 0;
					pos1++;
				}
				wavBytes = audiotools.Wav16Tools.intsToStero16Bytes(leftInts,rightInts);
			} else wavBytes = audiotools.Wav16Tools.intsToMono16Bytes(leftInts);
			var aInts = audiotools.Wav16Tools.stereoToInts(wavBytes,true);
			var w16 = new audiotools.Wav16Stereo(aInts[0],aInts[1]);
			_g.converted(w16,_g.mp3filename);
		}).load();
	}
	,converted: function(wav16,mp3Filename) {
		console.log(wav16.ints.length);
		console.log(this.mp3filename);
	}
	,setConvertedHandler: function(callbck) {
		this.converted = callbck;
		return this;
	}
	,__class__: audiotools.utils.Mp3Wav16Decoder
};
audiotools.webaudio = {};
audiotools.webaudio.Mp3ToBuffer = function(url,context) {
	this.url = url;
	this.context = context;
};
audiotools.webaudio.Mp3ToBuffer.__name__ = ["audiotools","webaudio","Mp3ToBuffer"];
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
var format = {};
format.wav = {};
format.wav.WAVEFormat = { __ename__ : true, __constructs__ : ["WF_PCM"] };
format.wav.WAVEFormat.WF_PCM = ["WF_PCM",0];
format.wav.WAVEFormat.WF_PCM.__enum__ = format.wav.WAVEFormat;
var haxe = {};
haxe.io = {};
haxe.io.Bytes = function(length,b) {
	this.length = length;
	this.b = b;
};
haxe.io.Bytes.__name__ = ["haxe","io","Bytes"];
haxe.io.Bytes.alloc = function(length) {
	var a = new Array();
	var _g = 0;
	while(_g < length) {
		var i = _g++;
		a.push(0);
	}
	return new haxe.io.Bytes(length,a);
};
haxe.io.Bytes.prototype = {
	set: function(pos,v) {
		this.b[pos] = v & 255;
	}
	,__class__: haxe.io.Bytes
};
haxe.io.Eof = function() { };
haxe.io.Eof.__name__ = ["haxe","io","Eof"];
haxe.io.Eof.prototype = {
	toString: function() {
		return "Eof";
	}
	,__class__: haxe.io.Eof
};
var js = {};
js.Boot = function() { };
js.Boot.__name__ = ["js","Boot"];
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
js.Lib.__name__ = ["js","Lib"];
js.Lib.alert = function(v) {
	alert(js.Boot.__string_rec(v,""));
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
String.__name__ = ["String"];
Array.__name__ = ["Array"];
Mp3DecodeWebAudio.main();
})();
