$(function(){
    console.log('messenger.js loaded');
	// BaseUrl = "http://13.53.70.208:3000/api";
	BaseUrl = "http://0.0.0.0:3000/api";


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
    const url_pot_get = `${BaseUrl}/pots/get/`;
    const url_my_pots = `${BaseUrl}/pots/get/${user_id}/`;
    const url_conversations = `${BaseUrl}/conversations/${user_id}/`;

	const url_pot_get_messages = `${BaseUrl}/ggm/<string:pot_id>/`;
    const url_pot_join = `${BaseUrl}/pot/join/${user_id}/<string:pot_id>/`;
	const url_item_put = `${BaseUrl}/gpm/${user_id}/`;

    // Make an AJAX request to the POT API endpoint
	$.ajax({
		url: url_my_pots,
		type: 'GET',
		success: function(response) {
			// Handle the successful response here
			// console.log(response); // Output the response to the console for testing

			// Assuming you have a container element with id="pots-container" to populate
			var potsContainer = $('.potsContainer');

			// Clear any existing content in the container
			potsContainer.empty();

			// Iterate over each pot in the response
			response.pots.forEach(function(pot) {
				// Create HTML elements to display pot information
				var potElement = $('<li class="pot"></li>');
				var potNameElement = $('<a><i class="fas fa-circle"></i> ' + pot.name + '</a>');
				// var createdByElement = $('<p>Created by: ' + pot.created_by + '</p>');
				// var membersList = $('<ul></ul>');
				// Iterate over each member in the pot and create list items
				// pot.members.forEach(function(member) {
				// 	var memberListItem = $('<li>' + member + '</li>');
				// 	membersList.append(memberListItem);
				// });

				// Append pot information to the pot element
				potElement.append(potNameElement);
				// potElement.append(createdByElement);
				// potElement.append($('<p>Members:</p>'));
				// potElement.append(membersList);

				// Append pot element to the container
				potsContainer.append(potElement);
			});
		},
		error: function(xhr, status, error) {
			// Handle any errors that occur during the request
			console.error(error); // Log the error to the console
		}
	});

    // Make an AJAX request to the CONVERSATION API endpoint
	$.ajax({
        url: url_conversations,
        type: 'GET',
        success: function(response) {
            // Handle the successful response here
            console.log(response); // Output the response to the console for testing

            // Assuming you have a container element with id="contacts-container" to populate
            var contactsContainer = $('.contactsContainer');

            // Clear any existing content in the container
            contactsContainer.empty();

            // Iterate over each contact in the response
            response.contacts.forEach(function(contact) {
                // Create HTML elements to display contact information
                var contactElement = $('<li class="contact"></li>');
				var ContactNameElement = $('<a><i class="fas fa-circle"></i> ' + contact + '</a>');

                // Append contact information to the contact element
                contactElement.append(contactNameElement);

                // Append contact element to the container
                contactsContainer.append(contactElement);
            });
        },
        error: function(xhr, status, error) {
            // Handle any errors that occur during the request
            console.error(error); // Log the error to the console
        }
    });
});