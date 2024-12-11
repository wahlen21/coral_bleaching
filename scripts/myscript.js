// add your JavaScript/D3 to this file

// Set map dimensions
const width = 960;
const height = 600;

// Define the map projection and path generator
const projection = d3.geoMercator()
    .scale(150)
    .translate([width / 2, height / 1.5]);

const path = d3.geoPath().projection(projection);

// Create the SVG element for the map
const svg = d3.select("div#plot")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Tooltip element
const tooltip = d3.select("#tooltip");

// Set coral severity colors
const severityColor = {
    "No Bleaching": "#c6e6ff",
    "Low": "#66b3ff",
    "Medium": "#ffcc00",
    "High": "#ff3333"
};

// Load the world map (GeoJSON) for map boundaries
d3.json("https://raw.githubusercontent.com/d3/d3-geo/master/test/data/world-110m.geojson")
    .then(function(geoData) {

        // Draw the country boundaries
        svg.append("g")
            .selectAll("path")
            .data(geoData.features)
            .enter()
            .append("path")
            .attr("class", "country")
            .attr("d", path)
            .style("fill", "lightgray")
            .style("stroke", "white")
            .style("stroke-width", 0.5)
            .on("mouseover", function(event, d) {
                d3.select(this).style("fill", "#ff7f0e");
                tooltip.style("display", "block")
                    .html(d.properties.name)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                d3.select(this).style("fill", "lightgray");
                tooltip.style("display", "none");
            });

    })
    .catch(function(error) {
        console.log("Error loading the GeoJSON data: " + error);
    });

// Load Excel data (using SheetJS to parse the file)
d3.dsv(",","data/CoralBleaching.xlsx").then(function(data) {
    console.log("Loaded Coral Bleaching Data:", data);
    
    // Add data points (coral bleaching severity) to the map
    svg.append("g")
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
            return projection([d.LON, d.LAT])[0];
        })
        .attr("cy", function(d) {
            return projection([d.LON, d.LAT])[1];
        })
        .attr("r", 5)
        .attr("fill", function(d) {
            return severityColor[d.BLEACHING_SEVERITY] || "#808080"; // Default gray if severity is unknown
        })
        .attr("class", "coral-point")
        .on("mouseover", function(event, d) {
            d3.select(this).style("fill", "#ff7f0e");
            tooltip.style("display", "block")
                .html(d.COUNTRY + "<br>Bleaching Severity: " + d.BLEACHING_SEVERITY)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).style("fill", function(d) {
                return severityColor[d.BLEACHING_SEVERITY] || "#808080";
            });
            tooltip.style("display", "none");
        });
});
