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
    // BaseUrl = "http://0.0.0.0:3000/api";
    BaseUrl = "https://labpal.com.ng/api";

    const columnshipments = ['shipment_id', 'completed', 'created_at', 'pickup_time', 'dropoff_time','duration', 'pickup_loc', 'dropoff_loc', 'numb_of_packs', 'create_lat_lng', 'pickup_lat_lng', 'dropoff_lat_lng', 'created_by','picked_by','dropoff_by', 'description'];
    const headershipments = ['Shipment Id','Completed', 'Created ⏰', 'Pickup ⏰', 'Dropoff ⏰',' Duration⏰', 'Pickup Loc.', 'Dropoff Loc.', 'No. of packs', 'Created lat/lng', 'Pick Up lat/lng','Drop Off lat/lng', 'Created by','Picked by','Dropped by', 'Description'];

    let dataTableInstance ;
    const user_id = getCookie('user_id');
    var user_name = getCookie('name');
    const lab_name = getCookie('lab_name');
    user_name = user_name.replace(/['"]+/g, '');
    console.log(user_id, user_name, lab_name);

    const url_shipment_get = `${BaseUrl}/shipments/get/${user_id}/${lab_name}/`
    const url_shipment_push = `${BaseUrl}/shipments/push/${user_id}/${lab_name}/`;
    const url_shipment_put = `${BaseUrl}/shipments/put/${user_id}/${lab_name}/`;
    const url_shipment_delete = `${BaseUrl}/shipments/delete/${user_id}/${lab_name}/`;  


    var dropOff_dateTime;
    var formattedDuration;
    var completed = false;

    $("#create").click(function() {
        // Get form data
        var shipment_id = $('#shipment_id').text();
        var pickupLocation = $("#pickup-location").val();
        var dropoffLocation = $("#dropoff-location").val();
        var numb_of_packs = $("#numb_of_packs").val();
        var description = $("#description").val();
        console.log(url_shipment_push)
        // Check if all required form fields are filled
        if (shipment_id) {
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
                        shipment_id: shipment_id,
                        numb_of_packs: numb_of_packs,
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
                            alert('Shipment sent to the server successfully:', response);
                        },
                        error: function(xhr, status, error) {
                            alert('Error sending shipement to the server:', error);
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
                        shipment_id: pickup_shipment_ID,
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

    $("#drop-off").click(function() {
        // Get form data
        var dropped_shipment_ID = $("#drop-shipment-id").val();

        // Check if all required form fields are filled
        if (dropped_shipment_ID) {
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
                    var droplatLngString = `${latitude},${longitude}`;

                    var dropOff_dateTime = new Date(timestamp);
                    dropOff_dateTime.setHours(dropOff_dateTime.getUTCHours() + 1); // Adjust for WAT (UTC+1)
                    dropOff_dateTime = dropOff_dateTime.toISOString()

                    data = {
                        dropoff_by: user_name,
                        shipment_id: dropped_shipment_ID,
                        dropoff_lat_lng: droplatLngString,
                        // dropoff_time: dropOff_dateTime,
                    }
                    // Example of sending the data to your backend
                    $.ajax({
                        url: url_shipment_put,  // Your backend endpoint
                        type: 'PUT',
                        contentType: 'application/json',
                        data: JSON.stringify(data),
                        success: function(response) {
                            alert('Drop off sent to the server successfully:', response);
                        },
                        error: function(xhr, status, error) {
                            alert('Error sending location to the server:', error);
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

    async function loadData () {
        $('.body').empty();
        $('#reports_h').empty();
        headershipments.forEach(function (header) {
            $('#reports_h').append(`<th>${header}</th>`);
            });
        try {
            const data = await fetchData(url_shipment_get);
            console.log(data);
            renderTable('r_table', 'ex-r_table', data.shipments, columnshipments);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }
    loadData();

    function renderTable(tableId, exTableId, data, columns) {
        // Destroy the existing DataTable instance for the specified table ID (if it exists)
        if (dataTableInstance) {
            dataTableInstance.destroy();
            }
        // Empty the table body and header before rendering a new table
        // $('#r_table tbody').empty();
        // $(`#${tableId} thead`).empty();
        // $(`#${tableId} thead`).append('<tr>' + columns.map(header => `<th>${header}</th>`));


        dataTableInstance = $(`#${tableId}`).DataTable({
            data: data,
            columns: columns.map(col => ({ data: col })),
            columnDefs: [
                {
                    data: null,
                    defaultContent:
                    '<button class="tablebtn" id="btn-delete"><i class="fas fa-trash-alt"></i></button>'
                },
            ],
            order: [[1, 'desc']]
        });
        // dataTableInstance.column(0).visible(false);



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
        $('#shipment_id').text(randomString); // Append the random string to the element
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














     // Initialize the map, centered on a location (first marker's location) with a specific zoom level
     var map = L.map('map').setView([6.5568768, 3.3456128], 13);

     // Load and display OpenStreetMap tiles
     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
         maxZoom: 19,
         attribution: '© OpenStreetMap'
     }).addTo(map);

     // Array of locations (latitude, longitude)
     var locations = [
         [6.5568768, 3.3456128],
         [6.4578768, 3.2456128],
         [6.6568768, 3.1456128]
     ];

     // Loop through the locations and add a marker for each
     $.each(locations, function(index, location) {
         L.marker(location).addTo(map)
             .bindPopup('Location ' + (index + 1))
             .openPopup();
     });
});
