$(function () {
    const headersChannel = ['_id','created at', 'user', 'item', 'lot_numb', 'direction', 'location', 'quantity', 'description', 'action'];
    console.log("channels.js loaded");
    BaseUrl = "http://0.0.0.0:3000/api";
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

    const user_id = getCookie('user_id');
    const url = `${BaseUrl}/channel/push/${user_id}/`;
    const url_item_get = `${BaseUrl}/item/get/`;
    const url_item_put = `${BaseUrl}/item/put/`;

    let dataTableInstance;
    let editedCell;
    function fetchData(url) {
        // Fetch data from the provided URL
        return $.get(url);
    }
    
    async function fetchLotNumbers() {
        try {
            const data = await $.get(`${BaseUrl}/lotexp/get/`);
            return data.lotexp.map(lot => lot.lot_numb);
        } catch (error) {
            console.error('Error fetching lot numbers:', error);
            return [];
        }
    }
    async function submitForm() {
        let item = $('#autoInputItem').val();
        let lot = $('#autoInputLot').val();
        let quantity = $('#QtyInputChannel').val();
        let direction = $('#dropDownDirectionChannel').val();
        let location = $('#dropDownLocationsChannel').val();
        let description = $('#DescripInputChannel').val();
        switch (true) {
            case !item:
                alert("Please enter an item.");
                break;
            case !quantity:
                alert("Please enter a quantity.");
                break;
            case !direction:
                alert("Please enter a machine.");
                break;
            case !location:
                alert("Please enter a location.");
                break;
            case !lot:
                alert("Please enter a lot number.");
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
                // console.log(formData);
                // console.log(user_id);
                $.post({
                        url: url,
                        contentType: "application/json",
                        data: JSON.stringify(formData),
                        success: function (response) {
                            alert("Channel created successfully");
                            console.log(response);
                        },
                        error: function (error) {
                            alert("Could not insert Data into Channels. Please make sure the item is in the inventory and the lot number is correct");
                            console.error(error);
                        }
                    });
                try {
                    itemform = {
                        direction: direction,
                        item: item,
                        'in stock': quantity,
                    }
                    console.log(itemform);
                    $.ajax({
                        url: url_item_put,
                        contentType: "application/json",
                        method: "PUT",
                        data: JSON.stringify(itemform),
                        success: function (response) {
                            // alert("update qty successfully");
                            console.log(response);
                        },
                        error: function (error) {
                            alert("Could'nt update Quantity of items");
                            console.error(error);
                        }
                    });
                }
                catch (error) {
                    console.error("Error updating items quantity:", error);
                }
                
            }
        refreshTable()
        }
    function refreshTable() {
        fetchData(`${BaseUrl}/channels/get/`).then(data => {
            dataTableInstance.clear();
            dataTableInstance.rows.add(data.channels);
            dataTableInstance.draw();
        }).catch(error => {
            console.error("Error fetching data:", error);
        });
    }
    // Call refreshTable every 5 seconds (5000 milliseconds)
    setInterval(refreshTable, 10000);
    async function loadData () {
        $('.body').empty();
        $('#reports_h').empty();
        headersChannel.forEach(function (header) {
            $('#reports_h').append(`<th>${header}</th>`);
            });
        try {
            const data = await fetchData(`${BaseUrl}/channels/get/`);
            // console.log(data);
            renderTablePISChannels(data.channels, headersChannel);
            } 
        catch (error) {
            console.error("Error fetching data:", error);
            }
    }
    $('#r_table tbody').on('click','td:not(:first-child, :last-child, :nth-child(2))',function () {
        // Check if there's no other cell being edited
        if (!editedCell) {
            // Store the currently edited cell
            editedCell = $(this);
            // Get the current text of the cell
            var cellText = $(this).text();
            // Replace the cell's content with an input field, using the cell's current text as the initial value
            $(this).html('<input type="text" class="edit-input" value="' + cellText + '">');

            // Focus on the input field1`
            $('.edit-input').focus();
            }
        });

    $('#r_table tbody').on('blur', '.edit-input', function () {
        // Get the updated value from the input field
        var updatedValue = $(this).val();
        // Get the channel ID from the data attribute of the row
        var row = dataTableInstance.row(editedCell.closest('tr'));
        // var row = dataTableInstance.row($(this).closest('tr'));
        var rowData = row.data();
        // console.log(rowData);
        var rowId = rowData._id;
        // console.log(channelId);
        // Get the column index
        var columnIndex = editedCell.index();
        console.log(columnIndex);
        var columnsChannels={0:'created at',1:'user',2:'item',3:'lot',4:'direction', 5:'location',6:'quantity',7:'description',};
        var columnNameChannels = columnsChannels[columnIndex];

        editedCell.text(updatedValue);
        // console.log(updatedValue);
        // Reset the editedCell variable
        editedCell = null;
        console.log(rowId);
        console.log(columnNameChannels);
        console.log(updatedValue);
        // Update the channel data in the database
        updateChannel(rowId, columnNameChannels, updatedValue);

        function updateChannel(rowId, columnNameChannels, updatedValue) {
            $.ajax({
                url: `${BaseUrl}/channel/put/${rowId}/`,
                method: "PUT",
                contentType: "application/json",
                data:  JSON.stringify({ [columnNameChannels]: updatedValue }),
                success: function () {
                    // alert('Channel updated successfully')
                    // Optionally, handle success actions
                    console.log(`The channel id:${rowId} updated successfully.`);
                },
                error: function (error) {
                    console.error("Error updating Channels:", error);
                    // editedCell.text(originalValue);
                    // Handle the error and provide feedback to the user
                    alert("Error updating channels. Please try again or call Femo");
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
        let lot = $('#autoInputLot').val();

        if (!lotNumbers.includes(lot)) {
            console.log("Lot doesn't exist");
            // Show the date input modal
            $('#dateModal').modal('show');

        } else if (lotNumbers.includes(lot)){
            console.log("Lot exists");
            // Handle form submission without expiration date
            await submitForm();
        }
    });
    // Function to handle form submission with expiration date
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
            order: [[1, 'desc']]
        });
        dataTableInstance.column(0).visible(false);

        }
    
    $('#r_table tbody').on('click', '#btn-delete', function () {
        var row = dataTableInstance.row($(this).parents('tr'));
        deleteChannel(row);
        });

    $('#channel_btn').click(loadData ());

    function deleteChannel(row) {
        var rowId = row.data()._id;
        $.ajax({
            url: `${BaseUrl}/channel/delete/${rowId}/`,
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