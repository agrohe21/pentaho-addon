pentaho.prb = {};

pentaho.PUC = function(){
	/* is the PUC enabled */
	this.enabled = (window.parent != null && window.parent.mantle_initialized == true);
	this.app = "/" + window.location.pathname.split( '/' )[1];
	this.args = {};
	
	/* assign arguments to this.args */
	var qs = (location.search.length > 0 ? location.search.substring(1) : ""),
	//object to hold data
	item = null, name = null, value = null, items = qs.split("&");
	//assign each item onto the args object
	for (var i=0, j=items.length; i <j; i++){
		item = items[i].split("=");
		name = decodeURIComponent(item[0]);
		value = decodeURIComponent(item[1]);
		this.args[name] = value;
	}

	/* register for thesave button events */
	if (this.enabled) { //PUC enabled
		gCtrlr = new WaqrProxy(); // this is a required variable
		//subscribe to the save event and allow instances to override the method
		gCtrlr.repositoryBrowserController.pluginSave =	function(oSave) {
				this.savePluginState(oSave);
			}
		/* register for the edit button events */
		window.parent.registerContentCallback(new function() {
			this.editContentToggled = function(mode) {
				if (mode) {
					this.startEditMode();
				} else {
					this.endEditMode();
				}
			}
		});
		/* enable save for the PUC object */
		if (window.parent.enableAdhocSave ) {
			window.parent.enableAdhocSave( true );
		}		
	} // end PUC.enabled
}

pentaho.PUC.prototype = {
	savePluginState: function(oState) {
		//document.body.appendChild(prettyPrint(oState, { maxDepth:10 } ));	
		//TODO do somethings here like actually call the webservice when available.
		
		//enable refresh after the real webservice saves
		//pentaho.app.refreshBrowsePanel();
	},
	refreshBrowsePanel: function(){
		// if possible refresh the solution browser panel
		if (this.enabled && window.parent.mantle_refreshRepository) {
			window.parent.mantle_refreshRepository();
		}
	},
	toggleEditButton: function(lower){
		// if possible, lower/depress the 'Edit' toolbar button
		if (this.enabled && window.parent.setContentEditSelected) {
			window.parent.setContentEditSelected((lower == true) ? true : false);
		}
	},
	startEditMode: function() {
	},
	endEditMode: function() {
	}
}

pentaho.prb.EditPane = function(oConfig) {
	this.element = $(oConfig.element);
}

pentaho.prb.EditPane.prototype = {
	toggleToolbar:  function(display){
		if (display) {
			$(this.element).show("fast");
			//$('#yui-main .yui-b').animate({marginLeft:"24.0769em"},500);
		} else {
			$(this.element).hide("fast");
			//$('#yui-main .yui-b').animate({marginLeft:"0em"},500);
		}
	}
}

/* pentaho.prb.ModelSelector constructor function */
pentaho.prb.ModelSelector = function(oConfig){
	this.element = $(oConfig.element);
};

/* pentaho.prb.ModelSelector instance methods */
pentaho.prb.ModelSelector.prototype = {
	loadModels: function(models) {
		//console.log("loading models");
		var that = this;
		$(this.element).change(function(event) {
			that.onModelChange($('option:selected').text());
			}
		);
		
		/* loop through all models and load the select options */
		var model, len=models.length;
		if (len > 0) {
			//$(this.element).empty();
			/* This needs to be for loop ineach of jQuery each to maintain order */
			for (var i=0, j=len-1; j>=i; j--){
				model = models[j];
				$(this.element).append("<option value'" + model.model + "'>" + model.name + "</option>");
			};
		}
	
	},
	onModelChange: function(selected){
		return;
	}
}

/* pentaho.prb.Table constructor function */
pentaho.prb.Table = function(oConfig){
	this.element = $(oConfig.element);
};

/* pentaho.prb.Table instance methods */
pentaho.prb.Table.prototype = {
	clearResults: function() {
		/* clear out any existing contents */
		$(this.element).empty();
	},
	loadResults: function(results, MDselect) {
		this.clearResults();
		
		/* create table and header */
		var table = $(this.element).append('<TABLE class=\"mqlTable\"><THEAD><TR class=\"list_colHead_first\"></TR></THEAD><TBODY></TBODY></TABLE>');
		for (var j=0,k=MDselect.length; j<k; j++) {
			$(table).find('THEAD TR').append('<TD>'+ MDselect[j].column +'</TD>');
		}
		/* add a row for each result record */
		var body = $(table).find('TBODY');
		for (var i=0,k=results.length; i<k; i++) {
			$(body).append('<TR class=\"navigation_table\"></TR>');
			var row = $(body).find('TR:last');
			for (var j=0,z=MDselect.length; j<z; j++) {
				$(row).append('<TD>'+ results[i][MDselect[j].column] +'</TD>');
			}
		}
	}	//loadResults
};	//	pentaho.prb.Table.prototype


pentaho.prb.FieldSelector = function(oConfig) {
	this.element = $(oConfig.element);
};

/* pentaho.prb.Table instance methods */
pentaho.prb.FieldSelector.prototype.clearFields = function() {
		/* clear out any existing contents */
		$(this.element).empty();
};

pentaho.prb.FieldSelector.prototype.loadFields = function(views) {

		this.clearFields();

		/* create the tables element */
		var view, table = $(this.element).append('<TABLE class=\"mqlTable\"><THEAD><TR class=\"list_colHead_first\"><TD>Include</TD><TD>View Name</TD><TD>Column Name</TD><TD>Column Type</TD><TD>Filter</TD></TR></THEAD><TBODY></TBODY></TABLE>');
		/* for each view and column add another row in the table */
		$.each(views, function (){
			view = this;
			$.each(view.columns, function(){
				var col = this;
				$(table).find('TBODY').append(
					'<TR class=\"navigation_table\" id=\"'+view.view+':'+col.column+'\">'+
					'<TD class=\"gridcell\"><input type=\"checkbox\" name=\"chk'+view.view+'.'+col.column+'\"></TD>'+
					'<TD>'+ view.name +'</TD>'+
					'<TD>'+ col.name +'</TD>'+
					'<TD>'+ col.type +'</TD>'+
					'<TD class=\"colFilter\"><input type=\"button\" id=\"b'+view.view+':'+col.column+'\" name=\"b'+view.view+'.'+col.column+'\" value=\"Filter\"></TD>'+
					'</TR>'
				);
			})
		})
		
		var that=this;
		/* Bind once to table and let events bubble up  */
		$(table).click(
			function(event) {
				//console.log("tableClick Event");
				that.handleTableClick(event);
			}
		);
};	// loadFields

pentaho.prb.FieldSelector.prototype.handleTableClick = function(event) {
		//console.log("handleTableClick");
		var tar = event.target, obj, col;
		if (tar.type == 'checkbox') {
			obj = $(tar).parent().parent()[0].id.split(":");
			this.onToggleSelect(obj[0],obj[1])
		}
		/*
		//filter related 
		if (tar.type == 'button' && $(tar).parent().hasClass('colFilter')){	
			obj = $(tar).parent().parent()[0].id.split(":");
			col = pentaho.xmql.mdModel.findColumn(obj[0],obj[1]);
			var colSelect = new pentaho.pmd.MDselect({"table":col.view, "column":col.column,"aggregation":"None"});
			var cols = [colSelect];
			var colQuery   = new pentaho.pmd.Query({
				"domain":pentaho.xmql.mdModel.domain,
				"model":pentaho.xmql.mdModel.model,
				"MDselect":cols
				});
			colQuery.execute({success:function(results){
				$('#filterDialog').empty();
				
				var table = $('#filterDialog').append('<TABLE class=\"mqlTable\"><THEAD><TR class=\"list_colHead_first\"></TR></THEAD><TBODY></TBODY></TABLE>');

				//create header with first column of first row.  assumes only one column :)
				$(table).find('THEAD TR').append('<TD>'+ colSelect.column +'</TD>');
				//pentaho.print(results);
				var body = $(table).find('TBODY');
				for (var i=0,j=results.length; i<j; i++) {
					$(body).append('<TR class=\"navigation_table\"></TR>');
					var row = $(body).find('TR:last');
					$(row).append('<TD>'+ results[i][colSelect.column] +'</TD>');
				}
				$('#filterDialog').dialog('open');
			}});

		} */ 
	}	// handleTableClick

pentaho.prb.FieldSelector.prototype.onToggleSelect = function(table, column){
		return;
	}

	/*
requires: pentaho.location, pentaho.PUC
*/

// The following code is for Save/Save As functionality
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
