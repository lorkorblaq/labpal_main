$(document).ready(function() {
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
    

    const user_id = getCookie('user_id');
    const url_event_todo_push = `${BaseUrl}/to-do/push/${user_id}/`;
    const url_event_todo_put = `${BaseUrl}/to-do/put/${user_id}/`;
    const url_event_todo_get_one = `${BaseUrl}/to-do/get/${user_id}/`;
    const url_event_todo_get_all = `${BaseUrl}/to-do/get-all/${user_id}/`;
    const url_event_todo_delete = `${BaseUrl}/to-do/del/${user_id}/`;

    $('.datePicker').datepicker({
        dateFormat: 'yy-mm-dd', 
        autoclose: true,
        todayHighlight: true,
    });
    function getCurrentDate() {
        var today = new Date();
        var year = today.getFullYear();
        var month = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
        var day = String(today.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }
    $('#date-input').val(getCurrentDate());
    $.ajax({
        url: url_event_todo_get_all,  // Replace with your endpoint for fetching all to-dos
        method: 'GET',
        success: function(response) {
            response.forEach(function(todo) {
                console.log('todo :', todo);
                updateOrCreateCard(todo);
            });
        },
        error: function(xhr, status, error) {
            console.error('Error fetching to-dos:', error);
            alert('Failed to fetch to-dos. Please refresh the page.');
        }
    });

    $('#add-todo').click(function(event) {
        event.preventDefault();

        var newTodo = $('#new-todo').val().trim();
        var date = $('.datePicker').val().trim();

        if (newTodo === '' || date === '') {
            alert('Please enter both a task and a date.');
            return;
        }

        // AJAX POST request to add to-do
        console.log(url_event_todo_push, newTodo, date);
        var data = {
            task: [{ text: newTodo, completed: false }], // Wrap task in an array
            date: date
        };
        $.ajax({
            url: url_event_todo_push,  // Replace with your endpoint
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function(response) {
                // Handle success response
                // alert(response.message);  // Optionally show success message
                $('#new-todo').val('');  // Clear input fields after successful addition

                // Call function to update or create card based on returned data
                updateOrCreateCard({
                    date: date,
                    tasks: [{ text: newTodo, completed: false }]
                });
            },
            error: function(xhr, status, error) {
                // Handle error
                console.log(data);
                alert('Failed to add to-do. Please try again.');
            }
        });
    });

    function updateOrCreateCard(todoData) {
        var existingCard = $('#todo-list').find(`#${todoData.date}-card`);
    
        if (existingCard.length > 0) {
            // Card already exists for this date, update tasks list
            var taskList = existingCard.find('.task-list');
            var completedList = existingCard.find('.completed-list');
    
            todoData.tasks.forEach(function(task) {
                if (task.completed) {
                    completedList.append(createTaskItem(task.text, task.completed, todoData.date));
                } else {
                    taskList.append(createTaskItem(task.text, task.completed, todoData.date));
                }
            });
        } else {
            // Create new card for this date
            var card = $('<div>').addClass('card').attr('id', `${todoData.date}-card`);
            var cardHeader = $('<div>').addClass('card-header').text(todoData.date);
    
            var deleteButton = $('<button>').addClass('delete-date-card').html('<i class="fas fa-trash"></i>').css('margin-left', '10px');
            deleteButton.on('click', function() {
                deleteDateCard(todoData.date);
            });
    
            cardHeader.append(deleteButton);
    
            var cardBody = $('<div>').addClass('card-bodyer').css('padding', '40px').css('background-color', '#f8f9fa');
    
            var taskList = $('<ul>').addClass('task-list').css('padding-left', '0');
            var completedList = $('<ul>').addClass('completed-list').css('padding-left', '0');
            todoData.tasks.forEach(function(task) {
                if (task.completed) {
                    completedList.append(createTaskItem(task.text, task.completed, todoData.date));
                } else {
                    taskList.append(createTaskItem(task.text, task.completed, todoData.date));
                }
            });
    
            cardBody.append(taskList, $('<hr>').css('border', '1px solid #FF7E22'), $('<h5>').css('font-weight', 'bold').css('color', '#FF7E22').text('Done'), completedList);
            card.append(cardHeader, cardBody);
    
            $('#todo-list').prepend(card);  // Prepend the new card to the beginning of the list
        }
    }
    
    
    function createTaskItem(text, completed, date) {
        var listItem = $('<li>').addClass('task-item');
        var checkbox = $('<input type="checkbox">').addClass('task-checkbox').prop('checked', completed);
        var label = $('<label>').text(text).addClass('editable');

        if (completed) {
            label.css('text-decoration', 'line-through');
        }

        checkbox.on('change', function() {
            var isChecked = this.checked;
            var taskData = {
                oldText: text,
                newText: text,
                completed: isChecked
            };

            // AJAX call to update task status on the server
            console.log(taskData);
            $.ajax({
                url: url_event_todo_put + date + '/',  // Replace with your endpoint
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({ task: taskData }),
                success: function(response) {
                    // Handle success response
                    if (isChecked) {
                        label.css('text-decoration', 'line-through');
                        moveToCompleted(listItem);
                    } else {
                        label.css('text-decoration', 'none');
                        moveToPending(listItem);
                    }
                },
                error: function(xhr, status, error) {
                    // Handle error
                    alert('Failed to update task. Please try again.');
                    // Revert checkbox state
                    checkbox.prop('checked', !isChecked);
                }
            });
        });

        label.on('click', function() {
            var currentText = $(this).text();
            var input = $('<input type="text">').val(currentText).addClass('editable-input');
            $(this).replaceWith(input);
            input.focus();

            input.on('blur', function() {
                var newText = $(this).val();
                var taskData = {
                    oldText: currentText,
                    newText: newText,
                    completed: checkbox.is(':checked')
                };

                // AJAX call to update task text on the server
                $.ajax({
                    url: url_event_todo_put + date + '/',  // Replace with your endpoint
                    method: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify({ task: taskData }),
                    success: function(response) {
                        // Handle success response
                        label.text(newText);
                        input.replaceWith(label);
                        text = newText; // Update the text variable to the new text
                    },
                    error: function(xhr, status, error) {
                        // Handle error
                        alert('Failed to update task. Please try again.');
                        // Revert to old text
                        input.replaceWith(label);
                    }
                });
            });

            input.on('keydown', function(event) {
                if (event.key === 'Enter') {
                    input.blur();
                }
            });
        });

        listItem.append(checkbox, label);
        return listItem;
    }
    
    
    function moveToCompleted(taskItem) {
        var completedList = taskItem.closest('.card-bodyer').find('.completed-list');
        taskItem.appendTo(completedList);
    }
    
    function moveToPending(taskItem) {
        var taskList = taskItem.closest('.card-bodyer').find('.task-list');
        taskItem.appendTo(taskList);
    }

    function deleteDateCard(date) {
        var userId = 'your_user_id_here'; // Replace with the actual user ID
    
        $.ajax({
            url: url_event_todo_delete+date+'/',  // Replace with your endpoint
            method: 'DELETE',
            success: function(response) {
                // alert(response.message);  // Optionally show success message
                $(`#${date}-card`).remove();  // Remove the card from the DOM
            },
            error: function(xhr, status, error) {
                alert('Failed to delete to-do. Please try again.');
            }
        });
    }
});