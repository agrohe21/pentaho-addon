var pentaho = pentaho || {};
pentaho.cda = {};

pentaho.cda.Descriptor = function(json){
	this.datasources = [];
}

pentaho.cda.Descriptor.prototype = {
	addDataSource: function(connection){
		for (var i=0,j=this.datasources.length;i<j;i++){
			if (datasources[i] == connection) {
				return;
			}
		}
		this.datasources.push(connection);
	}
	,getDataSourceXML: function(){
		var datasource;
		for (var i=0,j=this.datasources.length;i<j;i++){
			datasource =  datasources[i];
			datasource.asXML();
		}
	},
	save: function(path) {
		$.post("content/cda/writeCdaFile",{path: 'bi-developers/cda/cdafiles/test.cda' ,data:'this is a test'},
			function(data){
				console.log(data);
			});
	}
}

pentaho.cda.Connection = function(json){
	this.id   = json.id || 1;
	this.type = json.type || 'metadata.metadata';
}

pentaho.cda.MQLConnection = function(json) {
	pentaho.cda.Connection.call(this, json);
	this.type   = 'metadata.metadata';
	this.domain = json.domain;
	this.xmi    = 'metadata.xmi';
}

inheritPrototype(pentaho.cda.MQLConnection, pentaho.cda.Connection);

pentaho.cda.MQLConnection.prototype.toXML = function() {
		return '<Connection id=\"' + this.id + "\" type=\"" + this.type + '\">'+
		'<DomainId>'+ this.domain + '</DomainId>' +
		'<XmiFile>' + this.xmi    + '</XmiFile>'  +
		'</Connection>'
}

pentaho.cda.DataAccess = function(json){
	this.id   = json.id || 1;
	this.type = json.type || 'mql';
	this.name = json.name || 'Unknown';
	this.query = '';
	this.access = 'public';
	this.cache  = true;
	this.cacheDuration = 1;
	this.columns = [];
	this.parameters = [];
}

pentaho.cda.DataAccess.prototype = {
	toXML: function(){
		return
			"<DataAccess id=\""+this.id+"\" connection=\""+this.connection.id+"\" type=\""+this.type+"\" access=\""+this.access+"\">"+
			"<Name>"+ this.name +"</Name>"+
			"<Query>" + this.query + "</Query>"+
			"</DataAccess>";
		
	} // end toXML
} //end pentaho.cda.DataAccess.prototype