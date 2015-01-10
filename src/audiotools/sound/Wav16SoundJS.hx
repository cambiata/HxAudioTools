package audiotools.sound;
import audiotools.Wav16;
import audiotools.webaudio.WebAudioTools;
import js.html.audio.AudioBuffer;
import js.html.audio.AudioBufferSourceNode;
import js.html.audio.AudioContext;

/**
 * Wab16Webaudio
 * @author Jonas Nyström
 */
class Wab16Webaudio extends Wav16SoundBase implements Wav16Sound 
{
	//var playCallback:String->Float->Void;
	var elapsedTimeSinceStart:Float;
	var lastTime = .0;
	var delta = .0;
	var buffer:AudioBuffer;
	var source: AudioBufferSourceNode;
	
	var context:AudioContext; // = audiotools.webaudio.WebAudioTools.getAudioContext();
	//var key:String;
	
	/* INTERFACE audiotools.sound.Wav16Sound */
	
	@:expose dynamic static public function animationCallback() { }
	
	public function new(wav16:Wav16, playCallback:String->Float->Void, key:String) 
	{
		//this.key = key;
		//this.playCallback = playCallback;
		super(wav16, playCallback, key);
		
		this.context =  WebAudioTools.getAudioContext();
		this.buffer = WebAudioTools.createBufferFromWav16(wav16, this.context, 48000);		
		 audiotools.sound.Wab16Webaudio.animationCallback =this.onAnimate;	 // this.playCallback; /
		
		 untyped __js__('
			window.requestAnimFrame = (function() {
			    return window.requestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.oRequestAnimationFrame ||
				window.msRequestAnimationFrame ||
				function(/* function */ callback, /* DOMElement */ element) {
				    window.setTimeout(callback, 1000 / 60);
				};
			})();		 
		 ');			 
			 
		  this.onAnimate();				
	}
	
	override public function start(pos:Float) 
	{
		this.source = context.createBufferSource();
		this.source.buffer =  this.buffer;
		this.source.connect(context.destination, 0, 0);			
		this.elapsedTimeSinceStart = pos;
		this.source.start(pos);
		this.lastTime = this.context.currentTime;
		this.playing = true;			
	}
	
	override public function stop() :Void
	{
		if (this.playing == false) return;
		if (source == null) return;
		source.stop(0);
		this.source == null;
		this.elapsedTimeSinceStart = 0;
		this.playing = false;		
	}
	
	function onAnimate() {
		
		if (this.playing) {
			//trace([this.elapsedTimeSinceStart, context.currentTime]);
			if (this.elapsedTimeSinceStart > this.buffer.duration) this.stop();
			var delta = this.context.currentTime - this.lastTime;
			this.elapsedTimeSinceStart += delta;
			this.playCallback(this.key, this.elapsedTimeSinceStart);
			this.lastTime = this.context.currentTime;			
		} else {
			//trace('onAnimate...');	
		}
		
		untyped __js__('requestAnimFrame(  audiotools.sound.Wab16Webaudio.animationCallback);');				
	}
	
}