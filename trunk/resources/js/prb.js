var pentaho = pentaho || {};

pentaho.prb = {
	//datasource is used to hold the choice of DS between an MQL, MDX, CDA, KTR, etc..
	datasource:{}
};
/*
pentaho.prb relies on the pentaho-cdf JS objects for UI display
*/

/* pentaho.prb.ModelSelector constructor function */
pentaho.prb.ModelSelector = function(sandbox){
	this.sandbox = sandbox;
};

/* pentaho.prb.ModelSelector instance methods */
pentaho.prb.ModelSelector.prototype = {
	init: function(element) {
		this.element = element;
		var that = this;
		pentaho.pmd.discoverModels({
			success:function(models){
				//console.log("load models");
				that.loadModels(models);
			}
		});
		
	},
	
	loadModels: function(models) {
		//console.log("loading models");
		var that = this, mdl;
		$('#' + that.element).change(function(event) {
		console.log(that.element);
			that.onModelChange($('#' + that.element + ' option:selected').text(),$('#' + that.element + ' option:selected').data() );
			}
		);
		
		/* loop through all models and load the select options */
		var model, len=models.length;
		if (len > 0) {
			//$(this.element).empty();
			/* This needs to be for loop ineach of jQuery each to maintain order */
			for (var i=0, j=len-1; j>=i; j--){
				model = models[j];
				model.discoverViews({success:function(){
					$('#' + that.element).append("<option value'" + model.model + "'>" + model.name + "</option>");
					$('#'+that.element  + ' option:last').data(model);
				}});
				//console.log('loadModels');
				//console.log($('#'+this.element  + ' option:last').data());
			};
		}
	
	},
	onModelChange: function(selected, data){
		console.log(selected);
		console.log(data);
		return;
	}
}

//= require `Dashboards.js`
//= require `CoreComponents.js`

pentaho.prb.DataSourceColumns = function(sandbox) {
	this.sandbox = sandbox; 
};

pentaho.prb.DataSourceColumns.prototype.init = function(element) {
	this.element = element;
	var that=this;
	this.sandbox.listen('prb-datasourceQuery-change',
		function(event) {
						/*
			this.component = {
				name: "datasourceColumns",
				type: "TreeComponent",
				valuesArray: myarr,
				parameters:[],
				parameter:"datasourceType",
				valueAsId: false,
				htmlObject: that.element,
				executeAtStart: true,
				postChange:
					function(){
						that.datasourceChange(datasourceType);
					}
			};*/
			
			
			that.component = {
				  name: "datasourceColumns",
				  type: "text",
				  listeners:[],
				  htmlObject: that.element,
				  expression: function(){return '<h1>'+ event.data.name || "Unknown" +'</h1>'},
				  preExecution:function(){},
				  postExecution:function(){}	
				}

			Dashboards.addComponents([title]);
			Dashboards.update(title);

		}
	);
}

pentaho.prb.DataSourceSelect = function(sandbox) {
	this.sandbox = sandbox; 
};

pentaho.prb.DataSourceSelect.prototype.init = function(element) {
	window.datasourceType = "mql";
	this.datasourceChange("mql");
	this.element = element;
	var that=this;
	this.radioComponent = {
		name: "datasourceSelector",
		type: "radioComponent",
		valuesArray: [
			["mql", "Pentaho Metadata"],
			["mdx", "Pentaho Analsis"],
			["cda", "Community Data Access"]
			//["ktr", "Pentaho Data Integration"]
			],
		parameters:[],
		parameter:"datasourceType",
		separator: "<br/>",
		valueAsId: false,
		htmlObject: that.element,
		executeAtStart: true,
		postChange:
			function(){
				that.datasourceChange(datasourceType);
			}
	};
	Dashboards.addComponents([this.radioComponent]);
	Dashboards.update(this.radioComponent);
};

pentaho.prb.DataSourceSelect.prototype.datasourceChange = function(value) {
	//console.log("dataSourceSelect change: " + value);
	var sources = [], that=this;
	switch (value) {
		case "mql":
			pentaho.pmd.discoverModels({success:function(models) {
				//console.log(models);
				for (var i=0, j=models.length;i<j;i++) {
					//console.log(models[i]);
					sources.push({name:models[i].domain, path:models[i].domain});
				}
				//console.log(sources);
				that.sandbox.notify({type:'prb-datasource-change', data:sources});
				}});
			break;
		case "mdx":
			pentaho.pas.discoverCubes({success:function(cubes) {
				//console.log(cubes);
				for (var i=0, j=cubes.length;i<j;i++) {
					sources.push({name:cubes[i].schema, path:cubes[i].schema});
				}
				that.sandbox.notify({type:'prb-datasource-change', data:sources});
			}});
			break;
		case "cda":
			pentaho.cda.discoverDescriptors(function(descriptors) {
				//console.log(descriptors);
				for (var i=0, j=descriptors.length;i<j;i++) {
					sources.push({name:descriptors[i].name, path:descriptors[i].path});
				}
				that.sandbox.notify({type:'prb-datasource-change', data:sources});
			});
			break;
		default:
			//
	} //end switch value
	
}

pentaho.prb.DataSourceQuerySelect = function(sandbox){
	this.sandbox = sandbox;
};

/*
pentaho.prb.Text instance methods
//= require "app.js"
*/
pentaho.prb.DataSourceQuerySelect.prototype.init = function(element) {
		this.element = element;
		var that=this, qryarray = [];
		this.sandbox.listen('prb-datasource-value-change',
			function(event) {
			     for (var i=0,j=event.data.length;i<j;i++){
			         qryarray[i] = [event.data[i].id, event.data[i].name || 'Unknown'];
			     }
				that.display(qryarray);
			}
		);
}

pentaho.prb.DataSourceQuerySelect.prototype.display = function(queryarray) {
	var that = this;
	//console.log('pentaho.prb.DataSourceQuerySelect.display');
	//console.log(queryarray);
	
	ds_query=queryarray[0] || [];
	var dsqueryselect = {
		  name: "datasourceQuery",
		  type: "select",
		  listeners:[dsvalselect],
		parameter: "ds_query",
		  valuesArray: queryarray,
		  valueAsId: false,
		  htmlObject: that.element,
		  postChange:function(){
			//console.log(ds_query + ':' + $('#' + that.element + ' :selected').text());
			that.sandbox.notify({type:'prb-datasourceQuery-change', data:{id:ds_query, value:$('#' + that.element + ' :selected').text()}});
			}
		}

	Dashboards.addComponents([dsqueryselect]);
	Dashboards.update(dsqueryselect);
}

pentaho.prb.DataSourceValueSelect = function(sandbox){
	this.sandbox = sandbox;
};

/*
pentaho.prb.Text instance methods
//= require "app.js"
*/
pentaho.prb.DataSourceValueSelect.prototype.init = function(element) {
		this.element = element;
		var that=this;
		this.sandbox.listen('prb-datasource-change',
			function(event) {
				//pass the file conents to the displayText function.
				that.display(event.data);
			}
		);
}

pentaho.prb.DataSourceValueSelect.prototype.display = function(data) {
	var that = this;
	//console.log('pentaho.prb.DataSourceValueSelect');
	//console.log(data);
	var myarr = [], src = [], found=false;
	for (var i=0,j=data.length;i<j;i++) {
		found = false;
		$.each(myarr, function(index,value) {
			if (value[0] == data[i].name) {
				found = true;
				return false;
			}
		});
		if (found == false) {
			myarr.push([data[i].name, data[i].path]);
		}
	}
	//console.log('pentaho.prb.DataSourceValueSelect.display');
	datasourceVal=myarr[0][0];
	dsvalselect = {
		name: "datasourceValue",
		type: "select",
		listeners:[],
		parameter: "datasourceVal",
		valuesArray: myarr,
		valueAsId: false,
		htmlObject: that.element,
		postChange:function(){
			that.change({id:datasourceVal, name:$('#' + that.element + ' :selected').text()});
		}	
	}

	Dashboards.addComponents([dsvalselect]);
	Dashboards.update(dsvalselect);
}

pentaho.prb.DataSourceValueSelect.prototype.change = function(data) {
    var that = this, qryarray = [];
	//console.log(data);
		switch (datasourceType) {
            case "mql":
				//var pmdModels = 
                break;
            case "mdx":
                break;
			case "cda":
				pentaho.prb.datasource = new pentaho.cda.Descriptor({name:data.id,path:data.name});
				pentaho.prb.datasource.discoverQueries(function(queries){
				    qryarray = queries;
        			for (var i=0,j=queries.length;i<j;i++ ){
        			 //console.log(queries[i]);
        			 //$('#' + that.element).after('<b>'+queries[i].name+'</b>');
                    }
				});	
				break;
		}
		//console.log(qryarray);
		that.sandbox.notify({type:'prb-datasource-value-change', data:qryarray});
}
/*
@class pentaho.prb.Text
*/
pentaho.prb.Text = function(sandbox){
	this.sandbox = sandbox;
};

/*
pentaho.prb.Text instance methods
//= require "app.js"
*/
pentaho.prb.Text.prototype.init = function(element) {
		this.element = element;
		var that=this;
		this.sandbox.listen('prb-state-init',
			function(event) {
				//pass the file conents to the displayText function.
				that.displayText(event.data);
			}
		);
}

pentaho.prb.Text.prototype.displayText = function(data) {

	//console.log('pentaho.prb.Text.displayText');
	var title = {
		  name: "reportTitle",
		  type: "text",
		  listeners:[],
		  htmlObject: this.element,
		  expression: function(){return '<h1>'+ data.options.title || "Unknown" +'</h1>'},
		  preExecution:function(){},
		  postExecution:function(){}	
		}

	Dashboards.addComponents([title]);
	Dashboards.update(title);
}

/*
@class pentaho.prb.Table
*/
pentaho.prb.Table = function(sandbox){
	this.sandbox = sandbox;
	var that = this;
	this.sandbox.listen('prb-state-init',
		function(event) {
			that.clearResults();
			that.loadResults(event.data);
		}
	);
	this.sandbox.listen('prompt-added',
		function(event) {
			that.addParameter(event.data);
		}
	);
	
};

//= require `jquery.js`

/* pentaho.prb.Table instance methods */
pentaho.prb.Table.prototype.init = function(element) {
		this.element = element;
}
pentaho.prb.Table.prototype.clearResults = function() {
		/* clear out any existing contents */
		$(this.element).empty();
}

pentaho.prb.Table.prototype.addParameter = function(data) {
	//console.log(data);
	//should only be one, but only way I know to generically reference property
	for (prompt in data ) {
		//console.log(prompt);
		this.tableComponent.listeners.push(prompt);
		this.tableComponent.parameters.push([prompt, prompt]);
		this.tableComponent.cdaParams.push([prompt, prompt]);
	}
}
pentaho.prb.Table.prototype.loadResults = function(data) {
	//console.log('pentaho.prb.Table.loadResults');
	var
		colTypes   = [],
		colFormats = [],
		colWidths  = [],
		colHeaders = [];
		colURL = [];
	for (var i=0, j=data.columns.length; i<j; i++) {
		colHeaders[i] = data.columns[i].title;
		colWidths[i]  = data.columns[i].width;
		colTypes[i]   = data.columns[i].datatype;
		colFormats[i] = null;
		colURL[i]     = data.columns[i].drill || null;
	}
			
	this.tableComponent =	{
		name: "reportTable",
		type: "tableComponent",
		chartDefinition:   {
			colHeaders: colHeaders,
			colTypes: colTypes,
			colFormats: colFormats,
			colWidths: colWidths,
			displayLength: 50,
			tableStyle: "classic",
			dataAccessId: data.query.access,
			path: data.query.path,
			drawCallback: function(component){
				var col, url, path, pathstr, parm, parmstr = "";
				for (var i=0, j=colURL.length;i<j;i++) {
					col = colURL[i];
					if (col != null) {
						//console.log(colURL[i]);
						path = col.path.split( '/' );
						pathstr = '/';
						for (var z=2,x=path.length-1;z<x;z++) {
							pathstr = pathstr + path[z] + '/';
						}
						
						switch (col.type) {
							case 'prb':
								url = encodeURI('run.html?solution=' + path[1] + '&path='+ pathstr + '&file=' + path[x]);
								break;
							default:
								url = '#';
						}
						$("#queryResultTable tbody tr .column"+i).each(function(index,value){
							parmstr = "";
							for (var m=0,n=col.parms.length;m<n;m++){
								parm = col.parms[m];
								for (val in parm) {
									parmstr += '&' + val + '=' + $(this).html();
								}
							}
							$(this).html('<a href='+ url + parmstr + '>' + $(value).html()+'</a>');
							//var anch = $('<a/>').attr('href', url+ parmstr);
							//$(this).html('<a href='+ url + parmstr + '>' + $(value).html()+'</a>').wrap($(this).html());;
							//$(this).wrap(anch);
						});
					}
				}
			}
			},
			listeners:  [],
			parameters: [],
			cdaParams:  [],
			htmlObject: "queryResult"
		};
	Dashboards.addComponents([this.tableComponent]);
	Dashboards.update(this.tableComponent);
		  
		
		
		/* create table and header not using dashboards
		var table = this.element.append('<TABLE class=\"display\" id=\"'+ this.element.attr('id') +'_table\"><THEAD><TR class=\"prbTableColHead\"></TR></THEAD><TBODY></TBODY></TABLE>');
		$("#"+this.element.attr('id')+'_table').dataTable( {aaData:results, aoColumns:colHeaders});
		*/
}	//loadResults

/*
@class pentaho.prb.StateManager
*/

pentaho.prb.StateManager = function(sandbox) {
	this.sandbox = sandbox;
}

pentaho.prb.StateManager.prototype.init = function(){
	var that = this;
	this.sandbox.listen('prb-param-init',
		function(event) {
			//console.log('in listen prb-param-init');
			//console.log(event.data);
			that.loadState(event.data);
		});

	this.sandbox.listen('prb-save-request',
		function(event) {
			//console.log('in listen prb-save-request');
			//console.log(event.data);
			that.saveState(event.data);
		});
		
};

pentaho.prb.StateManager.prototype.loadState = function(data){
	var that = this;
	//console.log('inloadstate');
	//console.log(data);
	if (data.solution == null || data.path == null || data.file == null) {
		throw new Error('A solution, path and id must be supplied');
		return;
	};
	this.action = new pentaho.solRepo.Action({solution:data.solution, path:data.path, id:data.file})
	this.action.load(function(file) {
			that.sandbox.notify({type:'prb-state-init', data:file});
	});
	
}

pentaho.prb.StateManager.prototype.saveState = function(data){
	var that = this;
	//console.log('pentaho.prb.StateManager.saveState');
	//console.log(data);
	this.action = this.action || new pentaho.solRepo.Action({solution:data.solution, path:data.path, id:data.file})
	this.action.save(function() {
			that.sandbox.notify({type:'prb-save-complete', data:{}});
	});
	
}

/*
@class pentaho.prb.Location
*/
pentaho.prb.Location = function(sandbox) {
	this.sandbox = sandbox;
}

pentaho.prb.Location.prototype.init = function(){
	var args = pentaho.location.args
	this.solution = args.solution;
	this.path     = args.path;
	this.file     = args.file;
	this.parms    = [];
	var parmobj = {}
	for (parm in args) {
		if (parm != 'solution' && parm != 'path' && parm != 'file' && parm != 'userid' && parm != 'password') {
			parmobj[parm] = args[parm];
			this.parms.push(parmobj);
		}
	}
	this.sandbox.notify({type:'prb-param-init', data:{solution:this.solution, path:this.path, file:this.file, parms:this.parms}});
};

/*
@class pentaho.prb.PromptManager
*/
pentaho.prb.PromptManager = function(sandbox){
	this.sandbox = sandbox;
}

pentaho.prb.PromptManager.prototype.init = function(element){
	this.element = element;
	var that=this;
	this.sandbox.listen('prb-state-init',
		function(event){
			//console.log('prb.PromptManager.init');
			//console.log(event.data);
			that.load(event.data);
		});
}

pentaho.prb.PromptManager.prototype.load = function(data){
	var prompt, prompts = data.prompts, cdfprompt, that=this;
	for each (prompt in prompts){
		//console.log(prompt);
		if (pentaho.location.args[prompt.id]) {
			var pval = pentaho.location.args[prompt.id];
			//console.log('overriding the value of ' + prompt.id + ' from '+ prompt.value +' to ' + pval);
			prompt.value = pval;
		}
		
		//the following line is bad bad bad, but required by CDF Dashboards.globalContext
		//it sets  a global variable to the value from the prb file for this prompt
		window[prompt.parameter] = prompt.value;
		
		//create the DIV placeholder that CDF needs for the SELECT
		var htmlprompt = $('#report_prompt').append('<DIV id=\"'+ prompt.id +'_prompt\"></DIV>');
		var promptdata = {};
		promptdata[prompt.parameter] = prompt.value;
		
		//create the appropriate input type
		switch (prompt.datatype) {
			case "number":
				cdfprompt = 
					{
					  name: prompt.id +"_prompt",
					  type: "textInputComponent",
					  parameter: prompt.parameter,
					  htmlObject: prompt.id + "_prompt",
					  preExecution:function(){},
					  postExecution:function(){}
					}
				break;
			case "date":
				cdfprompt = 
					{
					  name: prompt.id +"_prompt",
					  type: "dateInputComponent",
					  dateFormat: 'yy-mm-dd',
					  parameter: prompt.parameter,
					  parameters:[],
					  htmlObject: prompt.id + "_prompt",
					  preExecution:function(){},
					  postExecution:function(){
						//alert("You chose: " + window[prompt.parameter]);
						}
					}

				break;
			default:
				cdfprompt = {
					name: prompt.id + '_prompt',
					type: "select",
					queryDefinition: {
						dataAccessId: prompt.query.access,
						path: prompt.query.path
					},
					valueAsId: true,
					parameter: prompt.parameter,
					htmlObject: prompt.id + "_prompt",
					preExecution:function(){
						//console.log('preExecution prb.Table');
						//console.log(this);
					},
					postExecution:function(){
						//console.log('in prompt postExecution');
						//Dashboards.processChange(this.name);
						//console.log('here:'+prompt.value);
						//console.log($('#' + cdfprompt.htmlObject + ' select').val());
						//$('#' + cdfprompt.htmlObject + ' select').val(prompt.value)
					}
				}  //end default case;				
		}
		that.sandbox.notify({type:'prompt-added', data:promptdata});
		Dashboards.addComponents([cdfprompt]);
		Dashboards.update(cdfprompt);
		$('#' + prompt.id + "_prompt").prepend('<label class=\"label_prompt\" for=\"'+ prompt.id+ '_prompt' +'\">' + prompt.title + '</label>');
	} //end for loop for each prompt
}  // end promptManager load

//pentaho.prb.Query is not used at this point, but left in here for future
/*
@class pentaho.prb.Query
*/
pentaho.prb.Query = function(sandbox){
	this.sandbox = sandbox;
}

pentaho.prb.Query.prototype.init = function(){
	var that=this;
	this.sandbox.listen('prb-state-init',
		function(event){
			//console.log('prb.Query.init');
			//console.log(event.data);
			that.execute(event.data);
		});
}

pentaho.prb.Query.prototype.execute = function(file) {
	var that = this;
	//console.log('in pentaho.prb.Query.execute');
	//console.log(file);
	this.cda = new pentaho.cda.Descriptor({path:file.query.path});
	this.query = new pentaho.cda.Query({id:file.query.access}, this.cda);
	this.query.execute(function(data) {
		//console.log('in query.execute response');
		var columns = [], md;
		for (var i=0, j=file.columns.length;i<j; i++){
			md = file.columns[i];
			columns[i]          = {};
			columns[i].title    = md.title;
			columns[i].datatype = md.datatype;
			columns[i].width    = md.width;
		}
		that.sandbox.notify({type:'query-complete', data:{results:data.resultset, columns:columns}});
	});
}


/*
           requires: pentaho.location, pentaho.PUC
*/

// The following code is for Save/Save As functionality within PUC
var gCtrlr;

// this is a required object
function Wiz() {
    currPgNum = 0;
}

// this is a required object
function RepositoryBrowserControllerProxy() {

    // This function is called after the Save dialog has been used
    this.remoteSave = function( myFilename, mySolution, myPath, myType, myOverwrite ) {
		//console.log("save state:" + myFilename);
		this.pluginSave({
        	fullpath :mySolution+myPath+'/'+myFilename,
        	"filename":myFilename,
        	solution :mySolution,
        	path     :myPath,
        	type     :myType,
        	overwrite:myOverwrite
        });
    } //end remoteSave
}

RepositoryBrowserControllerProxy.prototype.pluginSave = function(oSave){
	return;
}

/* this is a required object per Pentaho */
function WaqrProxy() {
    this.wiz = new Wiz();
    this.repositoryBrowserController = new RepositoryBrowserControllerProxy();
}
