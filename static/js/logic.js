let earthquakeurl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
let techurl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

d3.json(earthquakeurl).then(function(data){
    console.log(data)

    createFeatures(data.features)

});

function markersize(magnitude){
   return Math.sqrt(magnitude)* 5
};

function pickingColor(depth){
    if (depth < 10) return "#00ff66";
    else if (depth < 30) return "#91ff00";
    else if (depth < 50) return "#eeff00";
    else if (depth < 70) return "#ffa200";
    else if (depth < 90) return "#ff5e00";
    else return "#FF0000";
}

function createFeatures(earthquakeData){

    function onEachFeature(feature, layer) {
    layer.bindPopup("Magnitude: "+feature.properties.mag+ "<br>Depth: "+feature.geometry.coordinates[2]+"<br>Location: "+feature.properties.place);
    }

    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature:onEachFeature,

        pointToLayer: function(feature, latlng){

            let markers = { 
                fillOpacity: 0.7,
                fillColor: pickingColor(feature.geometry.coordinates[2]),
                color: "black",
                radius: feature.properties.mag* 25000,
                weight : 0.5

            }
            return L.circle(latlng, markers);
        }

    })
    createMap(earthquakes);
}

function createMap(earthquakes) {
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    techPlates= new L.layerGroup();

        d3.json(techurl).then(function(plates){
            L.geoJSON(plates,{
                color: "orange",
                weight: 2
            }).addTo(techPlates);
        });

        let baseMaps = {
            "street": street,
            "topo": topo,
        };

        let overlayMaps = {
            "Earthquakes": earthquakes,
            "Techtonic Plates": techPlates
        };

    let myMap = L.map("map",{
        center:[ 
            37.09, -95.71
        ],
        zoom: 5,
        layers: [street,earthquakes, techPlates]
    });

    let legend = L.control({position:"bottomright"});
    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "info Legend"),
        depth = [-10, 10, 30, 50, 70, 90];
       
        div.innerHTML += "<h3 style='text-align: center'>Depth</h3>"

        for (let i = 0; i < depth.length; i++){
            div.innerHTML +=
            '<i style="background:' + pickingColor(depth[i]+1) + '"></i> ' + depth[i] + (depth[i+1]? '&ndash;' + depth[i+1] + '<br>': '+')
        }
        return div;
    };
    legend.addTo(myMap)

    L.control.layers(baseMaps,overlayMaps, {
        collapsed: false
    }).addTo(myMap);
};
