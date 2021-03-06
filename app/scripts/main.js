//-------------------------------------------------------------------------------
//
// Project: EOxClient <https://github.com/EOX-A/EOxClient>
// Authors: Daniel Santillan <daniel.santillan@eox.at>
//
//-------------------------------------------------------------------------------
// Copyright (C) 2014 EOX IT Services GmbH
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies of this Software or works derived from this Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//-------------------------------------------------------------------------------

(function() {
    'use strict';

    var root = this; // to be used in nested context

    function setuplogging (enable) {

    	// Check if console exists (difference in browsers and if it is enabled)
    	if (!enable || typeof console === 'undefined' || !console.log ) {
		  window.console = {
		    debug: function() {},
		    trace: function() {},
		    log: function() {},
		    info: function() {},
		    warn: function() {},
		    error: function() {}
		  };
		}
    	
    }

    var deps = [
		'backbone',
        'app',                  // the main app
        'backbone.marionette',
        'regionManager',
        'jquery',
        'jqueryui',
        "util",                 // variaous utilities
        "libcoverage"          // WCS handling code
	] ;

	var callback = function(Backbone, App) {

        function error_handler( message, url, xhr)
        {
            window.alert( message+"\nURL: "+url
                +"\nERROR: "+xhr.status+" "+xhr.statusText )
        }

        var config_url = "config.json";

        console.log("Loading config.json ...")
        $.ajax({
            url: config_url,
            async: false,
            cache: false,
            error: function( xhr, status_, error )
            {
                error_handler("The browser failed to load the client's configuration!\n"+
                    "The client cannot be started!\n\n"+
                    "This may be a temporary problem.\n"+
                    "Please, click OK to reload the client.\n", config_url, xhr)
                location.reload(true)
            },
            success: function(config_src)
            {

                // load the data content specification

                $.ajax({
                    url: config_src.mapConfig.dataconfigurl,
                    async: false,
                    cache: false,
                    error: function( xhr, status_, error )
                    {
                        error_handler( "Failed to load the data layers' definitions!\n\n"
                            +"This may be a temporary problem.\nPlease, try to reload the client.\n",
                            config_src.mapConfig.dataconfigurl, xhr)
                        location.reload(true)
                    },
                    success: function(data_cfg)
                    {
                        _.extend(config_src.mapConfig, data_cfg);
                    }
                });

                // Configure Debug options
                setuplogging(config_src.debug);

                var viewModules = [];
                var models = [];
                var templates = [];
                var options = {};
                var config = {};

                // collect list of view modules
                _.each(config_src.views, function(view) {
                    viewModules.push(view);
                }, this);

                // collect list of model modules
                _.each(config_src.models, function(model) {
                    models.push(model);
                }, this);

                // collect list of template modules
                _.each(config_src.templates, function(tmpl) {
                    templates.push(tmpl.template);
                }, this);

                // assure all required modules are available and start the main app
                root.require([].concat(
                    config_src.mapConfig.visualizationLibs,     //Visualizations such as Openlayers or GlobWeb
                    config_src.mapConfig.module,                //Which module should be used for map visualization
                    config_src.mapConfig.model,                 //Which model to use for saving map data
                    viewModules,                            //All "activated" views are loaded
                    models,
                    templates
                ), function(){
                    App.configure(config_src);
                    App.start();
                });

            }
        });
    }

	var err_callback = function(err) {
        console.log("uire failed!")
        console.log(err)
        window.alert( "Failed to load some of the dependencies.\n"+
                "This may be a temporary problem.\n"+
                "Click OK to reaload the client.\n\n"+
                "Reason: " + err.requireType + "\nModule(s): " + err.requireModules)
        location.reload(true)
    }

    // assure all required JS modules + the configuration are available
    // ... and trigger the main app's setup
    root.require(deps ,callback, err_callback);
}).call( this );
