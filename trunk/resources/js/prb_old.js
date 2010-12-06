/* pentaho.xmql brings the Metadata Query API as a plugin */
pentaho.xmql = {
	/* mdQuery is a singleton instance of pentaho.pmd.query and is a translator for the Pentaho server metadata API*/
	mdQuery:  {},
	/* Metadata Model to be used for the current query */
	mdModel:  {},
	/* table */
	mdTable: {},
	/* Filter box */
	mdFldSelect: {},
	mdModelSelect: {},
	/* method setup to responsd to PUC edit mode clicks */
	mdEditPane: {},
	app: new pentaho.PUC(),
	init: function() {
		console.log("init");
		this.mdEditPane = new pentaho.prb.EditPane({element:'#mqlLeft'});
		this.mdTable    = new pentaho.prb.Table({element:$("#queryResult")});
		var command = this.app.args.command;
		switch (command) {
			case "new":
				pentaho.xmql.mdEditPane.toggleToolbar(true);
				break;
			case "edit":
				pentaho.xmql.mdEditPane.toggleToolbar(true);
				break;
			case "load":
				pentaho.xmql.mdEditPane.toggleToolbar(false);
				break;
			default:
				pentaho.xmql.mdEditPane.toggleToolbar(true);
		} // end switch command
	}
}     //end pentaho.xmql	