package audiotools.sound;
import audiotools.Wav16;

/**
 * @author Jonas Nyström
 */

interface Wav16Sound 
{
	//function init(wav16:Wav16, playCallback:Float->Void) ;
	function start(pos:Float):Void ;
	function stop():Void ;
}