
importScripts('dsp.js');

function sleep (milliseconds) {
	var start = Date.now();
	for(var i = 0; i < 1e7; i++) {
		if((Date.now() - start) > milliseconds) {
			break;
		}
	}
}

self.addEventListener('message', function (e) {
	
	var buffer = e.data;
	
	var frameSize = buffer.frameSize;
	
	var fft = new FFT(frameSize, buffer.sampleRate);
	
	
	var handleFrame = function (chFrameData) {
		var frame = new Float64Array(frameSize);
		for(var i=0; i < frameSize; i++) {
			var amp = 0;
			for(var c=0; c < chFrameData.length; c++) {
				amp += chFrameData[c][i];
			}
			amp /= chFrameData.length;
			frame[i] = amp;
		}
		
		fft.forward(frame);
		
		return {spectrum: fft.spectrum};
	};
	
	
	var frameCount = Math.floor(buffer.length / frameSize);
	
	var channelCount = buffer.channelData.length;
	
	var toSend = [];
	
	for(var i=0; i < frameCount; i+=2) {
		var channelFrameData = [];
		for(var c=0; c < channelCount; c++) {
			channelFrameData[c] = buffer.channelData[c].subarray(i*frameSize, i*frameSize+frameSize);
		}
		var frameData = handleFrame(channelFrameData);
		
		toSend.push({
			//frame: frameData.frame,
			spectrum: new Float32Array(frameData.spectrum),
			index: i,
			frameCount: frameCount,
			sampleRate: buffer.sampleRate
		});
		
		if(toSend.length === 5) {
			self.postMessage({frames: toSend});
			sleep(100);
			toSend = [];
		}
	}
	if(toSend.length > 0) {
		self.postMessage({frames: toSend});
	}
	
	self.postMessage('close');
	
}, false);