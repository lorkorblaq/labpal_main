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

    const columnRequests = ['request_id', 'completed', 'created_at', 'pickup_time', 'dropoff_time','duration', 'pickup_loc', 'numb_of_samples', 'picked_by', 'description'];
    const headerRequest = ['Request Id','Completed', 'Created at', 'Picked at', 'Dropped at',' Duration⏰', 'Pickup Lab.', 'No. of samples', 'Picked by', 'Description'];

    let dataTableInstance ;
    const user_id = getCookie('user_id');
    var user_name = getCookie('name');
    const lab_name = getCookie('lab_name');
    user_name = user_name.replace(/['"]+/g, '');
    console.log(user_id, user_name, lab_name);

    const url_shipment_get = `${BaseUrl}/request-pickup/get/${user_id}/`
    const url_shipment_push = `${BaseUrl}/request-pickup/push/${user_id}/`;
    const url_shipment_put = `${BaseUrl}/request-pickup/put/${user_id}/`;
    const url_shipment_delete = `${BaseUrl}/request-pickup/delete/${user_id}/`;  


    var dropOff_dateTime;
    var formattedDuration;
    var completed = false;

    $("#create").click(function() {
        // Get form data
        var request_id = $('#request_id').text();
        var pickupLocation = $("#pickup-location").val();
        var dropoffLocation = $("#dropoff-location").val();
        var numb_of_samples = $("#numb_of_samples").val();
        var weight = $("#weight").val();
        var description = $("#description").val();
        console.log(url_shipment_push)
        // Check if all required form fields are filled
        if (request_id) {
            // Check if Geolocation is supported
            if (navigator.geolocation) {
                // Get current position
                navigator.geolocation.getCurrentPosition(function(position) {
                    // Extract latitude, longitude, accuracy, and timestamp
                    var latitude = position.coords.latitude;
                    var longitude = position.coords.longitude;
                    var createLatLngString = `${latitude},${longitude}`;
                    var timestamp = position.timestamp;
                    var create_dateTime = new Date(timestamp);
                    create_dateTime.setHours(create_dateTime.getUTCHours() + 1); // Adjust for WAT (UTC+1)
                    created_at = create_dateTime.toISOString()

                    completed = true;
                    data = {
                        created_at: created_at,
                        request_id: request_id,
                        numb_of_samples: numb_of_samples,
                        weight: weight,
                        pickup_loc: pickupLocation,
                        dropoff_loc: dropoffLocation,
                        create_lat_lng: createLatLngString,
                        description: description
                    }
                    console.log(data); 
                    // Example of sending the data to your backend
                    $.ajax({
                        url: url_shipment_push,
                        type: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify(data),
                        success: function(response) {
                            alert('Pickup request sent successfully', response);
                        },
                        error: function(xhr, status, error) {
                            alert('Error sending pickup request', error);
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
            const shipments = data.shipments;
    
            // Get the last shipment
            const lastShipment = shipments[shipments.length - 1];
    
            if (!lastShipment) {
                alert('No shipments found.');
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
            const shipments = data.shipments;
    
            // Filter the shipment by the entered shipment ID
            const filteredShipment = shipments.find(shipment => shipment.request_id === request_id);
    
            if (!filteredShipment) {
                alert('Shipment ID not found.');
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
        headerRequest.forEach(function (header) {
            $('#reports_h').append(`<th>${header}</th>`);
            });
        try {
            const data = await fetchData(url_shipment_get);
            renderTable('r_table', 'ex-r_table', data.requests, columnRequests);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
        $('#loadingIndicator').hide();        
    }
    loadData();

    // function renderTable(tableId, exTableId, data, columns) {
    //     // Helper function to convert minutes to D:H:M format
    //     function formatDuration(minutes) {
    //         const days = Math.floor(minutes / (24 * 60));
    //         const hours = Math.floor((minutes % (24 * 60)) / 60);
    //         const mins = minutes % 60;
    
    //         return `${days}D:${hours}H:${mins}M`;
    //     }
    
    //     // Destroy the existing DataTable instance for the specified table ID (if it exists)
    //     if (dataTableInstance) {
    //         dataTableInstance.destroy();
    //     }
    
    //     // Map the columns, applying the formatDuration function to the 'duration' field
    //     dataTableInstance = $(`#${tableId}`).DataTable({
    //         data: data,
    //         columns: columns.map(col => {
    //             if (col === 'duration') {
    //                 // Apply custom formatting to the duration column
    //                 return {
    //                     data: col,
    //                     render: function(data, type, row) {
    //                         if (type === 'display' && data !== null) {
    //                             return formatDuration(data); // Convert minutes to D:H:M format
    //                         }
    //                         return data;
    //                     }
    //                 };
    //             }
    //             // Default behavior for other columns
    //             return { data: col };
    //         }),
    //         columnDefs: [
    //             {
    //                 data: null,
    //                 defaultContent:
    //                 '<button class="tablebtn" id="btn-delete"><i class="fas fa-trash-alt"></i></button>'
    //             },
    //         ],
    //         order: [[1, 'desc']]
    //     });
    
    //     // Add export and print buttons
    //     var exportButton = $('<button>').text(' Export').addClass('button fas fa-file-export');
    //     var printButton = $('<button>').text(' Print').addClass('button fas fa-print');
    //     exportButton.click(function() {
    //         exportJSONData(data);
    //     });
    //     printButton.click(function() {
    //         printJSONDataAsCSV(data);
    //     });
    
    //     if ($(`#${exTableId}`).find('.button').length === 0) {
    //         $(`#${exTableId}`).append(exportButton).append(printButton);
    //     }
    // }

    function renderTable(tableId, exTableId, data, columns) {
        function formatDuration(minutes) {
            const days = Math.floor(minutes / (24 * 60));
            const hours = Math.floor((minutes % (24 * 60)) / 60);
            const mins = minutes % 60;
            return `${days}D:${hours}H:${mins}M`;
        }
    
        if (dataTableInstance) {
            dataTableInstance.destroy();
        }
    
        dataTableInstance = $(`#${tableId}`).DataTable({
            data: data,
            columns: columns.map(col => {
                if (col === 'duration') {
                    return {
                        data: col,
                        render: function(data, type, row) {
                            if (type === 'display' && data !== null) {
                                return formatDuration(data);
                            }
                            return data;
                        }
                    };
                }
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
    
        $(`#${tableId} tbody`).on('click', 'tr', function () {
            var rowData = dataTableInstance.row(this).data();
    
            var trackingInfoHtml = createTrackingTimeline(rowData);
            console.log(trackingInfoHtml);
            $('#mappingModal').modal('show');
            $('#tracking-info').html(trackingInfoHtml);
        });        
    
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
    
    function createTrackingTimeline(rowData) {
        function formatTimeFromTimestamp(rowData, timestampField) {
            // Check if the timestampField exists and is valid
            const timestamp = new Date(rowData[timestampField]);
        
            if (isNaN(timestamp)) {
                return '';  // Return if the timestamp is invalid
            }
        
            // Extract hours, minutes, and seconds, ensuring two-digit format
            const hours = String(timestamp.getHours()).padStart(2, '0');
            const minutes = String(timestamp.getMinutes()).padStart(2, '0');
            const seconds = String(timestamp.getSeconds()).padStart(2, '0');
        
            // Return formatted time in HH:MM:SS format
            return `${hours}:${minutes}:${seconds}`;
        }

        console.log(rowData);
        const statuses = [
            {
                status: "Request Received", 
                details: "Waiting for the Lab. to confirm your request.", 
                time: formatTimeFromTimestamp(rowData, 'accepted_time'), 
                completed: rowData.accepted === "yes", // or another relevant field from your data
            },            
            { 
                status: "Rider loop", 
                details: "Searching for the closest rider to assign.", 
                time: formatTimeFromTimestamp(rowData, 'assignedTime'), 
                completed: rowData.assigned === "yes", // or another relevant field from your data

            },
            { 
                status: "Rider enroute", 
                details: "A rider has been assigned and is on their way to pickup.", 
                time: formatTimeFromTimestamp(rowData, 'enrouteTime'), 
                completed: rowData.enroute === "yes" 
            },
            { 
                status: "Rider At Your Place", 
                details: "Rider is waiting to pick up your samples.", 
                time: formatTimeFromTimestamp(rowData, 'atPickupTime'), 
                completed: rowData.atPickup === "yes" 
            },
            { 
                status: "Samples Picked Up", 
                details: "Samples have been picked up and are on their way to the lab.", 
                time: formatTimeFromTimestamp(rowData, 'pickup_time'), 
                completed: rowData.picked === "yes" 
            },
            { 
                status: "Samples Dropped Off", 
                details: "Samples have been dropped off at the lab.", 
                time: formatTimeFromTimestamp(rowData, 'dropoff_time'), 
                completed: rowData.completed === "yes" 
            }
        ];
    
        let timelineHtml = '<div class="timeline">';
        statuses.forEach(status => {
            const completedClass = status.completed ? 'completed' : 'pending';
            timelineHtml += `
                <div class="timeline-item ${completedClass}">
                    <div class="timeline-status">${status.status}</div>
                    <div class="timeline-details">${status.details}</div>
                    <div class="timeline-time">${status.time}</div>
                </div>
            `;
        });
        timelineHtml += '</div>';
    
        return timelineHtml;
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
