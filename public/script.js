var points = [];
var drawLayer;
$.getJSON("./temp/carpark_data.json", function(data) {
    console.log(data);
    points = data.value;
    $(document).ready(function() {
        var southWest, northEast, startBounds, maxBounds;
        southWest = L.latLng(1.273429, 103.686218),
            northEast = L.latLng(1.438178, 103.967056),
            startBounds = L.latLngBounds(southWest, northEast),
            southWest = L.latLng(1.213019, 103.586655),
            northEast = L.latLng(1.484168, 104.040527),
            maxBounds = L.latLngBounds(southWest, northEast);

        map = L.map('mcmap', {
            crs: L.CRS.EPSG4326,
            maxBounds: maxBounds,
            maxBoundsViscosity: 1.0
        }).fitBounds(startBounds);

        var baseMap = L.tileLayer('//a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
            attribution: '',
            maxZoom: 17
        });

        var bounds = map.getBounds();
        var topLeft = map.latLngToLayerPoint(bounds.getNorthWest());
        var mapLayer = {
            onAdd: function(map) { // called during map.addLayer(mapLayer);
                map.on('viewreset moveend', drawLayer);
                setTimeout(drawLayer, 0);
            }
        };
        points = points.filter(function(p) {
            if(p.LotType === "Y") return false;
            try {
                var split = p.Location.split(' ');
                var latlng = new L.LatLng(split[0], split[1]);
                p['displayName'] = _.truncate(_.startCase(_.toLower(p.Development)), {length: 20,  'omission': '...'});

                p['latlng'] = latlng;
                p['pt'] = map.latLngToLayerPoint(latlng);
            } catch (e) {
                console.log("--> Erroneous point with no location: ", p);
                return false;
            }
            return true;
        });

        function conditionalColor(d) {
            let lots = d.AvailableLots;
            if(lots < 10) { return '#db0808' }
            if(lots < 30) { return 'yellow' }
            return 'green';
        }

        var d3OverlayOptions = { zoomHide: false, zoomDraw: true };
        var first = true;
        var d3Overlay = L.d3SvgOverlay(function(selection, projection){
            if(first) {
                var circleSvgs = selection.selectAll('circle').data(points).enter();
                circleSvgs.append('circle')
                    .attr('cx', function(d) { return projection.latLngToLayerPoint(d.latlng).x })
                    .attr('cy', function(d) {console.log('re'); return projection.latLngToLayerPoint(d.latlng).y })
                    .attr('fill', conditionalColor)
                    //.attr('stroke', conditionalColor)
                    .attr('stroke-width', '1.2')
                    .attr('r', function(e) {
                        console.log('redarw');
                        return map.getZoom() / 9;
                    });

                first = false;
            }
            var circleSvgs = selection.selectAll('circle');
            console.log(circleSvgs)
            circleSvgs
                .attr('stroke-width', '1.2')
                .attr('r', function(e) {
                    return 2.5/projection.scale;
                });
        }, d3OverlayOptions);
        d3Overlay.addTo(map);

        // filtering and projecting
        drawLayer = function() {
            bounds = map.getBounds();
            topLeft = map.latLngToLayerPoint(bounds.getNorthWest());

            // remove old overlay
            $("#overlay").remove();

            // create overlay
            var svg = d3.select(map.getPanes().overlayPane).append("svg")
                .attr('id', 'overlay')
                .attr("class", "leaflet-zoom-hide")
                .style("width", map.getSize().x + 'px')
                .style("height", map.getSize().y + 'px')
                .style("margin-left", topLeft.x + "px")
                .style("margin-top", topLeft.y + "px");

            //// view only MRTs
            //var filteredPoints = points.filter(function(p) {
                //return p.network.toLowerCase().includes("mrt");
            //});

            points = points.filter(function(p) {
                if(p.LotType === "Y") return false;
                try {
                    var split = p.Location.split(' ');
                    var latlng = new L.LatLng(split[0], split[1]);
                    p['latlng'] = latlng;
                    p['pt'] = map.latLngToLayerPoint(latlng);
                } catch (e) {
                    console.log("--> Erroneous point with no location: ", p);
                    return false;
                }
                return true;
            });

            var svgPoints = svg.selectAll('g')
                .data(points)
                .enter()
                .append('g')
                .attr('transform', 'translate(' + (-topLeft.x) + ',' + (-topLeft.y) + ')');
            if(map.getZoom() > 14) {
                svgPoints.append('text')
                    .attr('transform', function(d) {
                        return "translate(" + (d.pt.x + 5) + ", " + d.pt.y + ")";
                    })
                    .attr('stroke', 'black')
                    .attr('stroke-width', '1')
                    .text(function(d) { return d.AvailableLots + ' ' + "" })
            }
            if(map.getZoom() > 15) {
                svgPoints.append('text')
                    .attr('transform', function(d) {
                        return "translate(" + (d.pt.x + 5) + ", " + (d.pt.y+12) + ")";
                    })
                    .attr('stroke', 'black')
                    .attr('fill', 'black')
                    .attr('fill-opacity', '0.4')
                    .attr('stroke-opacity', '0.4')
                    .text(function(d) { return d.displayName })
            }
        }
        baseMap.addTo(map);
        map.addLayer(mapLayer);
        drawLayer();
    });
});
