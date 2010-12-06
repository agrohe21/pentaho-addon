var TreeComponent = BaseComponent.extend({
    update: function(){
        var ph = $("#" + this.htmlObject);
        var myArray = this.getValuesArray();
		
		/* create the tables element */
		var view = {},
		table = ph.append('<TABLE class=\"mqlTable\"><THEAD><TR class=\"list_colHead_first\"><TD>Include</TD><TD>View Name</TD><TD>Column Name</TD><TD>Column Type</TD><TD>Filter</TD></TR></THEAD><TBODY></TBODY></TABLE>');
		/* for each view and column add another row in the table */
		$.each(myArray, function (){
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
				console.log("tableClick Event");
				that.handleTableClick(event);
			}
		);
		
		
  } //end update
  ,handleTableClick: function(event) {
		console.log("handleTableClick");
		var tar = event.target, obj, col;
		if (tar.type == 'checkbox') {
			obj = $(tar).parent().parent()[0].id.split(":");
			this.onToggleSelect(obj[0],obj[1])
		}
	}	// end handleTableClick
	,onToggleSelect: function(table, column){
		return;
	} //end onToggleSelect
  
  
});