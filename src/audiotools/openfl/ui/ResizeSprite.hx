package audiotools.openfl.ui;


import openfl.display.Graphics;
import openfl.display.Sprite;
import openfl.Lib;
import openfl.events.MouseEvent;
import openfl.events.Event;
import openfl.geom.Rectangle;

/**
 * ResizeSprite
 * @author Jonas Nyström
 */

class ResizeSprite extends Sprite
{

	var _width:Float;
	var _height:Float;	
	
	static private var GRIP_SIZE:Float = 15;	
	var gripLayer:Sprite;
	var dm:DragMode;
	var offX:Float;
	var offY:Float;
	var off2X:Float;
	var off2Y:Float;
	var bgColor:Int;
	var bgTransp:Float;
	var frColor:Int;
	var frTransp:Float;
	
	public function new(x:Float=100, y:Float=100, width:Float=300, height:Float=100, bgColor:Int=0x000000, bgTransp:Float=0.3, frColor:Int=0x000000, frTransp:Float=0.6) {
		super();
		this._width = width;
		this._height = height;		
		this.x = x;
		this.y = y;		
		this.bgColor = bgColor;
		this.bgTransp = bgTransp;
		this.frColor = frColor;
		this.frTransp = frTransp;
		
		this.createChildren();
		this._draw();
		this.redraw(this._width, this._height, this);
	}		
	
	private function createChildren() 
	{
		this.gripLayer = new Sprite();
		this.addChild(this.gripLayer);		
		this.gripLayer.addEventListener(MouseEvent.MOUSE_DOWN, onMouseDown);
	}
	
	public function removeListeners() {
		this.gripLayer.removeEventListener(MouseEvent.MOUSE_DOWN, onMouseDown);		
	}
	
	private function onMouseDown(e:MouseEvent):Void 
	{
		//if (!e.ctrlKey) return;		
		offX = this.mouseX;
		offY = this.mouseY;
		off2X = this._width - offX;
		off2Y = this._height - offY;
		
		var mx = this.mouseX;
		var my = this.mouseY;
		dm = DragMode.Move;
		
		if (mx < GRIP_SIZE && my < GRIP_SIZE) dm = DragMode.LeftTop
		else if (mx > this._width - GRIP_SIZE && my < GRIP_SIZE) dm = DragMode.RightTop
		else if (mx < GRIP_SIZE && my > this._height - GRIP_SIZE) dm = DragMode.LeftBottom
		else if (mx > this._width - GRIP_SIZE && my > this._height - GRIP_SIZE) dm = DragMode.RightBottom
		else if (my < GRIP_SIZE) dm = DragMode.Top
		else if (my > this._height - GRIP_SIZE) dm = DragMode.Bottom
		else if (mx < GRIP_SIZE) dm = DragMode.Left
		else if (mx > this._width - GRIP_SIZE) dm = DragMode.Right		
		;

		//trace(dm);		

		Lib.current.stage.addEventListener(MouseEvent.MOUSE_MOVE, onMove);
		Lib.current.stage.addEventListener(MouseEvent.MOUSE_UP, onRelease);					
	}

	
	private function onMove(e:MouseEvent):Void 
	{			
			//trace(this.parent.mouseY);
			var p = this.parent;
			
			switch (this.dm) {
				case DragMode.LeftTop:
					var changeX =  p.mouseX - this.x - offX;
					this.x = this.x + changeX;
					this._width = this._width - changeX ;
					var changeY =  p.mouseY - this.y - offY;
					this.y = this.y + changeY;
					this._height = this._height - changeY;						
					_draw();	
				case DragMode.RightTop:
					this._width = p.mouseX - this.x + off2X;					
					var changeY =  p.mouseY - this.y - offY;
					this.y = this.y + changeY;
					this._height = this._height - changeY;						
					_draw();	
				case DragMode.LeftBottom:
					var changeX =  p.mouseX -  this.x - offX;
					this.x = this.x + changeX;
					this._width = this._width - changeX;						
					this._height = p.mouseY  - this.y + off2Y;			
					_draw();	
				case DragMode.RightBottom:
					this._width = p.mouseX  - this.x + off2X;
					this._height = p.mouseY  - this.y + off2Y;
					this._draw();	
				case DragMode.Top:
					var changeY =  p.mouseY - this.y - this.offY;
					this.y = this.y + changeY;		
					this._height = this._height - changeY;
					_draw();						
					
				case DragMode.Bottom:
					this._height = p.mouseY  - this.y + off2Y;
					this._draw();						
					
				case DragMode.Left:
					var changeX =  p.mouseX - this.x - offX;
					this.x = this.x + changeX;
					this._width = this._width - changeX;
					_draw();	
				case DragMode.Right:
					this._width = p.mouseX - this.x + off2X;					
					_draw();	
				case DragMode.Move:
					var changeX =  p.mouseX - this.x - offX;
					this.x = this.x + changeX;					
					var changeY =  p.mouseY - this.y - this.offY;
					this.y = this.y + changeY;					
				default:
			}
	}

	private function onRelease(e:MouseEvent):Void 
	{
		Lib.current.stage.removeEventListener(MouseEvent.MOUSE_MOVE, onMove);
		Lib.current.stage.removeEventListener(MouseEvent.MOUSE_UP, onRelease);			
		switch this.dm
		{
			case DragMode.Move: // do nothing
			case _: this.redraw(this._width, this._height, this);
		}		
	}		
	
	 function _draw() {
		this._width = Math.max(20, this._width);
		this._height = Math.max(20, this._height);		
		this.gripLayer.graphics.clear();		
		this.drawBackground(this._width, this._height, this.gripLayer.graphics);
		this.draw(this._width, this._height, this);
	}	
	
	function drawBackground(w:Float, h:Float, graphics:Graphics)
	{
		this.gripLayer.graphics.lineStyle(1, this.frColor, this.frTransp);
		this.gripLayer.graphics.beginFill(this.bgColor, this.bgTransp); // transparent background
		this.gripLayer.graphics.drawRect(0, 0, this._width, this._height);				
	}
	
	
	public function draw(w:Float, h:Float, sprite:Sprite)
	{
		trace('draw: Should be overridden. $w:$h');
	}
	
	public function redraw(w:Float, h:Float, sprite:Sprite)
	{
		trace('redraw: Should be overridden. $w:$h');
	}
	
}

enum DragMode {
	Move;
	LeftTop;
	RightTop;
	LeftBottom;
	RightBottom;
	Top;
	Bottom;
	Left;
	Right;
}