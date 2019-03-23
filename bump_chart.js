(function () {
  "use strict";
  window.onload = function () {
    const parent = d3.select('#bump-chart');

    const width = 1000;
    const height = 5000;

    const svg = parent.append('svg')
      .attr('width', width + "px")
      .attr('height', height + "px");


    const combined = d3.csv('data/combined_data.csv');
    combined.then(function (data) {
      console.log(data);

      let nested = d3.nest().key(function (d) {
        return d['country'];
      }).entries(data);

      console.log(nested);

      const yearGrab = function (d) {
        return +d['year'];
      }

      const xScale = d3.scaleLinear()
        .domain([2015, 2018])
        .range([30, width - 400]);

      const yScale = d3.scaleLinear()
        .domain([1, 163])
        .range([10, height - 10]);

      const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

      let circles = svg.selectAll("circle").data(data).enter()
        .append('circle')
        .attr('r', 5)
        .attr('cx', function (d) {
          return xScale(+d['year']);
        })
        .attr('cy', function (d) {
          console.log(+d['happiness_rank']);
          return yScale(+d['happiness_rank']);
        })
        .style('fill', function (d) {
          return colorScale(d['country']);
        })

      let labels = svg.selectAll('text').data(data).enter()
        .append('text')
        .attr('x', function (d) {
          return xScale(+d['year']) + 10;
        })
        .attr('y', function (d) {
          console.log(+d['happiness_rank']);
          return yScale(+d['happiness_rank']);
        })
        .text(function (d) {
          let year = +d['year'];
          return year === 2018 ?d['country'].toUpperCase(): "";
        })
        .attr('alignment-baseline', 'central')
    })


  }



})();
