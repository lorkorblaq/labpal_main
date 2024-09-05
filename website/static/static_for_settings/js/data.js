$(function() {
    console.log('data.js loaded');
    BaseUrl = "https://labpal.com.ng/api";
    // BaseUrl = "http://0.0.0.0:3000/api";
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
    const url_data_machine_push = `${BaseUrl}/machines/push/${user_id}/${lab_name}/`;
    const url_data_machine_bulk_push = `${BaseUrl}/machines/bulkpush/${user_id}/${lab_name}/`;
    const import_items_url = `${BaseUrl}/items/bulkpush/${user_id}/${lab_name}/`;

    const url_data_item_push = `${BaseUrl}/items/push/${user_id}/${lab_name}/`;
    const url_data_item_bulk_push = `${BaseUrl}/items/bulkpush/${user_id}/${lab_name}/`;
    const import_item_heading = ['bench', 'category', 'item', 'vials/pack', 'tests/vial', 'quantity', 'reOrderLevel', 'class', 'tests/day']
    var numericItemsFields = new Set(['quantity', 'tests/vial', 'vials/pack', 'reOrderLevel', 'tests/day']);


    const url_data_del = `${BaseUrl}/data/del/${user_id}/${lab_name}/`;

    $('#addMachine').on('click', function(event) {
        console.log('Add Machine Clicked');
        event.preventDefault();
        const data = {
            'name': $('#name_of_machine').val(),
            'serial_number': $('#serial_number').val(),
            'manufacturer': $('#manufacturer').val(),
            'name_engineer': $('#name_engineer').val(),
            'contact_engineer': $('#contact_engineer').val(),
        }
        console.log(data);
        $.ajax({
            url: url_data_machine_push,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function(response) {
                console.log(response);
                alert('Machine data Submitted');
            },
            error: function(error) {
                console.log(error);
                alert('Error Submitting Data');
            }
        });
    });

    $('#addBulkItems').click(function() {
        var alertMessage = `Please select a CSV file to import data.\nThe CSV file should contain exactly the following columns:\n\n`;
        $.each(import_item_heading, function(index, column) {
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
                readCSVFile(file, numericItemsFields);
            }
        });
        // Trigger file input click
        fileInput.click();
    });

    $('#addItem').click(function() {
        data = {
            'item': $('#name_of_item').val(),
            'tests/vial': parseInt($('#tests_vial').val(), 10),
            'vials/pack': parseInt($('#vials_pack').val(), 10),
            'tests/day': parseInt($('#tests_day').val(), 10),
            'reOrderLevel': parseInt($('#reorder_level').val(), 10),
            'class': $('#class').val(),
            'category': $('#category').val(),
            'bench': $('#bench').val(),
            'quantity': parseInt($('#quantity').val(), 10),
        };
        console.log(data);
        postSubmitsToApi(url_data_item_push, data);
    });

    // function readCSVFile(file) {
    //     var reader = new FileReader();
    //     reader.onload = function(event) {
    //         var csvData = event.target.result;
    //         var jsonData = convertCSVToJSON(csvData);
    //         sendJSONDataToAPI(jsonData, url_data_item_bulk_push);
    //     };
    //     reader.readAsText(file);
    // }

    function readCSVFile(file, numericFields = new Set()) {
        var reader = new FileReader();
        reader.onload = function(event) {
            var csvData = event.target.result;
            var jsonData = convertCSVToJSON(csvData, numericFields);
            sendJSONDataToAPI(jsonData, url_data_item_bulk_push);
        };
        reader.readAsText(file);
    }

    function convertCSVToJSON(csvData, numericFields = new Set()) {
        var lines = csvData.split('\n').filter(line => line.trim() !== ''); // Filter out empty lines
        var result = [];
        var headers = lines[0].split(',').map(header => header.trim()); // Trim headers
    
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
    function postSubmitsToApi(url, data) {
        $.ajax({
            type: 'POST',
            url: url,
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function(response) {
                alert(response.message);                
                console.log('Data successfully posted:', response);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                // Check if the responseJSON exists and has a message property
                const errorMessage = jqXHR.responseJSON && jqXHR.responseJSON.message ? jqXHR.responseJSON.message : 'An error occurred';
                alert(`${errorMessage}`);
                console.error('Error posting data:', jqXHR, textStatus, errorThrown);
            }
        });
    }
    // function convertCSVToJSON(csvData) {
    //     var lines = csvData.split('\n').filter(line => line.trim() !== ''); // Filter out empty lines
    //     var result = [];
    //     var headers = lines[0].split(',').map(header => header.trim()); // Trim headers
        
    //     // Set of fields that should be converted to numbers
    //     var numericFields = new Set(['quantity', 'tests/vial', 'vials/pack', 'reOrderLevel', 'tests/day']);

    //     for (var i = 1; i < lines.length; i++) {
    //         var obj = {};
    //         var currentLine = lines[i].split(',').map(cell => cell.trim()); // Trim cell values

    //         for (var j = 0; j < headers.length; j++) {
    //             var header = headers[j];
    //             var value = currentLine[j];
    //             // Convert numeric fields to numbers
    //             if (numericFields.has(header)) {
    //                 obj[header] = Number(value);
    //             } else {
    //                 obj[header] = value;
    //             }
    //         }
    //         result.push(obj);
    //     }
    //     return result;
    // }

    function sendJSONDataToAPI(jsonData, url) {
        fetch(url, {
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
        // Convert JSON data to CSV format
        var csvContent = convertJSONToCSV(data);

        // Create a blob object from the CSV content
        var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

        // Create a temporary anchor element to trigger the download
        var link = document.createElement('a');
        var url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'data.csv');
        document.body.appendChild(link);

        // Trigger the download
        link.click();
        document.body.removeChild(link);
    }



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
});
