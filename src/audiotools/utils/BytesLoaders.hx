package audiotools.utils;
import audiotools.utils.BytesLoader;
import haxe.io.Bytes;

using Lambda;
/**
 * BytesLoaders
 * @author Jonas Nyström
 */
class BytesLoaders 
{
	var loadedBytes:Map<String, Bytes>;
	var loaders:Array<BytesLoader>;
	var loadedCount:Int;
	public function new(files:Array<String>) 
	{
		this.loaders = files.map(function(file:String) return new BytesLoader(file));
		for (loader in this.loaders) loader.onLoaded = onLoaderLoaded;
		
	}
	
	public function loadBytes() {		
		this.loadedCount = 0;
		this.loadedBytes = new Map<String,Bytes>();
		for (loader in this.loaders) loader.loadBytes();
		return this;
	}	
		
	
	public function onLoaderLoaded(bytes: Bytes, filename:String) {
		trace('onLoaderLoaded $filename');
		this.loadedBytes.set(filename, bytes);
		loadedCount++;
		if (loadedCount >= this.loaders.length) this.onLoaded(this.loadedBytes);
	}	
	
	dynamic public function onLoaded(loadedBytes:Map<String, Bytes>) {
		trace('ALL');
	}
	
	public function setOnLoaded(onLoadedCallbck:Map<String, Bytes>->Void)  {
		this.onLoaded = onLoadedCallbck;
		return this;
	}
	
	
}