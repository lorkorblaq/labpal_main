$(function () {
    console.log("expiration.js loaded");
    const columnsLot = ['item', 'lot_numb', 'expiration', 'quantity', 'created at'];
    const headersLot = ['Item', 'Lot number','Expiration', 'Quantity', 'Created'];
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
    user_id = getCookie("user_id");
    lab_name = getCookie("lab_name");
    BaseUrl = "https://labpal.com.ng/api"
    // BaseUrl = "http://0.0.0.0:3000/api";
    lotexpUrl = `${BaseUrl}/lotexp/get/${user_id}/${lab_name}/`;
    const import_lots_url = `${BaseUrl}/lotexp/bulkpush/${user_id}/${lab_name}/`;


    import_heading = ['item', 'lot_numb', 'expiration', 'quantity'];

    async function fetchData(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    }
    function renderTable(tableId, exTableId, data, columns, headers) {
        // Destroy the existing DataTable instance for the specified table ID (if it exists)
        if ($.fn.DataTable.isDataTable(`#${tableId}`)) {
            $(`#${tableId}`).DataTable().clear().destroy();
            $(`#${tableId}_head`).empty(); // Remove all children elements
        }
        // Function to append headers to the table
        headers.forEach(function (header) {
            h = $(`#${tableId}_head`);
            $(`#${tableId}_head`).append(`<th>${header}</th>`);
        });
        // Initialize a new DataTable instance for the specified table ID
        $(`#${tableId}`).DataTable({
            data: data,
            columns: columns.map(col => ({ data: col })),
            // Add any other DataTable options as needed
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

    function exportJSONData(data) {
        // Convert JSON data to CSV format
        var csvContent = convertJSONToCSV(data);
        
        // Create a blob object from the CSV content
        var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        
        // Create a temporary anchor element to trigger the download
        var link = document.createElement('a');
        var url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'lot_exp.csv');
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
  
    async function loadexpireData(){
        $('#loadingIndicator').show();
        headersLot.forEach(function (header_expire) {
            $('#expire_head').append(`<th>${header_expire}</th>`);
        });
        try {
            const data = await fetchData(lotexpUrl);
            console.log(data);
            // renderExpireTable(data.lotexp, columnsLot);
            renderTable('expire_table', 'ex-expire_table', data.lotexp, columnsLot, headersLot);

            } 
        catch (error) {
            console.error("Error fetching data:", error);
            }
        $('#loadingIndicator').hide();        

    };
    loadexpireData();
    
    $('#expiry_filter').on('input', async function () {
        const filterValue = $(this).val();
    
        try {
            const data = await fetchData(lotexpUrl);
            if (filterValue === "") {
                // Load all data if input is empty
                renderTable('expire_table', 'ex-expire_table', data.lotexp, columnsLot, headersLot);
                return;
            }
    
            const filterDays = parseInt(filterValue, 10);
    
            if (isNaN(filterDays)) {
                alert("Invalid input, please enter a number");
                console.error("Invalid input: Not a number");
                return;
            }
    
            const currentDate = new Date();
            const targetDate = new Date();
            targetDate.setDate(currentDate.getDate() + filterDays);
    
            const filteredData = data.lotexp.filter(item => {
                const expirationDate = new Date(item['expiration']);
                return expirationDate <= targetDate;
            });
    
            renderTable('expire_table', 'ex-expire_table', filteredData, columnsLot, headersLot);
            console.log(filteredData);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    });

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
        
        // Set of fields that should be converted to numbers
        var numericFields = new Set(['quantity']);

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

    function sendJSONDataToAPI(jsonData) {
        // Show the loading indicator when the fetch starts
        fetch(import_lots_url, {
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
            const skippedItems = data['note'];  // Handle skipped items if present
    
            let alertMessage = successMessage;
            if (skippedItems && skippedItems.length > 0) {
                alertMessage += skippedItems;
            }
    
            alert(alertMessage);  // Show the success message in the alert
        })
        .catch(error => {
            console.error('Error:', error);
            alert(`Error importing your lots data data:\n${error.message}`);
        })
        .finally(() => {
            // Hide the loading indicator after the request finishes
            loadingIndicator.style.display = 'none';
        });
    }
});