package audiotools.sound;

/**
 * Wav16SoundLoader
 * @author Jonas Nyström
 */

import audiotools.Wav16;
import tink.core.Future;
import tink.core.Outcome;
import audiotools.utils.Mp3Wav16Decoder;


using Lambda;
using cx.ArrayTools;
using StringTools;
 
class Wav16SoundLoader 
{

	static var instance:Wav16SoundLoader;
	
	var cache:Map <String, Wav16>;
	
  	public static inline function getInstance()
  	{
		if (instance == null)
			return instance = new Wav16SoundLoader();
		else
			return instance;
  	}
	
	function new() {
		this.cache = new Map <String, Wav16>();
	}	
	
	/*
	public function setSoundPath(path:String) {
		SOUND_PATH = path;
	}
	
	static var SOUND_PATH:String = '/bin';
	*/
	
	public function getWav16s(mp3files:Array<String>, startCallback:Int->Void=null): Future<Map<String, Wav16>>
	{
		
		
		var f = Future.trigger();
		
		var result = new Map <String, Wav16>();	
		
		/*
		trace(mp3files);
		mp3files = mp3files.map(function(mp3file) return SOUND_PATH + mp3file);
		trace(mp3files);
		*/
		
		if (mp3files == null || mp3files.length == 0) f.trigger(result);
		
		//----------------------------------------------------------------------------------------------------
		//trace(mp3files);
		
		var cacheKeys = this.cache.keys().fromIterator();		
		//trace('In cache:');
		//trace(cacheKeys);
		
		var loadKeys = ArrayTools.hasNot(cacheKeys, mp3files);
		//trace('mp3s to load:');
		//trace(loadKeys);
		
		if (startCallback != null) startCallback(loadKeys.length);
		
		//----------------------------------------------------------------------------------------------
		
		for (mp3file in cacheKeys) {			
			result.set(mp3file, this.cache.get(mp3file));
		}
		
		if (loadKeys.length == 0) f.trigger(result);
		
		//--------------------------------------------------------------------------------------------
		
		Mp3Wav16Decoders.decodeAllMap(loadKeys).handle(function(soundData:Map<String, Wav16>) {			
			for (mp3file in soundData.keys()) {
				
				// removie initial chars:
				//if (mp3file.startsWith('/')) mp3file = mp3file.substr(1);
				//if (mp3file.startsWith('./')) mp3file = mp3file.substr(1);
				
				
				this.cache.set(mp3file, soundData.get(mp3file));
				result.set(mp3file, soundData.get(mp3file));
			}
			f.trigger(result);			
		});			
		
		return f.asFuture();
	}
	
	
	
}