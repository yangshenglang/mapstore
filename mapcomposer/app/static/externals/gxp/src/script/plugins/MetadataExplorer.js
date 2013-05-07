/** *  Copyright (C) 2007 - 2012 GeoSolutions S.A.S. *  http://www.geo-solutions.it * *  GPLv3 + Classpath exception * *  This program is free software: you can redistribute it and/or modify *  it under the terms of the GNU General Public License as published by *  the Free Software Foundation, either version 3 of the License, or *  (at your option) any later version. * *  This program is distributed in the hope that it will be useful, *  but WITHOUT ANY WARRANTY; without even the implied warranty of *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the *  GNU General Public License for more details. * *  You should have received a copy of the GNU General Public License *  along with this program.  If not, see <http://www.gnu.org/licenses/>. */Ext.namespace("gxp.plugins");/** api: constructor *  .. class:: MetadataExplorer(config) * *    Base class to  * *    ``...`` method. *       *	  Author: */gxp.plugins.MetadataExplorer = Ext.extend(gxp.plugins.Tool, {    /** api: ptype = gxp_metadataexplorer */    ptype: "gxp_metadataexplorer",    id: "metadataexplorer",    /** private: property[target]     *  ``Object``     *  The object that this plugin is plugged into.     */    cswconfig: null,    /** private: method[constructor]     */    constructor: function (config) {        this.initialConfig = config;        Ext.apply(this, config);        gxp.plugins.MetadataExplorer.superclass.constructor.apply(this, arguments);    },    /** api: method[init]     *  :arg target: ``Object`` The object initializing this plugin.     */    /*init: function(target) {		gxp.plugins.MetadataExplorer.superclass.init.apply(this, arguments);        this.target = target;    },*/    /** api: method[addActions]     */    /*addActions: function(config) {        var actions = [{            text: this.buttonText,            menuText: this.menuText,            iconCls: this.iconCls,            tooltip: "Metadata Explorer",            handler: function() {                this.addOutput();            },            scope: this        }];        return gxp.plugins.MetadataExplorer.superclass.addActions.apply(this, [actions]);    },*/    addOutput: function (config) {        var target = this.target,            me = this;                    var extent = app.mapPanel.map.getExtent();                if (extent)            this.cswconfig.initialBBox = {                minx: extent.left,                miny: extent.bottom,                maxx: extent.right,                maxy: extent.top        };        this.output = gxp.plugins.MetadataExplorer.superclass.addOutput.apply(this, [{                xtype: 'panel',                region: "center",                layout: "fit",                                //id: 'metadata',                deferredRender: false,                autoScroll: true,                listeners: {                    scope: this,                                        afterrender: function (panel) {                        var configure = this.cswconfig;                        var viewer = app;                        // //////////////////////////////////////////////////////////////////////////                        // Retrieve the language code to initialize the metadata explorer i18n.                        // //////////////////////////////////////////////////////////////////////////                        var query = location.search;                        if (query && query.substr(0, 1) === "?") {                            query = query.substring(1);                        }                        var url = Ext.urlDecode(query);                        var code = url.locale || this.defaultLanguage;                        // //////////////////////////////////                        // Loads bundle for i18n messages                        // //////////////////////////////////                        i18n = new Ext.i18n.Bundle({                            bundle: "CSWViewer",                            path: "externals/csw/i18n",                            lang: code == 'en' ? "en-EN" : (code == 'de' ? "de-DE" : (code == 'fr' ? "fr-FR" : "it-IT"))                        });                        i18n.onReady(function () {                            //                            // Declares a panel for querying CSW catalogs                            //                            var cswPanel = new CSWPanel({                                scope: this,                                config: configure,                                listeners: {                                    zoomToExtent: function (layerInfo) {                                        var map = viewer.mapPanel.map;                                        var bbox = layerInfo.bbox;                                        if (bbox) {                                            //                                            // TODO: parse the urn crs code (like "urn:ogc:def:crs:::WGS 1984") inside the CSW BBOX tag.                                             //                                            bbox.transform(                                                new OpenLayers.Projection("EPSG:4326"),                                                new OpenLayers.Projection(map.projection));                                            map.zoomToExtent(bbox);                                        } else {                                            Ext.Msg.show({                                                title: viewer.cswZoomToExtent,                                                msg: viewer.cswZoomToExtentMsg,                                                width: 300,                                                icon: Ext.MessageBox.WARNING                                            });                                        }                                    },                                    viewMap: function (el) {                                        var mask = new Ext.LoadMask(Ext.getBody(), {                                            msg: this.cswMsg                                        });                                        mask.show();                                        var mapInfo = el.layers;                                        var uuid = el.uuid;                                        var gnURL = el.gnURL;                                        var title = el.title;                                        for (var i = 0; i < mapInfo.length; i++) {                                            var wms = mapInfo[i].wms;                                            var source;                                            for (var id in viewer.layerSources) {                                                var src = viewer.layerSources[id];                                                var url = src.initialConfig.url;                                                //                                                // Checking if source url aldready exists                                                //                                                if (url && url.indexOf(wms) != -1)                                                    source = src;                                            }                                            var layer = mapInfo[i].layer;                                            //                                            // Adding a new record to existing store                                            //                                            var addLayer = function (s) {                                                var record = s.createLayerRecord({                                                    name: layer,                                                    title: title,                                                    source: s.id, // TODO: to check this                                                    gnURL: gnURL,                                                    uuid: uuid                                                });                                                var layerStore = viewer.mapPanel.layers;                                                if (record) {                                                    layerStore.add([record]);                                                    modified = true;                                                }                                            }                                            //                                            // Adding the sources only if exists                                            //                                            if (!source) {                                                var sourceOpt = {                                                    config: {                                                        url: wms                                                    }                                                };                                                source = viewer.addLayerSource(sourceOpt);                                                //                                                // Waiting GetCapabilities response from the server.                                                //                                                source.on('ready', function () {                                                    addLayer(source);                                                    mask.hide();                                                });                                                //                                                // To manage failure in GetCapabilities request (invalid request url in                                                 // GeoNetwork configuration or server error).                                                //                                                source.on('failure', function (src, msg) {                                                    //                                                    // Removing layer source from sources ?                                                    //                                                    //for (var id in app.layerSources) {                                                    //    if(id.indexOf(source.id) != -1)                                                    //        app.layerSources[id] = null;                                                        //}                                                      mask.hide();                                                    Ext.Msg.show({                                                        title: 'GetCapabilities',                                                        msg: msg + viewer.cswFailureAddLayer,                                                        width: 300,                                                        icon: Ext.MessageBox.ERROR                                                    });                                                });                                            } else {                                                addLayer(source);                                                mask.hide();                                            }                                        }                                    }                                }                            });                            //                            // Overridding addListenerMD method to show metadata inside a new Tab.                            //                            cswPanel.cswGrid.plugins.tpl.addListenerMD = function (id, values) {                                Ext.get(id).on('click', function (e) {                                    //                                    // open GN inteface related to this resource                                    //                                    if (values.identifier) {                                        viewer.viewMetadata(                                            values.metadataWebPageUrl,                                            values.identifier,                                            values.title);                                    } else {                                        //                                        // Shows all DC values. TODO create dc visual                                        //                                        var text = "<ul>";                                        var dc = values.dc;                                        //eg. URI                                        for (var el in dc) {                                            if (dc[el] instanceof Array) {                                                //cicle URI array                                                for (var index = 0; index < dc[el].length; index++) {                                                    //cicle attributes of dc                                                    if (dc[el][index].value) {                                                        text += "<li><strong>" + el + ":</strong> ";                                                        for (name in dc[el][index]) {                                                            text += "<strong>" + name + "</strong>=" + dc[el][index][name] + " ";                                                        }                                                        text += "</li>";                                                    } else if (el == "abstract") {                                                        text += "<li><strong>abstract:</strong> " + dc[el][index] + "</li> ";                                                    } else {                                                        //DO NOTHING                                                    }                                                }                                            }                                        }                                        dc += "</ul>";                                        var dcPan = new Ext.Panel({                                            html: text,                                            preventBodyReset: true,                                            autoScroll: true,                                            autoHeight: false,                                            width: 600,                                            height: 400                                        });                                        var dcWin = new Ext.Window({                                            title: "MetaData",                                            closable: true,                                            width: 614,                                            resizable: false,                                            draggable: true,                                            items: [                                                dcPan                                            ]                                        });                                        dcWin.show();                                    }                                });                            };                            panel.add(cswPanel);                            panel.doLayout(false, true);                        });                    }                }            }        ]);    }});Ext.preg(gxp.plugins.MetadataExplorer.prototype.ptype, gxp.plugins.MetadataExplorer);