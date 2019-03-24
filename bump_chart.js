(function () {
  "use strict";

  const parent = d3.select('#bump-chart');

  const width = 400;
  const height = 2000;

  const svg = parent.append('svg')
    .attr('width', width + "px")
    .attr('height', height + "px");


  const combined = d3.csv('data/combined_data.csv');
  combined.then(function (data) {
    console.log(data);

    let nested = d3.nest().key(function (d) {
        return d['country'];
      })
      .key(function (d) {
        return d['year'];
      })
      .rollup(function (d) {
        return d3.sum(d, function (g) {
          return g['happiness_rank'];
        });
      })
      .entries(data);

    console.log(nested);

    let trends = data.map(d => {
      d['values']
    })

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

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (height - 20) + ")")
      .call(xaxis);

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (30) + ")")
      .call(xaxis2);

    svg.append("g")
      .attr('class', 'y axis')
      .attr("transform", "translate(" + 30 + ", 0)")
      .call(yaxis);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    let circles = svg.append('g').selectAll("circle.point").data(data).enter()
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
        return makeSafeId(d.country);
      })
      .attr('id', function (d) {
        return 'point ' + makeSafeId(d.country) + "-point";
      })


    let labels = svg.append('g').selectAll('text.label').data(data).enter()
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
      });

    //      lineMaker = d3.svg.line()
    //        .x(function(d){return +d['year']})
    //        .y(function(d){return +d['value']})
    //      

    // Adding the paths 
    svg.append('g').selectAll('path.rank').data(nested).enter()
      .append('path')
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
      });

    function activate(){
      if (this.classList.contains('activated')) {
        let country = this.classList[this.classList.length - 2];
        svg.selectAll("." + country).classed('activated', false);
      } else {
        let country = this.classList[this.classList.length - 1];
        svg.selectAll("." + country).classed('activated', true);
      }

    }
    
    function highlight(){
      if (this.classList.contains('activated')) return false;
      console.log('hover');
      let country = this.classList[this.classList.length - 1];
        svg.selectAll("." + country).classed('hover', true);
//      setTimeout(function(){
//        svg.selectAll("." + country).classed('hover', false);
//      }, 500)
    }
    
    function unhighlight(){
      if (this.classList.contains('activated')) return false;
      let country = this.classList[this.classList.length - 1];
        svg.selectAll("." + country).classed('hover', false);
    }
    
    svg.selectAll(".rank, .point, .label")
      .on('click', activate);
    
    svg.selectAll(".rank, .point, .label")
      .on('mouseover', highlight);
    svg.selectAll(".rank, .point, .label")
      .on('mouseout', unhighlight)
  });
  

  ;

})();
