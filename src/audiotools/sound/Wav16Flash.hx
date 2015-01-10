package audiotools.sound;
import audiotools.flash.SoundTools;
import audiotools.Wav16;
import flash.events.Event;
import flash.events.TimerEvent;
import flash.Lib;
import flash.media.Sound;
import audiotools.openfl.OpenflWav16Tools;
import audiotools.Wav16;
import flash.media.SoundChannel;
import flash.utils.ByteArray;
import flash.utils.Timer;


/**
 * Wav16Flash
 * @author Jonas Nyström
 */
class Wav16Flash extends Wav16SoundBase implements Wav16Sound 
{
	var sound:Sound;
	var channel:SoundChannel;
	var initializing:Bool;
	public function new(wav16:Wav16, playCallback:String->Float->Void, key:String) 
	{
		super(wav16, playCallback, key);
		var ch2 = (wav16.stereo) ? wav16.ch2 : wav16.ch1;
		var byteArray = OpenflWav16Tools.intsToStereo16ByteArray(wav16.ch1, ch2);		
		
		this.initializing = true;		
		SoundTools.buildSound(OpenflWav16Tools.intsToStereo16ByteArray(wav16.ch1, ch2), SoundTools.stereo16format(wav16.ch1.length), function(sound) {
			this.sound = sound;
			this.initializing = false;
			this.duration = this.sound.length;
			this.sound.addEventListener(Event.SOUND_COMPLETE, function(e) {
				this.stop();
			});
			trace('SOUND');
		});	
		Lib.current.addEventListener(Event.ENTER_FRAME, onEnterFrame, false, 0, true);
	}
	
	var duration:Float;
	
	private function onEnterFrame(e:Event):Void 
	{
		if (this.playing) {
			var position =  this.channel.position;
			if (position > this.duration) this.stop();
			
			this.playCallback(this.key, position);			
		}
	}
	
	var startTimer:Timer;
	
	override public function start(pos:Float) 
	{
		if (this.sound == null) {
			 this.startTimer = new Timer(300);
			 startTimer.addEventListener(TimerEvent.TIMER, function(e){
				 trace('timer ' + this.sound);
				 if (this.sound == null) return;
				 this.startTimer.stop();
				 this._start(pos);				 
			 });
			 startTimer.start();
		} else {
			this._start(pos);
		}
	}
	
	function _start(pos:Float) {
		if (this.sound == null) {
			trace('sound == null');
			return;
		}		
		this.channel = this.sound.play(pos);
		this.playing = true;				
	}
	
	override public function stop() 
	{
		this.playing = false;
		if (this.channel == null) return;		
		this.channel.stop();
	}
	
}