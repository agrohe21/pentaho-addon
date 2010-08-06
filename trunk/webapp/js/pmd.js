/**
 * Author:  Andy Grohe
 * Company: Project Leadership Associates
 * Date:    04/01/2010
 * Version: 0.1
 */

/* pentaho namespace as a holder of pmd module
*/
var pentaho = pentaho || {}

/*
pentaho.pmd provides a JavaScript API for Pentaho's Metadata services.
Using this utility you can communicate with Pentaho's BI Platform to
obtain Metadata structure and to issue Metadata queries.
@module pmd
@title Pentaho Metadata
*/
pentaho.pmd = {
		//cache array of BusinessModel(s) created from server XML so that future requests are not required
		businessModels: [],
		/*
		The BusinessModel class provides the ability to discover Business Models residing on the Pentaho
		BI Platform server.  you can optionally pass in an object literal with the model properties
		and the BusinessModel will be returned to you.
		@class BusinessModel
		@constructor
		@param {Object} model
		*/
		BusinessModel: function(oModel){
			//ctor takes JS object instead of pentaho XML
			//we may revive these objects from stored JSON strings and using XML is not preferred as storage:)
		
			this.domain = oModel.domain,
			this.model = oModel.model,
			this.name = oModel.name,
			this.description = oModel.description,
			this.views = []; //holds an array of Business Tables
			//if views were provided in the model, then create pmd.BusinessView(s)
			if (oModel.views) {
				for (var i = 0, x = oModel.views.length; i < x; i++) {
					this.views[i] = new pentaho.pmd.BusinessView(oModel.views[i]);
				};
			}
		},// end BusinessModel
		//class function to return a pentaho.pmd.BusinessModel based on a model_id only
		findModel: function(model_id) {
			for (var i=0,x=pentaho.pmd.businessModels.length; i<x; i++) {
				if (pentaho.pmd.businessModels[i].model == model_id || pentaho.pmd.businessModels[i].name == model_id){
					return pentaho.pmd.businessModels[i];
				}

			};
		},
		/*
		@description class function to discover the BusinessModel(s) on the Pentaho BI Server
		@parameters - configuration object with options and callback function
		@return - returns array of BusinessModels found on BI server via callback function
		*/
		discoverModels: function(oConfig){
			//If we already have some models in the class variable, return early with those values
			if (pentaho.pmd.businessModels.length > 0) {
				console.log("Using Existing Models");
				oConfig.success(pentaho.pmd.businessModels);
			}
			else {
				/* TODO implement some sort of event triggering. formerly jQuery
				$(that).trigger("MDQmodelLoadStart");
				*/
				//call BI server with generic lisbusinessmodels.
				//this function does not use any other parameters such as solution or domain
				pentaho.xhr.execute("/pentaho/AdhocWebService", {
					async: true,
					dataType: "xml",
					type: "GET",
					data: {"component":"listbusinessmodels"},
					complete: function($response){
						var xmlDoc = pentaho.xhr.parseXML($response); //reponse has responseText when coming from pentaho-ajax
						var xmlmodels = xmlDoc.getElementsByTagName('model'), //find all models in the document
						 models = [];
						
						//loop through all server XML and create new pmd.BusinessModel(s)
						for (var i=0,j=xmlmodels.length; i<j; i++) {
								models[i] = {};  //first build up the objects
								models[i].domain = xmlDoc.getElementsByTagName('domain_id')[i].firstChild.nodeValue;
								models[i].model = xmlDoc.getElementsByTagName('model_id')[i].firstChild.nodeValue;
								models[i].name = xmlDoc.getElementsByTagName('model_name')[i].firstChild.nodeValue;
								if (xmlDoc.getElementsByTagName('model_description')[i]) {
									models[i].description = xmlDoc.getElementsByTagName('model_description')[i].firstChild.nodeValue;
								}
								pentaho.pmd.businessModels[i] = new pentaho.pmd.BusinessModel(models[i]);
						}
						//call success function if there is one
						if (typeof oConfig.success == 'function') {
							oConfig.success(pentaho.pmd.businessModels);
						}
						else {
							throw new Error("Unrecognized callback function to BusinessModel.getModels");
						}
					}, // end on complete
					error: function(e){
						throw new Error("unable to get pentaho Business Models");
					} // end on error
				}); // end xhr.execute
			}  //end else length was zero
		} // end getModels
		  
	}	//end pentaho.pmd

//Instance method for pmd.BusinessModel(s) to discover their views. Requires another server call.
pentaho.pmd.BusinessModel.prototype.discoverViews = function(oConfig) {
	var that =this;
	pentaho.xhr.execute("/pentaho/AdhocWebService", {
		async: true,
		cache: true,
		dataType: "xml",
		type: "GET",
		data: {
			component:"getbusinessmodel",
			domain: that.domain,
			model: that.model
		},
		complete: function($response){
			var xmlDoc = pentaho.xhr.parseXML($response);  //BI Server always gives us back text
			var xmlviews = xmlDoc.getElementsByTagName('view'), //find all views in the document		
				views = [], view = {}, columns = [];
				that.views = [];
				
				//loop through all views in server xml and create new pmd.BusinessView(s)
				for (var i=0,z=xmlviews.length; i<z; i++) {
		          	view = xmlDoc.getElementsByTagName('view')[i];
		            var cols = view.getElementsByTagName('column');
					views[i] = {
						view: xmlDoc.getElementsByTagName('view_id')[i].firstChild.nodeValue,
						name: xmlDoc.getElementsByTagName('view_name')[i].firstChild.nodeValue,
						description: xmlDoc.getElementsByTagName('view_description')[i].firstChild.nodeValue,
						columns: []
					};
					
					//loop through all column in this view
		           	for (var j=0,x=cols.length; j<x; j++) {
		           		views[i].columns[j] = {};
						views[i].columns[j].view   = views[i].view;
			           	views[i].columns[j].column = view.getElementsByTagName('column_id')[j].firstChild.nodeValue;
			           	views[i].columns[j].name   = view.getElementsByTagName('column_name')[j].firstChild.nodeValue;
			           	views[i].columns[j].description = view.getElementsByTagName('column_description')[j].firstChild.nodeValue;
			           	views[i].columns[j].type        = view.getElementsByTagName('column_type')[j].firstChild.nodeValue;
						if (view.getElementsByTagName('column_field_type')[j]) {
							views[i].columns[j].field_type = view.getElementsByTagName('column_field_type')[j].firstChild.nodeValue;
						}
					}
					that.views[i] = new pentaho.pmd.BusinessView(views[i]);
				}
				//invoke callback method if one was provided
				if (typeof oConfig.success == 'function') {
					oConfig.success(that.views);
				} else {
					throw new Error( "Unrecognized callback function to BusinessView.discoverViews" ); 
				}
		}  //end complete
	} //end xhr.execute
	)
} //end getView

//Instance method to find a specific BusinessColumn in the BusinessView(s() based on view and column strings.
pentaho.pmd.BusinessModel.prototype.findColumn = function(view,column){
	for (var i=0,x=this.views.length; i<x; i++) {
		if (this.views[i].view == view){
			for (var z=0,y=this.views[i].columns.length; z<y; z++){
				if (this.views[i].columns[z].column == column){
					return this.views[i].columns[z];
				}
			}
		}
	}
}

/*
Method that creates an instance of a BusinessView and subsequent BusinessColumn(s) based on provided object literal
@class BusinessView
@constructor
@param {Object} view

*/
pentaho.pmd.BusinessView = function(oView) {
	this.view = oView.view;
	this.name = oView.name;
	this.description = oView.description;
	this.columns = [];
	if (oView.columns) {
		for (var i=0,x=oView.columns.length; i<x; i++) {
			this.columns[i] = new pentaho.pmd.BusinessColumn(oView.columns[i]);
		};
	}
} // end Businessview

/*
/*
Method that creates an instance of a BusinessColumn based on provided object literal
@class BusinessColumn
@constructor
@param {Object} column

*/

pentaho.pmd.BusinessColumn = function(oColumn) {
	this.view        = oColumn.view;
	this.column      = oColumn.column;
	this.name        = oColumn.name;
	this.description = oColumn.description;
	this.field_type  = oColumn.field_type;
	this.type        = oColumn.type;
}

pentaho.pmd.BusinessColumn.prototype.getDistinctValues = function() {
}

/*
 * 
 * Query related functionality
 * 
 */
 
/*
@class MDselect
@description Class to manage table and column values for Metadata queries
*/
pentaho.pmd.MDselect = function(json) {
	this.table       = json.table;
	this.column      = json.column;
	this.aggregation = json.aggregation || 'None';
	this.alias       = json.alias || json.column;
}

pentaho.pmd.MDselect.prototype = {
	/*
	@class MDselect
	@method toXML
	@description Converts internal objects in to XML string that Pentaho BI Platform can digest
	*/
	toXML: function(){
		return "<selection><view>" + this.table + "</view><column>" + this.column + "</column><aggregation>" + this.aggregation + "</aggregation></selection>";
	}
}

/*
@class MDselect
@description Class to manage order of table and column values for Metadata queries
*/
pentaho.pmd.MDorder = function(json) {
	this.direction   = json.direction;
	this.table       = json.table;
	this.column      = json.column;
	this.aggregation = json.aggregation;
}

pentaho.pmd.MDorder.prototype = {
	/*
	@class MDorder
	@method toXML
	@description Converts internal objects in to XML string that Pentaho BI Platform can digest
	*/
	toXML: function(){
		return "<order><view>" + this.table + "</view><column>" + this.column + "</column><aggregation>" + (this.aggregation) ? this.aggregation : "none" + "</aggregation></order>";
	}
}

/*
@class MDfilter
@description Class to manage filters for Metadata queries
*/
pentaho.pmd.MDfilter = function(json) {
	this.operator  = json.operator;
	this.condition = json.condition;
}

pentaho.pmd.MDfilter.prototype = {
	/*
	@class MDselect
	@method toXML
	@description Converts internal objects in to XML string that Pentaho BI Platform can digest
	*/
	toXML: function(){
		return "<constraint><operator>" + this.operator +"</operator><condition>"+ this.condition +"</condition></constraint>";
	}
}

/*
@class Query
@constructor
@description Class to execute Metadata queries.
Used primarily as wrapper for using Javascript instead of createing and parsing BI Platform XML
the object can take an object literal and reconstruct itself.  Useful when re-hydrating from storage.
*/

pentaho.pmd.Query = function(json){
	this.model = json.model || "Unknown Model";
	this.domain = json.domain || "Unknown Domain";
	this.distinct = json.distinct || false; 
	this.MDselect = json.MDselect || []; //holds an array of column objects to be included in query
	this.MDorder   = json.MDorder || []; //holds an array of column objects to be used for sorting
	this.MDfilter  = json.MDfilter || []; //holds an array of filters to be used in the MQL query
}

pentaho.pmd.Query.prototype = {

	/*
	@method addFilter
	@description Utility method to add a filter constraint to the query
	*/
	addFilter: function(filter){//we are passed a filterobject
		this.MDfilter.push(filter);
	},
	/*
	@method removeFilter
	@description Utility method to remove a filter constraint from the query
	*/
	removeFilter: function(index){
		this.MDfilter.splice(index,1);
	},
	/*
	@method addOrder
	@description Utility method to add a field Order to the query
	*/
	addOrder: function(order){//we are passed an order object
		this.MDorder.push(order);
	},
	/*
	@method removeOrder
	@description Utility method to remove a field order from the query
	*/
	removeOrder: function(index){
		this.MDorder.splice(index,1);
	},
	/*
	@method addSelect
	@description Utility method to add a field to the query selection
	*/
	addSelect: function(select){//we are passed a select object
		this.MDselect.push(select);
	},
	/*
	@method removeSelect
	@description Utility method to remove a field from the query selection
	*/
	removeSelect: function(index){
		this.MDselect.splice(index,1);
	},
	//Adds or removes a column from the MDselect array
	toggleSelect: function(select){
		//if it is there remove it
		for (var i=0,x=this.MDselect.length; i<x; i++) {
			if (this.MDselect[i].table == select.table && this.MDselect[i].column == select.column){
				this.removeSelect(i);
				return;
			}
		};
		//otherwise add it
		this.addSelect(select);
	}, //end setColumn
	
	/*
	@method getMQLSelect
	@description constructs XML string of all fields in MDselect array
	*/
	getMQLSelect: function(){
		var mqlselect = "";
		for (var i=0,x=this.MDselect.length; i<x; i++) {
			mqlselect = mqlselect + this.MDselect[i].toXML();	
		};
		return mqlselect;
	},
	/*
	@method getMQLOrder
	@description constructs XML string of all fields in MDorder array
	*/
	getMQLOrder: function(){
		var mqlorder = "";
		for (var i=0,x=this.MDorder.length; i<x; i++) {
			mqlorder = mqlorder + this.MDorder[i].toXML();	
		};
		return mqlorder;
	},
	/*
	@method getMQLFilter
	@description constructs XML string of all fields in MDFilter array
	*/
	getMQLFilter: function(){
		var mqlfilter = "";
		for (var i=0,x=this.MDfilter.length; i<x; i++) {
			mqlfilter = mqlfilter + this.MDfilter[i].toXML();	
		};
		return mqlfilter;
	},
	/*
	@method execute
	@description Calls to BI Platform to execute the current query based on internal representation
	@returns Server results are translated into JavaScript objects and passed via callback
	*/
	
	execute: function(oConfig){
						
		var view, col, urlQuery = "";
		
		//if nothing selected, do not call server
		if (this.MDselect.length == 0) {
			return;
		} else {
			//Calls ServiceAction for system/pmd-plugin/mqlQuery.xaction
			//This will hopefully be changed in the future when Pentaho creates a web service
			pentaho.xhr.execute("/pentaho/ServiceAction", {
				asysnc:   true,
				cache:    true,
				dataType: "xml",
				type:     "POST",
				complete:	function($response) {
					//When complete, go ahead and turn the text into XML and then JavaScript object
					var xmlDoc = pentaho.xhr.parseXML($response);
					var data = [], results;
					try {
						results = pentaho.xhr.SOAP2JS(xmlDoc);
						data = results.results;
					} catch (e) {
						//if we cannot get the data just return an empty set
						data = [];
					}
					//invoke callback on success with data as JS object
					oConfig.success(data);
				}, //end executeComplete
				data:{
					auditname:"xmql",  //this goes into the PRO_AUDIT table
					solution :"system",
					path     :"pmd-plugin",
					action   :"mqlQuery.xaction",
					resultset:"query_result",
					domain   :this.domain,
					model    :this.model,
					disable_distinct: this.distinct,
					orders:      this.getMQLOrder(),
					selections:  this.getMQLSelect(),
					constraints: this.getMQLFilter()
				},
				error: function(xhr, ajaxOptions, thrownError){
					//TODO do somethign useful with the error
				}
			});
		} // end if select
	} // end execute
			
} // end pentaho.pmd.Query.prototype

/*
@module pentaho
@method print
@description Utility function to call prettyPrint and add the output to the end of the document
Must include prettyPrint.js in current page
*/
pentaho.print = function(obj) {
		document.body.appendChild(prettyPrint(obj, { maxDepth:10 } ));
	} //end pentaho.print

/*
@module pentaho
@class event
@description Utility container for DOM events indepentdent of JS library
Must include prettyPrint.js in current page
*/
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
	}}

/*
@module pentaho
@class xhr
@description Utility container for XHR events indepentdent of JS library
Currently uses pentaho-ajax.js to minimize dependencies, but could be any library
*/
pentaho.xhr = {
		/*
		@method execute
		@description call the appropriate XHR functions and delivers results
		*/
		execute: function(url, oConfig){
			var parms = "";
			for (parm in oConfig.data) {
				parms += "&" + parm +"="+oConfig.data[parm];
			}
			function func(response) {
				//console.log(response);
					var myxml = pentaho.xhr.parseXML(response);
					oConfig.complete(myxml);
			};
			//var response = pentahoGet(url, parms, func);
			var response = pentahoGet(url, parms);
			oConfig.complete(response);

		},
		/*
		@method SOAP2JS
		@description Utility function to convert data from pentaho ServiceAction SOAP to JS objects
		*/
		SOAP2JS: function(oXML) {
			//assumes we get a valid XML document
			//var oXML  = pentaho.xhr.parseXML(sSOAP);
			var rows = oXML.getElementsByTagName('DATA-ROW');        //initialize array of all DATA-ROW returned in SOAP
			var cols = oXML.getElementsByTagName('COLUMN-HDR-ITEM'); //initialize arry of all COLUMN-HDR-ITEM in SOAP
			var oResults = {};     //initialize emply object for each the JSON rows
			oResults.results = []; //add empty array to hold DATA-ROW contents in the results JS property
			for (var i=0; i<rows.length; i++) {
				row = oXML.getElementsByTagName('DATA-ROW')[i]; //get the row for this loop var i
				oResults.results[i] = {}; //initialize each row with empty objects
				for (var j=0; j<cols.length; j++) {
					//addign the object value for column header COLUMN-HDR-ITEM and ros DATA-ROW values
					oResults.results[i][oXML.getElementsByTagName('COLUMN-HDR-ITEM')[j].firstChild.nodeValue] = row.getElementsByTagName('DATA-ITEM')[j].firstChild.nodeValue;
				}
			}
			
			return oResults; //comment
		},
		/*
		@method parseXML
		@description Utility function to convert data from plain text/xml into XML document object
		*/
		parseXML: function (sText){
			var xmlDoc,parser;
			try { //Firefox, Mozilla, Opera, etc.
				  parser=new DOMParser();
				  xmlDoc=parser.parseFromString(sText,"text/xml");
				  return xmlDoc;
			}
			catch(e){
				try { //Internet Explorer
				  xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
				  xmlDoc.async="false";
				  xmlDoc.loadXML(sText);
				  return xmlDoc;
				} catch(e) {
				  	alert("parseXML Error" + e.message);
				  	return false;
				  }
			}
		} //end parseXML
		
	}  //end pentaho.xhr