/**
 * @author Andy
 */
Pentaho = {
	xhr: {
		execute: function(url, oConfig){
			//Pentaho.print(oConfig.data);
			$.ajax({
				async: oConfig.async,
				cache: oConfig.cache,
				dataFilter: oConfig.dataFilter,
				data: oConfig.data,
				dataType: oConfig.dataType,
				error: oConfig.error,
				complete: oConfig.complete,
				type: oConfig.type,
				url: url
			})
		},
		execJSON: function(fileName, funcSuccess){
			$.getJSON(fileName, function(data){
				funcSuccess(data);
			});
		} //end ajax
	},
	print: function(obj) {
		document.body.appendChild(prettyPrint(obj, { maxDepth:10 } ));
	}
};
