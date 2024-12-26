$(function() {
    // BaseUrl = "https://labpal.com.ng/api";
    BaseUrl = "http://127.0.0.1:3000/api";
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
    const url_event_get_all = `${BaseUrl}/events/get/${user_id}/${lab_name}/`;
    const url_shipment_get = `${BaseUrl}/shipments/get/${user_id}/${lab_name}/`

    async function fetchData(url) {
        // Fetch data from the provided URL
        return $.get(url);
    }
    $('#overview-btn').click(function() {
        $("#monitoring").hide();
        $("#reports").hide();
        $("#overview").show();
    });

    $('#monitoring-btn').click(function() {
        $("#reports").hide();
        $("#overview").hide();
        $("#monitoring").show();
    });

    $('#reports-btn').click(function() {
        $("#monitoring").hide();
        $("#overview").hide();
        $("#reports").show();
    });

    // # date range picker
    $('.date-range').daterangepicker({
        opens: 'left',
        locale: {
            format: 'YYYY-MM-DD'
        }
    }, function(start, end, label) {
        console.log("A new date selection was made: " + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
    });


    $('#operations-btn').click(function(){
        var url = url_event_get_all + 'operations' + '/';
        renderTable('oper-r_table', 'ex-oper-r_table', url, ColumnsOperationsEvents, HeadersOperationsEvents);``
    });

    $('#applyFilter').click(async function () {
        try {
            // Fetch shipment data
            const shipmentData = await fetchData(url_shipment_get);
            console.log("Shipment Data:", shipmentData.shipments);
    
            // Get filter values
            const dateRange = $('#machine-date-range').val(); // Date range input
            const fromLocation = $('#fromLocation').val(); // "From" location input
            const toLocation = $('#toLocation').val(); // "To" location input
            console.log("Filter Values:", dateRange, fromLocation, toLocation);
    
            // Parse date range into start and end dates
            const [startDate, endDate] = dateRange.split(" - ").map(date => new Date(date.trim()));
    
            // Filter shipments based on criteria
            const filteredShipments = shipmentData.shipments.filter(shipment => {
                const pickupTime = new Date(shipment.pickup_time);
    
                const matchesDateRange =
                    (!startDate || pickupTime >= startDate) &&
                    (!endDate || pickupTime <= endDate);
    
                const matchesFromLocation =
                    !fromLocation || shipment.pickup_loc.includes(fromLocation);
    
                const matchesToLocation =
                    !toLocation || shipment.dropoff_loc.includes(toLocation);
                console.log("Matches:", matchesDateRange, matchesFromLocation, matchesToLocation);
                return matchesDateRange && matchesFromLocation && matchesToLocation;
            });
            console.log("Filtered Shipments:", filteredShipments);
            // Calculate totals
            const totalWeight = filteredShipments.reduce((sum, shipment) => sum + shipment.weight, 0);
            const totalPrice = filteredShipments.reduce((sum, shipment) => sum + calculatePrice(shipment), 0);
            const shipmentCount = filteredShipments.length;
    
            // Update the cards dynamically
            updateCard('#operationsBoard .col-lg-4:nth-child(1) .card-body span', `${totalWeight}kg`, "text-primary");
            updateCard('#operationsBoard .col-lg-4:nth-child(2) .card-body span', `₦${totalPrice.toFixed(2)}`, "text-success");
            updateCard('#operationsBoard .col-lg-4:nth-child(3) .card-body span', `${shipmentCount}`, "text-danger");
            
            // Populate the shipment table
            populateShipmentTable(filteredShipments);
        } catch (error) {
            console.error("Error fetching or processing data:", error);
        }
    });
    
    // Helper function to calculate price (dummy implementation, update as needed)
    function calculatePrice(shipment) {
        return shipment.weight * 2; // Example: Price is weight * 2
    }
    
    // Helper function to update a card's content
    function updateCard(selector, value, textClass) {
        $(selector)
            .removeClass("text-primary text-success text-danger")
            .addClass(textClass)
            .text(value);
    }
    
    // Function to populate the shipment table
    function populateShipmentTable(shipments) {
        const tableBody = $('#shipmentTableBody');
        tableBody.empty(); // Clear any existing rows

        shipments.forEach(shipment => {
            const row = `
                <tr>
                    <td>${shipment.shipment_id}</td>
                    <td>${shipment.weight}kg</td>
                    <td>${shipment.completed === "Yes" ? "Completed" : "Pending"}</td>
                </tr>
            `;
            tableBody.append(row); // Add the row to the table body
        });
    }
    
        

    // Function to filter events based on the selected machine and items
    function getDateRange(selector) {
        const dateRangeInput = $(selector).val().trim();
        const [start, end] = dateRangeInput.split(' - ');

        const startDate = start ? new Date(start) : null;
        const endDate = end ? new Date(end) : null;
        console.log("Date Range:", startDate, endDate);
        return { startDate, endDate };
    }

    function readCSVFile(file) {
        var reader = new FileReader();
        reader.onload = function(event) {
            var csvData = event.target.result;
            var jsonData = convertCSVToJSON(csvData);
            sendJSONDataToAPI(jsonData);
        };
        reader.readAsText(file);
    }

    function sendJSONDataToAPI(jsonData) {
        fetch(import_items_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonData)
        })
        .then(async response => {
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Error importing data');
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            alert('Data imported successfully!');
        })
        .catch(error => {
            console.error('Error:', error);
            alert(`Error importing your inventory data:\n${error.message}`);
        });
    }

    function exportJSONData(data) {
        if (!data || data.length === 0) {
            alert("No data available to export.");
            return;
        }
    
        // Convert JSON data to CSV format
        var csvContent = convertJSONToCSV(data);
    
        // Create a blob object from the CSV content
        var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
        // Create a temporary anchor element to trigger the download
        var link = document.createElement('a');
        var url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'inventory_data.csv');
        document.body.appendChild(link);
    
        // Trigger the download
        link.click();
        document.body.removeChild(link);
    }
    
    // Function to convert JSON data to CSV format
    function convertJSONToCSV(data) {
        if (!data || !data.length) {
            return ''; // Return empty string if no data
        }

        var csv = [];
        // Extract column headers from the first object in the array
        var headers = Object.keys(data[0]);
        csv.push(headers.join(','));

        // Iterate over each object in the array
        data.forEach(function(obj) {
            var row = [];
            headers.forEach(function(header) {
                row.push(obj[header] !== undefined ? obj[header] : '');
            });
            csv.push(row.join(','));
        });

        // Combine rows into a single CSV string
        return csv.join('\n');
    }


    function convertCSVToJSON(csvData) {
        var lines = csvData.split('\n').filter(line => line.trim() !== ''); // Filter out empty lines
        var result = [];
        var headers = lines[0].split(',').map(header => header.trim()); // Trim headers
        
        // Set of fields that should be converted to numbers
        var numericFields = new Set(['quantity', 'tests/vial', 'vials/pack', 'reOrderLevel', 'tests/day']);

        for (var i = 1; i < lines.length; i++) {
            var obj = {};
            var currentLine = lines[i].split(',').map(cell => cell.trim()); // Trim cell values

            for (var j = 0; j < headers.length; j++) {
                var header = headers[j];
                var value = currentLine[j];
                // Convert numeric fields to numbers
                if (numericFields.has(header)) {
                    obj[header] = Number(value);
                } else {
                    obj[header] = value;
                }
            }
            result.push(obj);
        }
        return result;
    }
    // Function to print the table content
    function printJSONDataAsCSV(jsonData) {
        // Check if jsonData is an array; if not, attempt to access the array within it.
        if (!Array.isArray(jsonData)) {
            // If jsonData has an 'events' property (like your example data structure), use that.
            jsonData = jsonData.events || [];
        }

        // If jsonData is still not an array after this, return or throw an error.
        if (!Array.isArray(jsonData) || jsonData.length === 0) {
            alert("No data available for printing.");
            return;
        }

        // Add header row
        var headerRow = [];
        for (var key in jsonData[0]) {
            if (jsonData[0].hasOwnProperty(key)) {
                headerRow.push(key);
            }
        }
        var csvContent = '<table border="2">';
        csvContent += '<thead><tr>';
        headerRow.forEach(function(header) {
            csvContent += `<th>${header}</th>`;
        });
        csvContent += '</tr></thead>';

        // Convert JSON data to CSV format
        jsonData.forEach(function(item) {
            var row = [];
            for (var key in item) {
                if (item.hasOwnProperty(key)) {
                    row.push(item[key]);
                }
            }
            csvContent += '<tr>'; // Add row start tag
            row.forEach(function(cell) {
                csvContent += `<td>${cell}</td>`;
            });
            csvContent += '</tr>'; // Add row end tag
            csvContent += '<tr><td colspan="' + headerRow.length + '"><hr></td></tr>'; // Add horizontal line
        });
        csvContent += '</table>';

        // Open a new window to display the CSV content
        var printWindow = window.open('', '_blank');
        printWindow.document.write('<html><head><title>Table Print</title></head><body>');
        printWindow.document.write(csvContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    }
});
