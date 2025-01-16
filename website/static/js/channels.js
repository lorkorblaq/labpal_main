$(function () {
    const headersChannel = ['_id','created at', 'user', 'item', 'lot_numb', 'direction', 'location', 'quantity', 'description', 'action'];
    console.log("channels.js loaded");
    BaseUrl = "https://labpal.com.ng/api";
    // BaseUrl = "http://127.0.0.1:3000/api";

    // const user_d = $.cookie('user_id');
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
    
    let dataTableInstance;
    let editedCell;
    const user_id = getCookie('user_id');
    const lab_name = getCookie("lab_name");
    const url_channel_get = `${BaseUrl}/channels/get/${user_id}/${lab_name}/`
    const url_channel_push = `${BaseUrl}/channel/push/${user_id}/${lab_name}/`;
    const url_channel_put = `${BaseUrl}/channel/put/${user_id}/${lab_name}/`;
    const url_channel_delete = `${BaseUrl}/channel/delete/${user_id}/${lab_name}/`;    
    const url_item_put = `${BaseUrl}/item/put/${user_id}/${lab_name}/`;
    const url_lot_exp = `${BaseUrl}/lotexp/get/${user_id}/${lab_name}/`;

   
    function fetchData(url_channel_push) {
        // Fetch data from the provided URL
        return $.get(url_channel_push);
    }
    
    async function fetchLotNumbers() {
        try {
            const data = await $.get(url_lot_exp);
            return data.lotexp.map(lot => lot.lot_numb);
        } catch (error) {
            console.error('Error fetching lot numbers:', error);
            return [];
        }
    }

    async function submitForm() {
        let item = $('#inputItem').val();
        let lot = $('#inputLot').val();
        let quantity = $('#QtyInputChannel').val();
        let direction = $('#dropDownDirectionChannel').val();
        let location = $('#locationsChannel').val();
        let description = $('#DescripInputChannel').val();
    
        switch (true) {
            case !item:
                alert("Please enter an item.");
                break;
            case !lot:
                alert("Please enter a lot number.");
                break;
            case !location:
                alert("Please enter a location.");
                break;
            case !quantity:
                alert("Please enter a quantity.");
                break;
            default:
                // Create an object with the form data
                const formData = {
                    item: item,
                    lot_numb: lot,
                    quantity: quantity,
                    direction: direction,
                    location: location,
                    description: description
                };
                
                // Show the loading indicator
                $('#loadingIndicator').show();
                // Make the post request
                $.post({
                    url: url_channel_push,
                    contentType: "application/json",
                    data: JSON.stringify(formData),
                    success: function (response) {
                        alert("Channel created successfully");
                        console.log(response);
                    },
                    error: function (xhr, status, error) {
                        // Extract the error message from the server response
                        if (xhr.responseJSON && xhr.responseJSON.message) {
                            alert(xhr.responseJSON.message);  // Show the custom error message
                        } else {
                            alert("An error occurred: " + error);  // Fallback for unknown errors
                        }
                        console.error(xhr.responseText);  // Log the full response for debugging
                    },
                    complete: function () {
                        // Hide the loading indicator after the request completes (success or error)
                        $('#loadingIndicator').hide();
                    }
                }); 
                refreshTable(); // Refresh the table after the form submission is done
        }
    }
    
    function refreshTable() {
        fetchData(url_channel_get).then(data => {
            dataTableInstance.clear();
            dataTableInstance.rows.add(data.channels);
            dataTableInstance.draw();
        }).catch(error => {
            console.error("Error fetching data:", error);
        });
    }
    // Call refreshTable every 5 seconds (5000 milliseconds)
    // setInterval(refreshTable, 10000);
    async function loadData () {
        $('#loadingIndicator').show();
        $('.body').empty();
        $('#reports_h').empty();
        headersChannel.forEach(function (header) {
            $('#reports_h').append(`<th>${header}</th>`);
            });
        try {
            const data = await fetchData(url_channel_get);
            console.log(data);
            // renderTablePISChannels(data.channels, headersChannel);
            renderTablePISChannels('r_table', 'ex-r_table', data.channels, headersChannel);

            } 
        catch (error) {
            console.error("Error fetching data:", error);
            }
        $('#loadingIndicator').hide();        

    }

    $('#r_table tbody').on('click','td:not(:first-child, :last-child, :nth-child(2), :nth-child(3), :nth-child(4), :nth-child(5))',function () {
        // Check if there's no other cell being edited
        if (!editedCell) {
            // Store the currently edited cell
            editedCell = $(this);
            // Get the current text of the cell
            var cellText = $(this).text();
            // Replace the cell's content with an input field, using the cell's current text as the initial value
            $(this).html('<input type="text" class="edit-input" value="' + cellText + '">');

            // Focus on the input field
            $('.edit-input').focus();
        }
    });

    $('#r_table tbody').on('blur', '.edit-input', function () {
        // Get the updated value from the input field
        var updatedValue = $(this).val();
        // Get the channel ID from the data attribute of the row
        var row = dataTableInstance.row(editedCell.closest('tr'));
        var rowData = row.data();
        var rowId = rowData._id;
        var columnIndex = editedCell.index();
        var columnsChannels = {
            0: 'created at',
            1: 'user',
            2: 'item',
            3: 'lot_numb',
            4: 'direction',
            5: 'location',
            6: 'quantity',
            7: 'description'
        };
        var columnNameChannels = columnsChannels[columnIndex];
    
        editedCell.text(updatedValue);
        editedCell = null;
    
        // Update the channel data in the database
        updateChannel(rowId, columnNameChannels, updatedValue);
    
        function updateChannel(rowId, columnNameChannels, updatedValue) {
            $.ajax({
                url: url_channel_put + rowId + '/',
                method: "PUT",
                contentType: "application/json",
                data: JSON.stringify({ [columnNameChannels]: updatedValue }),
                success: function (result) {
                    if (result && result.message) {
                        console.log(`The channel id:${rowId} updated successfully.`);
                    } else {
                        console.error("Unexpected response:", result);
                        alert("Error updating channels. Please try again or contact support");
                    }
                },
                error: function (error) {
                    console.error("Error updating Channels:", error);
                    if (error.responseJSON && error.responseJSON.message) {
                        alert(error.responseJSON.message);
                    } else {
                        alert("Error updating channels. Please try again or contact support");
                    }
                }
            });
        }
    });
    
    // Event listener for Enter key press
    $('#r_table tbody').on('keypress', '.edit-input', function (event) {
        // Check if the pressed key is Enter (key code 13)
        if (event.which === 13) {
            // Trigger the blur event to handle the update
            $(this).blur();
            }
        });
    // post for channel
    $('#postChannelForm').submit(async function (event) {
        event.preventDefault();
        let lotNumbers = await fetchLotNumbers();
        let lot = $('#inputLot').val();
        let direction = $('#dropDownDirectionChannel').val();
        console.log(direction);

        if (!lotNumbers.includes(lot)) {
            if (direction === 'To') {
                alert("Lot doesn't exist in your store so you can't send. Please get the lot from the store first.");
            } else if (direction === 'From') {
                console.log("Lot doesn't exist");
                // Show the date input modal
                $('#dateModal').modal('show');
            }
        } else if (lotNumbers.includes(lot)){
            console.log("Lot exists");
            // Handle form submission without expiration date
            await submitForm();
            refreshTable();
        }
    });

    function renderTablePISChannels(tableId, exTableId, data, columns) {
        // Destroy the existing DataTable instance for the specified table ID (if it exists)
        if (dataTableInstance) {
            dataTableInstance.destroy();
            }
        // Empty the table body and header before rendering a new table
        // $('#r_table tbody').empty();
        $(`#${tableId} thead`).empty();
        $(`#${tableId} thead`).append('<tr>' + columns.map(header => `<th>${header}</th>`));


        dataTableInstance = $(`#${tableId}`).DataTable({
            data: data,
            columns: columns.map(col => ({ data: col })),
            columnDefs: [
                {
                    targets: -1, // Target the last column
                    data: null,
                    defaultContent:
                    '<button class="tablebtn" id="btn-delete"><i class="fas fa-trash-alt"></i></button>'
                },
            ],
            order: [[1, 'desc']]
        });
        dataTableInstance.column(0).visible(false);



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

    $('#r_table tbody').on('click', '#btn-delete', function () {
        var row = dataTableInstance.row($(this).parents('tr'));
        deleteChannel(row);
        });

    $('#channel_btn').click(loadData ());

    function deleteChannel(row) {
        var rowId = row.data()._id;
        $.ajax({
            url: url_channel_delete+rowId+'/',
            method: "DELETE",
            success: function () {
                // deleteRowById(channelId);
                // Remove the row from the DataTable on successful deletion
                row.remove().draw();
            },
            error: function (error) {
                console.error("Error deleting channel:", error);
                // Handle the error and provide feedback to the user
                alert("Error deleting channel. Please try again or call Femo.");
            }
        });
    }
   
});