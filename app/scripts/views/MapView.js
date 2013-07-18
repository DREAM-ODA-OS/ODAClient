

define(['backbone',
		'communicator',
		'globals',
		'openlayers',
		'models/MapModel'],
		function( Backbone, Communicator, globals ) {

			var MapView = Backbone.View.extend({

				render: function() {
					map = new OpenLayers.Map("map");
					console.log("Created Map");

					//Go through all defined baselayer and add them to the map
					globals.baseLayers.each(function(baselayer) {
						map.addLayer(this.createLayer(baselayer));
					}, this);

					//Set attributes of map based on mapmodel attributes
			    var mapmodel = globals.objects.get('mapmodel');
			    map.setCenter(new OpenLayers.LonLat(mapmodel.get("center")), mapmodel.get("zoom") );
			    return this;
				},
				//method to create layer depending on protocol
				//setting possible description attributes
				createLayer: function (layer) {
					var return_layer = null;

					switch(layer.get("protocol")){
						case "WMTS":
							return_layer = new OpenLayers.Layer.WMTS({
								"name": layer.get("name"),
				        "layer": layer.get("id"),
				        "protocol": layer.get("protocol"),
				        "url": layer.get("urls"),
				        "matrixSet": layer.get("matrixSet"),
				        "style": layer.get("style"),
				        "format": layer.get("format"),
				        "maxExtent": layer.get("maxExtent"),
				        "resolutions": layer.get("resolutions"),
				        "projection": layer.get("projection"),
				        "gutter": layer.get("gutter"),
				        "buffer": layer.get("buffer"),
				        "units": layer.get("units"),
				        "transitionEffect": layer.get("transitionEffect"),
				        "isphericalMercator": layer.get("isphericalMercator"),
				        "isBaseLayer": layer.get("isBaseLayer"),
				        "wrapDateLine": layer.get("wrapDateLine"),
				        "zoomOffset": layer.get("zoomOffset")
							});
							break;
					};
					return return_layer;		
				}
			});
			return MapView;
	});


