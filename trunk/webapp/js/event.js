/*
@module pentaho
@class event
@description Utility container for DOM events indepentdent of JS library
Must include prettyPrint.js in current page
*/

var pentaho = pentaho || {};

pentaho.event = {
	/*
	@method addListener
	@description  Cross-browser implementation of element.addEventListener()
	grabbed from website http://snipplr.com/view.php?codeview&id=561
	*/
	addListener: function (element, type, expression, bubbling)
	{
		bubbling = bubbling || false;
		
		if(window.addEventListener)	{ // Standard
			element.addEventListener(type, expression, bubbling);
			return true;
		} else if(window.attachEvent) { // IE
			element.attachEvent('on' + type, expression);
			return true;
		} else return false;
	}
}