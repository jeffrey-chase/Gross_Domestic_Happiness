# Gross Domestic Happiness

**Authors:** Jeffrey Chase and Steve Rodriguez


## About the Data
Data comes from the 2019 World Happiness Report. The report surveyed people in 155 countries around the world about their personal feelings of subjective happiness and then aggregated them by each country. They then compared this country level to various social and economic factors that 	'predict' a country's happiness level. They then normalized each of these indicators and scored them based on how much they explained the country's happiness score. We used the most recent 4 years of data, covering 2015-2018.

## About the Visualization
Our visualization consists of two main idioms: a country-level choropleth map visualizing the values of each of the attributes in the data set and a bump chart visualizing how country's rankings have changed over time. 

### Map
Each country in the map is colored along a quantitative color scale indicating its value on the selected attribute for 2018, and the country's borders are colored according to what region the country is in. When hovering over a country, a popup appears with that country's name, flag, overall happiness rank in 2018 and the name and value of the chosen attribute.

##### Features

- Popups are slightly transparent to allow the user to see countries below them
- Popups have `pointer-events` CSS property set to `none` so that the popup doesn't obscure hovering over other countries
- Popup's locations calculating using `turf.pointOnFeature()` on the country, or, if the country has multiple polygons, on the largest polygon. This was done so that the popup was always in a consistent central location guaranteed to be within its borders.
- Hovering over a country also shows its corresponding popup value in the bump chart view and also triggers the highlight features for it in the bump chart. 
- Clicking on a country in the map scrolls to that country in the bump chart and also triggers its selection features in the bump chart.

### Bump Chart
The bump chart features two main views: an individual country view and a regional overview. 

The individual country view shows how the happiness rank of each country has changed over time with each country's color and path being colored by a categorical color scale that cycles through 20 different values based on the country's initial ranking. 

The regional overview aggregates each region by the average ranking with a small difference addded for each individual country's value. Because of this, the country's are ordered within-region according to their rankings and regions that have more variability will be more spread out than regions that have values that are more similar. 

Hovering over a country's path, point, or label displays a popup with the country's name and all of its rankings over time.

##### Features 

- Popups locate themselves at the location of the country's endpoint on the chart so that the user can more easily guage that country's trajectory on the chart
   - However, popups will always locate on the screen. If the country's endpoint is below the screen the popup will display at the bottom of the screen with the arrow just below the edge of the screen. If the endpoint is above the screen then the popup will display at the top of the screen with the popup's arrow pointing up. 
- Hovering over a country's path, points, or label make its path more opaque, makes its points pulse, and changes the color of its label. 
- Hovering over a country's path, points, or label also displays the popup for that country in the map view.
- Clicking on a country's path, points, or label toggles these highlight features permanently.



## External Resources

#### Libraries

- [`d3.js`](https://d3js.org/)
- [`leaflet.js`](https://leafletjs.com/)
- [`turf.js`](https://turfjs.org/)
- [`d3-legend`](https://cdnjs.com/libraries/d3-legend) [about](https://d3-legend.susielu.com/)

#### Other

- Country polygon `geo.json` file came from [https://geojson-maps.ash.ms/](https://geojson-maps.ash.ms/)
- Country flag icons came from [https://github.com/hjnilsson/country-flags](https://github.com/hjnilsson/country-flags)
- With fonts from [Google Fonts](https://fonts.google.com/)

