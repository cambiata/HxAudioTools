package cx;

/**
 * CxTools
 * @author 
 */
class Tools 
{

	//------------------------------------------------------------------------------------------------------------
	// Ints
	inline static public function intMin(a:Int, b:Int):Int return (a < b) ? a : b;
	inline static public function intMax(a:Int, b:Int):Int return (a > b) ? a : b;
	
	
	//------------------------------------------------------------------------------------------------------------
	// Arrays
	
	inline static public function indexOrNull<T>(a:Array<T>, idx:Int)
	{
		return (idx < 0 || idx > a.length) ? null : a[idx];
	}

	inline static public function indexOrDefault<T>(a:Array<T>, idx:Int, def:T)
	{
		return (idx < 0 || idx > a.length) ? def : a[idx];
	}	
	
	
}