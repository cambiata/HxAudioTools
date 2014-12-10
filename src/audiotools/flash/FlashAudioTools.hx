package audiotools.flash;
import audiotools.openfl.OpenflWav16Tools;
import audiotools.Wav16;
import flash.media.Sound;
import flash.utils.ByteArray;


/**
 * FlashAudioTools
 * @author Jonas Nyström
 */
class FlashAudioTools 
{
	static public function testplay(wav16:Wav16) 
	{
		var ch2 = (wav16.stereo) ? wav16.ch2 : wav16.ch1;
		var byteArray = OpenflWav16Tools.intsToStereo16ByteArray(wav16.ch1, ch2);
		
		
		SoundTools.buildSound(OpenflWav16Tools.intsToStereo16ByteArray(wav16.ch1, ch2), SoundTools.stereo16format(wav16.ch1.length), function(sound) {
			sound.play(0);
		});	
		
		
		//OpenflWav16Tools.intsToStereo16ByteArray
		/*
		trace(wav16.ch1.length);
		var sound = new Sound();
		sound.loadPCMFromByteArray(byteArray,  wav16.ch1.length, 'short', false);		
		var soundChannel = sound.play();			
		*/
	}
}