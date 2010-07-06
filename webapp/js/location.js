/**
 * @author Andy
 */

pentaho.location = {
	app: "/" + window.location.pathname.split( '/' )[1],
	args: function() {
		//get query string without the initial ?
		var qs = (location.search.length > 0 ? location.search.substring(1) : ""),
		//object to hold data
		args = {},
		//get individual items
		item = null, name = null, value = null;
		var items = qs.split("&");
		
		//assign each item onto the args object
		for (var i=0, j=items.length; i <j; i++){
		    item = items[i].split("=");
		    name = decodeURIComponent(item[0]);
		    value = decodeURIComponent(item[1]);
		    args[name] = value;
		}
		
		return args;
	} //end args
}