package audiotools.utils;



import audiotools.Wav16;
import audiotools.Wav16Mono;
import audiotools.Wav16Stereo;
import haxe.ds.Vector;
import haxe.io.Bytes;


#if (sys)
import sys.FileSystem;
import sys.io.File;
#end

#if (js)
import js.Lib;
import audiotools.webaudio.Mp3ToBuffer;
import js.html.audio.AudioBuffer;
import js.html.Float32Array;
import js.html.audio.AudioContext;
#end

#if (flash)
import audiotools.openfl.utils.WaveEncoder;
import audiotools.openfl.utils.ByteArrayTools;
import flash.events.Event;
import flash.media.Sound;
import flash.net.URLLoader;
import flash.net.URLLoaderDataFormat;
import flash.net.URLRequest;
import flash.utils.ByteArray;
#end

/**
 * Mp3Decoder
 * @author Jonas Nyström
 */

class Mp3Wav16Decoder 
{
	var mp3filename:String;

	public function new(mp3Filename:String) 
	{
		this.mp3filename = mp3Filename;
	}
	
	public function execute() {
		this.getWavFile();
		return this;
	}	
	
	#if (sys)	
	public function getWavFile(tempPath:String = '') {
		var tempFilename = (tempPath != '') ? '$tempPath/temp.wav' : 'temp.wav';
		var command = Sys.command('sox', [this.mp3filename, tempFilename]);
		var wavBytes = File.getBytes(tempFilename);
		
		FileSystem.deleteFile(tempFilename);
		var aInts = Wav16Tools.stereoToInts(wavBytes, true);
		var w16 = new Wav16Stereo(aInts[0], aInts[1]);
		this.converted(w16, this.mp3filename);
	}
	#end

	#if (flash) 
		public function getWavFile() {
			var loader = new URLLoader(new URLRequest(this.mp3filename));
			loader.dataFormat = URLLoaderDataFormat.BINARY;
			loader.addEventListener(Event.COMPLETE, function(e) {
				var data:ByteArray = cast loader.data;			
				var sound:Sound = new Sound();
				sound.loadCompressedDataFromByteArray(data, data.length);
				var wavByteArray:ByteArray = new ByteArray();
				sound.extract(wavByteArray, 10000000000);
				
				var we = new WaveEncoder();
				var wavEncodedByteArray:ByteArray = we.encode(wavByteArray);
				wavEncodedByteArray.position = 0;				
				
				var wavBytes = ByteArrayTools.toBytes(wavEncodedByteArray);
				var aInts = Wav16Tools.stereoToInts(wavBytes, true);
				var w16 = new Wav16Stereo(aInts[0], aInts[1]);			
				this.converted(w16, this.mp3filename);			
			});
		}
	#end	
	
	#if (js)
	
		var context:AudioContext;
		public var buffer(default, null):AudioBuffer;
		public function setContext(context:AudioContext) {
			this.context = context;
			return this;
		}	
	
		public function getWavFile() {
			if (this.context == null) {
				Lib.alert('No AudioContext!');			
				throw "No AudioContext";
			}
			new Mp3ToBuffer(this.mp3filename, context).setLoadedHandler(function(buffer:AudioBuffer, filename:String) {
				this.buffer = buffer;
				
				var wavBytes:Bytes = null;
					
				var left:Float32Array = buffer.getChannelData(0);
				trace('ll ' + left.length);
				var leftInts = new Vector<Int>(left.length);				
				var pos = 0;
				for (n in left) {
					leftInts.set(pos, Std.int(n * 32767));
					pos++;
				}
				
				var w16:Wav16 = null;
				
				if (buffer.numberOfChannels > 1) {
					var right:Float32Array = buffer.getChannelData(1);
					var rightInts = new Vector<Int>(right.length);
					var pos = 0;
					for (n in right) {
						rightInts.set(pos, Std.int(n * 32767));
						pos++;
					}
					wavBytes = Wav16Tools.intsToStero16Bytes(leftInts, rightInts);	
					w16 = new Wav16Stereo(leftInts, rightInts);
					
				} else {
					wavBytes = Wav16Tools.intsToMono16Bytes(leftInts);
					w16 = new Wav16Mono(leftInts);
				}				
				
				/*
				var aInts = Wav16Tools.stereoToInts(wavBytes, true);
			trace(this.mp3filename);
				trace([aInts[0].length, aInts[1].length] );
				var w16 = new Wav16Stereo(aInts[0], aInts[1]);		
				*/
				this.converted(w16, this.mp3filename);							
				
				
			}).load();		
			
		}
	#end
	
	dynamic public function converted(wav16:Wav16, mp3Filename:String) {
		trace(wav16.ints.length);
		trace(mp3filename);
	}
	
	public function setDecodedHandler(callbck:Wav16->String->Void) {
		this.converted = callbck;
		return this;		
	}
	
	

	
	
	
}