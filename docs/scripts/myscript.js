document.addEventListener("DOMContentLoaded", function() {
    // Log the coralData to ensure it's loaded correctly
    console.log("Coral Data: ", coralData);

    // Set up the dimensions of the heatmap container
    const width = 1000;  // Increased width to fit both the heatmap and the legend
    const height = 600;

    // Define the color scale for the BLEACHING_SEVERITY
    const colorScale = d3.scaleOrdinal()
        .domain(["No Bleaching", "Low", "Medium", "HIGH"])
        .range(["#FFCC99", "#FF9966", "#FF6633", "#CC3300"]);  // New coral color scheme with more distinction

    // Create the Leaflet map centered on a location (e.g., somewhere near the coral reef regions)
    const map = L.map('map', {
        center: [-5.5, 119.0],  // Centered roughly over Indonesia
        zoom: 3  // Adjust zoom level to zoom out more (start with a more zoomed-out view)
    });

    // Add the OpenStreetMap tile layer (or any other base layer)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Function to handle null or undefined values and format tooltip content
    function getValueOrDefault(value) {
        return value ? value : null;  // Return null for missing values
    }

    // Function to create tooltip content by conditionally including non-null values
    function createTooltipContent(d) {
        let content = `<b>Bleaching Severity:</b> ${d.BLEACHING_SEVERITY}<br>`;
        
        // Only add fields that have valid values (non-null)
        if (d.LOCATION) content += `<b>Location:</b> ${d.LOCATION}<br>`;
        
        // Combine LAT and LON into one line as coordinates
        if (d.LAT && d.LON) {
            content += `<b>Coordinates:</b> (${d.LAT}, ${d.LON})<br>`;
        }
        
        // Format MONTH and YEAR as Date with leading zero for single digit months
        if (d.MONTH && d.YEAR) {
            let monthFormatted = d.MONTH;
            if (d.MONTH < 10) {
                monthFormatted = '0' + d.MONTH;  // Add leading zero for single-digit months
            }
            content += `<b>Date:</b> ${monthFormatted}-${d.YEAR}<br>`;
        }
        
        // Format Depth with unit "m"
        if (d.DEPTH) content += `<b>Depth (m):</b> ${d.DEPTH}<br>`;
        
        // Add other fields if they exist
        if (d.CORAL_FAMILY) content += `<b>Coral Family:</b> ${d.CORAL_FAMILY}<br>`;
        if (d.CORAL_SPECIES) content += `<b>Coral Species:</b> ${d.CORAL_SPECIES}<br>`;
        if (d.PERCENTAGE_AFFECTED) content += `<b>Percentage Affected:</b> ${d.PERCENTAGE_AFFECTED}%<br>`;
        if (d.BLEACHING_DURATION) content += `<b>Bleaching Duration:</b> ${d.BLEACHING_DURATION} days<br>`;
        if (d.MORTALITY) content += `<b>Mortality:</b> ${d.MORTALITY}%<br>`;
        if (d.RECOVERY) content += `<b>Recovery:</b> ${d.RECOVERY}%<br>`;
        if (d.SURVEY_TYPE) content += `<b>Survey Type:</b> ${d.SURVEY_TYPE}<br>`;
        if (d.SURVEY_AREA) content += `<b>Survey Area:</b> ${d.SURVEY_AREA}<br>`;
        if (d.WATER_TEMPERATURE) content += `<b>Water Temperature:</b> ${d.WATER_TEMPERATURE}°C<br>`;
        if (d.OTHER_FACTORS) content += `<b>Other Factors:</b> ${d.OTHER_FACTORS}<br>`;
        if (d.REMARKS) content += `<b>Remarks:</b> ${d.REMARKS}<br>`;
        if (d.SOURCE) content += `<b>Source:</b> ${d.SOURCE}<br>`;

        return content;
    }

    // Ensure that the LAT/LON values are numeric and valid
    coralData = coralData.filter(d => !isNaN(d.LAT) && !isNaN(d.LON));
    console.log("Filtered Coral Data: ", coralData);

    // Create a Leaflet layer group to hold the heatmap markers
    const heatmapLayer = L.layerGroup().addTo(map);

    // Create the heatmap (circles with colors)
    coralData.forEach(d => {
        const lat = d.LAT;
        const lon = d.LON;
        const severity = d.BLEACHING_SEVERITY;

        // Convert BLEACHING_SEVERITY to color
        const color = colorScale(severity);

        // Create a circle marker for each coral data point
        L.circleMarker([lat, lon], {
            radius: 5,  // Radius of the circle
            fillColor: color,  // Set fill color from color scale
            color: "black",  // Border color
            weight: 1,  // Border thickness
            opacity: 1,
            fillOpacity: 0.7  // Transparency of the circle
        })
        .bindTooltip(createTooltipContent(d), {
            permanent: false,  // Tooltip disappears when you click away (if permanent is false)
            direction: 'top',  // Tooltip appears above the marker
            offset: [0, -10]  // Offset to move it slightly above the point
        })
        .on('mouseover', function(event) {
            tooltip.style("visibility", "visible")
                .html(createTooltipContent(d))
                .style("top", (event.originalEvent.pageY + 10) + "px")
                .style("left", (event.originalEvent.pageX + 10) + "px");
        })
        .on('mousemove', function(event) {
            tooltip.style("top", (event.originalEvent.pageY + 10) + "px")
                .style("left", (event.originalEvent.pageX + 10) + "px");
        })
        .on('mouseout', function() {
            tooltip.style("visibility", "hidden");
        })
        .on('click', function(event) {
            // Tooltip on click will show severity at the clicked point
            L.tooltip()
                .setLatLng(event.latlng)  // Position the tooltip at the clicked point
                .setContent(createTooltipContent(d))
                .openOn(map);
        })
        .addTo(heatmapLayer);
    });

    // Legend Data with new colors
    const legendData = [
        { severity: "No Bleaching", color: "#FFCC99" },
        { severity: "Low", color: "#FF9966" },
        { severity: "Medium", color: "#FF6633" },
        { severity: "HIGH", color: "#CC3300" }
    ];

    // Create the legend container (grouping)
    const legend = L.control({position: 'bottomright'});

    legend.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'info legend');
        let labels = [];

        // Iterate over the legend data
        legendData.forEach(function(d) {
            // Create a legend item with a color box and the severity label
            labels.push(
                '<i style="background:' + d.color + '; width: 20px; height: 20px; display: inline-block; margin-right: 10px;"></i> ' + d.severity
            );
        });

        // Join the labels into a string, separated by <br> for new lines
        div.innerHTML = labels.join('<br>');
        return div;
    };

    // Add the legend to the map
    legend.addTo(map);
});