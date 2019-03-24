window.onload = function () {
  var au = new L.LatLng(0, 0);
  var mymap = L.map('maparea').setView(au, 1.5);


  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    minZoom: 1,
    maxZoom: 19
  }).addTo(mymap).setZIndex(1);


  Promise.all([
      d3.json('data/geo/countries.geo.json'),
      d3.csv('data/combined_data.csv')
    ])
    .then(function (data) {
      let info = data[1];
      info = info.filter(function (d) {
        return d.year === "2018";
      });

      let mapping = {};

      info.forEach(function (d) {
        mapping[d.country] = +d.happiness_score;
      })

      let fillScale = d3.scaleLinear()
        .domain(d3.extent(info.map(function (d) {
          return +d.happiness_score;
        })))
        .range([1, 0])

      let getColor = function (d) {
        if (d === undefined) {
          return '#555';
        } else {
          return d3.interpolateMagma(fillScale(d));

        }
      }


      function countryStyle(feature) {
        return {
          weight: 1,
          opacity: 1,
          color: 'white',
          dashArray: '1',
          fillOpacity: 0.7,
          fillColor: getColor(mapping[feature.properties.name])
        };
      }

      let countriesLayer = L.geoJson(data[0], {
        style: countryStyle
      });


      countriesLayer.eachLayer(function (l) {
        l.bindPopup(
          "<h4>" + l.feature.properties.name + "</h4>" +
          "<p> Happiness Value: <span class='popup-value'>" +
          mapping[l.feature.properties.name] +
          "</span></p>"
        );
        let polygon = l.feature.geometry;
        let center;

        if (polygon.type === "MultiPolygon") {
          let largestArea = 0;
          let largestPolygon;
          for (let i = 0; i < polygon.coordinates.length; i++) {
            let shape = turf.polygon(polygon.coordinates[i]);
            let area = turf.area(shape);
            if (area > largestArea) {
              largestArea = area;
              largestPolygon = shape;
            }
          }
          center = turf.centroid(largestPolygon);
        } else {
          center = turf.centroid(polygon);
        }
        console.log(center);
        l.on('mouseover', function (e) {
          var popup = L.popup()
            .setLatLng(new L.LatLng(center.geometry.coordinates[1],
              center.geometry.coordinates[0]))
            .setContent("<h4>" + l.feature.properties.name + "</h4>" +
              "<p> Happiness Value: <span class='popup-value'>" +
              mapping[l.feature.properties.name] +
              "</span></p>"
            ).openOn(mymap);
          //            this.openPopup();
        });
        l.on('mouseout', function (e) {
          this.closePopup();
        });
      });

      countriesLayer.addTo(mymap);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(mymap).setZIndex(10);
    })

}
