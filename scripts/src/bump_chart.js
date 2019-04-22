"use strict";

function bumpChart() {
  // Parent element to contain the svg
  const parent = d3.select('#bump-chart');

  // Total dimensions of the svg/chart
  const width = 400;
  const height = 2000;

  // Svg to draw the chart on
  const svg = parent.append('svg')
    .attr('width', width + "px")
    .attr('height', height + "px");

  //    let zoomHandler = d3.zoom()
  //      .scaleExtent([1, 5])
  //      .on('zoom', zoom);
  //    svg.call(zoomHandler);
  //
  //  let noZoom = true;
  //  window.addEventListener('keydown', (e) => {
  //    if (e.shiftKey) {
  //      console.log("shift down")
  //      noZoom = false;
  //      console.log('nozoom: ' + noZoom);
  //
  //    }
  //
  //  });
  //  window.addEventListener('keyup', (e) => {
  //    noZoom = true;
  //    //    zoomHandler.on("zoom", null)
  //    //    zoomHandler.scaleTo(1).translateTo([0, 0]).customEvent(svg);
  //  });


  let g = svg.append('g')


  //  function zoom(e) {
  //    console.log(d3.event.sourceEvent.shiftKey);
  //    if (d3.event.sourceEvent.shiftKey === true) {
  //      g.attr("transform", d3.event.transform);
  //
  //    }
  //  }

  let data = window.indicators;
  // Creates a version of the data grouped by country then year
  let nested = window.nested;

  const yearGrab = function (d) {
    return +d['year'];
  }

  const xScale = d3.scaleLinear()
    .domain([2015, 2018])
    .range([50, width - 120]);

  const yScale = d3.scaleLinear()
    .domain([1, d3.max(data, function (d) {
      return +d['happiness_rank']
    })])
    .range([50, height - 30]);

  let regionValues = {}

  window.regionSummaries.forEach((e) => {
    regionValues[e.key] = e.values;
  });

  const regScale = window.regScale;

  const regionScale = function (d) {
    return d3.color(regScale(d)).brighter().hex();
  }

  const colorScale = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, 20));

  let xaxis = d3.axisBottom()
    .scale(xScale)
    .ticks(4)
    .tickSize(-(height - 60))
    .tickFormat(d3.format(""));

  let xaxis2 = d3.axisTop()
    .scale(xScale)
    .ticks(4)
    .tickSize(0)
    .tickFormat(d3.format(""));

  let yaxis = d3.axisLeft()
    .scale(yScale)
    .ticks(nested.length)
    .tickSize(-(width - 150))
    .tickFormat(d3.format(""));

  let y2axis = d3.axisLeft()
    .scale(yScale)
    .ticks(16)
    .tickSize(2)

  g.append("g")
    .attr('class', 'y axis')
    .attr("transform", "translate(" + 30 + ", 0)")
    .call(yaxis);

  g.append("g")
    .attr("class", "x2 axis")
    .attr("transform", "translate(0," + (height - 20) + ")")
    .call(xaxis);

  g.append("g")
    .attr("class", "y2 axis")
    .attr("transform", "translate(" + 30 + ", 0)")
    .attr('display', 'none')
    .call(y2axis);

  let tooltip = d3.select('body')
    .append('div')
    .attr('id', 'tooltip')
    .attr('class', 'leaflet-popup')
    .style('position', 'absolute')
    .style('display', 'none');

  tooltip.append('div').attr('class', 'leaflet-popup-content-wrapper')
    .append('div').attr('class', 'leaflet-popup-content').attr('id', 'content');

  tooltip.append('div').attr('class', 'leaflet-popup-tip-container')
    .append('div').attr('class', 'leaflet-popup-tip');

  let circles = g.append('g').selectAll("circle.point").data(data).enter()
    .append('circle')
    .attr('r', 3.5)
    .attr('cx', function (d) {
      return xScale(+d['year']);
    })
    .attr('cy', function (d) {
      return yScale(+d['happiness_rank']);
    })
    .style('fill', function (d) {
      return colorScale(d['country']);
    })
    .attr('class', function (d) {
      return 'point ' + makeSafeId(d.country);
    })
    .attr('id', function (d) {
      return makeSafeId(d.country) + "-point";
    })
    .attr('data-cCode', function (d) {
      return d.ISO3;
    });
  console.log(regionValues);


  let labels = g.append('g').selectAll('text.label')
    .data(data.filter(function (d) {
      return +d.year === 2018;
    }))

  labels.enter()
    .append('text')
    .attr('x', function (d) {
      return xScale(+d['year']) + 10;
    })
    .attr('y', function (d) {
      return yScale(+d['happiness_rank']);
    })
    .attr('data-y', function (d) {
      return yScale(+d['happiness_rank']);
    })
    .text(function (d) {
      let year = +d['year'];
      return year === 2018 ? d['country'] : "";
    })
    .attr('alignment-baseline', 'central')
    .attr('class', function (d) {
      return 'label ' + makeSafeId(d.country);
    })
    .attr('id', function (d) {
      return makeSafeId(d.country) + "-label";
    })
    .attr('data-cCode', function (d) {
      return d.ISO3;
    })
    .attr('fill', 'white')
    .attr('data-fill', 'white')
    .attr('data-text', function (d) {
      return d.country;
    })
    .attr('data-reg-text', function (d) {
      return d.region === undefined || d.region === ''? 'Other' :d.region;
    })
    .attr('data-reg-fill', function (d) {
      return d.region === undefined || d.region === ''? '#aaa' : regionScale(d.region);
    })
    .attr('data-reg-y', function (d) {
      let data = regionValues[d.region];
      return yScale(data[3].value);
    });

  labels.exit().remove();
  //      lineMaker = d3.svg.line()
  //        .x(function(d){return +d['year']})
  //        .y(function(d){return +d['value']})
  //      

  //   Adding the paths 

  function pathMaker(d) {

    let start = "M " +
      xScale(+d.values[0].key) + " " +
      yScale(+d.values[0].value.happiness_rank) + ' ';
    let moves = "";
    for (let i = 1; i < d.values.length; i++) {
      moves += ("L " +
        xScale(+d.values[i].key) + " " +
        yScale(+d.values[i].value.happiness_rank) + " ");
    }
    return start + moves;

  }

  g.append('g').selectAll('path.rank').data(nested).enter()
    .append('path')
    .attr('d', pathMaker)
    .attr('stroke', function (d) {
      return colorScale(d['key']);
    })
    .attr('data-stroke', function (d) {
      return colorScale(d['key']);
    })
    .attr('data-reg-stroke', function (d) {
      return d.values[0].value.region === undefined || d.values[0].value.region === '' ?
        '#aaa': regionScale(d.values[0].value.region);
    })
    .attr('stroke-width', 3)
    .attr('fill', 'none')
    .attr('id', function (d) {
      return makeSafeId(d.key) + "-path"
    })
    .attr('class', function (d) {
      return 'rank ' + makeSafeId(d.key);
    })
    .attr('data-cCode', function (d) {
      return d.values[0].value.ISO3;
    })
    .attr('data-path', pathMaker)
    .attr('data-regPath', function (d) {
      let data = regionValues[d.values[0].value.region];
      console.log(d);
      let noiseMag = 1.75
      let start = "M " +
        xScale(+data[0].key) + " " +
        // yScale(+data[0].value + Math.random() * noiseMag - noiseMag / 2) + ' ';
        (yScale(+data[0].value + +d.values[0].value.happiness_rank / 70)) + ' ';
      let moves = "";
      for (let i = 1; i < d.values.length; i++) {
        moves += ("L " +
          xScale(+data[i].key) + " " +
          // yScale(+data[i].value + Math.random() * noiseMag - noiseMag / 2) + " ");
          (yScale(+data[i].value + +d.values[i].value.happiness_rank / 70)) + ' ');
      }
      return start + moves;
    });


  g.append('g').selectAll('path.region').data(window.regionSummaries)
    .enter()
    .append('path')
    .attr('class', 'region')
    .attr('d', function (d) {
      let start = "M " +
        xScale(+d.values[0].key) + " " +
        yScale(+d.values[0].value) + ' ';
      let moves = "";
      for (let i = 1; i < d.values.length; i++) {
        moves += ("L " +
          xScale(+d.values[i].key) + " " +
          yScale(+d.values[i].value) + " ");
      }
      return start + moves;
    })
    //    .attr('data-path', )
    .attr('stroke', '#fff')
    .attr('stroke-width', 3)
    .attr('fill', 'none')
    .attr('id', function (d) {
      return makeSafeId(d.key) + "-path"
    })
    .attr('class', function (d) {
      return 'rank ' + makeSafeId(d.key);
    })
    .attr('data-cCode', function (d) {
      return d.values[0].value.ISO3;
    });

  let xaxisContainer = g.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (30) + ")")

  xaxisContainer.append('rect')
    .attr('fill', 'black')
    .attr('width', width)
    .attr('height', 30)

  xaxisContainer.call(xaxis2);





  let regions = false;

  function attrSwitch(self, attr, regAttr) {
    if (regions) {
      return self.attr(regAttr);
    } else {
      return self.attr(attr);
    }
  }

  d3.select('#aggregationSwitch').on('click', function (e) {
    regions = !regions;
    svg.selectAll('path.rank')
      .transition()
      .duration(2000)
      .delay(500)
      .attr('d', function (d) {
        let self = d3.select(this);
        return attrSwitch(self, 'data-path', 'data-regPath');
      })
      .attr('stroke', function (d) {
        let self = d3.select(this)
        return attrSwitch(self, 'data-stroke', 'data-reg-stroke');
      })
      .attr('stroke-width', regions ? 0.1 : 3);

    svg.selectAll('.label')
      .transition()
      .duration(2000)
      .delay(500)
      .attr('fill', function (d) {
        let self = d3.select(this);
        return attrSwitch(self, 'data-fill', 'data-reg-fill');
      })
      .attr('y', function (d) {
        let self = d3.select(this);
        return attrSwitch(self, 'data-y', 'data-reg-y');
      })
      .text(function (d) {
        return d3.select(this).attr('data-text');
      })
      .on('end', function (e) {
        if (regions) {
          d3.select(this)
            .text(() => {
              return d3.select(this).attr('data-reg-text');
            });
        }
      });
    if (regions) {
      svg.selectAll('.y2').attr('display', null);
      svg.selectAll('.y').attr('display', 'none');

      d3.select(this).text("Show Individual Countries");
      circles.transition()
        .duration(2000)
        .delay(500)
        .attr('opacity', 0)
        .style('display', 'none !important')
      g.attr('transform', 'scale(0.55, 0.55)');

      svg.selectAll('.label')
        .style('font-size', '12pt');

      svg.selectAll('.axis text')
        .style('font-size', '9pt')

      svg
        .transition()
        .duration(2000)
        .delay(500).attr('height', height * 0.6)
    } else {
      d3.select(this).text("Group by Region");
      svg.selectAll('.y2').attr('display', 'none');
      svg.selectAll('.y').attr('display', null);

      circles.transition()
        .duration(2000)
        .delay(500)
        .attr('opacity', 1)
        .style('display', null);
      g.attr('transform', 'scale(1,1)');
      svg.selectAll('text').style('font-size', null);

      svg.transition()
        .duration(2000)
        .delay(500).attr('height', height)
    }
  });


  function activate() {
    if (this.classList.contains('activated')) {
      let country = this.classList[this.classList.length - 2];
      svg.selectAll("." + country).classed('activated', false);
    } else {
      let country = this.classList[this.classList.length - 1];
      svg.selectAll("." + country).classed('activated', true);
    }

  }

  function highlight() {
    let activated = this.classList.contains('activated');
    let index = activated ? 2 : 1,
      sizeBig = activated ? 5 : 6,
      sizeSmall = activated ? 2.75 : 3.5;
    let country = this.getAttribute('data-cCode');
    svg.selectAll("[data-cCode=" + country + "]").classed('hover', true);

    let data = window.isoCodeToDataAllYears[country];

    let x = d3.event.pageX;
    let y = d3.event.pageY;

    let self = d3.select(this);
    let location = self.node().getBoundingClientRect();

    let aboveScreen = location.top < 0;
    let belowScreen = location.bottom > window.innerHeight;
    let leftOfScreen = location.left < 0;
    let rightOfScreen = location.left > window.innerWidth;

    y = aboveScreen ? window.scrollY + 190 :
      belowScreen ? window.innerHeight + 10 :
      location.top + window.scrollY;

    x = leftOfScreen ? 0 :
      rightOfScreen ? window.innerWidth - 120 :
      location.left + window.scrollX;


    tooltip.classed('upsideDown', aboveScreen);
    let tipContent = tooltip.select('#content');
    tipContent.selectAll('*').remove();

    tipContent.data(data)

    tipContent
      .append('h4')
      .text(data[0].country);

    tipContent.selectAll('p').data(data).enter()
      .append('p')
      .text(function (d) {
        return d.year + ": " + d.happiness_rank;
      });

    //    tooltip.style("left", (d3.event.pageX - 50) + "px")
    //      .style("top", (d3.event.pageY - 95) + "px");

    tooltip.style("left", (x - 50) + "px")
      .style("top", (y - 95) + "px");

    tooltip.style('display', 'inline-block');

    tipContent.exit().remove()

    let points = svg.selectAll("[data-cCode=" + country + "]" + '.point')
    pulse(country);
    
    console.log(window.isoCodeToLayer[country]);
    window.isoCodeToLayer[country].fire('mouseover', {origin: 'map'});


    function pulse(country) {
      if (svg.selectAll("[data-cCode=" + country + "]").classed('hover')) {
        points
          .transition()
          .attr('r', sizeBig)
          .duration(1000)
          .delay(10)
          .ease(d3.easeSin)
          .transition()
          .attr('r', sizeSmall)
          .duration(1000)
          .delay(10)
          .on('end', () => {
            pulse(country)
          })
      }
    }
  }

  function unhighlight() {
    if (this.classList.contains('activated')) return false;
    let country = this.getAttribute('data-cCode');
    svg.selectAll("[data-cCode=" + country + "]").classed('hover', false);

    tooltip.style('display', 'none')
  }

  svg.selectAll(".rank, .point, .label")
    .on('click', activate);
  svg.selectAll(".rank, .point, .label")
    .on('mouseover', highlight);
  svg.selectAll(".rank, .point, .label")
    .on('mouseout', unhighlight)





  window.addEventListener('scroll', function (e) {
    let y = parseInt(window.scrollY);
    //      let scale = d3.scaleLinear()
    //        .domain([0, document.getElementById('bump-chart').getBoundingClientRect().height -600])
    //        .range([0, height-window.innerHeight]);

    let scale = (y) => {
      return y < 50 ? 0 : y - 50;
    };

    let rectScale = (y) => {
      return y < 50 ? -30 : y - 80;
    };

    console.log(scale(y));

    xaxisContainer.selectAll('text')
      .attr('y', scale(y));

    xaxisContainer.select('rect')
      .attr('y', rectScale(y))
      .attr('x', 0);
  })
  d3.select('#aggregationSwitch').dispatch('click');
}
