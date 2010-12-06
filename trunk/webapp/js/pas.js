/**
 * Author:  Andy Grohe
 * Company: Project Leadership Associates
 * Date:    10/06/2010
 * Version: 0.1
 */

/* pentaho namespace as a holder of pas module
*/
var pentaho = pentaho || {};

/*
pentaho.pas provides a JavaScript API for Pentaho's Analysis services.
Using this utility you can communicate with Pentaho's BI Platform to
obtain Analysis structure and to issue queries.
@module pas
@title Pentaho Analysis
*/
pentaho.pas = {
		//cache array of cube(s) created from server XML so that future requests are not required
		cubes: [],
		/*
		@description class function to discover the cube(s) on the Pentaho BI Server
		@parameters - configuration object with options and callback function
		@return - returns array of cubes found on BI server via callback function
		*/
		discoverCubes: function(oConfig){
			//If we already have some models in the class variable, return early with those values
			if (pentaho.pas.cubes.length > 0) {
				//console.log("Using Existing Cubes");
				oConfig.success(pentaho.pas.cubes);
			}
			else {
				//call BI server with generic listCatalogs.
				//this function does not use any other parameters such as solution or domain
				pentaho.xhr.execute("/pentaho/AnalysisViewService", {
					async: true,
					dataType: "xml",
					type: "GET",
					data: {"component":"listCatalogs"},
					complete: function($response){
						var xmlDoc = pentaho.xhr.parseXML($response); //reponse has responseText when coming from pentaho-ajax
						var xmlschemas = xmlDoc.getElementsByTagName('schema'); //find all models in the document
						var schemas = [], schema = {}, cubes = [], cube ={};
						
						//loop through all server XML and create new pas.Cube(s)
						for (var i=0,j=xmlschemas.length; i<j; i++) {
								schema = xmlDoc.getElementsByTagName('schema')[i];
								cubes = schema.getElementsByTagName('cube');
								schemas[i] = {
										"name":schema.attributes.getNamedItem("name").nodeValue
								}
								schemas[i].cubes = [];
								
								for (var x=0,y=cubes.length; x<y; x++) {
									cube = cubes[x];
									schemas[i].cubes[x] = {};
									schemas[i].cubes[x].name = cube.attributes.getNamedItem("name").nodeValue;
									schemas[i].cubes[x].schema = schemas[i].name;
									pentaho.pas.cubes[i] = new pentaho.pas.Cube(schemas[i].cubes[x]);
								}
						}
						//call success function if there is one
						if (typeof oConfig.success == 'function') {
							oConfig.success(pentaho.pas.cubes);
						}
						else {
							throw new Error("Unrecognized callback function to AnalysisView.discoverCubes");
						}
					}, // end on complete
					error: function(e){
						throw new Error("unable to get pentaho Cubes");
					} // end on error
				}); // end xhr.execute
			}  //end else length was zero
		} // end discoverCubes
		  
	}	//end pentaho.pas

pentaho.pas.Cube = function(cube) {
	this.name = cube.name;
	this.schema = cube.schema;
} // end pentaho.pas.Cube