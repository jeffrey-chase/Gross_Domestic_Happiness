let center = new L.LatLng(30, 0);
const mymap = L.map('maparea', {
  zoomSnap: 0.25
});

const cornerNE = L.LatLng(50, 180);
const cornerSW = L.LatLng(-50, -180);
const bounds = L.latLngBounds(cornerSW, cornerNE);

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  minZoom: 1,
  maxZoom: 5,
  maxBounds: bounds,
  maxBoundsViscosity: 1.0
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

    let getFill = function (d) {
      if (d === undefined) {
        return '#555';
      } else {
        return d3.interpolateMagma(fillScale(d));

      }
    }

    const colorScale = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, 12));

    function getColor(d) {
      return d3.rgb(colorScale(d)).brighter().hex();

    }

    function countryStyle(feature) {
      return {
        weight: 2,
        opacity: 0.6,
        color: getColor(feature.properties.subregion),
        dashArray: '1',
        fillOpacity: 0.8,
        fillColor: getFill(mapping[feature.properties.name])
      };
    }

    function countryStyleEmphasized(feature) {
      return {
        weight: 3,
        opacity: 1,
        color: 'white',
        dashArray: '1',
        fillOpacity: 0.8,
        fillColor: getColor(mapping[feature.properties.name])
      };
    }

    let countriesLayer = L.geoJson(data[0], {
      style: countryStyle
    });

//    chartMapMapping = {}

    countriesLayer.eachLayer(function (l) {
//      chartMapMapping[l.feature.properties.name] = l;
      let polygon = l.feature.geometry;
      let center;
      let id = makeSafeId(l.feature.properties.name) + "-label";
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
      
      l.on('mouseover', function (e) {
        let popup = L.popup()
          .setLatLng(new L.LatLng(center.geometry.coordinates[1],
            center.geometry.coordinates[0]))
          .setContent(
            "<h4>" + l.feature.properties.name + "</h4>" +
            "<p> Happiness Value: <span class='popup-value'>" +
            mapping[l.feature.properties.name] +
            "</span></p>"
          ).openOn(mymap);
        this.setStyle({
          fillOpacity: 1,
          weight: 4,
          dashArray: null
        });
        d3.select("#" + id).dispatch('mouseover');

      });

      l.on('mouseout', function (e) {
        countriesLayer.resetStyle(e.target);
        this.closePopup();
        d3.select("#" + id).dispatch('mouseout');

      });


      l.on('click', function (e) {
        let label = d3.select("#" + id);
        label.dispatch('click');
        console.log(id);
        console.log(label);
        label
          .transition()
          .style('fill', 'rgb(242,178,32)')
          .style('font-size', '8pt')
          .style('font-weight', 'bold')
          .duration(1000)
          .delay(200)
          .on('end', function () {
            d3.select(this).transition()
              .style('fill', null)
              .style('font-size', null)
              .duration(1000)
              .delay(100);
          });


        let svg = document.querySelector('#bump-chart svg');
        console.log('scroll');

        let elemY = parseFloat(document.getElementById(id).getAttribute('y'));
        console.log(elemY);
        let svgY = svg.getBoundingClientRect().y
        let y = -document.body.getBoundingClientRect().top + (svgY + elemY);

        let middle = (window.innerHeight -
          parseFloat(window.getComputedStyle(document.querySelector('header')).height)) / 3;

        let newPosition = y - middle;

        console.log(y + ' ' + middle);
        window.scrollTo({
          top: newPosition,
          behavior: 'smooth'
        });
      });
    });

    countriesLayer.addTo(mymap).setZIndex(2);
    mymap.createPane('labels');
    mymap.getPane('labels').style.zIndex = 650;
    mymap.getPane('labels').style.pointerEvents = 'none';


    let labels = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      minZoom: 1,
      maxZoom: 5,
      maxBounds: bounds,
      maxBoundsViscosity: 1.0,
      pane: 'labels'
    }).addTo(mymap);

    mymap.setView(center, 1.25);
     let legend = d3.select("body").append("svg")
        .attr("id","legend");
     let fillScale2 = d3.scaleLinear()
      .domain(d3.extent(info.map(function (d) {
        return +d.happiness_score;
      })))
      .range([d3.interpolateMagma(1), d3.interpolateMagma(0)]);
     let colorLegend = d3.legendColor()
            .shapeWidth(30)
            .orient('vertical')
            .scale(fillScale2);

        // .shapePadding(5)
        // .shapeWidth(50)
        // .shapeHeight(20)
        // .labelOffset(12);
       d3.select("#legend").append("g")
        // .attr("transform", "translate(352, 60)")
        .call(colorLegend);
  })
