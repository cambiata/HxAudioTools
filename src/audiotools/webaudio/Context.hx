package audiotools.webaudio;
import js.html.audio.AudioContext;

/**
 * NewClass
 * @author Jonas Nyström
 */
class Context 
{

	static var instance:Context;	
	
  	public static inline function getInstance()
  	{
		if (instance == null)
			return instance = new Context();
		else
			return instance;
  	}
	
	function new() {
		this.context = createAudioContext();
	}
	
	var context:AudioContext;
	
	public function getContext():AudioContext return this.context;
	
	/*
	public function getAudioContext():AudioContext {
		if (this._context == null) this._context = createAudioContext();
		return this._context;		
	}
	*/
	
	static public function createAudioContext():AudioContext
	{
		var context:AudioContext = null;
		untyped __js__ ('
			if (typeof AudioContext == "function") {
				context = new AudioContext();
				console.log("USING STANDARD WEB AUDIO API");
			} else if ((typeof webkitAudioContext == "function") || (typeof webkitAudioContext == "object")) {
				context = new webkitAudioContext();
				console.log("USING WEBKIT AUDIO API");
			} else {
				alert("AudioContext is not supported.");
				throw new Error("AudioContext is not supported. :(");
			}
		');
		return context;
	}	
		
}