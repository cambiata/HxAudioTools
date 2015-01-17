package audiotools.utils;

import tink.core.Future;
import tink.core.Outcome;

import audiotools.sound.Wav16SoundLoader;
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
	var soundmap:Map<String, Wav16>;
	var scorecache:Map <String, Wav16>;
	
	private static var instance:Wav16PartsBuilder;
	
  	public static inline function getInstance()
  	{
		if (instance == null)
			return instance = new Wav16PartsBuilder();
		else
			return instance;
  	}
	
	private function new() {
		this.scorecache = new Map <String, Wav16>();
	}	
	
	
	/*
	public function new(mp3files:Array<String>) 
	{
		

		
	}
	*/
	
	/*
	public function init(mp3files:Array<String>) {
		
		
		this.mp3files = mp3files;
		//this.scorecache = new Map <String, Wav16>();
		this.startDecoding(mp3files.length);
		
		Wav16SoundLoader.getInstance().getWav16s(mp3files,null).handle(function(soundmap: Map<String, Wav16>) {
			//trace('Loaded');
			//trace(soundmap.keys().fromIterator());
			this.soundmap = soundmap;
			this.initialized = true;
			this.finishedDecoding();
		});
		
	}
	*/
	
	public function initAsync(mp3files:Array<String>) : Future<Map<String, Wav16>> {
		var f = Future.trigger();		
		var result = new Map <String, Wav16>();			
		
		Wav16SoundLoader.getInstance().getWav16s(mp3files,null).handle(function(soundmap: Map<String, Wav16>) {
			//trace('Loaded');
			//trace(soundmap.keys().fromIterator());
			this.soundmap = soundmap;
			this.initialized = true;
			this.finishedDecoding();
			f.trigger(this.soundmap);
			
		});		
		
		return f.asFuture();
		
	}
	
	
	dynamic public function startDecoding(filesToLoad:Int) { };
	dynamic public function finishedDecoding() { };	
	
	
	/*
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
				var w16 = this.soundmap.get(key);
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
	*/
	
	public function buildSoundmap(partsnotes:PartsNotenrItems,soundmap:Map<String, Wav16>) :Wav16
	{
		if (! this.initialized) throw "Wav16PartsBuilder not initialized - sounds not decoded";
		
		var length = NotenrTools.getTotalLength(partsnotes) + 1;
		trace('Length: $length');		
		var result = Wav16.createSecs(length, true);
		//if (partsSounds == null) partsSounds = ['piano'];
		//while (partsnotes.length > partsSounds.length) partsSounds.push(partsSounds.last());
		//trace(partsSounds);
		
		var partidx = 0;
		for (part in partsnotes) {
			//var partSound = partsSounds[partidx];
			for (note in part) {				
				if (!note.playable) continue;	
				
				//var key = 'sounds/$partSound/${note.midinr}.mp3';	
				var key = note.mp3file;
				
				var w16 = this.soundmap.get(key);
				
				if ( w16 != null) {
					
					trace(note.playpos);
					
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
	
	
	
	/*
	public function buildScore(nscore:NScore, tempo:Int = 60, partsSounds:Array<String> = null):Wav16 {
		var partsnotes:PartsNotenrItems = new NotenrBarsCalculator(nscore.nbars).getPartsNotenrItems();
		NotenrTools.calculateSoundLengths(partsnotes, 60);				
		partsnotes = NotenrTools.resolveTies(partsnotes);	
		return this.build(partsnotes, partsSounds);
	}
	*/
	
	/*
	public function getScore(nscore:NScore, tempo:Int = 60, partsSounds:Array<String> = null, cacheKey:String='') : Wav16 {

		var key = nscore.uuid + ':$tempo:$partsSounds';
		
		trace('getKey:$key');
		//trace(key);
		if (this.scorecache.exists(key)) {
			trace('Get wav16 from cache');
			return this.scorecache.get(key);
		}
		
		var wav16 = this.buildScore(nscore, tempo, partsSounds);
		trace('Set wav16 to cache');
		this.scorecache.set(key, wav16);
		
		return wav16;
	}
	*/
	
	public function getScoreWav16Async(nscore:NScore, tempo:Int = 60, partsSounds:Array<String> = null) : Future<Wav16> {
		
		var f = Future.trigger();		
		
		var key = nscore.uuid + ':$tempo:$partsSounds';
		if (this.scorecache.exists(key)) {
			trace('Get wav16 from cache');
			var wav16:Wav16 = this.scorecache.get(key);
			f.trigger(wav16);
		} else {					
			var partsnotes = NotenrTools.getPartsnotes(nscore.nbars, tempo);
			var files = NotenrTools.getPartsnotesMp3files(partsnotes);					
			this.initAsync(files).handle ( function(soundmap) {
				var wav16 = this.buildSoundmap(partsnotes, soundmap);
				this.scorecache.set(key, wav16);
				trace('Set wav16 to cache');
				f.trigger(wav16);
			});	
		}
		
		return f.asFuture();
	}
	
	public function removeScoreFromCache(nscore:NScore, tempo:Int = 60, partsSounds:Array<String> = null) {
		var key = nscore.uuid + ':$tempo:$partsSounds';
		if (this.scorecache.exists(key)) {
			this.scorecache.remove(key);
			trace('remove key $key');
		} else {
			trace('can not find key $key to remove');
		}
	}
	
	
}