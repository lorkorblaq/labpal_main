$(function() {
    BaseUrl = "https://labpal.com.ng/api";
    // BaseUrl = "http://127.0.0.1:3000/api";
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

    const HeadersQcEvents = ['Created At','User', 'Machine',  'Item', 'Root Cause', 'Sub-root Cause', 'Root Cause Des.', 'Actioning'];
    const ColumnsQcEvents = ['created_at','user', 'machine',  'items', 'rootCause', 'subrootCause', 'rootCauseDescription', 'actioning'];

    const HeadersMaintenanceEvents = ['Created At','User', 'Machine',  'Frequency','Comments'];
    const ColumnsMaintenanceEvents = ['created_at','user', 'machine',  'frequency', 'comments'];

    const HeadersMachineEvents = ['Created At','User', 'Machine',  'Type of event','Resolved', 'Root Cause', 'Actioning'];
    const ColumnsMachineEvents = ['created_at','user', 'machine',  'category', 'resolved','rootCause',  'actioning'];

    const HeadersOperationsEvents = ['Created At','User', 'occurrence', 'Actioning'];
    const ColumnsOperationsEvents = ['created_at','user', 'occurrence',   'actioning'];
    

    const user_id = getCookie('user_id');
    const lab_name = getCookie('lab_name');
    const url_event_push = `${BaseUrl}/event/push/${user_id}/${lab_name}/`;
    const url_event_put = `${BaseUrl}/event/put/${user_id}/${lab_name}/`;
    const url_event_get_one = `${BaseUrl}/event/get/${user_id}/${lab_name}/`;
    const url_event_get_all = `${BaseUrl}/events/get/${user_id}/${lab_name}/`;
    const url_event_del = `${BaseUrl}/event/del/${user_id}/${lab_name}/`;
    const url_event_todo_push = `${BaseUrl}/event/to-do-push/${user_id}/`;
    const url_event_todo_get_one = `${BaseUrl}/event/to-do-get/${user_id}/`;
    const url_event_todo_get_all = `${BaseUrl}/event/to-do-get-all/${user_id}/`;

    function fetchData(url) {
        // Fetch data from the provided URL
        return $.get(url);
    }

    // async function loadData(url, ) {
    //     try {
    //         const data = await fetchData(url);
    //         // console.log(data);
    //         renderTable('inventory_table', 'ex-inventory_table', data.items, ColumnsItem, HeadersItem);
    //         }
    //     catch (error) {
    //         console.error("Error fetching data:", error);
    //         }
    //     };
    // nav buttons 
    $('.nav-link').on('click', function() {
        // Remove 'active' class from all links
        $('.nav-link').removeClass('active');

        // Add 'active' class to the clicked link
        $(this).addClass('active');
    });
    // nav corresponding divs
    $('.events').first().addClass('active');
    $('.nav-link').first().addClass('active');

    $('.nav-link').on('click', function(){
        // Remove active class from all nav links and event divs
        $('.nav-link').removeClass('active');
        $('.events').removeClass('active');

        // Add active class to the clicked nav link
        $(this).addClass('active');

        // Get the target event div ID
        var target = $(this).data('target');

        // Show the corresponding event div
        $(target).addClass('active');
    });

    // # date range picker
    $('.date-range').daterangepicker({
        opens: 'left',
        locale: {
            format: 'YYYY-MM-DD'
        }
    }, function(start, end, label) {
        console.log("A new date selection was made: " + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
    });

    // date picker 
    $('.datePicker').datepicker({
        dateFormat: 'yy-mm-dd', // Year first format
    });

    // time picker
    var currentTime = new Date();
    var currentHours = currentTime.getHours();
    var currentMinutes = currentTime.getMinutes();
    var formattedTime = currentHours + ':' + (currentMinutes < 10 ? '0' + currentMinutes : currentMinutes);
     $('#timepicker-machine').timepicker({
        timeFormat: 'hh:mm p',   // 24-hour format with AM/PM
        interval: 1,            // 30-minute increments
        minTime: '00:00am',      // Earliest time 10:00 AM
        maxTime: '11:59pm',       // Latest time 6:00 PM
        defaultTime: formattedTime,  // Default time 11:00 AM
        dynamic: true,           // Dynamic input updating
        dropdown: true,          // Show dropdown
        scrollbar: true,         // Show scrollbar if needed
        zindex: 10,            // z-index of the dropdown
        disableTextInput: false, // Allow manual input
        step: 15,                // Step size for arrow keys
        className: 'custom-timepicker', // Custom class name
        closeOnWindowScroll: true, // Close on window scroll
        appendTo: 'body',         // Append to body
        show2400: false   
    });

    // modal logic
    var modal = $('#myModal');

    // When the user clicks the button, open the modal
    $('#createButton').on('click', function() {
        modal.show();
    });

    // When the user clicks on <span> (x) or the Close button, close the modal
    $('.close').on('click', function() {
        modal.hide();
        $('.modal-content').hide();
        $('.modal-content').first().show(); // Show the main modal content
    });

    // When the user clicks anywhere outside of the modal, close it
    $(window).on('click', function(event) {
        if ($(event.target).is(modal)) {
            modal.hide();
            $('.modal-content').hide();
            $('.modal-content').first().show(); // Show the main modal content
        }
    });

    // Show corresponding additional content on tool click
    $('.tool').on('click', function() {
        var toolId = $(this).attr('id');
        $('.modal-content').hide();
        $('#additionalContent' + toolId.replace('tool', '')).show();
    });

    // Back button logic to return to the main modal content
    $('.back').on('click', function() {
        $('.modal-content').hide();
        $('.modal-content').first().show();
    });
    
    // tags & tagger for modals
    handleTagInput($('#QCtags'), $('#qcTagger'));
    handleTagInput($('#OperationsTags'), $('#operationsTagger'));

    // tag handler 
    function handleTagInput($input, tagContainer) {
        $input.on('keydown', function(event) {
            if (event.key === ',' || event.key === 'Enter') {
                event.preventDefault();
                var tagText = $input.val().trim();
                if (tagText) {
                    createTag(tagText, tagContainer);
                    $input.val('');
                }
            }
        });
    }

    // tag creator
    function createTag(tagText, tagContainer) {
        var $tag = $('<div class="tag"></div>');
        var $tagContent = $('<span></span>').text(tagText);
        var $tagClose = $('<span class="close">&times;</span>').on('click', function() {
            $tag.remove();
        });
        $tag.append($tagContent).append($tagClose);
        tagContainer.append($tag);
    }

    // maintainance tab on the page
    $('#maintenance-tab').on('click', function() {
        $('#maintenance-content').show();
        $('#downtimes-content').hide();
        $('#troubleshooting-content').hide();
        $(this).addClass('active');
        $('#downtimes-tab').removeClass('active');
        $('#troubleshooting-tab').removeClass('active');
    });

    // downtimes tab on the page
    $('#downtimes-tab').on('click', function() {
        $('#maintenance-content').hide();
        $('#downtimes-content').show();
        $('#troubleshooting-content').hide();
        $(this).addClass('active');
        $('#maintenance-tab').removeClass('active');
        $('#troubleshooting-tab').removeClass('active');
    });

    // troubleshooting tab on the page
    $('#troubleshooting-tab').on('click', function() {
        $('#maintenance-content').hide();
        $('#downtimes-content').hide();
        $('#troubleshooting-content').show();
        $(this).addClass('active');
        $('#maintenance-tab').removeClass('active');
        $('#downtimes-tab').removeClass('active');
    });

    // tag logic for machine modal
    $('.option-button').on('click', function(event) {
        event.preventDefault(); // Prevent the default form submission
        const value = $(this).data('value');
        const tag = $('<span class="tag">' + value + '<span class="remove-tag">&times;</span></span>');
        
        $('#frequencyTagger').append(tag);
 
        // Remove the tag when the remove icon is clicked
        tag.find('.remove-tag').on('click', function() {
            $(this).parent().fadeOut(300, function() {
                $(this).remove();
            });
        });

    });

    $('#rootcause').on('change', function() {
        var selectedValue = $(this).val();
        var submenuHtml = '';

        // Define submenu options based on the selected value
        switch (selectedValue) {
            case 'procedures':
                submenuHtml = `
                    <label for="peopleSubmenu">Select a procedure subcause:</label>
                    <select class="form-control " id="submenu">
                        <option value="timing">Timing</option>
                        <option value="equilibration">Equilibration</option>
                    </select>
                `;
                break;

            case 'methods':
                submenuHtml = `
                    <label for="methodSubmenu">Select a method subcause:</label>
                    <select class="form-control" id="submenu">
                        <option value="Method1">Method 1</option>
                        <option value="Method2">Method 2</option>
                    </select>
                `;
                break;

            case 'machines':
                submenuHtml = `
                    <label for="machinesSubmenu">Select a machine subcause:</label>
                    <select class="form-control" id="submenu">
                        <option value="pre-maintenance">Pre-maintenance</option>
                        <option value="post-maintenance">Post-maintenance</option>
                        <option value="pipettor-aspiration">Pipettor aspiration</option>
                    </select>
                `;
                break;
            case 'materials':
                submenuHtml = `
                    <label for="machinesSubmenu">Select a material subcause:</label>
                    <select class="form-control" id="submenu">
                        <option value="QC-material-deterioration">QC material deterioration</option>
                        <option value="reagent-exipration">Reagent exipration</option>
                        <option value="calibrator-exipration">Calibrator exipration</option>
                        <option value="wrong-lot">Wrong lot</option>
                    </select>
                `;
                break;
            case 'measurements':
                submenuHtml = `
                    <label for="machinesSubmenu">Select a measurement subcause:</label>
                    <select class="form-control" id="submenu">
                        <option value="unfit-calibration-curve">Unfit calibration curve</option>
                        <option value="wrong-lots">Wrong lots</option>
                    </select>
                `;
                break;
            case 'systems':
                submenuHtml = `
                    <label for="machinesSubmenu">Select a system subcause:</label>
                    <select class="form-control" id="submenu">
                        <option value="inconsistent-calibration">Inconsistent Calibration</option>
                        <option value="inadequate-Standard-Operating-Procedures">Inadequate Standard Operating Procedures</option>
                        <option value="maintenance-frequency">Maintenance frequency</option>

                    </select>
                `;
                break; 

            default:
                submenuHtml = '';  // Clear submenu if no valid option is selected
        }

        // Append or replace the submenu in the container
        $('#submenuContainer').html(submenuHtml);
    });

    // logic for the to-do modal
    const $todoInput = $('#new-todo');
    const $addTodoButton = $('#add-todo');
    const $todoList = $('#todo-list');

    //QC submit button
    $('#submit-qc').on('click', function(event) {

        event.preventDefault(); // Prevent default form submission behavior
        const qcData = [];
        const datePickerValue = $('#datePicker-qc').val();
        let tagsEntered = false; // Flag to check if at least one tag is entered

        if (datePickerValue !== '') {
            qcData.push(datePickerValue);
        } else {
            alert('Please select a date');
        }
        machine = $('#machineIndicatorQC').val();
        qcData.push(machine);
        // $('#qcTagger .tag span').each(function() {
        //     qcData.push($(this).text());
        // });

        $('#qcTagger .tag span').each(function() {
            const text = $(this).text().trim();
            
            if (text !== '') {
                qcData.push(text);
                tagsEntered = true; // Set flag to true if at least one tag is entered
            }
        });
    
        if (!tagsEntered) {
            alert('Please enter at least one tag');
            return; // Exit function if no tags are entered
        }
        var root_cause = $('#rootcause').val();
        qcData.push(root_cause);
        var subMenu = $('#submenu').val();
        qcData.push(subMenu);
        var RCQC_des = $('#RCQC_des').val();
        qcData.push(RCQC_des);
        var CAQC = $('#CAQC').val();
        qcData.push(CAQC);


        
    




        console.log(qcData);
        const filteredQC = qcData.filter(item => item !== '×');
        console.log(filteredQC)
        data = {
            "date": filteredQC[0],
            "machine": filteredQC[1],
            "items": filteredQC.slice(2, filteredQC.length -4),
            "rootCause": filteredQC[filteredQC.length -4],  
            "subrootCause": filteredQC[filteredQC.length -3],
            "rootCauseDescription": filteredQC[filteredQC.length -2],
            "actioning": filteredQC[filteredQC.length -1]
        }
        console.log(data);
        url = url_event_push + 'qc/';
        postSubmitsToApi(url, data);
    });

    // machine submit button
    $('#submit-machine').on('click', function(event) {
        event.preventDefault(); // Prevent default form submission behavior
    
        const machineData = [];
        const machineMaintenanceData = [];
        const category = [];
    
        // Validate and collect date and time
        var datePickerValue = $('#datePicker-machine').val();
        var time = $('#timepicker-machine').val();
        if (datePickerValue === '' || time === '') {
            alert('Please select a date and time');
            return;
        }
        // var dateTime = `${datePickerValue} ${time}`;
        machineData.push(datePickerValue);
        machineData.push(time);
    
        // Validate and collect machine information
        var machine = $('#machineIndicator').val();
        if (machine === null) {
            alert('Please select a machine');
            return;
        }
        machineData.push(machine);
    
        // Determine active menu item and handle form submission accordingly
        var activeMenuItem = $('.menu-item.active');
        var activeMenuId = activeMenuItem.attr('id');
        switch (activeMenuId) {
            case 'maintenance-tab':
                handleMaintenanceFormSubmission();
                break;
            case 'downtimes-tab':
                handleDowntimesFormSubmission();
                break;
            case 'troubleshooting-tab':
                handleTroubleshootingFormSubmission();
                break;
            default:
                console.log('No active content found');
        }
    
        // Function to handle maintenance form submission
        function handleMaintenanceFormSubmission() {
            let tagsEntered = false; // Flag to check if at least one tag is entered
            $('#frequencyTagger .tag').each(function() {
                var tagText = $(this).text().trim();
                
                console.log(tagText);
                if (tagText.endsWith('×')) {
                    tagText = tagText.slice(0, -1); // Remove '×' from the end
                    tagsEntered = true;
                }
                category.push(tagText);
            });
        
            if (!tagsEntered) {
                alert('Please enter at least one tag');
                return; // Exit function if no tags are entered
            }
            
    
            var comments = $('#commentsMaint').val();
            machineMaintenanceData.push(category);
            machineMaintenanceData.push(comments);
            machineData.push(machineMaintenanceData);
    
            var data = {
                'date': machineData[0],
                'time': machineData[1],
                'machine': machineData[2],
                'category': 'Maintenance', // Fixed category for maintenance
                'frequency': machineMaintenanceData[0], // Frequency array without '×'
                'comments': machineMaintenanceData[1]
            };
    
            console.log(data);
            var url = url_event_push + 'machine/';
            postSubmitsToApi(url, data);
        }
    
        // Function to handle downtimes form submission
        function handleDowntimesFormSubmission() {
            var resolved = $('#downtimes-content input[type="checkbox"]').prop('checked');
            var RCdowntime = $('#RCdowntime').val();
            var RCdownTimeDes = $('#RCdowntimeDes').val();
            var CAdowntime = $('#CAdowntime').val();
    
            machineData.push(resolved);
            machineData.push(RCdowntime);
            machineData.push(CAdowntime);
    
            var data = {
                'date': machineData[0],
                'time': machineData[1],
                'machine': machineData[2],
                'category': 'Downtime', // Fixed category for downtimes
                'resolved': resolved,
                'rootCause': RCdowntime,
                'rootCauseDes': RCdownTimeDes,
                'actioning': CAdowntime
            };
    
            console.log(data);
            var url = url_event_push + 'machine/';
            postSubmitsToApi(url, data);
        }
    
        // Function to handle troubleshooting form submission
        function handleTroubleshootingFormSubmission() {
            var resolved = $('#troubleshooting-content input[type="checkbox"]').prop('checked');
            var RCtroubleshooting = $('#RCtroubleshooting').val();
            var CAtroubleshooting = $('#CAtroubleshooting').val();
    
            machineData.push(resolved);
            machineData.push(RCtroubleshooting);
            machineData.push(CAtroubleshooting);
    
            var data = {
                'date': machineData[0],
                'time': machineData[1],
                'machine': machineData[2],
                'category': 'Troubleshooting', // Fixed category for troubleshooting
                'resolved': resolved,
                'rootCause': RCtroubleshooting,
                'actioning': CAtroubleshooting
            };
    
            console.log(data);
            var url = url_event_push + 'machine/';
            postSubmitsToApi(url, data);
        }
    
    });
    
    // Function to post data to API
    // function postSubmitsToApi(url, data) {
    //     $.ajax({
    //         type: 'POST',
    //         url: url,
    //         data: JSON.stringify(data),
    //         contentType: 'application/json',
    //         success: function(response) {
    //             console.log('Data successfully submitted:', response);
    //         },
    //         error: function(error) {
    //             console.error('Error submitting data:', error);
    //             alert('Error submitting data. Please try again later.');
    //         }
    //     });
    // }

    //operations submit button 
    $('#submit-operations').on('click', function(event) {
        event.preventDefault(); // Prevent default form submission behavior
        const datePickerValue = $('#datePicker-operations').val();
        const operationsData = [];
        let tagsEntered = false; // Flag to check if at least one tag is entered
        if (datePickerValue !== '') {
            operationsData.push(datePickerValue);
        } else {
            alert('Please select a date');
        }

        // Collect tags from #operationsTagger .tag span
        $('#operationsTagger .tag span').each(function() {
            const text = $(this).text().trim();
            
            if (text !== '') {
                operationsData.push(text);
                tagsEntered = true; // Set flag to true if at least one tag is entered
            }
        });
    
        if (!tagsEntered) {
            alert('Please enter at least one tag');
            return; // Exit function if no tags are entered
        }
        OPearationsActioning =   $('#CAoperations').val();
        operationsData.push(OPearationsActioning);
        const filteredOperations = operationsData.filter(item => item !== '×');
        
        const data = {
            'date': filteredOperations[0],
            'occurrence': filteredOperations.slice(1, filteredOperations.length -1), // Send all tasks as an array
            'actioning': filteredOperations[filteredOperations.length - 1]};
        console.log(filteredOperations);
        url = url_event_push+'operations/';
        postSubmitsToApi(url, data);
    });

    // to-do submit button
    $('#submit-todo').on('click', function(event) {
        event.preventDefault(); // Prevent default form submission behavior
        const todoText = $todoInput.val().trim();
        const allTodos = [];
        const datePickerValue = $('#datePicker-todo').val();
        if (datePickerValue !== '') {
            allTodos.push(datePickerValue);
        } else {
            alert('Please select a date');
        }
        // Add the new todo if it's not empty
        if (todoText !== '') {
            allTodos.push(todoText);
        } else if ($todoList.find('li').length !== 0) {
            $todoList.find('li span').each(function() {
                allTodos.push($(this).text());
            });
        } else {
            alert('Please add a task');
            return;
        }
        // Collect all existing todos from the list
        // $todoList.find('li span').each(function() {
        //     allTodos.push($(this).text());
        // });

        // console.log(allTodos[0]);
        const data = {
            'date': allTodos[0],
            'task': allTodos.slice(1) // Send all tasks as an array
        };
        url = url_event_todo_push;
        postSubmitsToApi(url, data);
    });

    // Function to post data to an API
    function postSubmitsToApi(url, data) {
        $.ajax({
            type: 'POST',
            url: url,
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function(response) {
                alert(response.message);   
            },
            error: function(jqXHR, textStatus, errorThrown) {
                // Check if the responseJSON exists and has a message property
                const errorMessage = jqXHR.responseJSON && jqXHR.responseJSON.message ? jqXHR.responseJSON.message : 'An error occurred';
                alert(`${errorMessage}`);
                console.error('Error posting data:', jqXHR, textStatus, errorThrown);
            }
        });
    }

    let activeEventType = 'qc'; // Default active event type
    $('#qc-btn').click(function(){
        var url = url_event_get_all + 'qc' + '/';
        renderTable('QCr_table', 'ex-QCr_table', url, ColumnsQcEvents, HeadersQcEvents);``
    });
    $('#qc-btn').click();


    $('#maintenance-btn').click(function() {
        var url = url_event_get_all + 'machine' + '/';

        fetchData(url).then(data => {
            console.log(data);
            let filteredData = data.events.filter(event => event.category === "Maintenance");
            let fdata = {events: filteredData};
            console.log(filteredData);
            renderTable('main_table', 'ex-main_table', fdata, ColumnsMaintenanceEvents, HeadersMaintenanceEvents);
        }).catch(error => {
            console.error("Error fetching data:", error);
        });
    });

    $('#machine-btn').click(function(){
        var url = url_event_get_all + 'machine' + '/';
        fetchData(url)
        .then(data => {
            console.log(data);

            // Filter the data to exclude events with category "Maintenance"
            let filteredData = data.events.filter(event => event.category !== "Maintenance");

            // Prepare the filtered data object
            let fdata = { events: filteredData };

            console.log(filteredData);

            // Render the table with the filtered data
            renderTable('machine-r_table', 'ex-machine-r_table', fdata, ColumnsMachineEvents, HeadersMachineEvents);
        })
        .catch(error => {
            console.error("Error fetching data:", error);
        });
    });

    $('#operations-btn').click(function(){
        var url = url_event_get_all + 'operations' + '/';
        renderTable('oper-r_table', 'ex-oper-r_table', url, ColumnsOperationsEvents, HeadersOperationsEvents);``
    });

    
    // // Event listener for the nav links
    // $('.nav-link').click(function() {
    //     var activevent = $(this).attr('id'); // Get the id of the clicked link
    //     console.log('Active event:', activevent);

    //     // Update the active event type based on the clicked nav link
    //     switch (activevent) {
    //         case 'qc-btn':
    //             activeEventType = 'qc';
    //             break;
    //         case 'machine-btn':
    //             activeEventType = 'machine';
    //             break;
    //         case 'operations-btn':
    //             activeEventType = 'operations';
    //             break;
    //         default:
    //             activeEventType = 'qc'; // Fallback to default if no match
    //             break;
    //     }

    //     console.log('Current active event type:', activeEventType);

    //     // Fetch events based on the updated active event type
    //     fetchEvents(activeEventType);
    // });

    // // Initial fetch of events for the default active event type
    // fetchEvents(activeEventType);

    // Function to filter events based on the selected machine and items
    function getDateRange(selector) {
        const dateRangeInput = $(selector).val().trim();
        const [start, end] = dateRangeInput.split(' - ');

        const startDate = start ? new Date(start) : null;
        const endDate = end ? new Date(end) : null;
        console.log("Date Range:", startDate, endDate);
        return { startDate, endDate };
    }

    function filterQC(events, machine, items, startDate, endDate) {
        return events.filter(event => {
            const eventDate = new Date(event.date);
            const matchesMachine = machine ? event.machine.toLowerCase().includes(machine.toLowerCase()) : true;
            const matchesItems = items ? items.every(item => event.items.includes(item)) : true;
            const withinDateRange = (!startDate || !endDate) || (eventDate >= startDate && eventDate <= endDate);
            return matchesMachine && matchesItems && withinDateRange;
        });
    }
    
    function filterMachine(events, machine, type, startDate, endDate) {
        return events.filter(event => {
            const eventDate = new Date(event.datetime);
            const matchesMachine = machine ? event.machine.toLowerCase().includes(machine.toLowerCase()) : true;
            const matchesType = type ? event.category.toLowerCase() === type.toLowerCase() : true;
            // const matchesResolved = resolved === 'all' || (resolved === 'resolved' && event.resolved) || (resolved === 'unresolved' && !event.resolved);
            const withinDateRange = (!startDate || !endDate) || (eventDate >= startDate && eventDate <= endDate);
            // return matchesMachine && matchesType && matchesResolved && withinDateRange;
            return matchesMachine && matchesType && withinDateRange;
        });
    }
    
    function filterOperations(events, startDate, endDate) {
        return events.filter(event => {
            const eventDate = new Date(event.date);
            const withinDateRange = (!startDate || !endDate) || (eventDate >= startDate && eventDate <= endDate);
            return withinDateRange;
        });
    }
    
    // Function to render a DataTable instance for the specified table ID
    async function renderTable(tableId, exTableId, urlOrData, columns, headers) {
        try {
            let data;
    
            // Check if urlOrData is a string (URL) or an object (data)
            if (typeof urlOrData === 'string') {
                // If it's a URL, fetch data from the provided URL
                console.log("Fetching data from URL:", urlOrData);
                let response = await fetch(urlOrData);
                data = await response.json(); // Assuming the API returns a JSON object
            } else if (typeof urlOrData === 'object') {
                // If it's an object, use it directly as data
                console.log("Using provided data object:", urlOrData);
                data = urlOrData;
            } else {
                throw new Error("Invalid data source: Must provide either a URL or a data object.");
            }
    
            console.log("Final data to render:", data);
    
            // Check if DataTable is already initialized and destroy it if it is
            if ($.fn.DataTable.isDataTable(`#${tableId}`)) {
                console.log("DataTable exists, destroying...");
                $(`#${tableId}`).DataTable().clear().destroy();
            }
    
            // Clear the existing table headers
            console.log("Clearing and appending new headers");
            $(`#${tableId} thead`).empty(); // Ensure the header is cleared
    
            // Append new headers to the table
            let headerRow = $('<tr>');
            headers.forEach(function(header) {
                headerRow.append(`<th>${header}</th>`);
            });
            $(`#${tableId} thead`).append(headerRow);
    
            // Initialize a new DataTable instance with the provided columns and data
            console.log("Initializing DataTable with new data");
            $(`#${tableId}`).DataTable({
                data: data.events || [],  // Adjust if your data structure differs
                columns: columns.map(col => ({ data: col })),
                // Add any other DataTable options as needed
            });
    
            // Button setup (Ensure these buttons are correctly set up every time)
            let exportButton = $('<button>').text(' Export').addClass('button fas fa-file-export');
            let printButton = $('<button>').text(' Print').addClass('button fas fa-print');
            // let deleteDB = $('<button>').text(' Delete').addClass('button fas fa-trash-alt');
    
            // Define button actions
            exportButton.click(function() {
                exportJSONData(data.events || data); // Pass data.events if available, otherwise pass data directly
            });

            printButton.click(function() {
                printJSONDataAsCSV(data);
            });
    
            // deleteDB.click(function() {
            //     if (confirm('Are you sure you want to delete all the items? This action cannot be undone.')) {
            //         fetch(delete_items_url, {
            //             method: 'DELETE'
            //         })
            //         .then(response => response.json())
            //         .then(data => {
            //             console.log('Success:', data);
            //             alert('Items deleted successfully!');
            //             renderTable(tableId, exTableId, [], columns, headers); // Re-render table with empty data
            //         })
            //         .catch((error) => {
            //             console.error('Error:', error);
            //             alert('Error deleting items');
            //         });
            //     } else {
            //         alert('Deletion canceled');
            //     }
            // });
    
            // Append buttons to exTableId if not already appended
            let buttonContainer = $(`#${exTableId}`);
            if (buttonContainer.find('.button').length === 0) {
                buttonContainer.append(exportButton).append(printButton);
                // .append(deleteDB)
            }
    
        } catch (error) {
            console.error("Error in renderTable:", error);
        }
    }
    
    // Function to display events in the UI
    function displayEventCards(events) {
        const eventContainer = $('.eventContainer');
        eventContainer.empty(); // Clear existing cards
    
        // Sort events array in descending order based on date and time
        events.sort((a, b) => {
            const dateA = new Date(a.datetime || a.date);
            const dateB = new Date(b.datetime || b.date);
            if (dateA.getTime() === dateB.getTime()) {
            // If dates are equal, compare times
            const timeA = new Date(a.datetime || a.date).getTime();
            const timeB = new Date(b.datetime || b.date).getTime();
            return timeB - timeA;
            } else {
            // If dates are not equal, compare dates
            return dateB - dateA;
            }
        });
    
        events.forEach(eventData => {
            var card = createCard(eventData);
            eventContainer.append(card); // Append card
        });
    }
    
    function createCard(eventData) {
        var card = $('<div>').addClass('card').attr('id', eventData.id); // Set ID of the card element to eventData.id
        var cardHeader = $('<div>').addClass('card-header');
    
        // Customize card header based on event type
        var formattedEventDate = '';
    
        if (eventData.event_type === 'qc' || eventData.event_type === 'operations') {
            formattedEventDate = new Date(eventData.date).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric', timeZone: 'GMT'
            });
        } else if (eventData.event_type === 'machine') {
            formattedEventDate = new Date(eventData.datetime).toLocaleString('en-US', 
            {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: 'numeric', minute: 'numeric', second: 'numeric',
                hour12: false,
                timeZone: 'GMT'
            });
        }
    
        cardHeader.text(`${formattedEventDate} - ${eventData.user || 'Unknown User'}`);
    
        var cardBody = $('<div>').addClass('card-body').attr('id', `${eventData.event_id}`);
        cardHeader.click(function() {
            console.log('eventData.event_id :', eventData.event_id);
            $(`#${eventData.event_id}`).slideToggle(); // Toggle only the card-body within this card
        });
    
        // Customize card body based on event type
        if (eventData.event_type === 'qc') {
            var itemsTag = eventData.items ? eventData.items.join(', ') : 'No items specified'; // Join array elements with ', ' separator or provide default text
    
            cardBody.append(
                $('<p>').text(`Machine: ${eventData.machine || 'N/A'}`),
                $('<p>').text(`Items: ${itemsTag}`),
                $('<p>').text(`Root Cause: ${eventData.rootCause || 'N/A'}`),
                $('<p>').text(`Actioning: ${eventData.actioning || 'N/A'}`)
            );
        } else if (eventData.event_type === 'machine') {
            cardBody.append(
                $('<p>').text(`Machine: ${eventData.machine || 'N/A'}`),
                $('<p>').text(`Type: ${eventData.category || 'N/A'}`)
            );
    
            if (eventData.category === 'Maintenance') {
                if (eventData.frequency && eventData.frequency.length > 0) {
                    var frequencyText = eventData.frequency.join(', '); // Join array elements with ', ' separator
                    cardBody.append(
                        $('<p>').text(`Frequency: ${frequencyText}`)
                    );
                }
    
                cardBody.append(
                    $('<p>').text(`Comments: ${eventData.comments || 'N/A'}`)
                );
            } else {
                cardBody.append(
                    $('<p>').text(`Resolved: ${eventData.resolved || 'N/A'}`),
                    $('<p>').text(`Root Cause: ${eventData.rootCause || 'N/A'}`),
                    $('<p>').text(`Actioning: ${eventData.actioning || 'N/A'}`)
                );
            }
        } else if (eventData.event_type === 'operations') {
            var occurrenceTag = eventData.occurrence ? eventData.occurrence.join(', ') : 'No occurrences specified'; // Join array elements with ', ' separator or provide default text
            cardBody.append(
                $('<p>').text(`Occurrence: ${occurrenceTag}`),
                $('<p>').text(`Actioning: ${eventData.actioning || 'N/A'}`)
            );
        } else {
            cardBody.append(
                $('<p>').text(`Details for other event types...`)
            );
        }
    
        // Append header and body to the card
        card.append(cardHeader, cardBody);
    
        return card;
    }

        // Function to render to-do items
    function renderTodoItem(todoText) {
        const $li = $('<li class="list-group-item checklist-item"></li>').html(`
            <span>${todoText}</span>
            <div class="checklist-actions">
                <button class="btn btn-sm btn-warning edit-btn">✏️</button>
                <button class="btn btn-sm btn-danger delete-btn">🗑️</button>
            </div>
        `);
        return $li;
    }

    // Function to handle adding a new to-do item
    function addTodoItem(todoText) {
        const $todoItem = renderTodoItem(todoText);
        $todoList.append($todoItem);
    }

    // Function to handle editing a to-do item
    function editTodoItem(todoItem, newText) {
        const $todoItem = $(todoItem).closest('.checklist-item').find('span');
        $todoItem.text(newText);
    }

    // Function to handle deleting a to-do item
    function deleteTodoItem(todoItem) {
        const $parent = $(todoItem).closest('.checklist-item');
        $parent.remove();
        // Check if parent list is empty after deletion
        if ($parent.siblings('.checklist-item').length === 0) {
            $parent.closest('.card').remove();
        }
    }

    function readCSVFile(file) {
        var reader = new FileReader();
        reader.onload = function(event) {
            var csvData = event.target.result;
            var jsonData = convertCSVToJSON(csvData);
            sendJSONDataToAPI(jsonData);
        };
        reader.readAsText(file);
    }

    function sendJSONDataToAPI(jsonData) {
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
            alert('Data imported successfully!');
        })
        .catch(error => {
            console.error('Error:', error);
            alert(`Error importing your inventory data:\n${error.message}`);
        });
    }

    function exportJSONData(data) {
        if (!data || data.length === 0) {
            alert("No data available to export.");
            return;
        }
    
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
        if (!data || !data.length) {
            return ''; // Return empty string if no data
        }

        var csv = [];
        // Extract column headers from the first object in the array
        var headers = Object.keys(data[0]);
        csv.push(headers.join(','));

        // Iterate over each object in the array
        data.forEach(function(obj) {
            var row = [];
            headers.forEach(function(header) {
                row.push(obj[header] !== undefined ? obj[header] : '');
            });
            csv.push(row.join(','));
        });

        // Combine rows into a single CSV string
        return csv.join('\n');
    }


    function convertCSVToJSON(csvData) {
        var lines = csvData.split('\n').filter(line => line.trim() !== ''); // Filter out empty lines
        var result = [];
        var headers = lines[0].split(',').map(header => header.trim()); // Trim headers
        
        // Set of fields that should be converted to numbers
        var numericFields = new Set(['quantity', 'tests/vial', 'vials/pack', 'reOrderLevel', 'tests/day']);

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

    
    // Update .applyFilter click handler
    $('.applyFilter').on('click', function() {
        console.log('applyFilter');
        const QCmachine = $('#QCfilterMachine').val().trim();
        const Mmachine = $('#MfilterMachine').val().trim();
        const type = $('#filterType').val().trim();
        const items = $('#filterItems').val().trim().split(',').map(item => item.trim()).filter(item => item);

        let startDate, endDate;
        switch (activeEventType) {
            case 'qc':
                ({ startDate, endDate } = getDateRange('#qc-date-range'));
                break;
            case 'machine':
                ({ startDate, endDate } = getDateRange('#machine-date-range'));
                break;
            case 'operations':
                ({ startDate, endDate } = getDateRange('#operation-date-range'));
                break;
            default:
                console.error('Unknown event type:', activeEventType);
                alert('Unknown event type. Please try again.');
                return;
        }
        console.log('Date Range:', { startDate, endDate });

        // Fetch and filter events
        $.ajax({
            type: 'GET',
            url: url_event_get_all + activeEventType + '/',
            success: function(response) {
                console.log('Raw Data:', response);
                let filteredEvents;
                switch (activeEventType) {
                    case 'qc':
                        filteredEvents = filterQC(response, QCmachine, items, startDate, endDate);
                        console.log('Filtered QC Data:', filteredEvents);
                        displayEventCards(filteredEvents);
                        break;
                    case 'machine':
                        filteredEvents = filterMachine(response, Mmachine, type, startDate, endDate);
                        console.log('Filtered Machine Data:', filteredEvents);
                        displayEventCards(filteredEvents);
                        break;
                    case 'operations':
                        filteredEvents = filterOperations(response, startDate, endDate);
                        console.log('Filtered Operations Data:', filteredEvents);
                        displayEventCards(filteredEvents);
                        break;
                    default:
                        console.error('Unknown event type:', activeEventType);
                        alert('Unknown event type. Please try again.');
                        break;
                }
            },
            error: function(error) {
                console.error('Error fetching data:', error);
                alert('Error fetching data. Please try again later.');
            }
        });
    });

    // Event listener for adding a new to-do item
    $addTodoButton.on('click', function(event) {
        event.preventDefault();
        const todoText = $todoInput.val().trim();
        if (todoText !== '') {
            addTodoItem(todoText);
            $todoInput.val('');
        }
    });

    // Event listener for Enter key press in input field
    $todoInput.on('keypress', function(e) {
        if (e.which === 13) {
            e.preventDefault();
            const todoText = $todoInput.val().trim();
            if (todoText !== '') {
                addTodoItem(todoText);
                $todoInput.val('');
            }
        }
    });

    // Event listener for editing a to-do item
    $(document).on('click', '.edit-btn', function() {
        const taskSpan = $(this).closest('.checklist-item').find('span');
        const newText = prompt('Edit your task', taskSpan.text());
        if (newText !== null && newText.trim() !== '') {
            editTodoItem(this, newText.trim());
        }
    });

    // Event listener for deleting a to-do item
    $(document).on('click', '.delete-btn', function() {
        const confirmed = confirm("Are you sure you want to delete this task?");
        if (confirmed) {
            deleteTodoItem(this);
        }
    });

    // Make the lists sortable and connect them
    // Initialize sortable on document ready
    $('.sortable').sortable({
        connectWith: '.sortable',
        placeholder: 'sortable-placeholder',
        start: function(event, ui) {
            const item = ui.item;
            const parent = item.parent();

            // Check if it is the last item in the list
            if (parent.children('.checklist-item').length === 1 && !parent.data('delete-confirmed')) {
                const confirmed = confirm("You are about to move the last checklist item. This card will be deleted.");
                if (!confirmed) {
                    $(this).sortable('cancel');
                } else {
                    // Mark the parent to be deleted after the move
                    parent.data('delete-confirmed', true);
                }
            }
        },
        stop: function(event, ui) {
            const item = ui.item;
            const previousParent = item.data('previousParent');

            // Remove the card if the last item was moved and confirmation was given
            if (previousParent && previousParent.data('delete-confirmed')) {
                previousParent.closest('.card').remove();
            }

            // Clean up data attribute to allow further deletion without prompt
            if (previousParent) {
                previousParent.removeData('delete-confirmed');
            }

            // Remove the temporary storage of previous parent
            item.removeData('previousParent');
        },
        receive: function(event, ui) {
            const item = ui.item;
            item.data('previousParent', ui.sender);
        }
    }).disableSelection();
    
});