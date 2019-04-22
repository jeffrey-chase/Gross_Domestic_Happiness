(function (window) {
  Promise.all([
    d3.csv('data/combined_data.csv'),
    d3.json('data/geo/countries.geo.json')
  ]).then((data) => {
    window.indicators = data[0];
    window.geoData = data[1];


    window.isoCodeToData = {};

    window.indicators.forEach(function (d) {
      window.isoCodeToData[d.ISO3] = d;
    })

    window.isoCodeToDataAllYears = {}
    window.indicators.forEach(function (d) {
      if (!(d.ISO3 in window.isoCodeToDataAllYears)) {
        window.isoCodeToDataAllYears[d.ISO3] = [];
      }
      window.isoCodeToDataAllYears[d.ISO3].push(d);
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
        window.isoCodeToData[e.properties.iso_a3].region = e.properties.subregion || 'Other';
      } catch (err) {
        window.isoCodeToData[e.properties.iso_a3] = {}
        window.isoCodeToData[e.properties.iso_a3].region = e.properties.subregion || 'Other';
      }
    });

    window.indicators.forEach((e) => {
      e.region = window.isoCodeToData[e.ISO3].region;
    });

    window.nested = d3.nest().key(function (d) {
        return d['country'];
      })
      .key(function (d) {
        return d['year'];
      })
      .rollup(function (v) {
        return {
          happiness_rank: v[0].happiness_rank,
          ISO3: v[0].ISO3,
          region: v[0].region
        };
      })
      .entries(window.indicators);




    window.regionSummaries = d3.nest()
      .key(function (d) {
        return d.region;
      })
      .key(function (d) {
        return d.year;
      })
      .rollup(function (v) {
        return Math.floor(d3.mean(v, function (d) {
          return d.happiness_rank
        }));
      })
      .entries(window.indicators);


    window.regScale = d3.scaleOrdinal()
      .domain(window.regionSummaries.map((e) => e.key))
      .range(d3.quantize(d3.interpolateRainbow, 20))
    mapDraw();
    bumpChart();

    function resizer(e, cutoff) {
      if (window.innerWidth > 1000) {
        return false;
      }

      let newWidth = cutoff === 1000 ? 300 : 250;
      let newCutoff = cutoff === 1000 ? 800 : 600;

      let enlargeWidth = cutoff === 1000 ? 400 : 300;
      let enlargeCutoff = cutoff + 200;

      if (window.innerHeight < cutoff) {
        bumpChart(newWidth);
        window.onresize = (e) => {
          resizer(e, newCutoff)
        }
      } else {
        bumpChart(enlargeWidth);
        window.onresize = (e) => {
          resizer(e, enlargeCutoff)
        }
      }
    }

    window.onresize = function (e) {
      resizer(e, 1000)
    }
    d3.select('#aggregationSwitch').dispatch('click');
  })
})(window);
