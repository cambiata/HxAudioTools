(function () { "use strict";
var Main = function() {
	this.pausedTime = 0;
	this.spectrumPos = -1;
	var _g = this;
	this.container = window.document.getElementById("container");
	this.audiodatacanvas = window.document.getElementById("audiodatacanvas");
	this.adc = this.audiodatacanvas.getContext("2d");
	this.sgramcanvas = window.document.getElementById("spectrogramcanvas");
	this.sgc = this.sgramcanvas.getContext("2d");
	this.sgc.globalCompositeOperation = "darker";
	this.spectrumCanvas = window.document.getElementById("spectrum");
	this.sc = this.spectrumCanvas.getContext("2d");
	this.progress = window.document.getElementById("downloadMeter");
	this.lchStyle = this.adc.createLinearGradient(0,0,0,this.audiodatacanvas.height / 2);
	this.lchStyle.addColorStop(.0,"#69F");
	this.lchStyle.addColorStop(.5,"#00F");
	this.lchStyle.addColorStop(1.0,"#03C");
	this.rchStyle = this.adc.createLinearGradient(0,this.audiodatacanvas.height / 2,0,this.audiodatacanvas.height);
	this.rchStyle.addColorStop(.0,"#F09");
	this.rchStyle.addColorStop(.5,"red");
	this.rchStyle.addColorStop(1.0,"#900");
	this.spectrumStyle = this.sc.createLinearGradient(0,this.spectrumCanvas.height,0,20);
	this.spectrumStyle.addColorStop(0.95,"#F00");
	this.spectrumStyle.addColorStop(0.85,"#F90");
	this.spectrumStyle.addColorStop(0.60,"#9F0");
	this.spectrumStyle.addColorStop(0.00,"#690");
	this.spectrumPos = -1;
	this.sampleSong = window.document.getElementById("sampleSong");
	this.statusSpan = window.document.getElementById("status");
	this.timeSpan = window.document.getElementById("time");
	this.loopBox = window.document.getElementById("loop");
	this.togglebtn = window.document.getElementById("toggleplay");
	this.rewindbtn = window.document.getElementById("rewind");
	this.cursor = window.document.getElementById("cursor");
	this.acx = this.createAudioContext();
	this.musicfile = "jussi.mp3";
	this.sampleSong.textContent = this.musicfile;
	this.timeratio = 30;
	this.duration = 0.0;
	this.fft = this.acx.createAnalyser();
	this.fft.smoothingTimeConstant = 0.6;
	this.fftData = new Uint8Array(this.fft.frequencyBinCount);
	this.jsnode = this.acx.createScriptProcessor(1024,1,1);
	this.jsnode.connect(this.acx.destination,0,0);
	this.jsnode.onaudioprocess = $bind(this,this.onAudioProcess);
	var updateTimer = new haxe.Timer(33);
	updateTimer.run = $bind(this,this.onUpdateSpectrum);
	this.startTime = new Date().getTime();
	this.customAudio = window.document.getElementById("customAudio");
	this.customAudio.addEventListener("change",function(e) {
	});
	this.customAudio.addEventListener("change",function(e1) {
		var btn = _g.customAudio;
		btn.disabled = true;
		var fr = new FileReader();
		_g.statusSpan.textContent = "Reading file...";
		_g.loader.abort();
		fr.onload = function(e2) {
			_g.statusSpan.textContent = "Decoding audio...";
			_g.acx.decodeAudioData(fr.result,function(buffer) {
				btn.disabled = false;
				_g.onDecode(buffer);
				return true;
			},function(buffer1) {
				_g.statusSpan.innerHTML = "<span style=\"color: red\">An error occurred during decoding</span>";
				btn.disabled = false;
				return false;
			});
		};
		fr.readAsArrayBuffer(_g.customAudio.files[0]);
	},false);
	this.togglebtn.addEventListener("click",function(e3) {
		if(_g.source != null) {
			_g.pausedTime = (new Date().getTime() - _g.startTime) / 1000;
			_g.stopPlayback();
		} else if(_g.currentBuffer != null && _g.source == null) {
			_g.startPlayback(_g.pausedTime);
			_g.pausedTime = 0;
		}
	},false);
	this.rewindbtn.addEventListener("click",function(e4) {
		if(_g.source != null) {
			_g.stopPlayback();
			_g.startPlayback(0);
		} else {
			_g.stopPlayback();
			_g.cursor.style.left = -_g.cursor.offsetWidth / 2 + "px";
			_g.timeSpan.textContent = _g.timeStyle(0) + " | " + _g.timeStyle(_g.duration);
			_g.pausedTime = 0;
		}
	},false);
	this.container.addEventListener("mousedown",function(e5) {
		var y = e5.pageY - _g.container.offsetTop;
		if(y > _g.audiodatacanvas.offsetHeight + _g.sgramcanvas.offsetHeight) return;
		if(_g.currentBuffer != null) {
			var x = (e5.pageX - _g.container.offsetLeft + _g.container.scrollLeft) / _g.timeratio;
			if(x > _g.currentBuffer.duration || x < 0) return;
			if(_g.source != null) {
				_g.stopPlayback();
				_g.startPlayback(x);
			} else {
				_g.stopPlayback();
				_g.cursor.style.left = Math.round(Math.min(x,_g.duration) * _g.timeratio - _g.cursor.offsetWidth / 2 - 1) + "px";
				_g.timeSpan.textContent = _g.timeStyle(x) + " | " + _g.timeStyle(_g.duration);
				_g.pausedTime = x;
			}
		}
	},false);
	this.loadfile(this.musicfile);
};
Main.__name__ = true;
Main.main = function() {
	new Main();
};
Main.boolToInt = function(bool) {
	if(bool) return 1; else return 0;
};
Main.prototype = {
	onAudioProcess: function(e) {
		if(this.duration == 0) return;
		var currentTime = (e.timeStamp / 1000 - this.startTime) / 1000;
		if(currentTime > this.duration && this.source != null) {
			this.stopPlayback();
			this.cursor.style.left = -this.cursor.offsetWidth / 2 + "px";
			this.timeSpan.textContent = this.timeStyle(0) + " | " + this.timeStyle(this.duration);
		} else if(this.source != null) {
			this.cursor.style.left = Math.round(Math.min(currentTime,this.duration) * this.timeratio - this.cursor.offsetWidth / 2 - 1) + "px";
			this.timeSpan.textContent = this.timeStyle(currentTime) + " | " + this.timeStyle(this.duration);
		}
	}
	,onWorkerMessage: function(e) {
		var frameSize = 1024;
		var sgramcanvas = window.document.getElementById("spectrogramcanvas");
		var sgc = this.sgramcanvas.getContext("2d");
		if(this.worker == null) return;
		if(e.data.frames != null) {
			var _g1 = 0;
			var _g = e.data.frames.length;
			while(_g1 < _g) {
				var j = _g1++;
				(function () {
				var frames = e.data.frames;
				var data =  frames[j];
				var timeratio = 30;
				var index = data.index;
				var frameCount = data.frameCount;
				var ratio = timeratio / data.sampleRate;
				var x = index * 1024 * ratio;
				var _g2 = 0;
				while(_g2 < 512) {
					var i = _g2++;
					sgc.fillStyle = "hsl(" + Math.floor(i / (frameSize / 2) * 360) + ", " + 100 + "%, " + data.spectrum[i] * 150 * 50 + "%)";
					sgc.fillRect(x,sgramcanvas.height - i / (frameSize / 2) * sgramcanvas.height,ratio * frameSize * 2,sgramcanvas.height / (frameSize / 2));
				}
				}());;
			}
		} else {
			haxe.Log.trace("WORKER:",{ fileName : "Main.hx", lineNumber : 247, className : "Main", methodName : "onWorkerMessage", customParams : [e.data]});
			this.worker.onmessage = null;
			this.worker.terminate();
			this.worker = null;
		}
	}
	,onDecode: function(buffer) {
		this.currentBuffer = buffer;
		this.stopPlayback();
		haxe.Log.trace("Audio data decoded" + this.currentBuffer.length,{ fileName : "Main.hx", lineNumber : 257, className : "Main", methodName : "onDecode"});
		this.statusSpan.textContent = "Done";
		this.duration = buffer.duration;
		this.container.scrollLeft = 0;
		this.timeSpan.textContent = this.timeStyle(0) + " | " + this.timeStyle(this.duration);
		this.cursor.style.left = -this.cursor.offsetWidth / 2 + "px";
		this.togglebtn.disabled = false;
		this.rewindbtn.disabled = false;
		this.customAudio.disabled = false;
		this.channels = [buffer.getChannelData(0),buffer.getChannelData(1)];
		this.prepareWavedraw(buffer);
		this.ratioWave = this.timeratio / buffer.sampleRate;
		this.chunkSize = 16384;
		this.offset = 0;
		this.pausedTime = 0;
		this.lastY = [.0,.0];
		this.maxLen = this.channels[0].length;
		this.waveformtimer = new haxe.Timer(0);
		this.waveformtimer.run = $bind(this,this.onDrawWaveform);
		if(this.worker != null) {
			this.worker.onmessage = null;
			this.worker.terminate();
			this.worker = null;
		}
		this.worker = new Worker("worker.js");
		this.worker.onmessage = $bind(this,this.onWorkerMessage);
		var channelData = [];
		var _g1 = 0;
		var _g = buffer.numberOfChannels;
		while(_g1 < _g) {
			var c = _g1++;
			channelData[c] = this.channels[c];
		}
		this.worker.postMessage({ sampleRate : buffer.sampleRate, length : buffer.length, duration : buffer.duration, channelData : channelData, frameSize : 1024});
		return true;
	}
	,loadfile: function(musicfile) {
		var _g = this;
		this.loader = new XMLHttpRequest();
		this.loader.open("GET",musicfile,true);
		this.loader.responseType = "arraybuffer";
		haxe.Log.trace("Downloading audio...",{ fileName : "Main.hx", lineNumber : 304, className : "Main", methodName : "loadfile"});
		this.statusSpan.textContent = "Downloading...";
		this.loader.addEventListener("load",function(_) {
			haxe.Log.trace("Decoding audio...",{ fileName : "Main.hx", lineNumber : 307, className : "Main", methodName : "loadfile"});
			_g.statusSpan.textContent = "Decoding audio...";
			_g.customAudio.disabled = true;
			_g.sampleSong.innerHTML = "";
			_g.acx.decodeAudioData(_g.loader.response,$bind(_g,_g.onDecode),function(buffer) {
				_g.customAudio.disabled = false;
				_g.statusSpan.innerHTML = "<span style=\"color: red\">An error occurred during decoding</span>";
				return false;
			});
		},false);
		this.loader.addEventListener("progress",function(e) {
			_g.progress.value = e.loaded / e.total;
			_g.statusSpan.textContent = "Downloading... " + Math.round(e.loaded / 1024 / 1024 * 100) / 100 + "Mb of " + Math.round(e.total / 1024 / 1024 * 100) / 100 + "Mb";
		},false);
		this.loader.send();
	}
	,onDrawWaveform: function() {
		this.adc.fillStyle = "black";
		var data = null;
		var l = Math.min(this.maxLen,this.offset + this.chunkSize);
		var _g1 = 0;
		var _g = this.channels.length;
		while(_g1 < _g) {
			var c = _g1++;
			data = this.channels[c];
			if(data == null) continue;
			var x = this.offset * this.ratioWave;
			this.adc.beginPath();
			this.adc.moveTo(x,this.audiodatacanvas.height / 4 + this.audiodatacanvas.height / 2 * c + this.lastY[c] * (this.audiodatacanvas.height / 4.1));
			var i = this.offset;
			while(i < l) {
				this.adc.lineTo(x,this.audiodatacanvas.height / 4 + this.audiodatacanvas.height / 2 * c + data[i] * (this.audiodatacanvas.height / 4.1));
				this.lastY[c] = data[i] | 0;
				x = i * this.ratioWave;
				if(x > this.audiodatacanvas.width) break;
				i += 2;
			}
			if(c == 0) this.adc.strokeStyle = this.lchStyle; else this.adc.strokeStyle = this.rchStyle;
			this.adc.stroke();
		}
		this.offset += this.chunkSize;
		if(l >= this.maxLen) {
			this.channels[0] = null;
			this.channels[1] = null;
			data = null;
			if(this.waveformtimer != null) this.waveformtimer.stop();
			return;
		}
	}
	,prepareWavedraw: function(buffer) {
		this.audiodatacanvas.width = this.sgramcanvas.width = buffer.length * (this.timeratio / buffer.sampleRate) | 0;
		this.adc.clearRect(0,0,this.audiodatacanvas.width,this.audiodatacanvas.height);
		this.sgc.clearRect(0,0,this.sgramcanvas.width,this.sgramcanvas.height);
		this.adc.fillStyle = "rgba(0, 0, 0, 0.05)";
		var odd = true;
		var i = 0.0;
		while(i < this.duration / 60) {
			if(!odd) this.adc.fillRect(i * 60 * this.timeratio,0,60 * this.timeratio,this.audiodatacanvas.height);
			odd = !odd;
			i += 1.;
		}
		this.adc.strokeStyle = "#AAA";
		var _g1 = 0;
		var _g = this.channels.length;
		while(_g1 < _g) {
			var c = _g1++;
			var data = this.channels[c];
			if(data == null) continue;
			this.adc.beginPath();
			this.adc.moveTo(0,this.audiodatacanvas.height / 4 + this.audiodatacanvas.height / 2 * c + 0.5);
			this.adc.lineTo(this.audiodatacanvas.width,this.audiodatacanvas.height / 4 + this.audiodatacanvas.height / 2 * c + 0.5);
			this.adc.stroke();
		}
	}
	,startPlayback: function(offset) {
		haxe.Log.trace(this.currentBuffer,{ fileName : "Main.hx", lineNumber : 387, className : "Main", methodName : "startPlayback"});
		haxe.Log.trace(this.source,{ fileName : "Main.hx", lineNumber : 388, className : "Main", methodName : "startPlayback"});
		if(this.currentBuffer != null && this.source == null) {
			this.source = this.acx.createBufferSource();
			this.source.loop = false;
			this.source.buffer = this.currentBuffer;
			this.source.connect(this.fft,0,0);
			this.fft.connect(this.jsnode,0,0);
			this.source.connect(this.acx.destination,0,0);
			this.source.start(0,offset,this.currentBuffer.duration - offset);
			this.startTime = new Date().getTime() - offset * 1000;
		}
		this.togglebtn.textContent = "pause";
	}
	,stopPlayback: function() {
		if(this.source != null) {
			this.source.stop(0);
			this.source.disconnect(0);
			this.fft.disconnect(0);
			this.source = null;
		}
		this.togglebtn.textContent = "play";
	}
	,createAudioContext: function() {
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
	}
	,zfs: function(v) {
		if(v > 9) return "" + v; else return "0" + v;
	}
	,timeStyle: function(t) {
		return this.zfs(Math.floor(t / 1440)) + ":" + this.zfs(Math.floor(t / 60) % 60) + ":" + this.zfs(Math.floor(t) % 60) + "." + Math.floor(Math.floor(t % 1 * 10));
	}
	,onUpdateSpectrum: function() {
		this.spectrumRatio = this.spectrumCanvas.width / this.fftData.length;
		this.sc.fillStyle = "rgba(48, 48, 48, 0.6" + ")";
		this.sc.fillRect(0,0,this.spectrumCanvas.width,this.spectrumCanvas.height);
		this.sc.fillStyle = "rgba(255, 255, 0, 0.5)";
		this.sc.textAlign = "center";
		this.sc.font = "10px sans-serif";
		this.sc.strokeStyle = "rgba(255, 255, 255, 0.1)";
		this.sc.lineWidth = 1;
		this.sc.beginPath();
		var odd = false;
		var i = 55;
		while(i < 20000) {
			var hz = i;
			var peak = hz * this.fft.fftSize / this.acx.sampleRate;
			this.sc.moveTo(Math.round(peak * this.spectrumRatio) + 0.5,0);
			this.sc.lineTo(Math.round(peak * this.spectrumRatio) + 0.5,this.spectrumCanvas.height);
			if(hz >= 440) this.sc.fillText(hz + " Hz",peak * this.spectrumRatio + 5,10 + (odd?1:0) * 10);
			odd = !odd;
			i *= 2;
		}
		var i1 = 0;
		while(i1 < this.spectrumCanvas.height) {
			this.sc.moveTo(0,this.spectrumCanvas.height - i1 + 0.5);
			this.sc.lineTo(this.spectrumCanvas.width,this.spectrumCanvas.height - i1 + 0.5);
			i1 += 64;
		}
		this.sc.stroke();
		this.fft.getByteTimeDomainData(this.fftData);
		this.sc.strokeStyle = "#444";
		this.sc.lineWidth = 4;
		this.sc.beginPath();
		var _g1 = 0;
		var _g = this.fftData.length;
		while(_g1 < _g) {
			var i2 = _g1++;
			this.sc.lineTo(i2 * this.spectrumRatio,this.spectrumCanvas.height - this.fftData[i2]);
		}
		this.sc.stroke();
		this.fft.getByteFrequencyData(this.fftData);
		this.sc.fillStyle = "rgba(0, 0, 0, 0.15)";
		this.sc.strokeStyle = this.spectrumStyle;
		this.sc.lineWidth = 5;
		this.sc.beginPath();
		this.sc.moveTo(-10,this.spectrumCanvas.height + 10);
		var maxval = 0;
		var peak1 = 0;
		var _g11 = 0;
		var _g2 = this.fftData.length;
		while(_g11 < _g2) {
			var i3 = _g11++;
			var mag = this.fftData[i3];
			this.sc.lineTo(i3 * this.spectrumRatio,this.spectrumCanvas.height - mag);
			if(mag > maxval && mag < Math.POSITIVE_INFINITY) {
				maxval = Std["int"](Math.max(maxval,mag));
				peak1 = i3;
			}
		}
		this.sc.lineTo(this.spectrumCanvas.width + 10,this.spectrumCanvas.height + 10);
		this.sc.closePath();
		this.sc.stroke();
		this.sc.fill();
		var hz1 = 1024;
		this.sc.strokeStyle = "rgba(255, 0, 0, 0.5)";
		this.sc.lineWidth = 2;
		this.sc.beginPath();
		this.sc.moveTo(Math.round(peak1 * this.spectrumRatio),this.spectrumCanvas.height);
		this.sc.lineTo(Math.round(peak1 * this.spectrumRatio),this.spectrumCanvas.height - maxval);
		this.sc.font = "bold 10px sans-serif";
		this.sc.textAlign = "left";
		this.sc.fillStyle = "#F00";
		if(this.spectrumPos >= 0) {
			this.sc.strokeStyle = "rgba(0, 128, 255, 0.5)";
			this.sc.lineWidth = 2;
			this.sc.beginPath();
			this.sc.moveTo(Math.round(this.spectrumPos),this.spectrumCanvas.height - 256);
			this.sc.lineTo(Math.round(this.spectrumPos),this.spectrumCanvas.height);
			this.sc.stroke();
			var hz2 = this.spectrumPos / this.spectrumRatio * this.acx.sampleRate / this.fft.fftSize;
			this.sc.fillStyle = "#09F";
			this.sc.fillText(Math.round(hz2) + " Hz",this.spectrumPos + 2,33);
		}
	}
};
Math.__name__ = true;
var Std = function() { };
Std.__name__ = true;
Std["int"] = function(x) {
	return x | 0;
};
var haxe = {};
haxe.Log = function() { };
haxe.Log.__name__ = true;
haxe.Log.trace = function(v,infos) {
	js.Boot.__trace(v,infos);
};
haxe.Timer = function(time_ms) {
	var me = this;
	this.id = setInterval(function() {
		me.run();
	},time_ms);
};
haxe.Timer.__name__ = true;
haxe.Timer.prototype = {
	stop: function() {
		if(this.id == null) return;
		clearInterval(this.id);
		this.id = null;
	}
	,run: function() {
	}
};
haxe.io = {};
haxe.io.Eof = function() { };
haxe.io.Eof.__name__ = true;
haxe.io.Eof.prototype = {
	toString: function() {
		return "Eof";
	}
};
var js = {};
js.Boot = function() { };
js.Boot.__name__ = true;
js.Boot.__unhtml = function(s) {
	return s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
};
js.Boot.__trace = function(v,i) {
	var msg;
	if(i != null) msg = i.fileName + ":" + i.lineNumber + ": "; else msg = "";
	msg += js.Boot.__string_rec(v,"");
	if(i != null && i.customParams != null) {
		var _g = 0;
		var _g1 = i.customParams;
		while(_g < _g1.length) {
			var v1 = _g1[_g];
			++_g;
			msg += "," + js.Boot.__string_rec(v1,"");
		}
	}
	var d;
	if(typeof(document) != "undefined" && (d = document.getElementById("haxe:trace")) != null) d.innerHTML += js.Boot.__unhtml(msg) + "<br/>"; else if(typeof console != "undefined" && console.log != null) console.log(msg);
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
Date.__name__ = ["Date"];
Main.main();
})();
