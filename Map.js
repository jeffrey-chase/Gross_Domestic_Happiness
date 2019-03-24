window.onload = function () {
  var au = new L.LatLng(0, 0);
  var mymap = L.map('maparea').setView(au, 2);


  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(mymap);
  Promise.all([
      d3.json('data/geo/countries.geo.json'),
      d3.csv('data/combined_data.csv')
    ])
    .then(function (data) {
      let info = data[1];
      info = info.filter(function(d) {return d.year === "2018";} );
    
      let mapping = {};

      info.forEach(function (d) {
        mapping[d.country] = +d.happiness_score;
      })
    console.log(mapping);

      let fillScale = d3.scaleLinear()
        .domain(d3.extent(info.map(function(d){
          return +d.happiness_score;
        })))
        .range([1, 0])

      let getColor = function (d) {
        console.log(d);
        return d3.interpolateMagma(fillScale(d));
      }


      function countryStyle(feature) {
        console.log(feature);
        return {
          weight: 2,
          opacity: 1,
          color: 'white',
          dashArray: '3',
          fillOpacity: 0.7,
          fillColor: getColor(mapping[feature.properties.name])
        };
      }

      let countriesLayer = L.geoJson(data[0], {
        style: countryStyle
      });


      countriesLayer.addTo(mymap);
    })

}
