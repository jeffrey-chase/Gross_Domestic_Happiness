(function (window) {
  Promise.all([
    d3.csv('data/combined_data.csv'),
    d3.json('data/geo/countries.geo.json')
  ]).then((data) => {
    window.indicators = data[0];
    window.geoData = data[1];

    window.nested = d3.nest().key(function (d) {
        return d['country'];
      })
      .key(function (d) {
        return d['year'];
      })
      .rollup(function (v) {
        return {
          happiness_rank: v[0].happiness_rank,
          ISO3: v[0].ISO3
        };
      })
      .entries(window.indicators);

    window.isoCodeToData = {};

    window.indicators.forEach(function (d) {
      window.isoCodeToData[d.ISO3] = d;
    })


    window.geoData.features.forEach((e) => {
      let polygon = e.geometry;
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
        e.properties.center = turf.pointOnFeature(largestPolygon);
      } else {
        e.properties.center = turf.pointOnFeature(polygon);
      }
      try {
        window.isoCodeToData[e.properties.iso_a3].region = e.properties.subregion;
      } catch (err) {
        window.isoCodeToData[e.properties.iso_a3] = {}
        window.isoCodeToData[e.properties.iso_a3].region = e.properties.subregion;
      }
    });

    let regions = window.indicators.forEach((e) => {
      e.region = window.isoCodeToData[e.ISO3].region;
    });
    
    window.regionSummaries = d3.nest()
      .key(function (d) {
        return d.region;
      })
      .key(function (d){
      return d.year;
    })
      .rollup(function (v) {
        return Math.floor(d3.mean(v, function(d) {return d.happiness_rank}));
      })
      .entries(window.indicators);

    bumpChart();
    mapDraw();
  })
})(window);
