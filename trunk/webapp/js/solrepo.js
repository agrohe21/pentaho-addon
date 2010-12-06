/*
* Author:  Andy Grohe
* Company: Project Leadership Associates
* Date:    04/01/2010
* Version: 0.1
*/

/*
@description pentaho namespace as a holder of pmd module
*/
var pentaho = pentaho || {}

/*
@module solRepo
@class solRepo
@description Solution Repository class manages interaction with Pentaho Server's Solution Repository
*/
pentaho.solRepo = {
	/*
	@member repoTree
	@description class variable to hold BI Platform's Solution Repository Tree
	*/
	repoTree: {},
	/*
	@module solRepo
	@class Solution
	@description Represents the highest level in the Solution Repository
	-Solution
	--Directory
	---Action
	--Directory
	---Action
	*/
	Solution: function(obj) {
		this.id          = obj.id   || 'Unknown Solution';
		this.name        = obj.name || 'Unknown Name';
		this.date        = obj.date || 'Unknown Date';
		this.description = obj.description || 'Unknown Descr';
		this.type        = "solution";
		this.directories = [];
		//if directories were provided in the model, then create pmd.BusinessView(s)
		if (obj.directories) {
			for (var i = 0, x = obj.directories.length; i < x; i++) {
				this.directories[i] = new pentaho.solRepo.Directory(obj.directories[i], this);
			};
		}
		//console.log("Created solution: " + this.id + ":" + this.name);
	},
	/*
	@module solRepo
	@class Directory
	@description Represents directories under a Solution and other sub-directories
	*/
	Directory: function(obj, parent) {
		this.id          = obj.id;
		this.name        = obj.name;
		this.date        = obj.date;
		this.description = obj.description;
		this.parent      = parent;
		this.type        = "directory"
		//console.log("Created directory: " + this.id + ":" + this.name + " under: " + this.parent);
	},
	/*
	@module solRepo
	@class Action
	@description Represents indiviual action sequencess in Solution Repository Directories
	*/
	Action: function(obj, parent) {
		this.id         = obj.id;
		this.name       = obj.name;
		this.date       = obj.date;
		this.description= obj.description;
		this.parent     = parent;
		this.type       = "action";
		if (obj.solution) {
			this.solution = obj.solution;
		}
		if (obj.path) {
			this.path = obj.path;
		}
		//console.log("Created action: " + this.id + ":" + this.name + " under: " + this.parent);
	},
	/*
	@module solRepo
	@class solRepo
	@method processNode
	@description Recursively process the current Node
	*/
	//process the noode and all childNodes recursively
	processNode: function (nParent, nSolution, oParent, aActions) {
		var nFile, iFile, iDir;
		for (var j=0, i=nParent.childNodes.length;j<i;j++) {
			nFile = nParent.childNodes[j];
			if (nFile.getAttribute("visible") == "true") {//do not load non visible files
				//The following object properties are common to directories and actions
				if (nFile.getAttribute("isDirectory") == "true") {
					//console.log("directory: " + nFile.getAttribute("name"));
					if (typeof (oParent.directories) == "undefined" ){
						oParent.directories = [];
						iDir = 0;
					} else {
						iDir = oParent.directories.length;
					}
					oParent.directories[iDir] = new pentaho.solRepo.Directory({
						id         : nFile.getAttribute("name"),
						name       : nFile.getAttribute("localized-name"),
						date       : nFile.getAttribute("lastModifiedDate"),
						description: nFile.getAttribute("description")
					}, oParent)
					pentaho.solRepo.processNode(nFile, nSolution, oParent.directories[iDir]); //recursively process all childNodes
				} else { //must be an an action
					//console.log("action: " + nFile.getAttribute("name"));
					if (typeof (oParent.actions) == "undefined" ){
						oParent.actions = [];
						iFile = 0;
					} else {
						iFile = oParent.actions.length;
					}
					oParent.actions[iFile] = new pentaho.solRepo.Action({
						id         : nFile.getAttribute("name"),
						name       : nFile.getAttribute("localized-name"),
						date       : nFile.getAttribute("lastModifiedDate"),
						description: nFile.getAttribute("description")
					}, oParent)
				} // end if directory
			}     // end if visible
		}         // end for loop child nodes
	},             // end processNode function
	/*
	@module solRepo
	@class solRepo
	@method discoverTree
	@description class function to discover the contents of the Solution Repository on the Pentaho BI Server
	*/
	discoverTree: function(callback, filter){
		//if no filter is passed in then use xaction as the default
		if (filter == undefined) {
			filter = "*.xaction";
		}
		//invoke the pentaho web service SolutionRepositoryService with filter options
		pentahoGet("SolutionRepositoryService", "component=getSolutionRepositoryDoc&filter=" + filter,
			function(oResponse) {
				var repoNode, xmlSolution, isol, xmlRepo = pentaho.xhr.parseXML(oResponse);
			
				//get the repository in the document
				//As of this version, only one repository is returned from server
				//in future versions this may change and [0] would also need to change to some loop
				repoNode = xmlRepo.getElementsByTagName("repository")[0];
				//populate base of tree with repository node values
				pentaho.solRepo.repoTree = {
					name     :repoNode.getAttribute("path").replace("/", ""),
					solutions:[] //default to empty set of solutions
				}
				//loop through solutions underneath repository node
				//assumes only solutions at root node and no other actions or directories
				for (var i=0,j=repoNode.childNodes.length; i<j; i++) {
					xmlSolution = repoNode.childNodes[i];
					//ignore non-visible solutions
					if (xmlSolution.getAttribute("visible") == "true") {
						iSol = pentaho.solRepo.repoTree.solutions.length;
						pentaho.solRepo.repoTree.solutions[iSol] = new pentaho.solRepo.Solution({
							id         : xmlSolution.getAttribute("name"),
							name       : xmlSolution.getAttribute("localized-name"),
							date       : xmlSolution.getAttribute("lastModifiedDate"),
							description: xmlSolution.getAttribute("description"),
							type       : "solution"
						});
						if (xmlSolution.hasChildNodes) {  //only process subndoes if there are any
							pentaho.solRepo.processNode(xmlSolution, xmlSolution, pentaho.solRepo.repoTree.solutions[iSol]);  //recursively process all and child nodes
						}
						
					} //end if solution is visible
				}  //end solution loop 
				//call success function if there is one
				callback(pentaho.solRepo.repoTree);
		}) //end pentahoGet for SolutionRepositoryService
	} //end getSolutionRepositoryDocs
}  // end solRepo Object Definition

pentaho.solRepo.Action.prototype = {
	
	getSolution: function(){
		if (this.solution) {
			return this.solution;
		}
		var getParentPath = function(obj){
			if (obj.parent.type == 'solution') {
				//console.log("found solution: " + obj.parent.name);
				return obj.parent.id;
			} else {
				//console.log("not solution: " + obj.parent.name);
				return getParentPath(obj.parent);
			}
		};
		return getParentPath(this);
	},
	getPath: function(){
		if (this.path) {
			return this.path;
		}
		var path = [],
		getParentPath = function(obj,path){
			if (obj.parent.type == 'solution') {
				return path;
			} else {
				//console.log("not solution: " + obj.parent.name);
				path[path.length] = obj.parent.id;
				getParentPath(obj.parent, path);
			}
			return path.reverse();
		};
		getParentPath(this,path);
		//console.log(path.join("/"));
		return path.join("/");
	}, //end getPath
	discoverDetails: function(oConfig) {
		var that = this,
		data = { //default set of parms
			solution :this.getSolution(),
			path     :this.getPath(),
			name     :this.id,
			action   :this.id
		};
		//not complete but could be useful
	}, //end discoverDetails
	execute: function(oConfig){
			var that = this, data ={ //default set of parms
					auditname:"jsapi.action",  //this goes into the PRO_AUDIT table
					solution :this.getSolution(),
					path     :this.getPath(),
					action   :this.id
				};
			for (var i=0,j=oConfig.parameters.length;i<j;i++) {
				for (parm in oConfig.parameters[i]) {
					//console.log(parm);
					//console.log(oConfig.parameters[i][parm]);
					data[parm] = oConfig.parameters[i][parm];
				}
			}
			//pentaho.print(data);
	
			pentaho.xhr.execute("/pentaho/ServiceAction", {
				async:   true,
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
				data:data,
				error: function(xhr, ajaxOptions, thrownError){
					//TODO do somethign useful with the error
				}
			});
	}, // end execute
	load: function(func) {
		var that =this;
		pentaho.xhr.execute("/pentaho/content/cda/getCdaFile", {
			async: true,
			cache: true,
			dataType: "json",
			type: "GET",
			complete: function(response) {
				//console.log('solrepo.Action.load response');
				var file = eval('(' + response + ')' );
				if (typeof func == 'function'){
					func(file);
				}			
			},
			data:{path:that.getSolution() + that.getPath() +'/'+ that.id}
		});
	},
	save: function(func) {
		var that =this;
		/*
		$.post("/pentaho/content/cda/writeCdaFile", data:{path:that.getSolution() + that.getPath() +'/'+ that.id},
			function(data){
				console.log('saved: ' + data);
			});
			*/
	} //end save
}