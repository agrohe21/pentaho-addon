/**
 * @author Andy
 */
if (!pentaho.PUC) {
	pentaho.PUC = {
		enabled: (window.parent != null && window.parent.mantle_initialized == true),
		refreshBrowsePanel: function(){
			// if possible refresh the solution browser panel
			if (pentaho.PUC.enabled && window.parent.mantle_refreshRepository) {
				window.parent.mantle_refreshRepository();
			}
		},
		toggleEditButton: function(lower){
			// if possible, lower/depress the 'Edit' toolbar button
			if (pentaho.PUC.enabled && window.parent.setContentEditSelected) {
				window.parent.setContentEditSelected((lower == true) ? true : false);
			}
		}
	}
} // if pentaho.PUC
