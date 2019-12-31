/* global $, console, sap, window */
(function() {
    "use strict";
    //var JSONModel = sap.ui.model.json.JSONModel;

    var delayedExecution = function(originalFunction, delay) {
        var timerId = null;
        var decorator = function() {
            var args = arguments;
            var that = this;
            if (timerId) {
                window.clearTimeout(timerId);
            }
            timerId = window.setTimeout(function() {
                timerId = null;
                originalFunction.apply(that, args);
            }, delay);
        };
        decorator.abort = function() {
            if (timerId) {
                window.clearTimeout(timerId);
            }
        };
        return decorator;
    };

    sap.ui.core.Control.extend('sap.ushell.renderers.fiori2.search.controls.SearchResultMap', {

        metadata: {
            aggregations: {
                "_map": {
                    type: "sap.ui.core.Control",
                    multiple: false,
                    visibility: "hidden"
                }
            }
        },

        appId: "yPAjYBbnvu87r-bURAc-",
        appCode: "m3WAJo5rFmc5BG1IxJ3d2w",

        init: function() {

            var oMapConfig = {
                "MapProvider": [{
                    "name": "HEREMAPS",
                    "type": "",
                    "description": "",
                    "tileX": "256",
                    "tileY": "256",
                    "maxLOD": "20",
                    "copyright": "Tiles Courtesy of HERE Maps",
                    "Source": [{
                        "id": "s1",
                        "url": "http://1.maps.nlp.nokia.com/maptile/2.1/maptile/newest/normal.day/{LOD}/{X}/{Y}/256/png?app_code=" + this.appCode + "&app_id=" + this.appId
                    }, {
                        "id": "s2",
                        "url": "http://2.maps.nlp.nokia.com/maptile/2.1/maptile/newest/normal.day/{LOD}/{X}/{Y}/256/png?app_code=" + this.appCode + "&app_id=" + this.appId
                    }]
                }],
                "MapLayerStacks": [{
                    "name": "DEFAULT",
                    "MapLayer": {
                        "name": "layer1",
                        "refMapProvider": "HEREMAPS",
                        "opacity": "1.0",
                        "colBkgnd": "RGB(255,255,255)"
                    }
                }]
            };

            var geoMap = new sap.ui.vbm.GeoMap({
                legendVisible: false,
                scaleVisible: false,
                refMapLayerStack: 'DEFAULT',
                mapConfiguration: oMapConfig,
                width: '100%',
                height: '100%',
                zoomChanged: this.zoomChanged.bind(this),
                centerChanged: this.centerChanged.bind(this)
            });

            this.setAggregation('_map', geoMap);

            this.loadObjects = delayedExecution(this.loadObjects, 500);

        },

        splitCoordinates: function(coordinates) {
            var coords = coordinates.split(';');
            return [parseFloat(coords[0]), parseFloat(coords[1])];
        },

        deg2rad: function(deg) {
            return Math.PI * deg / 180;
        },

        rad2deg: function(rad) {
            return 180 * rad / Math.PI;
        },

        mercator: function(point) {
            var long = point[0];
            var lat = point[1];
            var radius = 6378137.0;
            var mercatorLong = this.deg2rad(long) * radius;
            var mercatorLat = Math.log(Math.tan(this.deg2rad((90 + lat) / 2))) * radius;
            return [mercatorLong, mercatorLat];
        },

        gps: function(point) {
            var long = point[0];
            var lat = point[1];
            var radius = 6378137.0;
            var gpsLong = this.rad2deg(long / radius);
            var gpsLat = 2 * this.rad2deg(Math.atan(Math.exp(lat / radius))) - 90;
            return [gpsLong, gpsLat];
        },

        createPolygonFromViewport: function(viewport) {
            var upperLeft = this.mercator(this.splitCoordinates(viewport.upperLeft));
            var lowerRight = this.mercator(this.splitCoordinates(viewport.lowerRight));
            var polygon = {
                "type": "Polygon",
                "coordinates": [
                    []
                ]
            };
            var points = polygon.coordinates[0];
            points.push(upperLeft, [lowerRight[0], upperLeft[1]],
                lowerRight, [upperLeft[0], lowerRight[1]],
                upperLeft);
            return polygon;
        },

        zoomChanged: function(event) {
            //var viewport = event.getParameter('viewportBB');
            //var filter = this.createPolygonFromViewport(viewport);
            //this.loadObjects(filter);
        },

        centerChanged: function(event) {
            //var viewport = event.getParameter('viewportBB');
            //var filter = this.createPolygonFromViewport(viewport);
            //this.loadObjects(filter);
        },

        loadObjects: function(filter) {
            var that = this;
            $.get('/geofacet?type=grid&filter=' + encodeURIComponent(JSON.stringify(filter))).then(function(result) {
                result = JSON.parse(result);
                var spotList = [];
                // console.log('number cities', result.cities.length);
                for (var i = 0; i < result.cities.length; ++i) {
                    var city = result.cities[i];
                    if (!city.name) {
                        continue;
                    }
                    var gps = that.gps(city.location_3857.coordinates);
                    var long = gps[0];
                    var lat = gps[1];
                    var spot = new sap.ui.vbm.Spot({
                        position: long + ';' + lat + ';0',
                        text: city.name,
                        type: (city.type === 'single') ? sap.ui.vbm.SemanticType.Default : sap.ui.vbm.SemanticType.Warning
                    });
                    spotList.push(spot);
                }
                var spots = new sap.ui.vbm.Spots({
                    items: spotList
                });
                that.getAggregation('_map').removeAllVos();
                that.getAggregation('_map').addVo(spots);

            });
        },

        renderer: function(oRm, oControl) {
            oRm.write('<div ');
            oRm.writeControlData(oControl);
            oRm.addClass('sapUshellSearchResultMap');
            oRm.writeClasses();
            oRm.write('>');
            oRm.renderControl(oControl.getAggregation('_map'));
            oRm.write('</div>');
        }
    });

    /*
        var oModel = new JSONModel({

        });

    var map = new sap.es.Map();
    map.placeAt('uiArea');
 */
})();
