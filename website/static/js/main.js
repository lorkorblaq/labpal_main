$(function () {
    console.log("MAIN ready");
    BaseUrl = "https://labpal.com.ng/api"
    // BaseUrl = "http://127.0.0.1:3000/api"

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
    const lab_name = getCookie('lab_name');
    const role = getCookie('role');
    const center = getCookie('center');
    const org_services = getCookie('org_services');

    // If the cookie exists, split it into an array
    if (org_services) {
        // Decode any escaped characters and clean up extra quotes
        const decodedOrgServices = decodeURIComponent(org_services)
            .replace(/\\054/g, ',') // Replace escaped commas
            .replace(/^"|"$/g, '') // Remove leading and trailing quotes
            .replace(/\\"/g, ''); // Remove escaped quotes within the string

        // Split into an array
        const orgServicesArray = decodedOrgServices.split(',');
        // Define which menu items correspond to which services
        const menuMapping = {
            'dashboard': 'menu-dashboard',
            'events': 'menu-events',
            'inventory': 'menu-inventory',
            'piu': 'menu-in-use',
            'channels': 'menu-channels',
            'lotExp': 'menu-expiration',
            'shipments': 'menu-shipments',
            'profile': 'menu-profile',
            'settings': 'menu-settings',
        };
        const cardMapping = {
            'events': 'card-events',
            'inventory': 'card-inventory',
            'expiration': 'card-expiration',
            'in-use': 'card-in-use',
            'channels': 'card-channels',
        };
        // Hide all menu items initially
        Object.values(menuMapping).forEach(menuId => {
            $(`#${menuId}`).hide();
        });
        Object.values(cardMapping).forEach(cardId => {
            $(`#${cardId}`).hide();
        });

        // Show menu items based on org_services
        orgServicesArray.forEach(service => {
            const menuId = menuMapping[service.trim()];
            if (menuId) {
                $(`#${menuId}`).show();
            }
        });
        orgServicesArray.forEach(service => {
            const cardId = cardMapping[service.trim()];
            if (cardId) {
                $(`#${cardId}`).show();
            }
        });
        console.log(orgServicesArray)
    } else {
        console.log("org_services cookie not found.");
    }        


        const item_url = `${BaseUrl}/items/get/${user_id}/${lab_name}/`;
        const lot_url = `${BaseUrl}/lotexp/get/${user_id}/${lab_name}/`;
        const machine_url = `${BaseUrl}/machines/get/${user_id}/${lab_name}/`;
        const labs_url = `${BaseUrl}/labs/get/${user_id}/`;
    
    // Check if socket is already initialized
    if (!window.socket) {
        // Initialize socket and pass role as a query parameter
        window.socket = io({ query: { role: role } });  // Or dynamically set 'staff'/'client'
    }
    socket.emit('pickUp', { message: 'role' });

    socket.on('pickUp', (data) => {
        console.log('Received from server:', data)
    });

    socket.on('connect_error', (error) => {
        console.error('Connection failed:', error);
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

    console.log("Role:", role, "center",center);
    // if (role === 'creator') {
    //     console.log("Staff");
    //     // Staff-specific code here
    //     socket.on('StaffNotifications', handleNotification);
    // }else if (role === 'client') {
    //     console.log("Client");
    //     // Client-specific code here
    //     socket.on('ClientNotifications', handleNotification);
    // }
    socket.on('StaffNotifications', handleNotification);  
    
    function handleNotification(data) {
        console.log('Notification:', data.message);
        toastr.warning(data.message, 'Notification');
        // Display the notification to the user (e.g., using a toast or alert)
    }
    // Toggle menu on click
    $("#menu-icon").click(function (event) {
        $("#floating-menu").fadeToggle(); // Smooth fade effect
        event.stopPropagation(); // Prevent closing immediately
    });

    // Close menu when clicking outside
    $(document).click(function (event) {
        if (!$(event.target).closest("#floating-menu, #menu-icon").length) {
            $("#floating-menu").fadeOut(); // Fade out when clicking outside
        }
    });

    // const firebaseConfig = {
    //     apiKey: "AIzaSyCblrG_QMF34EkvQDVNERUbgkIau4xymiI",
    //     authDomain: "labpal-28980.firebaseapp.com",
    //     projectId: "labpal-28980",
    //     storageBucket: "labpal-28980.appspot.com",
    //     messagingSenderId: "292842656635",
    //     appId: "1:292842656635:web:d27ed2319914e9baed63de",
    //     measurementId: "G-D0ECY39XF8"
    // };

    // Initialize Firebase
    // const app = initializeApp(firebaseConfig);
    // firebase.initializeApp(firebaseConfig);
    // const analytics = getAnalytics(app);

    $('.autoInputName').typeahead({
        source: function (request, response) {
            $.ajax({
                url: item_url, // Replace with your API endpoint for item search
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

    $('.autoInputLabs').typeahead({
        source: function (request, response) {
            $.ajax({
                url: labs_url, // Replace with your API endpoint for item search
                method: "GET",
                data: { term: request.term },
                dataType: "json",
                success: function (data) {
                    // console.log("Retrieved data:", data);
                    const labs_name = data.labs.map(lab => lab.lab_name);
                    // console.log(lotNumb);
                    response(labs_name);
                    },
                error: function (error) {
                    console.error("Error fetching labs name data:", error);
                    }
                });
            },
        });

    $('.autoInputRegions').typeahead({
        source: function (request, response) {
            $.ajax({
                url: labs_url, // Replace with your API endpoint for item search
                method: "GET",
                data: { term: request.term },
                dataType: "json",
                success: function (data) {
                    console.log("Retrieved data:", data);
                    const regions_name = data.labs.map(lab => lab.region);
                    console.log(regions_name);
                    response(regions_name);
                    },
                error: function (error) {
                    console.error("Error fetching region data:", error);
                    }
                });
            },
        });

    $('.autoInputItem').typeahead({
        source: function (request, response) {
            $.ajax({
                url: item_url, // Replace with your API endpoint for item search
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

    $('.autoInputMachine').typeahead({
        source: function (request, response) {
            $.ajax({
                url: machine_url, // Replace with your API endpoint for item search
                method: "GET",
                data: { term: request.term },
                dataType: "json",
                success: function (data) {
                    // console.log("Retrieved data:", data);
                    const Machines_name = data.machines.map(machine => machine.name);
                    // console.log(lotNumb);
                    response(Machines_name);
                    },
                error: function (error) {
                    console.error("Error fetching lot data:", error);
                    }
                });
            },
        });

    $('.autoInputLot').typeahead({
        source: function (request, response) {
            $.ajax({
                url: lot_url, // Replace with your API endpoint for item search
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
});