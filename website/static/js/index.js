// var canvas = document.getElementById("canvas");
// var ctx = canvas.getContext("2d");
// console.log('canvas :', canvas);
// canvas.width = 500;
// canvas.height = 500;

// ctx.strokeStyle = '#ff7e22';
// ctx.lineWidth = 17;
// ctx.shadowBlur = 1;
// ctx.shadowColor = '#ff7e22'

// function degToRad(degree) {
//     var factor = Math.PI / 180;
//     return degree * factor;
// }
// function renderTime() {
//     var now = new Date();
//     var today = now.toDateString();
//     var time = now.toLocaleTimeString();
//     var hrs = now.getHours();
//     var min = now.getMinutes();
//     var sec = now.getSeconds();
//     var mil = now.getMilliseconds();
//     var smoothsec = sec + (mil / 1000);
//     var smoothmin = min + (smoothsec / 60);

//     // Background
//     gradient = ctx.createRadialGradient(250, 250, 5, 250, 250, 300);
//     gradient.addColorStop(0, "rgba(0, 51, 58, 0)"); // Transparent black
//     gradient.addColorStop(1, "rgba(0, 51, 58, 0)"); // Transparent black
//     ctx.fillStyle = gradient;

//     // Clear the canvas with a transparent background
//     ctx.clearRect(0, 0, canvas.width, canvas.height);


//     ctx.font = "60px Helvetica Bold";
//     ctx.fillStyle = '#ff7e22';
//     ctx.fillText(time, 0, 70);

//     ctx.font = "30px Helvetica";
//     ctx.fillStyle = '#ff7e22'
//     ctx.fillText(today, 0, 110);

// }
// setInterval(renderTime, 40);



$('.datePicker').datepicker({
    format: 'mm/dd/yyyy',
    autoclose: true,
    todayHighlight: true
});




// Function to create a card dynamically based on event data
function createCard(eventData) {
    // Construct the card HTML
    var card = $('<div>').addClass('card').attr('id', eventData.id); // Set ID of the card element to eventData.id
    var cardHeader = $('<div>').addClass('card-header');

    // Customize card header based on event type
    var formattedEventDate = '';

    if (eventData.event_type === 'qc' || eventData.event_type === 'operations') {
        formattedEventDate = new Date(eventData.date).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', timeZone: 'GMT'
        });
    } else if (eventData.event_type === 'machine') {
        formattedEventDate = new Date(eventData.datetime).toLocaleString('en-US', {
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

