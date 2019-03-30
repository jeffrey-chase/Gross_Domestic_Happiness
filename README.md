# Gross Domestic Happiness

**Authors:** Jeffrey Chase and Steve Rodriguez


### General TODO:

- Add description of data/visualization to the intro
- Footer with author info and links
- Make rendering change width when window is resized
- Responsive layout (phone?)
- Dropdown userguide in the header explaining interactive elements


#### Map TODO


- Add legends to the map for the color scale
- Put the label on the closest point in the country if the centroid is not inside the bounds of the country
- Label popup to closest polygon in multi-polygons rather than largest
- Add ranks to popup over map
- Connect layers on map to values by ISO3 code rather than name to fix most of countries
- Buttons to visualize different attributes in the map
- Toggle region color code lines in map
- Try to fix opacity in popups' arrows
- Map parallax initialization jumpy (?); needs fixing
- Consider other color scales maybe
- Shift+arrows on keyboard zooms in and out
- Restyle the leaflet default buttons
- Also gray out color of the lines of the country when they are NA
- Histogram for regions values hovering near that region
- Change undefined to  N/A

#### Chart TODO

- Popups over the points of the bump chart with the happiness value
- Toggle bump chart to be rank vs. actual happiness value
- Add in country flags (svg: http://hjnilsson.github.io/country-flags/)
- Bump chart faceted by region
- Arrow keys let you select between different ranked countries
- Double click on label to zoom to that country's centroid on the map
