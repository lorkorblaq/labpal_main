$(function () {
    console.log("inventory.js loaded");
    // BaseUrl = "https://labpal.com.ng/api";
    BaseUrl = "http://0.0.0.0:3000/api";
    const HeadersItem = ['Items','Qty-in-Store', 'Unit', 'Category', 'Bench', 
                        'Class', 'BU', 'SU', 'PU', 'BU per day',
                        'BU per SU', 'SU per PU', 
                        'price per PU(₦)'];

    const ColumnsItem = ['item',  'quantity','storeUnit','category', 'bench', 
                        'class',  'baseUnit', 'storeUnit', 'purchaseUnit', 'baseUnit/day',
                        'baseUnit/storeUnit', 'storeUnit/purchaseUnit', 
                        'price/purchaseUnit'];

    const ColumnsRequest = ['bench', 'item', 'quantity', 'storeUnit', 'baseUnit', 'baseUnit_per_day', 
                            'total_baseUnit_in_store', 'quantity_baseUnit_requested', 
                            'total_days_to_last', 'amount_needed'];

    const HeadersRequest = ['Bench', 'Item', 'Qty in-Store','unit(SU)','BU', 
                            'Qty(BU)/day', 'Total Qty(BU) in-store', 
                            'Qty(BU) requested)', 'In-Stock Qty. To last(days)', 
                            'Amount needed(SU)'];

    const import_heading = ['item', 'bench', 'category', 'class', 'quantity', 
                            'reOrderLevel', 'baseUnit/day', 'baseUnit', 
                            'storeUnit', 'purchaseUnit', 'baseUnit/storeUnit', 
                            'storeUnit/purchaseUnit', 'price/purchaseUnit']

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
    const lab_name = getCookie("lab_name");
    const user_id = getCookie("user_id");
    const get_items_url = `${BaseUrl}/items/get/${user_id}/${lab_name}/`;
    const get_requistion_url = `${BaseUrl}/items/requisite/${user_id}/${lab_name}/`;
    const delete_items_url = `${BaseUrl}/items/deleteall/${user_id}/${lab_name}/`;
    const import_items_url = `${BaseUrl}/items/bulkpush/${user_id}/${lab_name}/`;
    const update_items_url = `${BaseUrl}/item/put/${user_id}/${lab_name}/`;

    let editedCell;
    let DataTable

    $('#inventory_b').click(function() {
        console.log("drawer clicked");
        $("#request_invent").hide()  ;
        $("#drawer_invent ").show();
        $("#tabel_request").hide();
    });

    $('#request_b').click(function() {
        $("#drawer_invent ").hide();
        $("#request_invent").show() ;
        // $("#tabel_request").hide();
    });

    $("#submit_request").click(function() {
        // Retrieve selected bench, categories, and number of days
        $('#loadingIndicator').show();
        var bench = $("#bench_filter").val();
        var categories = $(".category_filter:checked").map(function() {
            return $(this).val();
        }).get();
        var days = $("#quantity").val();

        if (!bench || !days) {
            // Display an error message or perform any other action
            alert("Please enter the bench and number of days to proceed.");
            $('#loadingIndicator').hide();
            return; // Exit the function early

        }

        // Prepare data to send to the API
        var requestData = {
            bench: bench,
            categories: categories,
            days: days
        };
        console.log("Request data:", requestData);
        // Send the requisition data to the API using AJAX
        $.ajax({
            url: get_requistion_url,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(requestData),
            success: function(response) {
                // Handle successful response from the API
                console.log("Requisition submitted successfully:", response);
                // You can display a success message or perform any other action here
                $("#ex-request_invent_table").show();
                renderTable('request_invent_table', 'ex-request_invent_table', response.requested, ColumnsRequest, HeadersRequest);
            },
            error: function(xhr, status, error) {
                // Handle errors from the API
                console.error("Error submitting requisition:", error);
                // You can display an error message or perform any other action here
            },
            complete: function() {
                // Hide the loader after the request completes (whether success or failure)
                $('#loadingIndicator').hide();
            }
        });
    });

    // Function to display the response data in a table
    function fetchData(url) {
        // Fetch data from the provided URL
        return $.get(url);
    }
    // Function to render a DataTable instance for the specified table ID
    function renderTable(tableId, exTableId, data, columns, headers) {
        // Check if DataTable is already initialized and destroy it if it is
        if ($.fn.DataTable.isDataTable(`#${tableId}`)) {
            var table = $(`#${tableId}`).DataTable();
            table.clear().destroy();
        }

        // Clear the table headers
        $(`#${tableId}_head`).empty();

        // Append new headers to the table
        headers.forEach(function(header) {
            $(`#${tableId}_head`).append(`<th>${header}</th>`);
        });

        // Initialize a new DataTable instance for the specified table ID
        $(`#${tableId}`).DataTable({
            data: data,
            columns: columns.map(col => ({ data: col })),
            // Add any other DataTable options as needed
        });

        // Create buttons
        var exportButton = $('<button>').text(' Export').addClass('button fas fa-file-export');
        var printButton = $('<button>').text(' Print').addClass('button fas fa-print');
        var deleteDB = $('<button>').text(' Delete').addClass('button fas fa-trash-alt');

        // Define button actions
        exportButton.click(function() {
            exportJSONData(data);
        });

        printButton.click(function() {
            printJSONDataAsCSV(data);
        });

        deleteDB.click(function() {
            // Ask the user for confirmation
            if (confirm('Are you sure you want to delete all the items? This action cannot be undone.')) {
                // If the user confirms, proceed with the deletion
                fetch(delete_items_url, {
                    method: 'DELETE'
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                    alert('Items deleted successfully!');
                    renderTable(tableId, exTableId, [], columns, headers); // Re-render table with empty data
                })
                .catch((error) => {
                    console.error('Error:', error);
                    alert('Error deleting items');
                });
            } else {
                // If the user cancels, do nothing
                alert('Deletion canceled');
            }
        });
        

        // Append buttons to exTableId if not already appended
        var buttonContainer = $(`#${exTableId}`);
        if (buttonContainer.find('.button').length === 0) {
            buttonContainer.append(exportButton).append(printButton).append(deleteDB);
        }
    }

    $('#importButton').click(function() {
        var alertMessage = `Please select a CSV file to import data.\nThe CSV file should contain exactly the following columns:\n\n`;
        $.each(import_heading, function(index, column) {
            alertMessage += `${column}\n`;
        });
        alert(alertMessage);
        
        // Create hidden file input
        var fileInput = $('<input>').attr('type', 'file').attr('accept', '.csv').css('display', 'none');
        $('body').append(fileInput); // Append to body
        
        // Bind change event before triggering click
        fileInput.on('change', function(event) {
            var file = event.target.files[0];
            if (file) {
                readCSVFile(file);
            }
        });
        // Trigger file input click
        fileInput.click();
    });

    function readCSVFile(file) {
        var reader = new FileReader();
        reader.onload = function(event) {
            var csvData = event.target.result;
            var jsonData = convertCSVToJSON(csvData);
            sendJSONDataToAPI(jsonData);
        };
        reader.readAsText(file);
    }

    function convertCSVToJSON(csvData) {
        var lines = csvData.split('\n').filter(line => line.trim() !== ''); // Filter out empty lines
        var result = [];
        var headers = lines[0].split(',').map(header => header.trim()); // Trim headers
        
        // Set of fields that should be converted to numbers (integers)
        var numericFields = new Set(['quantity', 'reOrderLevel', 'baseUnit/day', 'baseUnit/storeUnit', 'storeUnit/purchaseUnit']);
    
        // Set of fields that should be converted to floats
        var floatFields = new Set(['price/purchaseUnit']);
    
        for (var i = 1; i < lines.length; i++) {
            var obj = {};
            var currentLine = lines[i].split(',').map(cell => cell.trim()); // Trim cell values
    
            for (var j = 0; j < headers.length; j++) {
                var header = headers[j];
                var value = currentLine[j];
    
                if (numericFields.has(header)) {
                    obj[header] = Number(value); // Convert to integer
                } else if (floatFields.has(header)) {
                    obj[header] = parseFloat(value); // Convert to float
                } else {
                    obj[header] = value; // Keep as string
                }
            }
            result.push(obj);
        }
        return result;
    }
    
    
    function sendJSONDataToAPI(jsonData) {
        // Show the loading indicator when the fetch starts
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
            // Extract the success message from the response and show it in the alert
            const successMessage = data.message;
            const skippedItems = data['skipped_items due to duplication'];  // Handle skipped items if present
    
            let alertMessage = successMessage;
            if (skippedItems && skippedItems.length > 0) {
                alertMessage += `\nSkipped items due to duplication: ${skippedItems.join(', ')}`;
            }
    
            alert(alertMessage);  // Show the success message in the alert
        })
        .catch(error => {
            console.error('Error:', error);
            alert(`Error importing your inventory data:\n${error.message}`);
        })
        .finally(() => {
            // Hide the loading indicator after the request finishes
            loadingIndicator.style.display = 'none';
        });
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
        link.setAttribute('download', 'inventory_data.csv');
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

    // Event listeners for export and print buttons
    $('#export_request_button').click(function() {
        console.log("export button clicked");
        exportTableToCSV('request_invent_table');
    });

    $('#print_request_button').click(function() {
        printTable('request_invent_table');
    });

    async function loadInventoryData() {
        try {
            $('#loadingIndicator').show();
            const data = await fetchData(get_items_url);
            // console.log(data);
            renderTable('inventory_table', 'ex-inventory_table', data.items, ColumnsItem, HeadersItem);
            }
        catch (error) {
            console.error("Error fetching data:", error);
            }
        $('#loadingIndicator').hide();        
    };
    loadInventoryData();

    
    $('#all-items').click(async function() {
        console.log("All items clicked");
        try {
            const data = await fetchData(get_items_url);
            renderTable('inventory_table', 'ex-inventory_table', data.items, ColumnsItem, HeadersItem);
            console.log(data.items);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    });

    $('#reorderable').on('change', async function() {
        let selectedValue = $(this).val();  // Get the value of the selected option
        if (selectedValue === 'all-items') {
            try {
                $('#loadingIndicator').show();
                const data = await fetchData(get_items_url);
                renderTable('inventory_table', 'ex-inventory_table', data.items, ColumnsItem, HeadersItem);
                console.log(data.items);
            }
            catch (error) {
                console.error("Error fetching data:", error);
            }
            $('#loadingIndicator').hide();
            // Action when "All Items" is selected
            console.log("All Items selected");
            // Perform your action here
        } else if (selectedValue === 'reorderable') {
            try {
            $('#loadingIndicator').show();
            const data = await fetchData(get_items_url);
            const reorderableItems = data.items.filter(item => item['quantity'] <= item['reOrderLevel']);
            renderTable('inventory_table', 'ex-inventory_table', reorderableItems, ColumnsItem, HeadersItem);
            console.log(reorderableItems);
            }
            catch (error) {
                console.error("Error fetching data:", error);
                }
            $('#loadingIndicator').hide();
        }
    });
    
    $('#check_all').change(function() {
        $('.category_filter').prop('checked', this.checked);
    });

    $('.category_filter').change(function() {
        if (!this.checked) {
            $('#check_all').prop('checked', false);
        } else {
            if ($('.category_filter:checked').length === $('.category_filter').length) {
                $('#check_all').prop('checked', true);
            }
        }
    });

    function refreshTable() {
        fetchData(get_items_url).then(data => {
            dataTableInstance.clear();
            dataTableInstance.rows.add(data.channels);
            dataTableInstance.draw();
        }).catch(error => {
            console.error("Error fetching data:", error);
        });
    }

    $('[data-toggle="tooltip"]').tooltip();


    


    $('#inventory_table tbody').on('click', 'td', function () {
        // Check if there's no other cell being edited
        if (!editedCell) {
            // Store the currently edited cell
            editedCell = $(this);
            console.log('editedCell:',editedCell);
            // Get the current text of the cell
            var cellText = $(this).text();
            // Replace the cell's content with an input field, using the cell's current text as the initial value
            $(this).html('<input type="text" class="edit-input" value="' + cellText + '">');

            // Focus on the input field
            $('.edit-input').focus();
        }
    });


    $('#inventory_table tbody').on('blur', '.edit-input', function () {
        // Get the updated value from the input field
        var updatedValue = $(this).val();
        DataTable = $('#inventory_table').DataTable(); 
        // Get the channel ID from the data attribute of the row
        var row = DataTable.row(editedCell.closest('tr'));
        var rowData = row.data();
        var rowId = rowData._id;
        var columnIndex = editedCell.index();
        var columnsChannels = {
            0: 'item',
            1: 'quantity',
            2: 'storeUnit',
            3: 'category',
            4: 'bench',
            5: 'class',
            6: 'baseUnit',
            7: 'storeUnit',
            8: 'purchaseUnit',
            9: 'baseUnit/day',
            10: 'baseUnit/storeUnit',
            11: 'storeUnit/purchaseUnit',
            12: 'price/purchaseUnit'
        };
        var columnNameChannels = columnsChannels[columnIndex];
    
        editedCell.text(updatedValue);
        editedCell = null;
    
        // Update the channel data in the database
        updateInventory(rowId, columnNameChannels, updatedValue);
    
        function updateInventory(rowId, columnNameChannels, updatedValue) {
            $.ajax({
                url: update_items_url + rowId + '/',
                method: "PUT",
                contentType: "application/json",
                data: JSON.stringify({ [columnNameChannels]: updatedValue }),
                success: function (result) {
                    if (result && result.message) {
                        console.log(`The item id:${rowId} updated successfully.`);
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
    $('#inventory_table tbody').on('keypress', '.edit-input', function (event) {
        // Check if the pressed key is Enter (key code 13)
        if (event.which === 13) {
            // Trigger the blur event to handle the update
            $(this).blur();
            }
    });
});