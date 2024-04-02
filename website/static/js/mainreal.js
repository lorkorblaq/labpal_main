$(function () {
    console.log("ready");
    const headersPIS = ['id','created at', 'user', 'item', 'lot', 'bench', 'machine', 'quantity', 'description', ''];
    const headersChannel = ['id','created at', 'user', 'item', 'lot', 'direction', 'location', 'quantity', 'description', ''];
    const ColumnsItem = ['item', 'category', 'in stock', 'unit', 'per unit', 'machine', 'bench'];
    const headersItem = ['Item', 'Category', 'In Stock', 'Unit', 'Per Pack', 'Machine', 'Bench'];
    const columnsLot = ['item', 'lot', 'expiry date'];
    const headersLot = ['Item', 'Lot', 'Expiry Date'];
    BaseUrl = "http://127.0.0.1:5000/api/"
    // post for put in use
    $('#postFormPIS').submit(function (event) {
        event.preventDefault(); // Prevent the default form submission

        // Get the values from the input fields
        let bench = $('#dropDownBench').val();
        let machine = $('#dropDownMachine').val();
        let item = $('#autoInputItem').val();
        let lot = $('#autoInputLot').val();
        let quantity = $('#quantityInputPIS').val();
        let description = $('#DescripInputPIS').val();

        // Create an object with the form data
        let formData = {
            bench: bench,
            machine: machine,
            item: item,
            lot: lot,
            quantity: quantity,
            description: description
        };
        console.log(formData);
        url = $('#postFormPIS').attr('action');
        $.post({
            url: url,
            contentType: "application/json",
            data: JSON.stringify(formData),
            success: function(response) {
                alert("Item put in use successfully");
                console.log(response);
            },
            error: function(error) {
                alert("Error Inserting Data");
                console.error(error);
            }
        });
    });

    $('#postChannelForm').submit(function (event) {
        event.preventDefault(); // Prevent the default form submission
        //get the values from the input fields
        let item = $('#autoInputItem').val();
        let lot = $('#autoInputLot').val();
        let quantity = $('#QtyInputChannel').val();
        let direction = $('#dropDownDirectionChannel').val();
        let location = $('#dropDownLocationsChannel').val();
        let description = $('#DescripInputChannel').val();

        // Create an object with the form data
        let formData = {
            item: item,
            lot: lot,
            quantity: quantity,
            direction: direction,
            location: location,
            description: description
            };

        console.log(formData);
        url = $('#postChannelForm').attr('action');
        $.post({
            url: url,
            contentType: "application/json",
            data: JSON.stringify(formData),
            success: function(response) {
                alert("Channel created successfully");
                // console.log(response);
                dataTableInstance.reload();
                },
            error: function(error) {
                alert("Error Inserting Data into Channels");
                console.error(error);
                }
            });
        });
        // Autocompletes 
    $('#InputItemMain').typeahead({
        source: function (request, response) {
            $.ajax({
                url: "http://127.0.0.1:5000/api/items/get/", // Replace with your API endpoint for item search
                method: "GET",
                data: { term: request.term },
                dataType: "json",
                success: function (data) {
                    console.log("Retrieved data:", data);
                    const itemNames = data.items.map(item => item.item);
                    response(itemNames);
                    },
                error: function (error) {
                    console.error("Error fetching item data:", error);
                    }
                });
            },
        });
    $('#autoInputItem').typeahead({
        source: function (request, response) {
            $.ajax({
                url: "http://127.0.0.1:5000/api/items/get/", // Replace with your API endpoint for item search
                method: "GET",
                data: { term: request.term },
                dataType: "json",
                success: function (data) {
                    console.log("Retrieved data:", data);
                    const itemNames = data.items.map(item => item.item);
                    response(itemNames);
                    },
                error: function (error) {
                    console.error("Error fetching item data:", error);
                    }
                });
            },
        });
    $('#autoInputLot').typeahead({
        source: function (request, response) {
            $.ajax({
                url: "http://127.0.0.1:5000/api/lot-exp/get/", // Replace with your API endpoint for item search
                method: "GET",
                data: { term: request.term },
                dataType: "json",
                success: function (data) {
                    console.log("Retrieved data:", data);
                    const itemNames = data.lot_exp.map(lot => lot.lot);
                    response(itemNames);
                    },
                error: function (error) {
                    console.error("Error fetching item data:", error);
                    }
                });
            },
        });

    async function fetchData(url) {
        const response = await fetch(url);
        return response.json();
        }
    let dataTableInstance;

    let editedCell;
    
    $('#r_table tbody').on('click','td:not(:first-child, :last-child, :nth-child(2))',function () {
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

        // Event listener for input field blur (focus out)


    // Event listener for out mouse press
    $('#r_table tbody').on('blur', '.edit-input', function () {
        // Get the updated value from the input field
        var updatedValue = $(this).val();
        // Get the channel ID from the data attribute of the row
        
        var row = dataTableInstance.row(editedCell.closest('tr'));
        var rowData = row.data();
        var rowId = rowData.id;
        // console.log(rowId);
        // console.log(channelId);
        // Get the column index
        var columnIndex = editedCell.index();
        // console.log(columnIndex);
        var columnsChannels={0:'created at',1:'user',2:'item',3:'lot',4:'direction', 5:'location',6:'quantity',7:'description',};
        var columnNameChannels = columnsChannels[columnIndex];

        var columnsPIS={0:'created at',1:'user',2:'item',3:'lot',4:'bench', 5:'machine',6:'quantity',7:'description',};
        var columnNamePIS = columnsPIS[columnIndex];
        // Get the column name from the DataTable instance

        // console.log(columnName);
        // Update the content of the cell with the new value
        editedCell.text(updatedValue);
        // console.log(updatedValue);
        // Reset the editedCell variable
        editedCell = null;
        // Update the channel data in the database
        var path = window.location.pathname;
        if (path.includes('/channels')) {
            updateChannel(rowId, columnNameChannels, updatedValue);
        } else if (path.includes('/put-in-use')) {
            updatePIS(rowId, columnNamePIS, updatedValue);
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

    // Function to update channel data in the database

    // Function to update channel data in the database
    function updateChannel(rowId, columnNameChannels, updatedValue) {
        // Send PUT request to update the channel
        $.ajax({
            url: `http://127.0.0.1:5000/api/channel/put/${rowId}/`,
            method: "PUT",
            contentType: "application/json",
            data: JSON.stringify({ [columnNameChannels]: updatedValue }),
            success: function () {
                // alert('Channel updated successfully')
                // Optionally, handle success actions
                console.log(`Channel ${rowId} updated successfully.`);
            },
            error: function (error) {
                console.error("Error updating channel:", error);
                // Handle the error and provide feedback to the user
                alert("Error updating channel. Please try again or call Femo");
            }
        });
    }
    function updatePIS(rowId, columnNamePIS, updatedValue) {
        // Send PUT request to update the channel
        $.ajax({
            url: `http://127.0.0.1:5000/api/pis/put/${rowId}/`,
            method: "PUT",
            contentType: "application/json",
            data: JSON.stringify({ [columnNamePIS]: updatedValue }),
            success: function () {
                // alert('Channel updated successfully')
                // Optionally, handle success actions
                console.log(`The put in Use id:${rowId} updated successfully.`);
            },
            error: function (error) {
                console.error("Error updating PIS:", error);
                // Handle the error and provide feedback to the user
                alert("Error updating Put in Use Table. Please try again or call Femo");
            }
        });
    }

    function fetchData(url) {
        // Fetch data from the provided URL
        return $.get(url);
    }

    function deleteChannel(row) {
        var rowId = row.data().id;
        var path = window.location.pathname;
        if (path.includes('/channels')) {
            $.ajax({
                url: `http://127.0.0.1:5000/api/channel/delete/${rowId}/`,
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
        } else if (path.includes('/put-in-use')) {
            $.ajax({
                url: `http://127.0.0.1:5000/api/pis/delete/${rowId}/`,
                method: "DELETE",
                success: function () {
                    // deleteRowById(channelId);
                    // Remove the row from the DataTable on successful deletion
                    row.remove().draw();
                },
                error: function (error) {
                    console.error("Error deleting Put in use data:", error);
                    // Handle the error and provide feedback to the user
                    alert("Error deleting channel. Please try again or call Femo.");
                }
            });
        }        
    }

    $('#r_table tbody').on('click', '#btn-delete', function () {
        var row = dataTableInstance.row($(this).parents('tr'));
        deleteChannel(row);
        });


    function renderTablePISChannels(data, columns) {
        // Destroy the existing DataTable instance (if it exists)
        if (dataTableInstance) {
            dataTableInstance.destroy();
            }
        // Empty the table body and header before rendering a new table
        // $('#r_table tbody').empty();
        $('#r_table thead').empty();
        $('#r_table thead').append('<tr>' + columns.map(header => `<th>${header}</th>`));
    
        // Initialize a new DataTable instance
        dataTableInstance = $('#r_table').DataTable({
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
        });
        dataTableInstance.column(0).visible(false);

        }    
    // Add the click event to the Channels button
    function renderInventoryTable(data, columns) {
        // Destroy the existing DataTable instance (if it exists)
        // if (dataTableInstance) {
        //     dataTableInstance.destroy();
        //     }
        // Empty the table body and header before rendering a new table
        // $('#inventory_table').empty();
        if ($.fn.DataTable.isDataTable('#inventory_table')) {
            $('#inventory_table').DataTable().clear().destroy();
        }
        // Initialize a new DataTable instance
        // dataTableInstance = $('#inventory_table').DataTable({
        //     data: data,
        //     columns: columns.map(col => ({ data: col })),
        // });
        $('#inventory_table').DataTable({
            data: data,
            columns: columns.map(col => ({ data: col }))
        });
        // dataTableInstance.column(0).visible(false);

        }    
    
    function renderExpireTable(data, columns) {
        // if (dataTableInstance) {
        //     dataTableInstance.destroy();
        //     }
        // Destroy the existing DataTable instance (if it exists)
        if ($.fn.DataTable.isDataTable('#expire_table')) {
            $('#expire_table').DataTable().clear().destroy();
        }
    
        // Initialize a new DataTable instance
        $('#expire_table').DataTable({
            data: data,
            columns: columns.map(col => ({ data: col }))
        });
        }


    $('#pis_btn').click(async function () {
        $('.body').empty();
        $('#reports_h').empty();
        headersPIS.forEach(function (header) {
            $('#reports_h').append(`<th>${header}</th>`);
        });
    
        try {
            const data = await fetchData("http://127.0.0.1:5000/api/pis/get/");
            console.log(data);
            renderTablePISChannels(data.pis, headersPIS);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    });
    $('#channel_btn').click(async function () {
        headersChannel.forEach(function (header) {
            $('#reports_h').append(`<th>${header}</th>`);
            });

        try {
            const data = await fetchData("http://127.0.0.1:5000/api/channels/get/");
            // console.log(data);
            renderTablePISChannels(data.channels, headersChannel);
            } 
        catch (error) {
            console.error("Error fetching data:", error);
            }
        });

        // Item data
    $('#inventory_b').click(async function () {
        headersItem.forEach(function (header) {
            $('#inventory_head').append(`<th>${header}</th>`);
        });
        try {
            const data = await fetchData("http://127.0.0.1:5000/api/items/get/");
            console.log(data);
            renderInventoryTable(data.items, ColumnsItem);
            } 
        catch (error) {
            console.error("Error fetching data:", error);
            }
        });

        // Replace the existing click event with change event for the dropdown
    $('#inventory_filter').change(async function () {
        const filter = $(this).val();
    
        try {
            const data = await fetchData("http://127.0.0.1:5000/api/items/get/");
            let filteredData;
    
            switch (filter) {
                case 'stock':
                    // Display all items
                    renderInventoryTable(data.items, ColumnsItem);
                    break;
                case 'alert':
                    // Filter items with "in stock" less than or equal to 5
                    filteredData = data.items.filter(item => item['in stock'] <= 5);
                    renderInventoryTable(filteredData, ColumnsItem);
                    break;
                case 'safe':
                    // Filter items with "in stock" between 5 and 10 (inclusive)
                    filteredData = data.items.filter(item => item['in stock'] > 5 && item['in stock'] <= 10);
                    renderInventoryTable(filteredData, ColumnsItem);
                    break;
                default:
                    console.error("Invalid filter option");
                }
            } 
        catch (error) {
            console.error("Error fetching data:", error);
            }
        });

    // Expired items data
    $('#expire_b').click(async function () {
        // $('#expire_body').empty();
        // $('#expire_h').empty();
        headersLot.forEach(function (header) {
            $('#expire_head').append(`<th>${header}</th>`);
        });
        try {
            const data = await fetchData("http://127.0.0.1:5000/api/lot-exp/get/");
            console.log(data);
            renderExpireTable(data.lot_exp, columnsLot);
            } 
        catch (error) {
            console.error("Error fetching data:", error);
            }
        });

    $('#expiry_filter').change(async function () {
        const filter = $(this).val();
        try {
            const data = await fetchData("http://127.0.0.1:5000/api/lot-exp/get/");
            const currentDate = new Date();
            let filteredData;
            switch (filter) {
                case 'present':
                    filteredData = data.lot_exp.filter(item => new Date(item['expiry date']) <= currentDate);
                    break;
                case '30':
                    const dateIn30Days = new Date();
                    dateIn30Days.setDate(currentDate.getDate() + 30);
                    filteredData = data.lot_exp.filter(item => new Date(item['expiry date']) > currentDate && new Date(item['expiry date']) <= dateIn30Days);
                    break;
                case '60':
                    const dateIn60Days = new Date();
                    dateIn60Days.setDate(currentDate.getDate() + 60);
                    filteredData = data.lot_exp.filter(item => new Date(item['expiry date']) > currentDate && new Date(item['expiry date']) <= dateIn60Days);
                    break;
                case '90':
                    const dateIn90Days = new Date();
                    dateIn90Days.setDate(currentDate.getDate() + 90);
                    filteredData = data.lot_exp.filter(item => new Date(item['expiry date']) > currentDate && new Date(item['expiry date']) <= dateIn90Days);
                    break;
                }
            renderExpireTable(filteredData, columnsLot);
            } 
        catch (error) {
            console.error("Error fetching data:", error);
            }
            
        });




        // PIS data
    

    
    
    
    }
);