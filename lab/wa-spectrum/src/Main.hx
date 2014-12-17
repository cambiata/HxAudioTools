package;

import haxe.io.Input;
import haxe.Timer;
import js.Browser;
import js.Browser.document in doc;
import js.html.audio.AnalyserNode;
import js.html.audio.AudioBuffer;
import js.html.audio.AudioBufferCallback;
import js.html.audio.AudioBufferSourceNode;
import js.html.audio.AudioContext;
import js.html.audio.AudioProcessingEvent;
import js.html.audio.ScriptProcessorNode;
import js.html.ButtonElement;
import js.html.CanvasElement;
import js.html.CanvasGradient;
import js.html.CanvasRenderingContext2D;
import js.html.DivElement;
import js.html.Element;
import js.html.EventListener;
import js.html.FileReader;
import js.html.Float32Array;
import js.html.HTMLAllCollection;
import js.html.InputElement;
import js.html.ProgressElement;
import js.html.SpanElement;
import js.html.TableCellElement;
import js.html.Uint8Array;
import js.html.XMLHttpRequest;
import js.Lib;
/**
 * ...
 * @author Jonas Nyström
 */

class Main 
{	
	var container:DivElement;
	var audiodatacanvas:CanvasElement;
	var adc:CanvasRenderingContext2D;
	var sgramcanvas:CanvasElement;
	var sgc:CanvasRenderingContext2D;
	var spectrumCanvas:CanvasElement;
	var sc:CanvasRenderingContext2D;
	var sampleSong:Element;
	var statusSpan:Element;
	var timeSpan:Element;
	var loopBox:Element;
	var customAudio:InputElement;
	var currentBuffer:AudioBuffer;
	var progress:ProgressElement;	
	var cursor:DivElement;
	var lchStyle:CanvasGradient;
	var rchStyle:CanvasGradient;	
	var spectrumStyle:js.html.CanvasGradient;
	var waveformtimer:Timer;	
	var source:AudioBufferSourceNode;	
	var acx:AudioContext;
	var fft:AnalyserNode;	
	var jsnode:ScriptProcessorNode;
	var startTime:Float;
	var channels:Array<Float32Array>;				
	var ratioWave:Float;	
	var chunkSize:Int;
	var offset:Int;
	var lastY:Array<Float>;
	var maxLen:Int;		
	var timeratio:Float;
	var duration:Float;	
	var worker:js.html.Worker;
	var spectrumRatio:Float;
	var fftData:js.html.Uint8Array;
	var spectrumPos:Int = -1;
	var pausedTime:Float = 0;
	var musicfile:String;
	var loader:js.html.XMLHttpRequest;
	var togglebtn:ButtonElement;
	var rewindbtn:ButtonElement;
	
	static function main()  new Main();
	
	public function new() {
		this.container = cast doc.getElementById('container');
		this.audiodatacanvas = cast doc.getElementById('audiodatacanvas');
		this.adc = this.audiodatacanvas.getContext2d();
		this.sgramcanvas = cast doc.getElementById('spectrogramcanvas');
		this.sgc = cast this.sgramcanvas.getContext2d();
		sgc.globalCompositeOperation = 'darker';		
		this.spectrumCanvas = cast doc.getElementById('spectrum');
		this.sc = spectrumCanvas.getContext2d();		
		this.progress = cast doc.getElementById('downloadMeter');
		this.lchStyle = adc.createLinearGradient(0, 0, 0, audiodatacanvas.height / 2);
		this.lchStyle.addColorStop(.0, '#69F');
		this.lchStyle.addColorStop(.5, '#00F');
		this.lchStyle.addColorStop(1.0, '#03C');
		this.rchStyle = adc.createLinearGradient(0, audiodatacanvas.height / 2, 0, audiodatacanvas.height);
		this.rchStyle.addColorStop(.0, '#F09');
		this.rchStyle.addColorStop(.5, 'red');
		this.rchStyle.addColorStop(1.0, '#900');		
		this.spectrumStyle = sc.createLinearGradient(0, spectrumCanvas.height, 0, 20);
		this.spectrumStyle.addColorStop(0.95, '#F00');
		this.spectrumStyle.addColorStop(0.85, '#F90');
		this.spectrumStyle.addColorStop(0.60, '#9F0');
		this.spectrumStyle.addColorStop(0.00, '#690');		
		this.spectrumPos = -1;
		this.sampleSong =  doc.getElementById('sampleSong');
		this.statusSpan =doc.getElementById('status');
		this.timeSpan =doc.getElementById('time');
		this.loopBox = doc.getElementById('loop');
		this.togglebtn = cast doc.getElementById('toggleplay');
		this.rewindbtn = cast doc.getElementById('rewind');
		this.cursor = cast doc.getElementById('cursor');		
		this.acx = createAudioContext();
		this.musicfile = "jussi.mp3"; 
		this.sampleSong.textContent = this.musicfile;
		this.timeratio = 30;
		this.duration = 0.0;		
		this.fft = acx.createAnalyser();
		this.fft.smoothingTimeConstant = 0.6;
		this.fftData = new Uint8Array(fft.frequencyBinCount);
		
		this.jsnode = acx.createScriptProcessor(1024, 1, 1);
		this.jsnode.connect(acx.destination, 0, 0);
		this.jsnode.onaudioprocess = this.onAudioProcess;
		
		var updateTimer = new Timer(Std.int(1000 / 30));
		updateTimer.run = onUpdateSpectrum;
		
		this.startTime = Date.now().getTime();
		this.customAudio = cast doc.getElementById('customAudio');
		this.customAudio.addEventListener('change', function (e) {});		
		this.customAudio.addEventListener('change', function(e) {
			var btn = this.customAudio;
			btn.disabled = true;
			
			var fr = new FileReader();
			this.statusSpan.textContent = 'Reading file...';
			this.loader.abort();
			fr.onload = function(e) {
				statusSpan.textContent = 'Decoding audio...';
				this.acx.decodeAudioData(fr.result, function(buffer:AudioBuffer) {
					btn.disabled = false;
					onDecode(buffer);
					return true;
				}, function(buffer:AudioBuffer)  {
					statusSpan.innerHTML = '<span style="color: red">An error occurred during decoding</span>';
					btn.disabled = false;
					return false;
				});
			}
			fr.readAsArrayBuffer(this.customAudio.files[0]);
		}, false);
		
		this.togglebtn.addEventListener('click', function (e) {
			if(this.source != null) {
				this.pausedTime = (Date.now().getTime() - startTime)/1000;
				this.stopPlayback();
			}
			else if(currentBuffer != null && source == null) {
				this.startPlayback(pausedTime);
				this.pausedTime = 0;
			}
		}, false);		
		
		this.rewindbtn.addEventListener('click', function (e) {
			if(source != null) { // Not paused
				this.stopPlayback();
				this.startPlayback(0);
			}
			else {
				this.stopPlayback();
				this.cursor.style.left = -cursor.offsetWidth/2+'px';
				this.timeSpan.textContent = timeStyle(0)+' | '+timeStyle(duration);
				this.pausedTime = 0;
			}
		}, false);		
	
		this.container.addEventListener('mousedown', function (e) {
			var y = (e.pageY - container.offsetTop);
			if(y > audiodatacanvas.offsetHeight+sgramcanvas.offsetHeight) return; // On scrollbar
			if(this.currentBuffer != null) {
				var x = (e.pageX - container.offsetLeft + container.scrollLeft)/this.timeratio;
				if(x > this.currentBuffer.duration || x < 0) return;
				if(source != null) {
					stopPlayback();
					startPlayback(x);
				}
				else {
					stopPlayback();
					cursor.style.left = Math.round((Math.min(x, duration))*timeratio-cursor.offsetWidth/2-1)+"px";
					timeSpan.textContent = timeStyle(x)+' | '+timeStyle(duration);
					pausedTime = x;
				}
			}
		}, false);		
		
		this.loadfile(musicfile);		
	}
	
	function  onAudioProcess(e:AudioProcessingEvent) {
		//trace(e.timeStamp);
		if (this.duration == 0) return;
		//var ct = Date.fromTime(e.timeStamp/1000 - startTime).();		
		var currentTime = (e.timeStamp/1000 - startTime) / 1000 ;
		//trace([e.timeStamp, startTime, currentTime, this.duration]);
		
		if (currentTime > duration && source != null) {
			stopPlayback();
			cursor.style.left = -cursor.offsetWidth/2+'px';
			timeSpan.textContent = timeStyle(0) + ' | ' + timeStyle(this.duration);			
		} else if (source != null) {			
			cursor.style.left = Math.round((Math.min(currentTime, duration))*timeratio-cursor.offsetWidth/2-1)+"px";
			timeSpan.textContent = timeStyle(currentTime) + ' | ' + timeStyle(this.duration);			
		}
	}
	
	function onWorkerMessage(e) {
		//var ratio:Float = null;
		var frameSize = 1024;
		var sgramcanvas = cast doc.getElementById('spectrogramcanvas');
		var sgc = cast this.sgramcanvas.getContext2d();		
		if(worker == null) return;
		if(e.data.frames != null) {
			//for (var j = 0; j < e.data.frames.length; j++) {
			for (j in 0 ... e.data.frames.length) {
				untyped __js__ ('(function () {');
					//var data = e.data.frames[j];
					var frames = e.data.frames;
					var data = untyped __js__(' frames[j]' );
					//var data = e.data.frames[j];
					var timeratio = 30;
					var index = data.index;
					var frameCount = data.frameCount;
					var ratio = timeratio/data.sampleRate;						
					var x = index*1024*ratio;
					//for (var i = 0; i < frameSize / 2; i++) {
					for (i in 0 ... Std.int(1024/2)) {	
						
						sgc.fillStyle = 'hsl('+Math.floor((i/(frameSize/2))*360)+', '+100+'%, '+(data.spectrum[i]*150)*50+'%)';
						sgc.fillRect(x, sgramcanvas.height-(i/(frameSize/2))*sgramcanvas.height, ratio*frameSize*2, sgramcanvas.height/(frameSize/2));
					}
				untyped __js__ ('}());');
			}
		}
		else {
			trace('WORKER:', e.data);
			worker.onmessage = null;
			worker.terminate();
			worker = null;
		}
	}	
	
	function  onDecode(buffer:AudioBuffer) {
		this.currentBuffer = buffer;
		stopPlayback();
		trace('Audio data decoded' + this.currentBuffer.length);
		statusSpan.textContent = 'Done';
		duration = buffer.duration;
		container.scrollLeft = 0;
		timeSpan.textContent = timeStyle(0) + ' | ' + timeStyle(duration);			
		cursor.style.left = -cursor.offsetWidth/2+'px';
		togglebtn.disabled = false;
		rewindbtn.disabled = false;
		customAudio.disabled = false;		
		
		
		this.channels = [buffer.getChannelData(0), buffer.getChannelData(1)];
		this.prepareWavedraw(buffer);
		this.ratioWave = timeratio/buffer.sampleRate;
		this.chunkSize = 16*1024;
		this.offset = 0;
		this.pausedTime = 0;
		this.lastY = [.0, .0];	
		this.maxLen = channels[0].length;			
		this.waveformtimer = new Timer(0);
		this.waveformtimer.run = onDrawWaveform;
		
		if(this.worker != null) {
			this.worker.onmessage = null;
			this.worker.terminate();
			this.worker = null;
		}
		this.worker = new js.html.Worker('worker.js');			
		this.worker.onmessage = onWorkerMessage;			
		var channelData = [];
		
		for (c in 0 ... buffer.numberOfChannels) channelData[c] = channels[c];		
		this.worker.postMessage({
			sampleRate: buffer.sampleRate,
			length: buffer.length,
			duration: buffer.duration,
			channelData: channelData,
			frameSize: 1024				
		});
		
		return true;
	} 
	
	function loadfile(musicfile:String) {
		loader = new XMLHttpRequest();
		loader.open('GET', musicfile, true);
		loader.responseType = 'arraybuffer';
		trace('Downloading audio...');
		statusSpan.textContent = 'Downloading...';
		loader.addEventListener('load', function (_) {
			trace('Decoding audio...');
			statusSpan.textContent = 'Decoding audio...';
			customAudio.disabled = true;			
			sampleSong.innerHTML = '';
			acx.decodeAudioData(loader.response, this.onDecode, function (buffer:AudioBuffer) {
				customAudio.disabled = false;
				statusSpan.innerHTML = '<span style="color: red">An error occurred during decoding</span>';
				return false;
			});
		}, false);
		loader.addEventListener('progress', function (e) {
			progress.value = e.loaded/e.total;
			statusSpan.textContent = 'Downloading... '+Math.round((e.loaded/1024/1024)*100)/100+'Mb of '+Math.round((e.total/1024/1024)*100)/100+'Mb';
		}, false);
		loader.send();		
	}

	function onDrawWaveform() 
	{
		adc.fillStyle = 'black';
		var data:Float32Array = null;
		var l = Math.min(maxLen, offset+chunkSize);
		for (c in 0 ... channels.length) {	
			data = channels[c];
			if(data == null) continue;
			var x = offset*ratioWave;
			adc.beginPath();
			adc.moveTo(x, audiodatacanvas.height/4+(audiodatacanvas.height/2)*c+lastY[c]*(audiodatacanvas.height/4.1));
			var i = offset;
			while ( i < l) {
				adc.lineTo(x, audiodatacanvas.height/4+(audiodatacanvas.height/2)*c+data[i]*(audiodatacanvas.height/4.1));
				//adc.fillRect(x, audiodatacanvas.height/2, 1, data[i]*(audiodatacanvas.height));
				lastY[c] = Std.int(data[i]);
				x = i*ratioWave;
				if (x > audiodatacanvas.width) break;
				i += 2;
			}
			if(c == 0) adc.strokeStyle = lchStyle;
			else adc.strokeStyle = rchStyle;
			adc.stroke();
		}
		offset += chunkSize;
		
		if(l >= maxLen) {
			channels[0] = null;
			channels[1] = null;
			data = null;
			if (waveformtimer != null) waveformtimer.stop();						
			//startPlayback(0);
			return;
		}		
	}
	
	function prepareWavedraw(buffer:AudioBuffer) {
		audiodatacanvas.width = sgramcanvas.width = Std.int(buffer.length * (timeratio / buffer.sampleRate));
		adc.clearRect(0, 0, audiodatacanvas.width, audiodatacanvas.height);
		sgc.clearRect(0, 0, sgramcanvas.width, sgramcanvas.height);			
		adc.fillStyle = 'rgba(0, 0, 0, 0.05)';
		var odd = true;
		var i = 0.0;
		while (i < duration / 60) {
			if(!odd)
				adc.fillRect(i*60*timeratio, 0, 1*60*timeratio, audiodatacanvas.height);
			odd = !odd;				
			i += 60 / 60;
		}
		adc.strokeStyle = '#AAA';
		for (c in 0 ... channels.length) {
			var data = channels[c];
			
			if(data == null) continue;
			adc.beginPath();
			adc.moveTo(0, audiodatacanvas.height/4+(audiodatacanvas.height/2)*c+0.5);
			adc.lineTo(audiodatacanvas.width, audiodatacanvas.height/4+(audiodatacanvas.height/2)*c+0.5);
			adc.stroke();
		}		
	}	
	
	function startPlayback(offset:Float) {
		
		trace(currentBuffer);
		trace(source);
		
		if(currentBuffer != null && source == null) {
			source = acx.createBufferSource();
			source.loop = false;
			source.buffer = currentBuffer;
			source.connect(fft, 0, 0);
			fft.connect(jsnode, 0, 0);
			source.connect(acx.destination, 0, 0);
			source.start(0, offset, currentBuffer.duration-offset);
			startTime = Date.now().getTime() - offset*1000;
		}
		togglebtn.textContent = 'pause';
	};	
	
	function stopPlayback() {
		if(source != null) {
			//source.noteOff(0);
			source.stop(0);
			source.disconnect(0);
			fft.disconnect(0);
			source = null;
		}
		togglebtn.textContent = 'play';
	}
	
	function createAudioContext():AudioContext {
		var context:AudioContext = null;
		untyped __js__ ('
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
		');
		return context;
	}		
	
	static inline function boolToInt(bool:Bool):Int return (bool) ? 1 : 0;	
	function zfs(v) {return v > 9 ? '$v' : '0$v';};
	function timeStyle(t:Float) {return zfs(Math.floor(t/(60*24)))+':'+zfs(Math.floor(t/60) % 60)+':'+zfs(Math.floor(t) % 60)+'.'+Math.floor(Math.floor((t % 1)*10));};
	
	function onUpdateSpectrum() {
			spectrumRatio = spectrumCanvas.width / fftData.length;				
			sc.fillStyle = 'rgba(48, 48, 48, 0.6'+/*0.55*/')';
			sc.fillRect(0, 0, spectrumCanvas.width, spectrumCanvas.height);
			sc.fillStyle = 'rgba(255, 255, 0, 0.5)';
			sc.textAlign = 'center';
			sc.font = '10px sans-serif';
			sc.strokeStyle = 'rgba(255, 255, 255, 0.1)';
			sc.lineWidth = 1;
			sc.beginPath();			

			// Draw labels
			var odd = false;
			var i = 55;
			while (i < 20000) {
				var hz = i;
				var peak = (hz*fft.fftSize)/acx.sampleRate;
				sc.moveTo(Math.round(peak*spectrumRatio)+0.5, 0);
				sc.lineTo(Math.round(peak*spectrumRatio)+0.5, spectrumCanvas.height);
				if(hz >= 440)
					sc.fillText(hz+' Hz', peak*spectrumRatio+5, 10+boolToInt(odd)*(10));
				odd = !odd;
				
				 i *= 2;
			}			
			
			var i = 0;
			while (i < spectrumCanvas.height) {
				sc.moveTo(0, spectrumCanvas.height-i+0.5);
				sc.lineTo(spectrumCanvas.width, spectrumCanvas.height - i + 0.5);
				i += 64;
			}
			sc.stroke();			
			
			fft.getByteTimeDomainData(fftData);
			sc.strokeStyle = '#444';
			sc.lineWidth = 4;
			sc.beginPath();
			//for (var i = 0; i < fftData.length; i++) {
			for (i in 0 ... fftData.length) {
				sc.lineTo((i)*spectrumRatio, spectrumCanvas.height-fftData[i]);
			}
			sc.stroke();			
			
			fft.getByteFrequencyData(fftData);
			sc.fillStyle = 'rgba(0, 0, 0, 0.15)';
			
			sc.strokeStyle = spectrumStyle; //'#9F0';
			sc.lineWidth = 5;
			sc.beginPath();
			sc.moveTo(-10, spectrumCanvas.height+10);
			var maxval = 0;
			var peak = 0;			
		
			for(i in 0 ... fftData.length) {	
				var mag = fftData[i];
				sc.lineTo(i*spectrumRatio, spectrumCanvas.height-mag);
				if(mag > maxval && mag < Math.POSITIVE_INFINITY) {
					maxval = Std.int(Math.max(maxval, mag));
					peak = i;
				}
			}
			sc.lineTo(spectrumCanvas.width+10, spectrumCanvas.height+10);
			sc.closePath();
			sc.stroke();
			sc.fill();			
			
			var hz = 1024;
			//peak = (hz*fft.fftSize)/acx.sampleRate;
			sc.strokeStyle = "rgba(255, 0, 0, 0.5)";
			sc.lineWidth = 2;
			sc.beginPath();
			sc.moveTo(Math.round(peak*spectrumRatio), spectrumCanvas.height);
			sc.lineTo(Math.round(peak*spectrumRatio), spectrumCanvas.height-maxval);
			//sc.stroke();
			sc.font = "bold 10px sans-serif";
			sc.textAlign = 'left';
			sc.fillStyle = '#F00';
			//sc.fillText("Peak: "+Math.round((peak*acx.sampleRate)/fft.fftSize)+' Hz', 200*spectrumRatio, 10);
			
			if(spectrumPos >= 0) {
				sc.strokeStyle = "rgba(0, 128, 255, 0.5)";
				sc.lineWidth = 2;
				sc.beginPath();
				sc.moveTo(Math.round(spectrumPos), spectrumCanvas.height-256);
				sc.lineTo(Math.round(spectrumPos), spectrumCanvas.height);
				sc.stroke();
				var hz = ((spectrumPos/spectrumRatio)*acx.sampleRate)/fft.fftSize;
				sc.fillStyle = '#09F';
				sc.fillText(Math.round(hz)+' Hz', spectrumPos+2, 33);
			}			
			
		}	
	
}