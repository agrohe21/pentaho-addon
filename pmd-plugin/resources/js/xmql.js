/* pentaho.xmql brings the Metadata Query API as a plugin */
pentaho.xmql = {
	/* mdQuery is a singleton instance of pentaho.pmd.query and is a translator for the Pentaho server metadata API*/
	mdQuery:  {},
	/* Metadata Model to be used for the current query */
	mdModel:  {},
	/* method setup to responsd to PUC edit mode clicks */
	toggleToolbar:  function(display){
		if (display) {
			$('#mqlLeft').show("fast");
			//$('#yui-main .yui-b').animate({marginLeft:"24.0769em"},500);
		} else {
			$('#mqlLeft').hide("fast");
			//$('#yui-main .yui-b').animate({marginLeft:"0em"},500);
		}
	},
	init: function() {
		var command = pentaho.location.args.command;
		switch (command) {
			case "new":
				pentaho.pmd.discoverModels({success:pentaho.xmql.loadModels});
				pentaho.xmql.toggleToolbar(true);
				break;
			case "edit":
				pentaho.xmql.toggleToolbar(true);
				break;
			case "load":
				pentaho.xmql.toggleToolbar(false);
				break;
			default:
				pentaho.xmql.toggleToolbar(true);
		}

		$("#bQuery").bind("click", pentaho.xmql.executeQuery);

		/* create an instance of PentahoPlugin */
		pentaho.xmql.plugin = new pentaho.Plugin("xmql");
		var pluginOptions = {
			/* When plugin init is complete, load the models */
			pluginInitComplete: function(event){
				//pentaho.pmd.discoverModels({success:pentaho.xmql.loadModels})
			},
			pluginEditStart: function() {
				pentaho.xmql.toggleToolbar(true);
			},
			pluginEditComplete: function() {
				pentaho.xmql.toggleToolbar(false);
			},
		
			//Handle PluginLoadStateComplete event pouring the saved state into a waiting MDQuery object
			pluginLoadStateComplete: function(state){
				pentaho.xmql.mdModel = new pentaho.pmd.BusinessModel(
					{"model":state.model.model,
					"domain":state.model.domain,
					"name":state.model.name,
					"description":state.model.description,
					views:state.model.views});
				pentaho.xmql.mdQuery =  new pentaho.pmd.Query({
					domain:pentaho.xmql.mdModel.domain,
					model:pentaho.xmql.mdModel.model,
					MDselect:state.query.MDselect,
					MDorder:state.query.MDorder,
					MDfilter:state.query.MDfilter});
				//pentaho.xmql.viewLoadComplete();
				pentaho.xmql.executeQuery(); //execute loaded query from saved state
			}
		};
		//Call into with configured function handlers
		pentaho.xmql.plugin.init(pluginOptions);
		
		/* overriding PentahoPlugin default to be used by PluginSaveSate */
		pentaho.xmql.plugin.getCurrentPluginState = function() {
			//console.log(pentaho.xmql.mdQuery.mdModel);
			return {
				//get the current state of the MDQuery objects to save
				model : pentaho.xmql.mdModel,
				query : pentaho.xmql.mdQuery
			}
		}
	},
	/* method to be called when a query is to be executed */
	executeQuery: function() {
		pentaho.xmql.mdQuery.execute({success:pentaho.xmql.loadQuery}); //calls MDQuery.executeQuery, which on completion calls MDQqueryComplete
	},
	loadQuery: function(results) {
		$("#queryResult").empty();
		
		/* create table and header */
		var table = $('#queryResult').append('<TABLE class=\"mqlTable\"><THEAD><TR class=\"list_colHead_first\"></TR></THEAD><TBODY></TBODY></TABLE>');
		for (var j=0,k=pentaho.xmql.mdQuery.MDselect.length; j<k; j++) {
			$(table).find('THEAD TR').append('<TD>'+ pentaho.xmql.mdQuery.MDselect[j].column +'</TD>');
		}
		/* add a row for each result record */
		var body = $(table).find('TBODY');
		for (var i=0; i<results.length; i++) {
			$(body).append('<TR class=\"navigation_table\"></TR>');
			var row = $(body).find('TR:last');
			//console.log($(row).html());
			for (var j=0; j<pentaho.xmql.mdQuery.MDselect.length; j++) {
				$(row).append('<TD>'+ results[i][pentaho.xmql.mdQuery.MDselect[j].column] +'</TD>');
			}
		}
	}, //end pentaho.xml.loadQuery
	/* method be called when the page loads. Places models into drop down and sets up change event*/
	loadModels: function(models){
			//document.body.insertBefore( prettyPrint(model, {maxDepth:10}), document.body.firstChild );
			var that = this;
			
			$('#modelSelect').change(function() {
				pentaho.xmql.modelChange($('option:selected').text());
				}
			);
			
			/* loop through all models and load the select options */
			var model, len=models.length;
			if (len > 0) {
				//$('#modelSelect').empty();
				/* This needs to be for loop ineach of jQuery each to maintain order */
				for (var i=0, j=len-1; j>=i; j--){
					model = models[j];
					$('#modelSelect').append("<option value'" + model.model + "'>" + model.name + "</option>");
				};
			}
		
	},
	modelChange: function(selected){
		pentaho.xmql.mdModel = pentaho.pmd.findModel(selected);
		pentaho.xmql.mdModel.discoverViews({success:pentaho.xmql.viewLoadComplete});
		pentaho.xmql.mdQuery = new pentaho.pmd.Query({"domain":pentaho.xmql.mdModel.domain,"model":pentaho.xmql.mdModel.model});
	}, //end modelChange
	handleTableClick:  function(event) {
		var tar = event.target, obj, col;
		
		if (tar.type == 'checkbox') {
			obj = $(tar).parent().parent()[0].id.split(":");
			col = pentaho.xmql.mdModel.findColumn(obj[0],obj[1]);
			pentaho.xmql.mdQuery.toggleSelect(new pentaho.pmd.MDselect({"table":obj[0], "column":obj[1],"aggregation":"None"}));
		}
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

		}
	},
	viewLoadComplete: function(views) {
		//pentaho.print(views);
		$("#viewResult").empty(); //clear any former contents
		$("#queryResult").empty(); //clear any former contents

		var that=this, viewNode, view, colNode;
		var ul;

		/* create the tables element */
		var table = $('#viewResult').append('<TABLE class=\"mqlTable\"><THEAD><TR class=\"list_colHead_first\"><TD>Include</TD><TD>View Name</TD><TD>Column Name</TD><TD>Column Type</TD><TD>Filter</TD></TR></THEAD><TBODY></TBODY></TABLE>');
		
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
		/* create the filter dialog, but don't open just yet */
		$('#filterDialog').dialog({ autoOpen: false, title:"Valid Values", height:300, maxHeight:500, buttons: { "Ok": function() { $(this).dialog("close"); } } });
		/* Bind once to table and let events bubble up */
		$(table).click(pentaho.xmql.handleTableClick);
	}
}     //end pentaho.xmql	