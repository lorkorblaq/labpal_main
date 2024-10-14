$(function () {
    console.log("gpt.js loaded");
    // const BaseUrl = "https://labpal.com.ng/gpt";
    const BaseUrl = "http://13.60.96.217:3500/gpt";

    const chat_url = `${BaseUrl}/chat/push/`;

    function sendMessage() {
        var text = $("#prompt").val();
        if (text === "") {
            alert("Please enter a prompt");
            return;
        }


        // Append user message to the chat
        $("#chatMessages").append(`<div class="user-message">${text}</div>`);
           // Disable input and button
        $("#prompt").prop("disabled", true);
        $("#sendButton").prop("disabled", true); // Assuming you have a button with ID "sendButton"

        // Clear input field
        $("#prompt").val("");
        $("#loadingIndicatorgpt").show();
        // Send AJAX request
        $.ajax({
            url: chat_url,
            type: "POST",
            data: JSON.stringify({ query: text }),
            contentType: 'application/json',
            success: function(response) {
                console.log("Response:", response);

                // Construct chatbot message with sources
                let chatbotMessage = `<div class="chatbot-message">${response.response}`;
                
                if (response.sources && response.sources.length > 0) {
                    // Use a Set to store unique sources
                    let uniqueSources = new Set(response.sources);
    
                    chatbotMessage += `<br><br><strong>Sources:</strong><ul>`;
                    uniqueSources.forEach(function(source) {
                        chatbotMessage += `<li>${source}</li>`;
                    });
                    chatbotMessage += `</ul>`;
                }

                chatbotMessage += `</div>`;

                // Append AI message with sources to the chat
                $("#chatMessages").append(chatbotMessage);

                // Scroll to the bottom of the chat
                $("#chatMessages").scrollTop($("#chatMessages")[0].scrollHeight);
                $("#loadingIndicatorgpt").hide();
                $("#prompt").prop("disabled", false);
                $("#sendButton").prop("disabled", false);
            },
            error: function(xhr, status, error) {
                console.log("Error:", error);
                // Handle the error here
                $("#loadingIndicatorgpt").hide();
                $("#prompt").prop("disabled", false);
                $("#sendButton").prop("disabled", false);
            }
        });
    }

    // Send message on button click
    $("#sendButton").click(function () {
        console.log("sendButton clicked");
        sendMessage();
    });

    // Send message on Enter key press
    $("#prompt").keypress(function (event) {
        if (event.which === 13) { // 13 is the Enter key code
            console.log("Enter key pressed");
            sendMessage();
        }
    });
});
