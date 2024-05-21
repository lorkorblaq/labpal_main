$(function(){  
    console.log('GPT is here');

    function startStream(prompt) {
        const responseElement = $('.chat-messages');
        responseElement.html(''); // Clear previous response

        const apiKey = 'sk-proj-AjEglvr7K5DXKbOUy1LaT3BlbkFJmwG7h1UM7mW8Wa9GgLq0';
        const url = 'https://api.openai.com/v1/completions';
        
        $.ajax({
            url: url,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            data: JSON.stringify({
                model: "gpt-3.5-turbo-16k",
                messages: [
                    { role: 'system', content: 'As a biomedical Ph.D. scientist in a isos laboratory, I am here to assist you with any questions you have in the field of biomedicine.' }, 
                    { role: 'user', content: prompt }
                ],
                max_tokens: 150,
                temperature: 0.7,
                stream: true
            }),
            xhrFields: {
                onprogress: function (event) {
                    const chunk = event.currentTarget.response;
                    const lines = chunk.split('\n').filter(line => line.trim() !== '');
                    for (const line of lines) {
                        const message = line.replace(/^data: /, '');
                        if (message === '[DONE]') {
                            break;
                        }
                        try {
                            const parsed = JSON.parse(message);
                            console.log('Parsed message:', parsed);
                            if (parsed.choices && parsed.choices.length > 0) {
                                const text = parsed.choices[0].text;
                                const botMessage = $('<div class="chatbot-message">').text(text);
                                responseElement.append(botMessage);
                            }
                        } catch (error) {
                            console.error('Could not parse stream message', message, error);
                        }
                    }
                }
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.error('Error while streaming response:', errorThrown);
            responseElement.html('Ooops! An issue occured while getting response: ' + errorThrown);
        });
    }

    $('#sendButton').click(function() {
        const userInput = $('#prompt').val().trim();
        if (userInput !== '') {
            const userMessage = $('<div class="user-message">').text(userInput);
            $('.chat-messages').append(userMessage);
            $('#prompt').val(''); // Clear input field after sending message
            startStream(userInput);
        }
    });
});
