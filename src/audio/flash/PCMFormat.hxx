package audio.flash;
import flash.utils.ByteArray;

class PCMFormat
{
	public static inline var HEADER_SIZE : Int = 44;

	public var _channels : Int;
	public var _sampleRate : Int;
	public var _byteRate : Int;
	public var _blockAlign : Int;
	public var _bitsPerSample : Int;
	public var _waveDataLength : Int;
	public var _fullDataLength : Int;

	public function new()  {}

	public static function mono16format(fullDataLength:Int):PCMFormat
	{
		var format = new PCMFormat();
		format._bitsPerSample = 16;
		format._blockAlign = 2;
		format._byteRate = 88200;
		format._channels = 1;
		format._sampleRate = 44100;
		format._fullDataLength = fullDataLength;
		format._waveDataLength = fullDataLength - 84;
		return format;
	}

	public static function stereo16format(fullDataLength:Int):PCMFormat
	{
		var format = new PCMFormat();
		format._bitsPerSample = 16;
		format._blockAlign = 2;
		format._byteRate = 88200;
		format._channels = 2;
		format._sampleRate = 44100;
		format._fullDataLength = fullDataLength;
		format._waveDataLength = fullDataLength - 84;
		return format;
	}    

    
}
