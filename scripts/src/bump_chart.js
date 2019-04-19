(function () {
  "use strict";

  // Parent element to contain the svg
  const parent = d3.select('#bump-chart');

  // Total dimensions of the svg/chart
  const width = 400;
  const height = 2000;

  // Svg to draw the chart on
  const svg = parent.append('svg')
    .attr('width', width + "px")
    .attr('height', height + "px");

//  let zoomHandler = d3.zoom()
//    .scaleExtent([1, 5])
//    .on('zoom', zoom);
//  svg.call(zoomHandler);
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
//    //    e.preventDefault();
//    if (!noZoom) {
//      console.log(noZoom);
//      g.attr("transform", d3.event.transform);
//    }
//  }


  // Reading in the data as a promise
  const combined = d3.csv('data/combined_data.csv');
  combined.then(function (data) {
    console.log(data);

    // Creates a version of the data grouped by country then year
    let nested = d3.nest().key(function (d) {
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
      .entries(data);

    console.log(nested);

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

    let xaxis = d3.axisBottom()
      .scale(xScale)
      .ticks(4)
      .tickSize(-(height - 60))

      .tickFormat(d3.format(""));

    let xaxis2 = d3.axisTop()
      .scale(xScale)
      .ticks(4)
      .tickSize(-(height - 60))
      .tickFormat(d3.format(""));

    let yaxis = d3.axisLeft()
      .scale(yScale)
      .ticks(nested.length)
      .tickSize(-(width - 150))
      .tickFormat(d3.format(""));

    g.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (height - 20) + ")")
      .call(xaxis);

    g.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (30) + ")")
      .call(xaxis2);

    g.append("g")
      .attr('class', 'y axis')
      .attr("transform", "translate(" + 30 + ", 0)")
      .call(yaxis);

    const colorScale = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, 20));

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
      });

    labels.exit().remove();

    //      lineMaker = d3.svg.line()
    //        .x(function(d){return +d['year']})
    //        .y(function(d){return +d['value']})
    //      

    // Adding the paths 
    g.append('g').selectAll('path.rank').data(nested).enter()
      .append('path')
      .attr('d', function (d) {
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
      })
      .attr('stroke', function (d) {
        return colorScale(d['key']);
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


      let points = svg.selectAll("[data-cCode=" + country + "]" + '.point')
      pulse();


      function pulse() {
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
            .on('end', pulse)
        }
      }
    }

    function unhighlight() {
      if (this.classList.contains('activated')) return false;
      let country = this.getAttribute('data-cCode');
      svg.selectAll("[data-cCode=" + country + "]").classed('hover', false);

    }

    //    function brushed() {
    //      let s = d3.event.selection;
    //      if (s !== null) {
    //        let sy = s.map((e) => yScale.invert(e));
    //        console.log(sy);
    //        
    //        circles.classed("focused", function (d) {
    //          return sy[0] <= d.happiness_rank && d.happiness_rank <= sy[1];
    //        });
    //
    //      }
    //    }

    //    let brush = d3.brushY()
    //      .extent([[0, 0], [width - 120, height - 60]]);
    //
    //    svg.call(
    //      d3.brush().on("brush", brushed)
    //
    //    )
    svg.selectAll(".rank, .point, .label")
      .on('click', activate);
    svg.selectAll(".rank, .point, .label")
      .on('mouseover', highlight);
    svg.selectAll(".rank, .point, .label")
      .on('mouseout', unhighlight)
  });


  ;

})();
