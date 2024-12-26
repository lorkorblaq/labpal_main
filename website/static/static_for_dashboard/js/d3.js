BaseUrl = "https://labpal.com.ng/api";
// BaseUrl = "http://127.0.0.1:3000/api";
function getCookie(name) {
    let cookieArr = document.cookie.split("; ");
    for(let i = 0; i < cookieArr.length; i++) {
        let cookiePair = cookieArr[i].split("=");
        if(name == cookiePair[0]) {
            return decodeURIComponent(cookiePair[1]);
        }
    }
    return null;
}
const user_id = getCookie('user_id');
const lab_name = getCookie('lab_name');
const get_items_url = `${BaseUrl}/items/get/${user_id}/${lab_name}/`;
const url_channel_get = `${BaseUrl}/channels/get/${user_id}/${lab_name}/`;
const piu_get = `${BaseUrl}/piu/get/${user_id}/${lab_name}/`;
const url_shipment_get = `${BaseUrl}/shipments/get/${user_id}/${lab_name}/`;
const url_event_get_all = `${BaseUrl}/events/get/${user_id}/${lab_name}/`;


// Step 1: Fetch Data from the API
async function fetchData(apiEndpoint) {
    const response = await fetch(apiEndpoint);
    const data = await response.json();
    return data.items; // Adjust based on your API response structure
}

// Step 2: Extract Unique Values
function getUniqueValues(data, field) {
    return [...new Set(data.map(each => each[field]))];
}

// Step 3: Populate Filters
function populateFilters(data, fields) {
    fields.forEach(field => {
        const uniqueValues = getUniqueValues(data, field);
        const selectElement = d3.select(`#${field}`);

        // Clear previous options
        selectElement.selectAll("option").remove();

        // Add a default "All" option
        selectElement.append("option").attr("value", "").text("All");

        uniqueValues.forEach(value => {
            selectElement.append("option").attr("value", value).text(value);
        });
    });
}

// Function to find the maximum quantity in the data
function getMaxQuantity(data) {
    return Math.max(...data.map(item => item.quantity));
}

// Step 4: Filter Data
function filterData(data, filters, quantity) {
    return data.filter(each => {
        const matchFilters = Object.keys(filters).every(field => {
            return !filters[field] || each[field] === filters[field];
        });

        // Include quantity filtering
        return matchFilters && each.quantity <= quantity;
    });
}


// Step 5: Initialize and Render Chart
async function init(apiEndpoint, filterFields) {
    const itemsData = await fetchData(apiEndpoint); // Fetch items from the API
    
    // Populate filter dropdowns dynamically
    populateFilters(itemsData, filterFields);

    // Dynamically set the max value of the quantity slider
    const maxQuantity = getMaxQuantity(itemsData);
    d3.select("#quantity")
        .attr("max", maxQuantity)
        .attr("value", maxQuantity);
    
    d3.select("#quantityValue").text(maxQuantity); // Set initial quantity label

    // Render initial chart with all items
    renderItemsChart("#chart-items", itemsData);

    // Event listeners for filter controls
    d3.selectAll("select").on("change", () => {
        const filters = {};
        filterFields.forEach(field => {
            filters[field] = d3.select(`#${field}`).property("value");
        });

        const quantityValue = +d3.select("#quantity").property("value");

        console.log("Filters applied: ", filters, "Quantity filter: ", quantityValue); // Debug log

        const filteredData = filterData(itemsData, filters, quantityValue);

        console.log("Filtered data: ", filteredData); // Debug log

        d3.select("#chart-items").select("svg").remove(); // Remove previous chart
        renderItemsChart("#chart-items", filteredData);
    });

    // Quantity slider input listener
    d3.select("#quantity").on("input", function() {
        d3.select("#quantityValue").text(this.value); // Update displayed value of the slider

        const filters = {};
        filterFields.forEach(field => {
            filters[field] = d3.select(`#${field}`).property("value");
        });

        const quantityValue = +this.value;

        console.log("Filters applied: ", filters, "Quantity filter: ", quantityValue); // Debug log

        const filteredData = filterData(itemsData, filters, quantityValue);

        console.log("Filtered data: ", filteredData); // Debug log

        d3.select("#chart-items").select("svg").remove(); // Remove previous chart
        renderItemsChart("#chart-items", filteredData);
    });
}
init(get_items_url, ['category', 'bench', 'class']);

const endpoints = {
    items: `${BaseUrl}/items/get/${user_id}/${lab_name}/`,
    channels: `${BaseUrl}/channels/get/${user_id}/${lab_name}/`,
    piu: `${BaseUrl}/piu/get/${user_id}/${lab_name}/`,
    shipments: `${BaseUrl}/shipments/get/${user_id}/${lab_name}/`,
    events: `${BaseUrl}/events/get/${user_id}/${lab_name}/`,
};

function convertDurationToMinutes(duration) {
    const parts = duration.match(/(\d+)D:(\d+)H:(\d+)M:(\d+)S/);
    if (!parts) return 0; // Return 0 if the duration format is unexpected

    const days = parseInt(parts[1], 10) || 0;
    const hours = parseInt(parts[2], 10) || 0;
    const minutes = parseInt(parts[3], 10) || 0;
    const seconds = parseInt(parts[4], 10) || 0;

    // Convert to total minutes
    return (days * 24 * 60) + (hours * 60) + minutes + Math.floor(seconds / 60);
}


// Fetch data and display for each section
// Fetch data and display for each section
Object.keys(endpoints).forEach(endpoint => {
    fetch(endpoints[endpoint])
        .then(response => response.json())
        .then(data => {
            console.log(data.items);
            switch (endpoint) {
                // case 'items':
                //     renderItemsChart('#chart-items', data.items);
                //     break;
                case 'channels':
                    renderChannelsChart('#chart-channels', data.channels);
                    break;
                case 'piu':
                    renderPiuChart('#chart-piu', data.piu);
                    break;
                case 'shipments':
                    renderShipmentsChart('#chart-shipments', data.shipments);
                    break;
                case 'events':
                    // Handle the 'events' case here if needed
                    break;
            }
        })
        .catch(error => console.error(`Error fetching ${endpoint}:`, error));
});



function renderItemsChart(container, itemsData) {
    const svg = d3.select(container)
                  .append("svg")
                  .attr("width", "100%")
                  .attr("height", 400);

    const margin = {top: 40, right: 30, bottom: 80, left: 60},
          width = parseInt(svg.style("width")) - margin.left - margin.right,
          height = svg.attr("height") - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Title
    svg.append("text")
       .attr("x", margin.left)
       .attr("y", 20)
       .attr("text-anchor", "start")
       .style("font-size", "16px")
       .style("font-weight", "bold")
       .text("Items Chart");

    const x = d3.scaleBand()
                .domain(itemsData.map(d => d.item))
                .range([0, width])
                .padding(0.1);

    const y = d3.scaleLinear()
                .domain([0, d3.max(itemsData, d => d.quantity)])
                .nice()
                .range([height, 0]);

    g.append("g")
     .attr("class", "x-axis")
     .attr("transform", `translate(0,${height})`)
     .call(d3.axisBottom(x))
     .selectAll("text")
     .attr("transform", "rotate(-40)")
     .style("text-anchor", "end");

    g.append("g")
     .attr("class", "y-axis")
     .call(d3.axisLeft(y));

    // X Axis Label
    svg.append("text")
       .attr("x", margin.left + width / 2)
       .attr("y", height + margin.top + 40)
       .attr("text-anchor", "middle")
       .style("font-size", "14px")
       .text("Items");

    // Y Axis Label
    svg.append("text")
       .attr("transform", "rotate(-90)")
       .attr("x", -margin.top - height / 2)
       .attr("y", margin.left / 2)
       .attr("text-anchor", "middle")
       .style("font-size", "14px")
       .text("Quantity");

    // Create the tooltip
    const tooltipper = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")  // Make sure the tooltip is positioned absolutely
        .style("background", "lightgrey") // Optional: style your tooltip
        .style("padding", "5px")
        .style("border-radius", "5px");

    g.selectAll(".bar")
     .data(itemsData)
     .enter().append("rect")
     .attr("class", "bar")
     .attr("x", d => x(d.item))
     .attr("y", d => y(d.quantity))
     .attr("width", x.bandwidth())
     .attr("height", d => height - y(d.quantity))
     .attr("fill", "steelblue")
     .on("mouseover", function(event, d) {
         tooltipper.transition().duration(200).style("opacity", .9);
         tooltipper.html(`Item: ${d.item}<br>Quantity: ${d.quantity}`)
             .style("left", (event.pageX + 5) + "px")
             .style("top", (event.pageY - 28) + "px");
     })
     .on("mouseout", function() {
         tooltipper.transition().duration(500).style("opacity", 0);
     });
}

function renderChannelsChart(container, channelsData) {
    const svg = d3.select(container)
                  .append("svg")
                  .attr("width", "100%")
                  .attr("height", 400);

    const margin = {top: 40, right: 30, bottom: 80, left: 60}, // Increased bottom margin for x-axis label
          width = parseInt(svg.style("width")) - margin.left - margin.right,
          height = svg.attr("height") - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Title
    svg.append("text")
       .attr("x", margin.left)
       .attr("y", 20)
       .attr("text-anchor", "start")
       .style("font-size", "16px")
       .style("font-weight", "bold")
       .text("Channels Chart");

    const x = d3.scaleBand()
                .domain(channelsData.map(d => d.item))
                .range([0, width])
                .padding(0.1);

    const y = d3.scaleLinear()
                .domain([0, d3.max(channelsData, d => d.quantity)])
                .nice()
                .range([height, 0]);

    g.append("g")
     .attr("class", "x-axis")
     .attr("transform", `translate(0,${height})`)
     .call(d3.axisBottom(x))
     .selectAll("text")
     .attr("transform", "rotate(-40)")
     .style("text-anchor", "end");

    g.append("g")
     .attr("class", "y-axis")
     .call(d3.axisLeft(y));

    // X Axis Label
    svg.append("text")
       .attr("x", margin.left + width / 2)
       .attr("y", height + margin.top + 40)
       .attr("text-anchor", "middle")
       .style("font-size", "14px")
       .text("Items");

    // Y Axis Label
    svg.append("text")
       .attr("transform", "rotate(-90)")
       .attr("x", -margin.top - height / 2)
       .attr("y", margin.left / 2)
       .attr("text-anchor", "middle")
       .style("font-size", "14px")
       .text("Quantity");

    g.selectAll(".bar")
     .data(channelsData)
     .enter().append("rect")
     .attr("class", "bar")
     .attr("x", d => x(d.item))
     .attr("y", d => y(d.quantity))
     .attr("width", x.bandwidth())
     .attr("height", d => height - y(d.quantity))
     .attr("fill", "teal");
}

function renderPiuChart(container, piuData) {
    const svg = d3.select(container)
                  .append("svg")
                  .attr("width", "100%")
                  .attr("height", 400);

    const margin = {top: 40, right: 30, bottom: 80, left: 60},
          width = parseInt(svg.style("width")) - margin.left - margin.right,
          height = svg.attr("height") - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Title
    svg.append("text")
       .attr("x", margin.left)
       .attr("y", 20)
       .attr("text-anchor", "start")
       .style("font-size", "16px")
       .style("font-weight", "bold")
       .text("PIU Chart");

    const x = d3.scaleBand()
                .domain(piuData.map(d => d.item))
                .range([0, width])
                .padding(0.1);

    const y = d3.scaleLinear()
                .domain([0, d3.max(piuData, d => d.quantity)])
                .nice()
                .range([height, 0]);

    g.append("g")
     .attr("class", "x-axis")
     .attr("transform", `translate(0,${height})`)
     .call(d3.axisBottom(x))
     .selectAll("text")
     .attr("transform", "rotate(-40)")
     .style("text-anchor", "end");

    g.append("g")
     .attr("class", "y-axis")
     .call(d3.axisLeft(y));

    // X Axis Label
    svg.append("text")
       .attr("x", margin.left + width / 2)
       .attr("y", height + margin.top + 40)
       .attr("text-anchor", "middle")
       .style("font-size", "14px")
       .text("Items");

    // Y Axis Label
    svg.append("text")
       .attr("transform", "rotate(-90)")
       .attr("x", -margin.top - height / 2)
       .attr("y", margin.left / 2)
       .attr("text-anchor", "middle")
       .style("font-size", "14px")
       .text("Quantity");

    g.selectAll(".bar")
     .data(piuData)
     .enter().append("rect")
     .attr("class", "bar")
     .attr("x", d => x(d.item))
     .attr("y", d => y(d.quantity))
     .attr("width", x.bandwidth())
     .attr("height", d => height - y(d.quantity))
     .attr("fill", "orange");
}

// function renderShipmentsChart(container, shipmentsData) {
//     const svg = d3.select(container)
//                   .append("svg")
//                   .attr("width", "100%")
//                   .attr("height", 450);

//     const margin = {top: 20, right: 30, bottom: 40, left: 40},
//         width = parseInt(svg.style("width")) - margin.left - margin.right,
//         height = svg.attr("height") - margin.top - margin.bottom;

//     const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
//     svg.append("text")
//     .attr("x", margin.left)
//     .attr("y", 15)
//     .attr("text-anchor", "start")
//     .style("font-size", "16px")
//     .style("font-weight", "bold")
//     .text("Shipment Qty. packs"); 
//     const x = d3.scaleBand()
//                 .domain(shipmentsData.map(d => d.shipment_id))
//                 .range([0, width])
//                 .padding(0.1);

//     const y = d3.scaleLinear()
//                 .domain([0, d3.max(shipmentsData, d => d.numb_of_packs)])
//                 .nice()
//                 .range([height, 0]);

//     g.append("g")
//      .attr("class", "x-axis")
//      .attr("transform", `translate(0,${height})`)
//      .call(d3.axisBottom(x))
//      .selectAll("text")
//      .attr("transform", "rotate(-40)")
//      .style("text-anchor", "end");

//     g.append("g")
//      .attr("class", "y-axis")
//      .call(d3.axisLeft(y));

//     // X Axis Label
//     svg.append("text")
//        .attr("x", margin.left + width / 2)
//        .attr("y", height + margin.top + 40)
//        .attr("text-anchor", "middle")
//        .style("font-size", "14px")
//        .text("Shipment ID");

//     // Y Axis Label
//     svg.append("text")
//        .attr("transform", "rotate(-90)")
//        .attr("x", -margin.top - height / 2)
//        .attr("y", margin.left / 2)
//        .attr("text-anchor", "middle")
//        .style("font-size", "14px")
//        .text("No. of packs");

//     g.selectAll(".bar")
//      .data(shipmentsData)
//      .enter().append("rect")
//      .attr("class", "bar")
//      .attr("x", d => x(d.shipment_id))
//      .attr("y", d => y(d.numb_of_packs))
//      .attr("width", x.bandwidth())
//      .attr("height", d => height - y(d.numb_of_packs))
//      .attr("fill", "steelblue");
// }

const tooltip = d3.select("#tooltip");

// Add interactivity to bars
svg.selectAll(".bar")
    .on("mouseover", function (event, d) {
        tooltip.style("visibility", "visible")
            .text(d.name + ": " + d.value);
        d3.select(this).style("fill", "orange");
    })
    .on("mousemove", function (event) {
        tooltip.style("top", (event.pageY - 10) + "px")
            .style("left", (event.pageX + 10) + "px");
    })
    .on("mouseout", function () {
        tooltip.style("visibility", "hidden");
        d3.select(this).style("fill", "steelblue");
    });


// Add tooltips
const tooltipper = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);

g.selectAll(".bar")
    .data(topItems)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.item))
    .attr("y", d => y(d.quantity))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(d.quantity))
    .attr("fill", "steelblue")
    .on("mouseover", function(event, d) {
        tooltipper.transition().duration(200).style("opacity", .9);
        tooltipper.html(`Item: ${d.item}<br>Quantity: ${d.quantity}`)
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
        tooltipper.transition().duration(500).style("opacity", 0);
    });


