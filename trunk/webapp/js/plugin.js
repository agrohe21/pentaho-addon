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

/* Class to embody plugin functions */
pentaho.Plugin = function(filetype) {
	this.filetype = filetype;
	this.editing  = false;
}

pentaho.Plugin.prototype.init = function(oConfig) {
	var command = pentaho.location.args.command || 'new';
	var that = this;
	this.editing = (command == 'edit' || command == 'new');
	
	//console.log("PUC.enabled: " + pentaho.PUC.enabled);
	//console.log("editiing: " + this.editing);
	if (pentaho.PUC.enabled) { //PUC enabled
		gCtrlr = new WaqrProxy(); // this is a required variable
		//subscribe to the save event and allow instances of plugin to override the method
		gCtrlr.repositoryBrowserController.pluginSave =	function(oSave) {
				var state = that.getCurrentPluginState(oSave);
				console.log(state);
				that.savePluginState(state);
				if (typeof oConfig.saveComplete == 'function') {
					oConfig.saveComplete(oSave);
				}
			}
	
		if (window.parent.enableContentEdit) {
			window.parent.enableContentEdit(true);
		}
	      window.parent.registerContentCallback(new function() {
	        this.editContentToggled = function(selected) {
				that.startEditMode(that.editing, oConfig);
	        }
	      });
		
	    //console.log("enabling save: " + window.parent.enableAdhocSave);
	    if (pentaho.PUC.enabled && window.parent.enableAdhocSave ) {
	        window.parent.enableAdhocSave( true );
	    }
		
	} //end if PUC.enabled
	
	
	if ( command == 'edit' || command == 'load') {
		/* Load saved state if anything other than new */
		//if ( command != 'new') {
	
		var solution = pentaho.location.args.solution,
		path     = pentaho.location.args.path,
		filename = pentaho.location.args.filename;
		
		if (path != '/') {
			path += '/';
		}
		var state = {
			model:{
				domain:"steel-wheels",
				model:"BV_INVENTORY",
				name:"Inventory",
				description:"Inventory Metadata Model"
			},
			query:{
				MDselect:[new pentaho.pmd.MDselect({column:"BC_PRODUCTS_PRODUCTCODE", table:"CAT_PRODUCTS"})]
			}
			};
		//do something like read the state from the server
		oConfig.pluginLoadStateComplete(state);
		
	}
	oConfig.pluginInitComplete();
	this.startEditMode(this.editing, oConfig);

} //end init

pentaho.Plugin.prototype.startEditMode = function(editing, oConfig) {
	//console.log("startEditMode: " + editing + ":" + this.editing);
	pentaho.PUC.toggleEditButton(editing);
	this.editing == true ? oConfig.pluginEditStart() : oConfig.pluginEditComplete();
	this.editing = !this.editing;
}

pentaho.Plugin.prototype.getCurrentPluginState = function() {
	return {
		filetype:this.filetype
	}
}

pentaho.Plugin.prototype.savePluginState = function(oState) {
	//document.body.appendChild(prettyPrint(oState, { maxDepth:10 } ));	
	//TODO do somethings here like actually call the webservice when available.
	
	//enable refresh after the real webservice saves
	//pentaho.app.refreshBrowsePanel();
}