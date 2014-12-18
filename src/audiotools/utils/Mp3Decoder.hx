package audiotools.utils;



import haxe.ds.Vector;
import haxe.io.Bytes;
import tink.core.Future;
import tink.core.Outcome;

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
import flash.events.IOErrorEvent;
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

 
 typedef DecodedMp3 = {
	 filename:String,
	 bytes:haxe.io.Bytes,	 
 }
 
   typedef DecodedError = {
	 filename:String,
	 message:String,
 }
 
 
class Mp3Decoder 
{
	/*
	var mp3filename:String;

	public function new(mp3Filename:String) 
	{
		this.mp3filename = mp3Filename;
	}
	
	public function execute() {
		this.getWavFile();
		return this;
	}	
	*/
	
	#if (sys)	
	public function getWavFile(filename:String, tempPath:String = ''):Surprise<DecodedMp3, DecodedError> {
		
		var f = Future.trigger();
		
		if (FileSystem.exists(filename)) {
			var tempFilename = (tempPath != '') ? '$tempPath/temp.wav' : 'temp.wav';
			var command = Sys.command('sox', [this.mp3filename, tempFilename]);
			var wavBytes = File.getBytes(tempFilename);
			FileSystem.deleteFile(tempFilename);
			f.trigger(Success( { filename:filename, bytes: bytes}));
		} else {			
			f.trigger(Failure( { filename:filename, message: 'Can\'t find $filename'})); 				
		}
		
		/*
		var tempFilename = (tempPath != '') ? '$tempPath/temp.wav' : 'temp.wav';
		var command = Sys.command('sox', [this.mp3filename, tempFilename]);
		var wavBytes = File.getBytes(tempFilename);
		this.converted(wavBytes, this.mp3filename);
		FileSystem.deleteFile(tempFilename);
		return wavBytes;
		*/
		return f.asFuture();
	}
	#end

	#if (flash) 
	
		public function getWavFile(filename:String):Surprise<DecodedMp3, DecodedError> {
			
			var f = Future.trigger();
			
			var loader = new URLLoader(new URLRequest(filename));
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
				//this.converted(wavBytes, this.mp3filename);				
				f.trigger(Success( { filename:filename, bytes:wavBytes } ));
			});
			
			loader.addEventListener(IOErrorEvent.IO_ERROR, function(e:IOErrorEvent) {
				f.trigger(Failure( { filename:filename, message: e.text})); 		
			});			
			loader.load( new  flash.net.URLRequest(filename) );
			
			return f.asFuture();
		}
	#end	
	
	#if (js)
	
		static var context:AudioContext;
		public static function setContext(context:AudioContext) Mp3Wav16Decoder.context = context;
		public function getWavFile(filename:String):Surprise<DecodedMp3, DecodedError> {
			
			var f = Future.trigger();
			
			if (context == null) {
				Lib.alert('No AudioContext!');							
				f.trigger(Failure( { filename:filename, message:'No AudioContext!'})); 	
			}
			new Mp3ToBuffer(filename, context).setLoadedHandler(function(buffer:AudioBuffer, filename:String) {
				
				
				var bytes:Bytes = null;					
				var left:Float32Array = buffer.getChannelData(0);
				var leftInts = new Vector<Int>(left.length);				
				var pos = 0;
				for (n in left) {
					leftInts.set(pos, Std.int(n * 32767));
					pos++;
				}
				
				if (buffer.numberOfChannels > 1) {
					var right:Float32Array = buffer.getChannelData(1);
					var rightInts = new Vector<Int>(right.length);
					var pos = 0;
					for (n in right) {
						rightInts.set(pos, Std.int(n * 32767));
						pos++;
					}
					bytes = Wav16Tools.intsToStero16Bytes(leftInts, rightInts);					
				} else {
					bytes = Wav16Tools.intsToMono16Bytes(leftInts);
				}				
				//this.converted(bytes, this.mp3filename);
				f.trigger(Success( { filename:filename, bytes:bytes } ));
				
			}).load();		
		
			return f.asFuture();
		}
		
	#end
	
	/*
	dynamic public function converted(bytes:Bytes, mp3Filename:String) {
		trace(bytes.length);
		trace(mp3filename);
	}
	
	public function setConvertedHandler(callbck: Bytes->String->Void) {
		this.converted = callbck;
		return this;		
	}
	*/
	

	
	
	
}