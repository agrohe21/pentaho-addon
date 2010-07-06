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

// this is a required object
function WaqrProxy() {
    this.wiz = new Wiz();
    this.repositoryBrowserController = new RepositoryBrowserControllerProxy();
}

function PentahoPlugin(filetype) {
	this.filetype = filetype;
	this.editing  = false;
}

PentahoPlugin.prototype.init = function(oConfig) {
	var command = Pentaho.location.args.command;
	var that = this;
	this.editing = (command == 'edit' || command == 'new');
	
	//console.log("PUC.enabled: " + Pentaho.PUC.enabled);
	if (Pentaho.PUC.enabled) { //PUC enabled
		gCtrlr = new WaqrProxy(); // this is a required variable
		//subscribe to the save event and allow instances of plugin to override the method
		gCtrlr.repositoryBrowserController.pluginSave =	function() {
				var state = that.getCurrentPluginState();
				document.body.insertBefore( prettyPrint(state, {maxDepth:10}), document.body.lastChild );
				that.savePluginState(state);
				oConfig.saveComplete(data);
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
	    if (Pentaho.PUC.enabled && window.parent.enableAdhocSave ) {
	        window.parent.enableAdhocSave( true );
	    }
		
	} //end if PUC.enabled
	
	
	//if ( command == 'edit' || command == 'load') {
	//Load saved state if anything other than new
	//even if command is not supplied, the default is to load if not new
	if ( command != 'new') {
		/*
		solution = Pentaho.args.solution,
		path     = Pentaho.args.path,
		filename = Pentaho.args.filename;
		
		if (path != '/') {
			path += '/';
		}
		*/
		Pentaho.xhr.execJSON(
			'state.json',
			function(state) {
				//document.body.appendChild(prettyPrint(state, { maxDepth:10 } ));
				oConfig.pluginLoadStateComplete(state);
			}
		); //end ajax
		
	}
	oConfig.pluginInitComplete();
	this.startEditMode(this.editing, oConfig);

} //end init

PentahoPlugin.prototype.startEditMode = function(editing, oConfig) {
	//console.log("startEditMode: " + editing + ":" + this.editing);
	Pentaho.PUC.toggleEditButton(editing);
	editing == true ? oConfig.pluginEditStart() : oConfig.pluginEditComplete();
	this.editing = !this.editing;
}

PentahoPlugin.prototype.getCurrentPluginState = function() {
	return {
		filetype:this.filetype
	}
}

PentahoPlugin.prototype.savePluginState = function(oState) {
	//document.body.appendChild(prettyPrint(oState, { maxDepth:10 } ));	
	//TODO do somethings here like actually call the webservice when available.
	
	//enable refresh after the real webservice saves
	//Pentaho.app.refreshBrowsePanel();
}