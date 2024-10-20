function handleMaintenanceFormSubmission() {
    let tagsEntered = false; // Flag to check if at least one tag is entered
    const category = []; // Array to store tag categories
    const machineMaintenanceData = []; // Array to store maintenance data
    const machineData = []; // Assuming machineData is defined earlier

    // Collect tags from #frequencyTagger .tag
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

    // Collect comments from the comments field
    var comments = $('#commentsMaint').val();

    // Get the checkbox value (true if checked, false if not)
    var resolvedChecked = $('#maintenance-checkbox').is(':checked');

    // Push the collected data to machineMaintenanceData array
    machineMaintenanceData.push(category);
    machineMaintenanceData.push(comments);
    machineMaintenanceData.push(resolvedChecked); // Add checkbox status (true/false)
    
    // Assuming machineData already has date, time, and machine values pushed
    machineData.push(machineMaintenanceData);
    console.log("machine_data",machineData);
    // Prepare data object for submission
    var data = {
        'date': machineData[0],
        'time': machineData[1],
        'machine': machineData[2],
        'category': 'Maintenance', // Fixed category for maintenance
        'frequency': machineMaintenanceData[0], // Frequency array without '×'
        'comments': machineMaintenanceData[1],
        'resolved': machineMaintenanceData[2] // Checkbox value (true/false)
    };
    console.log("maine_data1", machineData[0]);
    console.log("maine_data", data);
    var url = url_event_push + 'machine/';
    postSubmitsToApi(url, data);
}

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
    console.log("mao",machineData);

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