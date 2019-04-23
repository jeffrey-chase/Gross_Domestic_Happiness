function mapDraw() {
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

  let info = window.indicators;

  info = info.filter(function (d) {
    return d.year === "2018";
  });

  let mapping = window.isoCodeToData;
  let geoData = window.geoData;

  function refreshLayers(selectedVar) {
    if (selectedVar === undefined) {
      selectedVar = 'happiness_rank';
    }

    let fillScale = d3.scaleLinear()
      .domain(d3.extent(info.map(function (d) {
        return +d[selectedVar];
      })))
      .range([1, 0])

    let getFill = function (d) {
      if (d === undefined || isNaN(d)) {
        return '#555';
      } else {
        return d3.interpolateInferno(fillScale(d));

      }
    }

    const colorScale = window.regScale;

    function getColor(d) {
      return d3.rgb(colorScale(d)).brighter().hex();

    }


    function countryStyle(feature) {
      let fill = '#555';
      try {
        fill = getFill(+mapping[feature.properties.iso_a3][selectedVar]);
      } catch (err) {
        fill = '#555'
      }

      return {
        weight: 2,
        opacity: 0.6,
        color: getColor(feature.properties.subregion),
        dashArray: '1',
        fillOpacity: 1,
        fillColor: fill
      };
    }


    let countriesLayer = L.geoJson(geoData, {
      style: countryStyle
    });

    window.isoCodeToLayer = {};
    countriesLayer.eachLayer(function (l) {
      let id = "[data-cCode=" + l.feature.properties.iso_a3 + "]";
      window.isoCodeToLayer[l.feature.properties.iso_a3] = l;

      let center = l.feature.properties.center;
      l.on('mouseover', function (e, fromChart) {

        let name = l.feature.properties.name;

        let rank;
        let score;
        let content;
        let variable = selectedVar.toLowerCase().split('_')
        variable = variable.map((e) => {
          return e[0].toUpperCase() + e.slice(1);
        }).join(' ');

        try {
          rank = mapping[l.feature.properties.iso_a3].happiness_rank || 'NA';
          score = mapping[l.feature.properties.iso_a3][selectedVar] || 'NA';

          content =
            "<div class='flag-container'>" +
            "<img src='images/flags/svg/" + l.feature.properties.iso_a2.toLowerCase() + ".svg'>" +
            "</div>" +
            "<h4>" + name +
            " <span class='popup-value'>(#" + rank + ")</span></h4>" +
            "<p>" + variable +
            " Value: <span class='popup-value'>" +
            score +
            "</span></p>"

          if (isNaN(score)) {
            rank = "NA";
            score = "NA";
            content = "<h4>" + name + "</h4>" +
              "<p> There is no data available for this country </p>"
          }
        } catch (err) {

        }

        let popup = L.popup()
          .setLatLng(new L.LatLng(center.geometry.coordinates[1],
            center.geometry.coordinates[0]))
          .setContent(content).openOn(mymap);
        this.setStyle({
          fillOpacity: 1,
          weight: 4,
          dashArray: null
        });


        d3.select(".label" + id).dispatch('mouseover', {detail: {fromMap: true}});

      });

      l.on('mouseout', function (e) {
        countriesLayer.resetStyle(e.target);
        this.closePopup();
        d3.select(".label" + id).dispatch('mouseout');
      });


      l.on('click', function (e) {
        let label = d3.select(".label" + id);
        label.dispatch('click');

        label
          .transition()
          .style('fill', 'rgb(242,178,32)')
          .style('font-weight', 'bold')
          .duration(1000)
          .delay(100)
          .on('end', function () {
            d3.select(this).transition()
              .style('fill', null)
              .duration(1000)
              .delay(0);
            label.dispatch('mouseover')
          });


        let svg = document.querySelector('#bump-chart svg');

        let elemY = parseFloat(document.querySelector(".label" + id).getAttribute('y'));
        let svgY = svg.getBoundingClientRect().y
        let y = -document.body.getBoundingClientRect().top + (svgY + elemY);

        let middle = (window.innerHeight -
          parseFloat(window.getComputedStyle(document.querySelector('header')).height)) / 3;

        let newPosition = y - middle;

        window.scrollTo({
          top: newPosition,
          behavior: 'smooth'
        });
      });
    });

    countriesLayer.addTo(mymap).setZIndex(2);

    let fillScale2 = d3.scaleSequential(d3.interpolateInferno)
      .domain(d3.extent(info.map(function (d) {
        return +d[selectedVar];
      })).reverse());

    let colorLegend = d3.legendColor()
      .shapeWidth(30)
      .cells(8)
      .ascending(false)
      .orient('vertical')
      .scale(fillScale2);

    let parent = d3.select("#maparea .leaflet-top.leaflet-left")
    parent.select('svg').remove();


    //      legend.append('rect')
    //        .attr('width', '100%')
    //        .attr('height', '100%')
    //        .attr('fill', 'black');


    let legend = parent.append("svg")
      .attr("id", "legend")
      .attr('z-index', 1001)
      .attr('width', '100%')
      .attr('height', 500)
      .style('padding', '15px');


    legend.append('text')
      .attr('id', 'legend-title')
      .text(selectedVar.toUpperCase().replace('_', ' '))
      .attr('fill', 'white')
      .attr('x', 0)
      .attr('y', 90);

    legend.append("g")
      .attr("transform", "translate(10, 100)")
      .call(colorLegend);
  }

  refreshLayers('happiness_score');
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

  let selected = 'happiness_score'

  d3.selectAll('#mapcontrols > button').on('click', function (e) {
    let newSelected = d3.select(this).node().getAttribute('data-var');
    if (newSelected !== selected) {
      selected = newSelected;
      refreshLayers(selected);
      d3.select('.picked').classed('picked', false);
      d3.select(this).classed('picked', true);
    }
  });
}
