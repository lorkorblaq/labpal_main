$(function () {
    console.log("MAIN ready");
    // BaseUrl = "http://13.53.70.208:3000/api/"
    BaseUrl = "http://0.0.0.0:3000/api";

    function getCookie(name) {
        const cookieArr = document.cookie.split("; ");
        for (let i = 0; i < cookieArr.length; i++) {
            const cookiePair = cookieArr[i].split("=");
            if (name === cookiePair[0]) {
                return decodeURIComponent(cookiePair[1]);
            }
        }
        return null;
    };
    const user_id = getCookie('user_id');
    const session_id = getCookie('session_id');

// Check if socket is already initialized
    if (!window.socket) {
        // Initialize socket
        window.socket = io();
    }
        

    // In your other file (let's call it otherFile.js)

    $('#InputItemMain').typeahead({
        source: function (request, response) {
            $.ajax({
                url: `${BaseUrl}/items/get/`, // Replace with your API endpoint for item search
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
                url: `${BaseUrl}/items/get/`, // Replace with your API endpoint for item search
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
                url: `${BaseUrl}/lotexp/get/`, // Replace with your API endpoint for item search
                method: "GET",
                data: { term: request.term },
                dataType: "json",
                success: function (data) {
                    // console.log("Retrieved data:", data);
                    const lotNumb = data.lotexp.map(lot => lot.lot_numb);
                    console.log(lotNumb);
                    response(lotNumb);
                    },
                error: function (error) {
                    console.error("Error fetching lot data:", error);
                    }
                });
            },
        });
    var path = window.location.pathname;
    
    // Add the 'active' class to the link with a matching pattern
    $('a[href="' + path + '"]').addClass('active');
    function refreshTable() {
        fetchData(`${BaseUrl}/channels/get/`).then(data => {
            dataTableInstance.clear();
            dataTableInstance.rows.add(data.channels);
            dataTableInstance.draw();
        }).catch(error => {
            console.error("Error fetching data:", error);
        });
    }
    toastr.options = {
        "timeOut": 0,          // Set timeOut to 0 to keep the notification until closed
        "extendedTimeOut": 0,  // Set extendedTimeOut to 0 to keep the notification until closed
        "tapToDismiss": true, // Disable tap to dismiss
        "positionClass": "toast-bottom-right", // Position of the notification
        "iconClass": 'toast-success-icon', // Custom icon class
        "escapeHtml": true,    // Escape HTML in message
        "showMethod": 'slideDown', // Show animation method
        "hideMethod": 'slideUp',    // Hide animation method
        "showEasing": 'swing',  // Show animation easing
        "hideEasing": 'linear', // Hide animation easing
        "showDuration": 300,    // Show animation duration
        "hideDuration": 300     // Hide animation duration
    };
    socket.on('notifications', function(data) {
        // Handle notification received from the server
        console.log('Notification:', data.message);
        toastr.warning(data.message, 'Notification');
        // Display the notification to the user (e.g., using a toast or alert)
    });
    
});