package audiotools.utils;
#if (js)
import audiotools.webaudio.utils.WebAudioTools;
import js.html.audio.AudioContext;
#end
using Lambda;
/**
 * Mp3Wav16Decoders
 * @author Jonas Nyström
 */
class Mp3Wav16Decoders 
{
	var decodedFiles:Map<String, Wav16>;
	var decoders:Array<Mp3Wav16Decoder>;
	var decodedCount:Int;
	
	#if js
	static public var context:AudioContext;
	#end
	
	public function new(mp3files:Array<String>) 
	{
		this.decoders = mp3files.map(function(file:String) return new Mp3Wav16Decoder(file));	
		#if (js) 		
		if (Mp3Wav16Decoders.context == null) Mp3Wav16Decoders.context = WebAudioTools.getAudioContext();
		this.decoders.iter(function(decoder) decoder.setContext(context));
		#end
		for (loader in this.decoders) loader.converted = this.onDecoded;		
	}
	
	dynamic public function onDecoded(wav16:Wav16, mp3Filename:String) {
		this.decodedFiles.set(mp3Filename, wav16);
		trace('decoded $mp3Filename');
		decodedCount++;
		if (decodedCount >= this.decoders.length) this.allDecoded(this.decodedFiles);		
	}	
	
	dynamic public function allDecoded(convertedFiles: Map<String, Wav16>) {
		trace('ALL DECODED');		
	}
	
	public function decodeAll() {		
		this.decodedCount = 0;
		this.decodedFiles = new Map<String,Wav16>();
		for (decoder in this.decoders) decoder.decode();
		return this;
	}		
	
	
}