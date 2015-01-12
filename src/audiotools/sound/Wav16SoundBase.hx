package audiotools.sound;

/**
 * Wav16SoundBase
 * @author Jonas Nyström
 */
class Wav16SoundBase implements Wav16Sound
{
	var key:String;
	var playCallback:String->Float->Void;
	var playing: Bool = false;	
	
	public function new(wav16:Wav16, playCallback:String->Float->Void, key:String) 
	{
		this.key = key;
		this.playCallback = playCallback;	
		this.playing = false;
	}
	
	/* INTERFACE audiotools.sound.Wav16Sound */
	
	public function start(pos:Float):Void 
	{
		trace('should be overridden');
	}
	
	public function stop():Void 
	{
		trace('should be overridden');
	}
	
}