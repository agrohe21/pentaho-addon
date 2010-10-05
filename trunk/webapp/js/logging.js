/*
@module pentaho
@method print
@description Utility function to call prettyPrint and add the output to the end of the document
Must include prettyPrint.js in current page
*/
pentaho.print = function(obj) {
		document.body.appendChild(prettyPrint(obj, { maxDepth:10 } ));
	} //end pentaho.print

