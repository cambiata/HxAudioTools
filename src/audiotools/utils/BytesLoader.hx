package audiotools.utils;


import haxe.io.Bytes;
import haxe.io.BytesData;
import haxe.io.BytesInput;
import tink.core.Future;
import tink.core.Outcome;


#if js
import js.html.ArrayBuffer;
import js.html.DataView;
import js.html.XMLHttpRequest;
import js.html.XMLHttpRequestProgressEvent;
import js.html.EventTarget;
#end

#if flash
import flash.events.Event;
import flash.events.IOErrorEvent;
import flash.net.URLLoader;
import flash.net.URLLoaderDataFormat;
import flash.net.URLRequest;
import flash.utils.ByteArray;
#end

using Lambda;

/**
 * ...
 * @author Jonas Nyström
 */

 typedef LoadedBytes = {
	 filename:String,
	 bytes:haxe.io.Bytes,
 }
 
  typedef LoadError = {
	 filename:String,
	 message:String,
 }
 
class BytesLoader
{	
#if (sys)
	static public function load(filename:String): Surprise<LoadedBytes, LoadError>
	{
		var f = Future.trigger();
		if (FileSystem.exists(filename))
			var bytes = File.getBytes(filename);
			f.trigger(Success( {filename:filename, bytes: bytes)))
		else
			f.trigger(Failure( { filename:filename, message: 'Can\'t find $filename'})); 		
			
		return f.asFuture();
	}	
#elseif js	
	static public function load(filename:String): Surprise<LoadedBytes, LoadError>
	{
		var f = Future.trigger();		
		var request:XMLHttpRequest = new XMLHttpRequest(); 
		request.open('GET', filename, true);
		request.responseType = 'arraybuffer';
		request.onload = function (e) {
			  var arrayBuffer:ArrayBuffer = request.response; 	
			  if (arrayBuffer != null) {
				var dataview:DataView = new DataView(arrayBuffer);
				var bytesData = new BytesData();
				for (i in 0...dataview.byteLength) bytesData.push( dataview.getUint8(i));
				var bytes = Bytes.ofData(bytesData);		
				f.trigger(Success( { filename:filename, bytes: bytes } ));
			  }
		};		
		request.onerror = function(e) {			
			f.trigger(Failure({ filename:filename, message: 'Can\'t load $filename'})); 		
		}
		request.send(null);
		return f.asFuture();
	}
#elseif flash
	static public function load(filename:String): Surprise<LoadedBytes, LoadError>
	{
		var f = Future.trigger();
		var req = new  flash.net.URLLoader();
		req.dataFormat =  flash.net.URLLoaderDataFormat.BINARY;
		req.addEventListener(flash.events.Event.COMPLETE , function ( e: Event )
		{
			var arr: ByteArray = cast( e.target,  flash.net.URLLoader ).data;
			var bytes = Bytes.ofData( arr );
			f.trigger(Success( { filename:filename, bytes:bytes } ));
		});
		req.addEventListener(IOErrorEvent.IO_ERROR, function(e:IOErrorEvent) {
			f.trigger(Failure( { filename:filename, message: e.text})); 		
		});
		req.load( new  flash.net.URLRequest(filename) );
		return f.asFuture();
	}
#end
}

class BytesLoaders 
{
	static public function loadAll(filenames:Array<String>): Future<Array<Outcome<LoadedBytes, LoadError>>> {
		return [ for (filename in filenames) BytesLoader.load(filename) ];
	} 	
	
	static public function loadAllMap(filenames:Array<String>):Future<Map<String, Bytes>> {		
		var f = Future.trigger();
		var result = new Map<String, Bytes>();		
		loadAll(filenames).handle(function(items:Array<Outcome<LoadedBytes, LoadError>>) {						
			items.iter(function(item) switch item {
					case Outcome.Success(loadetBytes): result.set(loadetBytes.filename, loadetBytes.bytes);
					case Failure(loadError): 
			});
			f.trigger(result);
		});
		return f.asFuture();		
	}
}
