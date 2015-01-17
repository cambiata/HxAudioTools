package audiotools.utils;


import tink.core.Future;
import tink.core.Outcome;
import audiotools.Wav16;

import haxe.ds.Vector;
import haxe.io.Bytes;


#if (sys)import tink.core.Future;
import tink.core.Outcome;
import sys.FileSystem;
import sys.io.File;
#end

#if (js)
import js.Lib;
import audiotools.webaudio.Mp3ToBuffer;
import js.html.audio.AudioBuffer;
import js.html.Float32Array;
import js.html.audio.AudioContext;
import audiotools.webaudio.WATools;
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
using Lambda;
/**
 * Mp3Decoder
 * @author Jonas Nyström
 */

  typedef Wav16File= {
	 filename:String,
	 w16: Wav16,	 
 }
 
   typedef Wav16Error = {
	 filename:String,
	 message:String,
 }
 
 
class Mp3Wav16Decoder 
{
	/*
	var mp3filename:String;

	public function new(mp3Filename:String) 
	{
		this.mp3filename = mp3Filename;
	}
	
	public function decode() {
		this.getWavFile();
		return this;
	}	
	*/
	#if (sys)	
	static public function decode(filename:String, tempPath:String = ''):Surprise<Wav16File, Wav16Error> {
			var f = Future.trigger();
			
			if (FileSystem.exists(filename)) {
				var tempFilename = (tempPath != '') ? '$tempPath/temp.wav' : 'temp.wav';
				var command = Sys.command('sox', [filename, tempFilename]);
				var w16 = Wav16.fromFile(tempFilename);
				FileSystem.deleteFile(tempFilename);			
				f.trigger(Success( { filename:filename, w16: w16}));
			} else {			
				f.trigger(Failure( { filename:filename, message: 'Can\'t find $filename'})); 				
			}
			
			return f.asFuture();
			
		}
	#end

	#if (flash) 
	static 	public function decode(filename:String ) :Surprise<Wav16File, Wav16Error> {
			
			var f = Future.trigger();
			
			var loader:URLLoader = new URLLoader();
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
				var w16 = new Wav16(aInts[0], aInts[1]);			
				f.trigger(Success( { filename:filename, w16: w16}));	
			});
			loader.addEventListener(IOErrorEvent.IO_ERROR, function(e:IOErrorEvent) {
				f.trigger(Failure( { filename:filename, message: e.text})); 		
			});			
			loader.load(new URLRequest(filename));
			
			return f.asFuture();
			
		}
	#end	
	
	#if (js)
	
	/*
		var context:AudioContext;
		public var buffer(default, null):AudioBuffer;
		
		
		
		public function setContext(context:AudioContext) {
			this.context = context;
			return this;
		}	
		*/
		static public var context:AudioContext;
		
	static public function decode(filename:String ) :Surprise<Wav16File, Wav16Error> {
			
		var f = Future.trigger();
		
		if (context == null) {			
			//Lib.alert('AudioContext not set');						
			//f.trigger(Failure( { filename:filename, message:'No AudioContext!'})); 	
			context = WATools.getAudioContext();
		}
		new Mp3ToBuffer(filename, context).setLoadedHandler(function(buffer:AudioBuffer, filename:String) {
			
			var wavBytes:Bytes = null;
				
			var left:Float32Array = buffer.getChannelData(0);
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
				w16 = new Wav16(leftInts, rightInts);
			} else {
				w16 = new Wav16(leftInts);
			}				

			f.trigger(Success( { filename:filename, w16: w16}));						
			
		}).load();		
		
		return f.asFuture();
	}
	#end
	/*
	dynamic public function converted(wav16:Wav16, mp3Filename:String) {
		trace(wav16.ch1.length);
		trace(mp3filename);
	}
	
	public function setDecodedHandler(callbck:Wav16->String->Void) {
		this.converted = callbck;
		return this;		
	}
	*/
}

class Mp3Wav16Decoders
{
	#if js
	public static function setContext(context:AudioContext) Mp3Wav16Decoder.context = context;
	#end
	
	static public function decodeAll(filenames:Array<String>): Future<Array<Outcome<Wav16File, Wav16Error>>> {
		return [ for (filename in filenames) Mp3Wav16Decoder.decode(filename) ];
	} 	

	static public function decodeAllMap(filenames:Array<String>):Future<Map<String, Wav16>> {		
		var f = Future.trigger();
		var result = new Map<String, Wav16>();		
		decodeAll(filenames).handle(function(items:Array<Outcome<Wav16File, Wav16Error>>) {						
			items.iter(function(item) switch item {
					case Outcome.Success(wav16file): result.set(wav16file.filename, wav16file.w16);
					case Failure(wav16Error): 
			});
			f.trigger(result);
		});
		return f.asFuture();		
	}	
	
}

