$(function(){
    console.log('messenger.js loaded');
    const BaseUrl = "http://0.0.0.0:3000/api";
    if (!window.socket) {
        // Initialize socket
        window.socket = io();
        // Your messenger socket logic here
    }
    const user_id = getCookie('user_id');
    const session_id = getCookie('session_id');
	// console.log(session_id);
    const url_add_contact = `${BaseUrl}/contact/add/${user_id}/`;
    const url_delete_contact = `${BaseUrl}/contact/delete/${user_id}/`;
    
    const url_create_pot = `${BaseUrl}/pot/create/${user_id}/`;
    const url_join_pot = `${BaseUrl}/pot/join/${user_id}/`;
    const url_leave_pot = `${BaseUrl}/pot/leave/${user_id}/`;
    const url_delete_pot = `${BaseUrl}/pot/delete/${user_id}/`;
    const url_my_pots = `${BaseUrl}/pots/get/${user_id}/`;

    const url_conversations = `${BaseUrl}/conversations/get/${user_id}/`;
    const url_gpm_messages = `${BaseUrl}/gpm/${user_id}/`;
    const url_get_users = `${BaseUrl}/user/get/`;
    const url_pot_get_messages = `${BaseUrl}/gpotm/`;
    const url_send_pmessage = `${BaseUrl}/pm/push/${user_id}/`;
    const url_send_gmessage = `${BaseUrl}/pot/message/push/${user_id}/`;


    $('.loading-spinner').show();
	
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
    function formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const formattedDateTime = date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        return formattedDateTime;
    }

    let clickedPotId;

    // Make an AJAX request to the POT API endpoint
    $.get(url_my_pots, function(response) {
        const potsContainer = $('.potsContainer');
        potsContainer.empty();

        response.pots.forEach(function(pot) {
            const potId = pot._id;
            const potElement = $('<li class="pot" id="' + potId + '"></li>');
            const potNameElement = $('<a><i class="fas fa-circle"></i> ' + pot.name + '</a>');
            potElement.append(potNameElement);
            potsContainer.append(potElement);

            potElement.click(function() {
                clickedPotId = $(this).attr('id');
                // console.log(clickedPotId);
                $.get(url_pot_get_messages + clickedPotId, function(messagesResponse) {
                    const messages = messagesResponse.pot_messages;
                    $('.chat-list ul').empty();
                    messages.forEach(function(message) {
                        const timestamp = new Date(message.timestamp);
                        const formattedDateTime = timestamp.toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                        });
                        const listItem = $('<li class="chat-list-item"></li>');
                        $.get(url_get_users + message.sender, function(userResponse) {
                            const sender = userResponse.firstname + ' ' + userResponse.lastname;
                            const isCurrentUser = message.sender === user_id;
                            const nameElement = $('<span class="name"></span>').text(isCurrentUser ? '' : sender);
                            const messageElement = $('<div class=""></div>').attr('id', isCurrentUser ? 'me' : 'others').html('<p>' + message.message + '</p>');
                            const messageTimeElement = $('<span class="msg-time"></span>').text(formattedDateTime);
                            const messageDiv = $('<div class="message"></div>');
                            messageDiv.append(messageElement);
                            messageDiv.append(messageTimeElement);
                            listItem.append(nameElement);
                            listItem.append(messageDiv);
                            $('.chat-list ul').append(listItem);
                        }).fail(function(xhr, status, error) {
                            console.error(error);
                        });
                    });
                }).fail(function(xhr, status, error) {
                    console.error(error);
                });
            });
        });
    }).fail(function(xhr, status, error) {
        console.error(error);
    });

        // Now clickedUserId is available here

    let clickedUserId;

    // Make an AJAX request to the CONVERSATION API endpoint
    $.get(url_conversations, function(response) {
        const contactsContainer = $('.contactsContainer');
        contactsContainer.empty();

        response.contacts.forEach(function(contact) {
            const recp_id = contact.user_id
            // console.log(recp_id);
            const contactElement = $('<li class="contact" id="' + contact.user_id + '"></li>');
            const contactNameElement = $('<a><i class="fas fa-circle online"></i> ' + contact.username + '</a>');
            contactElement.append(contactNameElement);
            contactsContainer.append(contactElement);

            contactElement.click(function() {
                clickedUserId = $(this).attr('id');
                const clickedUsername = contact.username;

                $.get(url_gpm_messages + clickedUserId, function(messagesResponse) {
                    const messages = messagesResponse.messages;
                    $('.chat-list ul').empty();

                    messages.forEach(function(message) {
                        const listItem = $('<li class="chat-list-item"></li>');
                        const isCurrentUser = message.sender === user_id;

                        const timestamp = new Date(message.timestamp);
                        const formattedDateTime = formatTimestamp(timestamp);

                        const nameElement = $('<span class="name"></span>').text(isCurrentUser ? '' : clickedUsername)
                        const messageElement = $('<div class=""></div>').attr('id', isCurrentUser ? 'me' : 'others').html('<p>' + message.message + '</p>');
                        const messageTimeElement = $('<span class="msg-time"></span>').text(formattedDateTime);
                        const messageDiv = $('<div class="message"></div>');
                        messageDiv.append(messageElement);
                        messageDiv.append(messageTimeElement);
                        listItem.append(nameElement);
                        listItem.append(messageDiv);
                        $('.chat-list ul').append(listItem);
                    });
                }).fail(function(xhr, status, error) {
                    console.error(error);
                });
            });
        });
    }).fail(function(xhr, status, error) {
        console.error(error);
    });


    $('.add-contact a').click(function(e) {
        e.preventDefault();
        $('.contact-input-add').toggle();
    });
    $('.delete-contact a').click(function(e) {
        e.preventDefault();
        $('.contact-input-delete').toggle();
    });


    $('.create-pot a').click(function(e) {
        e.preventDefault();
        $('.pot-input-create').toggle();
    });
    $('.join-pot a').click(function(e) {
        e.preventDefault();
        $('.pot-input-join').toggle();
    })
    $('.leave-pot a').click(function(e) {
        e.preventDefault();
        $('.pot-input-leave').toggle();
    })
    $('.delete-pot a').click(function(e) {
        e.preventDefault();
        $('.pot-input-delete').toggle();
    });



    $('.add-btn').click(function() {
        const contactId = $('.contact-input-add input').val();
        // Perform AJAX request to add contact
        console.log('Adding contact:', contactId);
        console.log('User ID:', user_id);
        $.ajax({
            url: `${url_add_contact}${contactId}/`,
            method: 'post',
            dataType: 'json',
            success: function(response) {
                console.log(response.message); // Log success message
                // Clear the input field
                alert('Contact added successfully');
                $('.contact-input-add').toggle();
            },
            error: function(xhr, status, error) {
                console.error('Error adding contact:', error);
                // Handle error (e.g., display error message to user)
            }
        });
    });
    $('.delete-btn').click(function() {
        const contactId = $('.contact-input-delete input').val();
        // Perform AJAX request to add contact
        console.log('Deleting contact:', contactId);
        console.log('User ID:', user_id);
        $.ajax({
            url: `${url_delete_contact}${contactId}/`,
            type: 'DELETE',
            dataType: 'json',
            success: function(response) {
                console.log(response.message); // Log success message
                // Clear the input field
                alert('Contact deleted successfully');
                $('.contact-input-delete').toggle();
            },
            error: function(xhr, status, error) {
                console.error('Error deleting contact:', error);
                // Handle error (e.g., display error message to user)
            }
        });
    });

    $('.create-pot-btn').click(function(e) {
        const pot_name = $('.pot-input-create input').val();
        const pot_description = $('#pot-descrip').val();
        console.log(pot_description)
        console.log(pot_name);
        data = {
            'pot_name': pot_name,
            'description': pot_description
        }
        // Perform AJAX request to add contact
        $.ajax({
            url: url_create_pot,
            method: 'post',
            contentType: 'application/json',
            data:JSON.stringify(data),
            success: function(response) {
                console.log(response.message); // Log success message
                // Clear the input field
                alert('Pot created successfully');
                $('create-input-add-pot').toggle();
            },
            error: function(xhr, status, error) {
                console.error('Error creating pot:', error);
                // Handle error (e.g., display error message to user)
            }
        });
    });
    $('.join-pot-btn').click(function() {
        let PotId = $('.pot-input-join input').val();
        // Perform AJAX request to leave pot
        $.ajax({
            url: `${url_join_pot}${PotId}/`,
            type: 'POST',
            contentType: 'application/json',
            success: function(response) {
                console.log(response.message); // Log success message
                // Clear the input field
                alert('You have joined the pot successfully');
                $('.pot-input-join').toggle();
            },
            error: function(xhr, status, error) {
                console.error('Error joining pot:', error);
                // Handle error (e.g., display error message to user)
            }
        });
    });
    $('.leave-pot-btn').click(function() {
        let PotId = $('.pot-input-leave input').val();
        // Perform AJAX request to leave pot
        $.ajax({
            url: `${url_leave_pot}${PotId}/`,
            type: 'post',
            contentType: 'application/json',
            success: function(response) {
                console.log(response.message); // Log success message
                // Clear the input field
                alert('You have left the pot successfully');
                $('.pot-input-leave').toggle();
            },
            error: function(xhr, status, error) {
                console.error('Error leaving pot:', error);
                // Handle error (e.g., display error message to user)
            }
        });
    });
    $('.delete-pot-btn').click(function() {
        let PotId = $('.pot-input-delete input').val();
        // Perform AJAX request to delete pot
        $.ajax({
            url: `${url_delete_pot}${PotId}/`,
            type: 'DELETE',
            dataType: 'json',
            success: function(response) {
                console.log(response.message); // Log success message
                // Clear the input field
                alert('Pot deleted successfully');
                $('.pot-input-delete').toggle();
            },
            error: function(xhr, status, error) {
                console.error('Error deleting pot:', error);
                // Handle error (e.g., display error message to user)
            }
        });
    });

 
	function performPrivSend() {
		const the_message = $('.send-input').val();
        console.log(clickedUserId);
        data = {
            recipient_id: clickedUserId,
            payload: the_message
        }
        console.log(data);
		socket.emit('private_message', data);

		$('.send-input').val('');
	}

	function performGroupSend() {
		const the_message = $('.send-input').val();
        // console.log(clickedPotId);
        data = {
            recipient_id: clickedPotId,
            payload: the_message
        }
        // console.log(data);
		socket.emit('public_message', data);

		$('.send-input').val('');
	}

    function handlePrivChat(data) {
        const ul = $('.chat-list ul');
        const li = $('<li class="chat-list-item"></li>');
        // console.log(data.data);
        // li.append('<div class="message"><p>' + data.data + '</p></div>');
        // ul.append(li);
        // ul.scrollTop(ul[0].scrollHeight);

        const isMe = data.senderID === user_id; // Check if the message is sent by the current user
        const senderName = isMe ? '' : data.senderName; // If it's not sent by the current user, display sender's name
        const messageClass = isMe ? 'me' : 'others'; // Apply different styling for sender and receiver messages
    
        const messageDiv = $('<div class="message"></div>').addClass(messageClass);
        const messageContent = $('<div class=""></div>').attr('id', isMe ? 'me' : 'others').html('<p>' + data.message + '</p>');

        formattedDateTime = formatTimestamp(data.timestamp);
        const messageTime = $('<span class="msg-time"></span>').text(formattedDateTime);
    
        messageDiv.append(messageContent);
        messageDiv.append(messageTime);
    
        li.append($('<span class="name"></span>').text(senderName));
        li.append(messageDiv);
    
        ul.append(li);
        ul.scrollTop(ul[0].scrollHeight);
        $.ajax({
            url: url_send_pmessage+clickedUserId+'/',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                message: data.message,
            }),
            success: function(response) {
                console.log('Message pushed successfully:', response);
            },
            error: function(xhr, status, error) {
                console.error('Error pushing message:', error);
            }
        });        
    }

	function handleGroupChat(data) {
        console.log('i dy here')
        const ul = $('.chat-list ul');
        const li = $('<li class="chat-list-item"></li>');
 
        const isMe = data.senderID === user_id; // Check if the message is sent by the current user
        const senderName = isMe ? '' : data.senderName; // If it's not sent by the current user, display sender's name
        const messageClass = isMe ? 'me' : 'others'; // Apply different styling for sender and receiver messages
    
        const messageDiv = $('<div class="message"></div>').addClass(messageClass);
        const messageContent = $('<div class=""></div>').attr('id', isMe ? 'me' : 'others').html('<p>' + data.message + '</p>');

        formattedDateTime = formatTimestamp(data.timestamp);
        const messageTime = $('<span class="msg-time"></span>').text(formattedDateTime);
    
        messageDiv.append(messageContent);
        messageDiv.append(messageTime);
    
        li.append($('<span class="name"></span>').text(senderName));
        li.append(messageDiv);
    
        ul.append(li);
        ul.scrollTop(ul[0].scrollHeight);
        $.ajax({
            url: url_send_gmessage+clickedPotId+'/',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                message: data.message,
            }),
            success: function(response) {
                console.log('Message pushed successfully:', response);
            },
            error: function(xhr, status, error) {
                console.error('Error pushing message:', error);
            }
        });        
    }
    socket.on('public_chat', handleGroupChat);
	socket.on('priv_chat', handlePrivChat);
    

    // Function to handle setting conversation type class on send input
    function setConversationTypeClass(conversationType) {
        // Remove existing conversation type classes
        $('.send-input').removeClass('private group');
        // Add the new conversation type class
        $('.send-input').addClass(conversationType);
    }

    // Click event handler for private conversations
    $('.conversation-list').on('click', '.private', function() {
        // Set conversation type class to 'private'
        setConversationTypeClass('private');
    });

    // Click event handler for group conversations
    $('.conversation-list').on('click', '.group', function() {
        // Set conversation type class to 'group'
        setConversationTypeClass('group');
    });

    // Keypress event handler for sending messages
    $('.send-input').keypress(function(e) {
        if (e.which === 13) { // Check if the Enter key is pressed
            // Check if the input has 'private' or 'group' class and perform corresponding action
            if ($('.send-input').hasClass('private')) {
                performPrivSend();
            } else if ($('.send-input').hasClass('group')) {
                performGroupSend();
            }
        }
    });

    // Click event handler for send button
    $('.send-btn').click(function() {
        // Check if the input has 'private' or 'group' class and perform corresponding action
        if ($('.send-input').hasClass('private')) {
            performPrivSend();
        } else if ($('.send-input').hasClass('group')) {
            performGroupSend();
        }
    });

    
});
