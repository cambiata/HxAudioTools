package audiotools.utils;
import audiotools.utils.Wav16DecoderPool;
import audiotools.Wav16;
import haxe.ds.ObjectMap;
import nx3.audio.NotenrBarsCalculator;
import nx3.audio.NotenrItem;
import nx3.audio.NotenrTools;
import audiotools.utils.Mp3Wav16Decoder;
import nx3.NScore;
using cx.ArrayTools;
/**
 * Wav16BuildFromParts
 * @author Jonas Nyström
 */
class Wav16PartsBuilder 
{
	var mp3files:Array<String>;
	var initialized: Bool = false;
	var soundData:Map<String, Wav16>;
	var cache:Map <String, Wav16>;
	
	private static var instance:Wav16PartsBuilder;
	
  	public static inline function getInstance()
  	{
		if (instance == null)
			return instance = new Wav16PartsBuilder();
		else
			return instance;
  	}
	
	private function new() {
		
	}	
	
	
	/*
	public function new(mp3files:Array<String>) 
	{
		

		
	}
	*/
	
	public function init(mp3files:Array<String>) {
		
		#if js 
		Mp3Wav16Decoders.setContext(audiotools.webaudio.WebAudioTools.getAudioContext());
		#end		
		
		this.mp3files = mp3files;
		this.cache = new Map <String, Wav16>();
		this.startDecoding();
		Mp3Wav16Decoders.decodeAllMap(this.mp3files).handle(function(soundData:Map<String, Wav16>) {
			this.soundData = soundData;			
			this.initialized = true;
			this.finishedDecoding();
		});				
	}
	
	dynamic public function startDecoding() { };
	dynamic public function finishedDecoding() { };	
	
	public function build(partsnotes:PartsNotenrItems,partsSounds:Array<String> = null) :Wav16
	{
		if (! this.initialized) throw "Wav16PartsBuilder not initialized - sounds not decoded";
		var result = Wav16.createSecs(NotenrTools.getTotalLength(partsnotes) + 1, true);
		if (partsSounds == null) partsSounds = ['piano'];
		while (partsnotes.length > partsSounds.length) partsSounds.push(partsSounds.last());
		trace(partsSounds);
		
		var partidx = 0;
		for (part in partsnotes) {
			var partSound = partsSounds[partidx];
			for (note in part) {				
				if (!note.playable) continue;	
				var key = 'sounds/$partSound/${note.midinr}.mp3';	
				var w16 = this.soundData.get(key);
				if ( w16 != null) {
					var offset = Wav16Tools.toSamples(note.playpos);
					var length = Wav16Tools.toSamples(note.soundlength + 0.1);					
					Wav16DSP.wspMixInto(result, w16, offset, length);	
				} else {
					trace('ERROR : $key == null!');
				}				
			}
			partidx++;
		}		
		return result;
	}
	
	public function buildScore(nscore:NScore, tempo:Int = 60, partsSounds:Array<String> = null):Wav16 {
		var partsnotes:PartsNotenrItems = new NotenrBarsCalculator(nscore.nbars).getPartsNotenrItems();
		NotenrTools.calculateSoundLengths(partsnotes, 60);				
		partsnotes = NotenrTools.resolveTies(partsnotes);	
		return this.build(partsnotes, partsSounds);
	}
	
	public function getScore(nscore:NScore, tempo:Int = 60, partsSounds:Array<String> = null, cacheKey:String='') : Wav16 {

		var key = nscore.uuid + ':$tempo:$partsSounds';
		
		trace('getKey:$key');
		//trace(key);
		if (this.cache.exists(key)) {
			trace('Get wav16 from cache');
			return this.cache.get(key);
		}
		
		var wav16 = this.buildScore(nscore, tempo, partsSounds);
		trace('Set wav16 to cache');
		this.cache.set(key, wav16);
		
		return wav16;
	}
	
}