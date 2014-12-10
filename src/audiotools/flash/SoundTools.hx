package audiotools.flash;
import flash.display.Loader;
import flash.display.LoaderInfo;
import flash.events.Event;
import haxe.remoting.FlashJsConnection;
import flash.utils.ByteArray;
import flash.media.Sound;
import flash.utils.Endian;
/**
 * SoundFactory
 * @author 
 */

class SoundTools 
{
	static public function buildSound(wav:ByteArray, format:PCMFormat, callbck:Sound->Void=null):Void -> Sound
	{
		var sound:Sound = null;
		var swf : SWFFormat = new SWFFormat(format);
		var compiledSWF : ByteArray = swf.compileSWF(wav);
		var compiledSWFLoader : Loader = new Loader();
		compiledSWFLoader.loadBytes(compiledSWF);
		compiledSWFLoader.contentLoaderInfo.addEventListener(Event.COMPLETE, function(e:Event) {
			var loaderInfo:LoaderInfo = cast(e.target, LoaderInfo);        
			var definition = loaderInfo.applicationDomain.getDefinition(SWFFormat.CLASS_NAME);
			var instance = Type.createInstance(definition, []);
			sound = cast instance;										
			if (callbck != null) callbck(sound);
		});	   		
	
		return function() return sound;
	}
	
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
}



class SWFFormat
{
    /* CLASS PROPERTIES **********************************************************************/
    private static inline var SWF_PART0 : String = "46575309";
    private static inline var SWF_PART1 : String = "7800055F00000FA000000C01004411080000004302FFFFFFBF150B00000001005363656E6520310000BF14C7000000010000000010002E00000000080013574156506C61796572536F756E64436C6173730B666C6173682E6D6564696105536F756E64064F626A6563740C666C6173682E6576656E74730F4576656E744469737061746368657205160116031802160600050701020702040701050704070300000000000000000000000000010102080300010000000102010104010003000101050603D030470000010101060706D030D04900470000020201010517D0306500600330600430600230600258001D1D1D6801470000BF03";
    private static inline var SWF_PART2 : String = "3F131800000001000100574156506C61796572536F756E64436C61737300440B0800000040000000";
    
    public static inline var CLASS_NAME : String = "WAVPlayerSoundClass";
    
    private var _pcmFormat : PCMFormat;
    
    /* CONSTRUCTOR ***************************************************************************/
    public function new(format : PCMFormat)
    {
        _pcmFormat = format;
    }
    
    /* PRIVATE METHODS ***********************************************************************/
    private function writeBytesFromString(byteArray : ByteArray, bytesHexString : String) : Void
    {
        var length : Int = bytesHexString.length;
        
        var i : Int = 0;
        while (i < length){
            var hexByte : String = bytesHexString.substr(i, 2);
            var byte : Int = Std.parseInt("0x" + hexByte);
	//trace( i + ' ' + byte);
	
            byteArray.writeByte(byte);
            i += 2;
        }
    }
    
    private function traceArray(array : ByteArray) : String
    {  // for debug  
        var out : String = "";
        var pos : Int = array.position;
        array.position = 0;
        
        while (array.bytesAvailable != 0)
        {
            var str : String = Std.string(array.readUnsignedByte()).toUpperCase();
            str = str.length < (2) ? "0" + str : str;
            out += str + " ";
        }
        
        array.position = pos;
        return out;
    }
    
    private function getFormatByte() : Int
    {
        var byte : Int = ((_pcmFormat._bitsPerSample == 0x10)) ? 0x32 : 0x00;
        byte += (_pcmFormat._channels - 1);
        var str:String = intToString(Math.floor(_pcmFormat._sampleRate / 5512.5));
        byte += 4 * (str.length - 1);  // :-)  
        return byte;
    }
    
    /* PUBLIC METHODS ************************************************************************/
    public function compileSWF(audioData : ByteArray) : ByteArray
    {
        var dataLength : Int = audioData.length;
        var swfSize : Int = dataLength + 307;
        var totalSamples : Int = Std.int(dataLength / _pcmFormat._blockAlign);
        var output : ByteArray = new ByteArray();
        output.endian = Endian.LITTLE_ENDIAN;
       
        writeBytesFromString(output, SWFFormat.SWF_PART0);
        output.writeUnsignedInt(swfSize);
        writeBytesFromString(output, SWFFormat.SWF_PART1);
        output.writeUnsignedInt(dataLength + 7);
        output.writeByte(1);
        output.writeByte(0);
        
	var formatbyte:UInt = getFormatByte();
        
        output.writeByte(formatbyte);
        output.writeUnsignedInt(totalSamples);
        output.writeBytes(audioData);
        writeBytesFromString(output, SWFFormat.SWF_PART2);
        return output;
    }
    
	public static function intToString (num : Int, base:Int = 2):String 
	{	        
	        var reference = "0123456789ABCDEFGHIJKLMNOPQRSTUVW";
	        var result = new StringBuf();
	        var maxPow = 0;
	        var test = 0;

	        while ( Std.int(Math.pow(base, maxPow)) <= num)
	        {    
		maxPow++;
	        }
	        
	        var i = maxPow - 1;
	        while (i >= 0) 
	        {
		var basePow = Math.pow(base, i);
		var pow = Math.floor(num / basePow);
		result.add(reference.charAt(Std.int(pow)));
		num -= Std.int(pow * basePow);
		i--;
	        }
	        var r = result.toString();
	        return r.length == 0 ? "0" : r;
	 }    
}


