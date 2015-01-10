package audiotools.sound;

/**
 * Wav16SoundManager
 * @author Jonas Nyström
 */
class Wav16SoundManager  implements Wav16Sound
{

  	private static var instance:Wav16SoundManager;
	var sound:Wav16Sound;
	var wav16:Wav16;
	var playCallback:String->Float->Void;
	var key:String;
  
  	public static inline function getInstance()
  	{
		if (instance == null)
			return instance = new Wav16SoundManager();
		else
			return instance;
  	}
	
	private function new() {
		
	}
	
	public function initSound(wav16:Wav16, playCallback:String->Float->Void, key:String) 
	{
		if (this.sound != null) this.sound.stop();		
		if (wav16 == this.wav16 && playCallback == this.playCallback && key == this.key) {
			trace('no need to re initialize');
			return;
		}
		this.wav16 = wav16;
		this.playCallback = playCallback;
		this.key = key;
		
		#if js 
			this.sound = new Wav16SoundJS(wav16, playCallback, key);
		#end
		
		#if flash
			this.sound = new Wav16SoundFlash(wav16, playCallback, key);
		#end		
	}
	
	/* INTERFACE audiotools.sound.Wav16Sound */	
	public function start(pos:Float):Void 
	{
		if (this.sound != null) 
			this.sound.start(pos);	
		else
			trace('Wav16SoundManager has no sound instance');
	}
	
	public function stop():Void 
	{
		if (this.sound != null) 
			this.sound.stop();
		else
			trace('Wav16SoundManager has no sound instance');

	}
	
	
	
	
}