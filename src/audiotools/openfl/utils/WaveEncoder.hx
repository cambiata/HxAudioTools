package audiotools.openfl.utils;
import flash.utils.ByteArray;
import flash.utils.Endian;

/**
 * WaveEncoder
 * @author 
 */
class WaveEncoder 
{
		private static var RIFF:String = "RIFF";	
		private static var WAVE:String = "WAVE";	
		private static var FMT:String = "fmt ";	
		private static var DATA:String = "data";	
		private var _bytes:ByteArray = new ByteArray();
		private var _buffer:ByteArray = new ByteArray();
		private var _volume:Float;
	
		public function new( volume:Float=1 )
		{
			this._volume = volume;
		}
	
		public function encode( samples:ByteArray, channels:Int=2, bits:Int=16, rate:Int=44100 ):ByteArray
		{
			var data:ByteArray = soundFloatsToShorts( samples );
			
			//_bytes.length = 0;
			_bytes.endian = Endian.LITTLE_ENDIAN;
			_bytes.writeUTFBytes( WaveEncoder.RIFF );
			_bytes.writeInt( uint( data.length + 44 ) );
			_bytes.writeUTFBytes( WaveEncoder.WAVE );
			_bytes.writeUTFBytes( WaveEncoder.FMT );
			_bytes.writeInt( uint( 16 ) );
			_bytes.writeShort( uint( 1 ) );
			_bytes.writeShort( channels );
			_bytes.writeInt( rate );
			_bytes.writeInt( uint( rate * channels * ( bits >> 3 ) ) );
			_bytes.writeShort( uint( channels * ( bits >> 3 ) ) );
			_bytes.writeShort( bits );
			_bytes.writeUTFBytes( WaveEncoder.DATA );
			_bytes.writeInt( data.length );
			_bytes.writeBytes( data );
			_bytes.position = 0;
			
			return _bytes;
		}
				
		private function uint( val:Int):Int return val;
		
		private function create( bytes:ByteArray ):ByteArray
		{
			_buffer.endian = Endian.LITTLE_ENDIAN;
			//_buffer.length = 0;
			bytes.position = 0;
			
			while ( bytes.bytesAvailable > 0 ) {				
				
				var float = bytes.readFloat();
				var short = Std.int(float * 0x7fff);
				_buffer.writeShort(short);		
				//_buffer.writeShort( Std.int(bytes.readFloat() * (0x7fff * _volume) ));
				
			}
			return _buffer;
			
			
			
		}		
		
		private function create2( bytes:ByteArray ):ByteArray
		{
			_buffer.endian = Endian.LITTLE_ENDIAN;
			bytes.position = 0;
			
			
			while ( bytes.bytesAvailable > 0 ) {				
				
				var float = bytes.readFloat();
				var short = Std.int(float * 0x7fff);
				_buffer.writeShort(short);						
			}
			return _buffer;
		}			
		
		static public function soundFloatsToShorts(bytes:ByteArray):ByteArray
		{
			var _buffer = new ByteArray();
			_buffer.endian = Endian.LITTLE_ENDIAN;
			bytes.position = 0;
			
			var i = 0;
			while ( bytes.bytesAvailable > 0 ) {								
				var float = bytes.readFloat();
				var short = Std.int(float * 0x7fff);
				_buffer.writeShort(short);						
				var float2:Float = short / 0x7fff;
				
				//_buffer.writeShort( Std.int(bytes.readFloat() * (0x7fff * _volume) ));
				
			}
			return _buffer;
		}
		
		static public function soundShortsToFloats(bytes:ByteArray):ByteArray
		{
			var _buffer = new ByteArray();
			_buffer.endian = Endian.LITTLE_ENDIAN;
			bytes.position = 0;			
			
			while ( bytes.bytesAvailable > 0 ) {								
				var short = bytes.readShort();
				var float:Float = short / 0x7fff;
				_buffer.writeFloat(float);						
			}
			return _buffer;			
		}
		
}