$("document").ready(function () {
    console.log("ready");
    var head = $('.head');
    var body = $('.body');
    var body_items = $('#body_invt');

    // var row = $('<tr>');;

    function fetchData(url, successCallback, errorCallback) {
        $.ajax({
            url: url,
            method: "GET",
            contentType: "application/json",
            success: successCallback,
            error: errorCallback
        });
    }

    function appendChannelData(channel) {
        
        var keys = Object.keys(channel);
        var headerRow = $('<tr>');
        keys.forEach(function(key) {
            var headerCell = $('<th>' + key + '</th>');
            headerRow.append(headerCell);
          });
        head.empty().append(headerRow);          
        // Append the 'head' element to the table with id 'reports_h'

        var row = $('<tr>');
        keys.forEach(function(key) {
            row.append('<td>' + channel[key] + '</td>');
        });
        body.append(row);
        // Append the 'row' element to the table with id 'reports_r'
        
    }


    function appendPiData(pi) {
        var keys = Object.keys(pi);
        var headerRow = $('<tr>');
        keys.forEach(function(key) {
            var headerCell = $('<th>' + key + '</th>');
            headerRow.append(headerCell);
          });
        head.empty().append(headerRow);

        // Append the 'head' element to the table with id 'reports_h'
        var row = $('<tr>');
        keys.forEach(function(key) {
            row.append('<td>' + pi[key] + '</td>');
        });
        body_invt.append(row);
    }

    function appendItemData(items) {
        var keys = Object.keys(items);
        var headerRow = $('<tr>');
        keys.forEach(function(key) {
            var headerCell = $('<th>' + key + '</th>');
            headerRow.append(headerCell);
          });
        head.empty().append(headerRow);          


        // Append the 'head' element to the table with id 'reports_h'
        var row = $('<tr>');
        row.append('<td>' + items.item + '</td>');
        row.append('<td>' + items['in stock'] + '</td>');
        row.append('<td>' + items['per unit'] + '</td>');
        row.append('<td>' + items.unit + '</td>');
        row.append('<td>' + items.machine + '</td>');
        row.append('<td>' + items.bench + '</td>');
        // $('#iitems_r').append(row);
        body_items.append(row);
    }
    

    
    $.ajax({
        url: "http://127.0.0.1:3000/api/channels/get/",
        method: "GET",
        contentType: "application/json",
        success: function (response) {
            console.log(response);
            $('#channel_btn').click(function(){
                body.empty();
                response.channels.forEach(function (channel) {
                    appendChannelData(channel);
                });
            });
        },
        error: function (error) {
            console.error("Error in channel request:", error);
        }
    });

    $.ajax({
        url: "http://127.0.0.1:3000/api/pis/get/",
        method: "GET",
        contentType: "application/json",
        success: function (response) {
            console.log(response);
            $('#pis_btn').click(function(){
                body.empty();
                response.pis.forEach(function (pi) {
                    appendPiData(pi);
                });
            });
        },
        error: function (error) {
            console.error("Error in PI request:", error);
        }
    });

    $.ajax({
        url: "http://127.0.0.1:3000/api/items/get/",
        method: "GET",
        contentType: "application/json",
        success: function (response) {
            console.log(response);
                response.items.forEach(function (item) {
                    appendItemData(item);
                });
        },
        error: function (error) {
            console.error("Error in items request:", error);
        }
    });
    
});