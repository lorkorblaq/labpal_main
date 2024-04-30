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

    const url_my_pots = `${BaseUrl}/pots/get/${user_id}/`;
    const url_conversations = `${BaseUrl}/conversations/get/${user_id}/`;
    const url_gpm_messages = `${BaseUrl}/gpm/${user_id}/`;
    const url_get_users = `${BaseUrl}/user/get/`;
    const url_pot_get_messages = `${BaseUrl}/gpotm/`;

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
                const clickedPotId = $(this).attr('id');

                $.get(url_pot_get_messages + clickedPotId, function(messagesResponse) {
                    const messages = messagesResponse.pot_messages;
                    messages.reverse();
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
        $('.contact-input').toggle();
    });

    $('.add-btn').click(function() {
        const contactId = $('.contact-input input').val();
        // Perform AJAX request to add contact
        console.log('Adding contact:', contactId);
        console.log('User ID:', user_id);
        $.ajax({
            url: `${BaseUrl}/contact/add/${user_id}/${contactId}/`,
            method: 'post',
            dataType: 'json',
            success: function(response) {
                console.log(response.message); // Log success message
                // Clear the input field
                alert('Contact added successfully');
                $('.contact-input').toggle();
            },
            error: function(xhr, status, error) {
                console.error('Error adding contact:', error);
                // Handle error (e.g., display error message to user)
            }
        });
    });
 

	function performPrivSend() {
		const the_message = $('.send-input').val();
        data = {
            recipient_id: clickedUserId,
            payload: the_message
        }
        // console.log(data);
		socket.emit('private_message', data);

		$('.send-input').val('');
	}

    function performGroupSend() {
        const the_message = $('.send-input').val();
        socket.emit('group_message', the_message);
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
            url: `${BaseUrl}/pm/push/${data.senderID}/${clickedUserId}/`,
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
        const ul = $('.chat-list ul');
        const li = $('<li class="chat-list-item me"></li>');
        li.append('<div class="message"><p>' + data.data + '</p></div>');
        ul.append(li);
        ul.scrollTop(ul[0].scrollHeight);
    }
    socket.on('group_chat', handleGroupChat);
	socket.on('priv_chat', handlePrivChat);
    socket.on('message', handlePrivChat);
    


    $('.send-input').keypress(function(e) {
        if (e.which === 13) {
			performPrivSend();
            performGroupSend();

        }
    });

    $('.send-btn').click(function() {
		performPrivSend();
        performGroupSend();
    });


});
