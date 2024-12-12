// add your JavaScript/D3 to this file

// Load data from the JSON file
d3.json("data/bleaching_data.json").then(function(data) {

// Set dimensions for the SVG container
const margin = { top: 40, right: 20, bottom: 80, left: 60 };
const width = 800 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Create the SVG container
const svg = d3.select("#bar-chart")
              .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
            .append("g")
              .attr("transform", `translate(${margin.left},${margin.top})`);

// Define color scale for severity levels
const color = d3.scaleOrdinal()
                .domain(["No Bleaching", "Low", "Medium", "HIGH"])
                .range(["#e0e0e0", "#a1c4fd", "#6d9df5", "#0b62a4"]);

// Get list of unique countries
const countries = [...new Set(data.map(d => d.COUNTRY))];

// Set the x scale (country on x-axis)
const x = d3.scaleBand()
            .domain(countries)
            .range([0, width])
            .padding(0.1);

// Set the y scale (count of observations on y-axis)
const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.count)])
            .nice()
            .range([height, 0]);

// Set the stack layout for the bar segments
const stack = d3.stack()
                .keys(["No Bleaching", "Low", "Medium", "HIGH"])
                .value((d, key) => {
                    const item = d.find(entry => entry.BLEACHING_SEVERITY === key);
                    return item ? item.count : 0;
                });

// Nest data by country and severity for stacking
const nestedData = d3.nest()
                     .key(d => d.COUNTRY)
                     .entries(data);

// Stack the data for each country
const stackedData = nestedData.map(d => {
    return stack([
        { "No Bleaching": d.values.filter(v => v.BLEACHING_SEVERITY === "No Bleaching")[0] },
        { "Low": d.values.filter(v => v.BLEACHING_SEVERITY === "Low")[0] },
        { "Medium": d.values.filter(v => v.BLEACHING_SEVERITY === "Medium")[0] },
        { "HIGH": d.values.filter(v => v.BLEACHING_SEVERITY === "HIGH")[0] }
    ]);
});

// Create bars
svg.selectAll(".country")
   .data(stackedData)
   .enter().append("g")
   .attr("class", "country")
   .attr("transform", (d, i) => `translate(${x(countries[i])},0)`)
   .selectAll("rect")
   .data(d => d)
   .enter().append("rect")
   .attr("y", d => y(d[1]))
   .attr("height", d => y(d[0]) - y(d[1]))
   .attr("width", x.bandwidth())
   .style("fill", d => color(d.key))
   .on("mouseover", function(event, d) {
       d3.select(this)
         .style("fill", d3.rgb(color(d.key)).darker(1));
   })
   .on("mouseout", function(event, d) {
       d3.select(this)
         .style("fill", color(d.key));
   });

// Add x-axis
svg.append("g")
   .selectAll("text")
   .data(countries)
   .enter().append("text")
   .attr("x", d => x(d) + x.bandwidth() / 2)
   .attr("y", height + 10)
   .attr("text-anchor", "middle")
   .text(d => d)
   .style("font-size", "12px");

// Add y-axis
svg.append("g")
   .call(d3.axisLeft(y));

// Add a legend
const legend = svg.selectAll(".legend")
                  .data(color.domain())
                  .enter().append("g")
                  .attr("class", "legend")
                  .attr("transform", (d, i) => `translate(0,${i * 20})`);

legend.append("rect")
      .attr("x", width - 20)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(d => d);

});
