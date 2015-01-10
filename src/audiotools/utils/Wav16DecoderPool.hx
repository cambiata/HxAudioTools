package audiotools.utils;

/**
 * Wav16Soundpool
 * @author Jonas Nyström
 */

 import audiotools.utils.Mp3Wav16Decoder;
import audiotools.Wav16;
import tink.core.Future;
import tink.core.Outcome;
 
class Wav16DecoderPool 
{

	var files:Map<String, Wav16>;

	public function new() 
	{
		#if js 
		//audiotools.utils.Mp3Wav16Decoder.setContext(WebAudioTools.getAudioContext());
		#end				
		this.files = new Map<String, Wav16>();
	}
	
	public function getFiles() return this.files;
	
	public function requestFile(sound:String, midinr:Int, version:String=''): Surprise<Wav16, String> {				
		var f = Future.trigger();	

		trace(this.files);
		var filetag = '$sound/$midinr$version.mp3';		
		trace(filetag);
		
		if (this.files.exists(filetag)) {
			trace('get from cache');
			f.trigger(Success(files.get(filetag)));			
		} else {
			Mp3Wav16Decoder.decode(filetag).handle(function(outcome) {
				switch outcome {
					case Success(wav16file): {
						this.files.set(filetag, wav16file.w16);
						trace('set to cache $filetag');
						trace(this.files);
						trace(wav16file);
						f.trigger(Success(wav16file.w16));
					}
					case Failure(wav16error): {
						trace(wav16error);
						f.trigger(Failure(wav16error.message)); 	
					}
				}			
			});
		}
		trace(this.files);
		return f.asFuture();
	}
	
}