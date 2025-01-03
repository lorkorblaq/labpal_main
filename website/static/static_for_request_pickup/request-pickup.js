$(document).ready(function() {


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
    BaseUrl = "http://0.0.0.0:3000/api";
    // BaseUrl = "https://labpal.com.ng/api";

    const columnRequests = ['request_id', 'completed', 'accepted', 'created_at', 'accepted_time', 'pickup_time', 'dropoff_time','duration', 'pickup_loc', 'numb_of_samples', 'created_by', 'picked_by', 'description'];
    const headerRequsts = ['Request Id','Completed', 'Accepted', 'Created at', 'accepted at', 'Pickup at', 'Dropoff at',' Duration', 'Pickup Lab.',  'No. of Samples', 'Created by', 'Picked by', 'Description'];

    let dataTableInstance ;
    const user_id = getCookie('user_id');
    var user_name = getCookie('name');
    const lab_name = getCookie('lab_name');
    user_name = user_name.replace(/['"]+/g, '');
    console.log(user_id, user_name, lab_name);

    const url_shipment_get = `${BaseUrl}/request-pickup/get/${user_id}/`
    const url_shipment_put = `${BaseUrl}/request-pickup/put/${user_id}/`;
    const url_shipment_delete = `${BaseUrl}/request-pickup/delete/${user_id}/`;  


    var dropOff_dateTime;
    var formattedDuration;
    var completed = false;

    $("#accepted").click(function() {
        // Get form data
        var accept_request_ID = $("#accept-request-id").val();

        // Check if all required form fields are filled
        if (accept_request_ID) {
            // Check if Geolocation is supported
            if (navigator.geolocation) {
                // Get current position
                navigator.geolocation.getCurrentPosition(function(position) {
                    // Extract latitude, longitude, accuracy, and timestamp
                    var latitude = position.coords.latitude;
                    var longitude = position.coords.longitude;
                    var accuracy = position.coords.accuracy;
                    var timestamp = position.timestamp;
                    completed = true;
                    var acceptlatLngString = `${latitude},${longitude}`;

                    var dropOff_dateTime = new Date(timestamp);
                    dropOff_dateTime.setHours(dropOff_dateTime.getUTCHours() + 1); // Adjust for WAT (UTC+1)
                    dropOff_dateTime = dropOff_dateTime.toISOString()

                    data = {
                        accepted_by: user_name,
                        request_id: accept_request_ID,
                    }
                    console.log(data)
                    // Example of sending the data to your backend
                    $.ajax({
                        url: url_shipment_put,  // Your backend endpoint
                        type: 'PUT',
                        contentType: 'application/json',
                        data: JSON.stringify(data),
                        success: function(response) {
                            alert('Request has been accepted:', response);
                        },
                        error: function(xhr, status, error) {
                            alert('Error accepting request, please try again:', error);
                        }
                    });

                }, function(error) {
                    console.error("Error Code = " + error.code + " - " + error.message);
                });
            } else {
                alert("Geolocation is not supported by this browser.");
            }
        } else {
            alert("Please fill in all the required fields.");
        }
    });

    $("#pick-up").click(function() {
        // Get form data
        var pickup_shipment_ID = $("#pick-shipment-id").val();

        // Check if all required form fields are filled
        if (pickup_shipment_ID) {
            // Check if Geolocation is supported
            if (navigator.geolocation) {
                // Get current position
                navigator.geolocation.getCurrentPosition(function(position) {
                    // Extract latitude, longitude, accuracy, and timestamp
                    var latitude = position.coords.latitude;
                    var longitude = position.coords.longitude;
                    var timestamp = position.timestamp;

                    // Convert timestamp to WAT (West Africa Time)
                    var pickUp_dateTime = new Date(timestamp);
                    pickUp_dateTime.setHours(pickUp_dateTime.getUTCHours() + 1); 
                    pickUp_dateTime = pickUp_dateTime.toISOString()
                    var picklatLngString = `${latitude},${longitude}`;

                    data = {
                        picked_by: user_name,
                        request_id: pickup_shipment_ID,
                        pickup_lat_lng: picklatLngString,
                        // pickup_time: pickUp_dateTime,
                    }

                    // Example of sending the data to your backend
                    $.ajax({
                        url: url_shipment_put,
                        type: 'PUT',
                        contentType: 'application/json',
                        data: JSON.stringify(data),
                        success: function(response) {
                            alert('pick up sent to the server successfully:', response);
                        },
                        error: function(xhr, status, error) {
                            alert('Error sending location to the server:', error);
                        }
                    });
                }, function(error) {
                    console.error("Error Code = " + error.code + " - " + error.message);
                });
            } else {
                alert("Geolocation is not supported by this browser.");
            }
        } else {
            alert("Please fill in all the required fields.");
        }
    });

    $("#dropped-off").click(function() {
        // Get form data
        var drop_off_request_ID = $("#drop-off-shipment-id").val();

        // Check if all required form fields are filled
        if (drop_off_request_ID) {
            // Check if Geolocation is supported
            if (navigator.geolocation) {
                // Get current position
                navigator.geolocation.getCurrentPosition(function(position) {
                    // Extract latitude, longitude, accuracy, and timestamp
                    var latitude = position.coords.latitude;
                    var longitude = position.coords.longitude;
                    var accuracy = position.coords.accuracy;
                    var timestamp = position.timestamp;
                    completed = true;
                    var acceptlatLngString = `${latitude},${longitude}`;

                    var dropOff_dateTime = new Date(timestamp);
                    dropOff_dateTime.setHours(dropOff_dateTime.getUTCHours() + 1); // Adjust for WAT (UTC+1)
                    dropOff_dateTime = dropOff_dateTime.toISOString()

                    data = {
                        dropped_by: user_name,
                        request_id: drop_off_request_ID,
                        accept_lat_lng: acceptlatLngString,
                    }
                    console.log(data)
                    // Example of sending the data to your backend
                    $.ajax({
                        url: url_shipment_put,  // Your backend endpoint
                        type: 'PUT',
                        contentType: 'application/json',
                        data: JSON.stringify(data),
                        success: function(response) {
                            alert('Request has been dropped:', response);
                        },
                        error: function(xhr, status, error) {
                            alert('Error dropping request, please try again:', error);
                        }
                    });

                    var seconds = Math.floor((duration / 1000) % 60);
                    var minutes = Math.floor((duration / (1000 * 60)) % 60);
                    var hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
                    var days = Math.floor(duration / (1000 * 60 * 60 * 24));
    
                    // Format duration with leading zeros
                    var formattedDuration = 
                        ("00" + days).slice(-2) + "days:" +
                        ("00" + hours).slice(-2) + "hrs:" +
                        ("00" + minutes).slice(-2) + "mins:" +
                        ("00" + seconds).slice(-2) + "sec";
    
                    // Display the drop-off stamp and duration in the table
                    $("#drop-off").text(dropOff_dateTime);
                    $("#duration").text(formattedDuration);

                }, function(error) {
                    console.error("Error Code = " + error.code + " - " + error.message);
                });
            } else {
                alert("Geolocation is not supported by this browser.");
            }
        } else {
            alert("Please fill in all the required fields.");
        }
    });


    $('#start-tracking').submit(async function (event) {
        event.preventDefault(); // Prevent the default form submission

        // Get the values from the input fields
        await submitForm();
        refreshTable();
    });

    async function submitForm() {
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;
        var accuracy = position.coords.accuracy;
        var timestamp = position.timestamp;
        var date = new Date(timestamp);
        date.setHours(date.getUTCHours() + 1); // Adjust for WAT (UTC+1)
        var pickUpStamp = date.toISOString().replace('T', ' ').replace('Z', '').split('.')[0];
        var pickupLocation = $("#pickup-location").val();
        var pickup_batchID = $("#pickup-box").val();
        var dropoffLocation = $("#dropoff-location").val();
        var riderName = $("#rider-name").val();

        switch (true) {
            case !pickupLocation:
                alert("Please enter a pick up location.");
                break;
            case !pickup_batchID:
                alert("Please enter a batch ID.");
                break;
            case !dropoffLocation:
                alert("Please enter a drop off location.");
                break;
            default:
                try {
                    const logistics_get_data = await fetchData(item_url);
    
                    // Check if the item is present in the fetched data
                    const batchExists = item_data.items.some(dataItem => dataItem.item === item);
    
                    if (!batchExists) {
                        alert("Batch ID not present.");
                    } else {
                        let formData = {
                            bench: bench,
                            machine: machine,
                            item: item,
                            lot_numb: lot,
                            quantity: quantity,
                            description: description
                        };
                        $.post({
                            url: piu_push,
                            contentType: "application/json",
                            data: JSON.stringify(formData),
                            success: function (response) {
                                alert("Pickup logged successfully");
                                console.log(response);
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                let errorMessage = "Could not insert data. Please make sure you input the correct values.";
                                if (jqXHR.responseJSON && jqXHR.responseJSON.message) {
                                    errorMessage = jqXHR.responseJSON.message;
                                }
                                alert(errorMessage);
                                console.error(errorThrown);
                            }
                        });
                    }
    
                } catch (error) {
                    console.error("Error fetching data:", error);
                }
        }
        refreshTable();
    }

    function fetchData(logistics_get) {
        // Fetch data from the provided URL
        return $.get(logistics_get);
    }

    var map;

    // Function to initialize the map on the created location of the last shipment
    async function loadMapWithLastShipment() {
        // Clear any previous map markers or polylines
        $('#map').empty();
    
        try {
            // Fetch all shipment data
            const data = await fetchData(url_shipment_get);
            const requests = data.requests;
    
            // Get the last shipment
            const lastShipment = requests[requests.length - 1];
    
            if (!lastShipment) {
                alert('No requests found.');
                return;
            }
    
            // Extract coordinates for the created location
            let createLatLng = lastShipment.create_lat_lng.split(",").map(Number);
    
            // Initialize the map (if it's not already initialized)
            if (!map) {
                map = L.map('map').setView(createLatLng, 13); // Center map on created location
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '© OpenStreetMap'
                }).addTo(map);
            }
    
            let createdAddress = await reverseGeocode(createLatLng);
            // Add marker for the created location
            let createMarker = L.marker(createLatLng).addTo(map)
                .bindPopup(`<b>Last created shipment:</b> ${lastShipment.created_at}, ${createdAddress}`).openPopup();
    
            // Reverse geocode to get the address from the coordinates
    
        } catch (error) {
            console.error("Error fetching shipment data:", error);
        }
    }
    
    // Function to reverse geocode the coordinates to a human-readable address
    async function reverseGeocode(latlng) {
        const [lat, lng] = latlng;
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    
        try {
            const response = await fetch(url);
            const data = await response.json();
            const address = data.display_name;  // Full address    
            return address;
        } catch (error) {
            console.error("Error with reverse geocoding:", error);
        }
    }
    
    // Function to plot shipment by its ID
    async function plotShipmentByID(request_id) {
        try {
            // Fetch the shipment data from the backend for the user
            const data = await fetchData(url_shipment_get);
            const requests = data.requests;
    
            // Filter the shipment by the entered shipment ID
            const filteredShipment = requests.find(shipment => shipment.request_id === request_id);
    
            if (!filteredShipment) {
                alert('Request ID not found.');
                return;
            }
    
            // Extract coordinates from the filtered shipment
            let createLatLng = filteredShipment.create_lat_lng.split(",").map(Number);
            let pickupLatLng = filteredShipment.pickup_lat_lng.split(",").map(Number);
            let dropoffLatLng = filteredShipment.dropoff_lat_lng.split(",").map(Number);
    
            // Check if the map already exists and destroy it if necessary
            if (map !== null) {
                map.remove();  // This destroys the previous map instance
            }
    
            // Initialize the map, centering on the "created" coordinates
            map = L.map('map').setView(createLatLng, 13); // Dynamically set the center
    
            // Add the tile layer (map base)
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap'
            }).addTo(map);

            let createdAddress = await reverseGeocode(createLatLng);
            let pickedAddress = await reverseGeocode(pickupLatLng);
            let droppedAddress = await reverseGeocode(dropoffLatLng);

            // Plot markers for each stage (created, picked up, dropped off)
            let createMarker = L.marker(createLatLng).addTo(map)
                .bindPopup(`<b>Created:</b> ${filteredShipment.created_at}, ${createdAddress}`).openPopup();
            let pickupMarker = L.marker(pickupLatLng).addTo(map)
                .bindPopup(`<b>Picked Up:</b> ${filteredShipment.pickup_time}, ${pickedAddress}`).openPopup();
            let dropoffMarker = L.marker(dropoffLatLng).addTo(map)
                .bindPopup(`<b>Dropped Off:</b> ${filteredShipment.dropoff_time},${filteredShipment.duration} ${droppedAddress}`).openPopup();
    
    
            // // Plot markers for each stage (created, picked up, dropped off)
            // L.marker(createLatLng).addTo(map)
            //     .bindPopup(`<b>Created:</b> ${filteredShipment.created_at}`).openPopup();
    
            // L.marker(pickupLatLng).addTo(map)
            //     .bindPopup(`<b>Picked Up:</b> ${filteredShipment.pickup_time}`).openPopup();
    
            // L.marker(dropoffLatLng).addTo(map)
            //     .bindPopup(`<b>Dropped Off:</b> ${filteredShipment.dropoff_time}`).openPopup();
    
            // Plot the route as a polyline connecting the created, picked up, and dropped off points
            let polyline = L.polyline([createLatLng, pickupLatLng, dropoffLatLng], { color: 'blue' }).addTo(map);
    
            // Zoom the map to fit all markers and route
            map.fitBounds(polyline.getBounds());
        } catch (error) {
            console.error("Error fetching shipment data:", error);
        }
    }

    // Event listener for the "Plot Shipment" button
    $('#plot-shipment-form').submit(function(event) {
        event.preventDefault();
        const request_id = $('#shipment-id-input').val(); // Assuming you have an input field for shipment ID
        if (request_id) {
            plotShipmentByID(request_id);
        } else {
            alert("Please enter a shipment ID.");
        }
    });
    loadMapWithLastShipment();

    async function loadData () {
        $('#loadingIndicator').show();
        $('.body').empty();
        $('#reports_h').empty();
        headerRequsts.forEach(function (header) {
            $('#reports_h').append(`<th>${header}</th>`);
            });
        try {
            const data = await fetchData(url_shipment_get);
            console.log(data);
            renderTable('r_table', 'ex-r_table', data.requests, columnRequests);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
        $('#loadingIndicator').hide();        
    }
    loadData();

    function renderTable(tableId, exTableId, data, columns) {
        // Helper function to convert minutes to D:H:M format
        function formatDuration(minutes) {
            const days = Math.floor(minutes / (24 * 60));
            const hours = Math.floor((minutes % (24 * 60)) / 60);
            const mins = minutes % 60;
    
            return `${days}D:${hours}H:${mins}M`;
        }
    
        // Destroy the existing DataTable instance for the specified table ID (if it exists)
        if (dataTableInstance) {
            dataTableInstance.destroy();
        }
    
        // Map the columns, applying the formatDuration function to the 'duration' field
        dataTableInstance = $(`#${tableId}`).DataTable({
            data: data,
            columns: columns.map(col => {
                if (col === 'duration') {
                    // Apply custom formatting to the duration column
                    return {
                        data: col,
                        render: function(data, type, row) {
                            if (type === 'display' && data !== null) {
                                return formatDuration(data); // Convert minutes to D:H:M format
                            }
                            return data;
                        }
                    };
                }
                // Default behavior for other columns
                return { data: col };
            }),
            columnDefs: [
                {
                    data: null,
                    defaultContent:
                    '<button class="tablebtn" id="btn-delete"><i class="fas fa-trash-alt"></i></button>'
                },
            ],
            order: [[1, 'desc']]
        });
    
        // Add export and print buttons
        var exportButton = $('<button>').text(' Export').addClass('button fas fa-file-export');
        var printButton = $('<button>').text(' Print').addClass('button fas fa-print');
        exportButton.click(function() {
            exportJSONData(data);
        });
        printButton.click(function() {
            printJSONDataAsCSV(data);
        });
    
        if ($(`#${exTableId}`).find('.button').length === 0) {
            $(`#${exTableId}`).append(exportButton).append(printButton);
        }
    }
    

    function exportJSONData(data) {
        // Convert JSON data to CSV format
        var csvContent = convertJSONToCSV(data);
        
        // Create a blob object from the CSV content
        var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        
        // Create a temporary anchor element to trigger the download
        var link = document.createElement('a');
        var url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'channels data.csv');
        document.body.appendChild(link);
        
        // Trigger the download
        link.click();
        document.body.removeChild(link);
    }
    // Function to convert JSON data to CSV format
    function convertJSONToCSV(data) {
        var csv = [];
        // Extract column headers from the first object in the array
        var headers = Object.keys(data[0]);
        csv.push(headers.join(','));
        
        // Iterate over each object in the array
        data.forEach(function(obj) {
            var row = [];
            // Iterate over each property in the object
            headers.forEach(function(header) {
                // Add the property value to the row array
                row.push(obj[header]);
            });
            // Join row array with comma and push to CSV array
            csv.push(row.join(','));
        });
        
        // Combine rows into a single CSV string
        var csvContent = csv.join('\n');
        return csvContent;
    }
    // Function to print the table content
    function printJSONDataAsCSV(jsonData) {
        // Add header row
        var headerRow = [];
        for (var key in jsonData[0]) {
            if (jsonData[0].hasOwnProperty(key)) {
                headerRow.push(key);
            }
        }
        var csvContent = '<table border="2">';
        // Add header row to CSV content
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
    $('#openCreateModalBtn').on('click', function() {
        const randomString = generateRandomString(7);
        $('#request_id').text(randomString); // Append the random string to the element
    });

    function generateRandomString(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const charactersLength = characters.length;
    
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
    
        return result;
    }


    // Shipment dashboard
    $('#dashboard').on('click', function() {
        console.log('Dashboard clicked');
        $('#ex-r_table').css('display', 'none');
    }
    );

});
