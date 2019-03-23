(function(){
  d3.csv('data/combined_data.csv').then(function(d){
    console.log(d);
  });
  
  let svg = d3.select('bump-chart').append('svg');
  
  
  
})();