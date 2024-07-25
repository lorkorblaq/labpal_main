$(function () {
    console.log("user-profile.js loaded");
    BaseUrl = "https://labpal.com.ng/api";
    // BaseUrl = "http://127.0.0.1:3000/api";

    function setCookie(name, value, hours) {
        var expires = "";
        var sameSite = document.location.protocol === 'https:' ? "; SameSite=None" : "";
        
        if (hours) {
            var date = new Date();
            date.setTime(date.getTime() + (hours * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
    
        document.cookie = name + "=" + encodeURIComponent(value) + expires + sameSite + "; path=/";
    }
    
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
    const userUrl = `${BaseUrl}/user/get/${user_id}/`
    const put_url = `${BaseUrl}/user/put/${user_id}/`;
    const image_url = `${BaseUrl}/user-image/${user_id}/`;
    // const url_item_get = `${BaseUrl}/user/put/`;
    // const url_item_put = `${BaseUrl}/item/put/`;
    $.get(userUrl, function(userData) {
        // Access the user data and update the HTML content
        const userDataContainer = $('#userContainer'); // Updated ID to match the HTML
        // Update specific elements with user data
        const userName = userData.firstname + ' ' + userData.lastname;
        userDataContainer.find('#image_profile').attr('src', userData.image);
        userDataContainer.find('#name').text(userName);
        userDataContainer.find('.title').text(userData.title);
        userDataContainer.find('#lab_acess').text(userData.lab_acess);
        userDataContainer.find('#firstName').text(userData.firstname);
        userDataContainer.find('#lastName').text(userData.lastname);
        userDataContainer.find('#emailAddr').text(userData.email);   
        userDataContainer.find('#mobileNumb').text(userData.mobile); 
        userDataContainer.find('#address').text(userData.address);   
        if ($('#image_profile').attr('src') !== "") {
            $('.upload_btn').hide();
        }
    })
    .fail(function(error) {
        console.error('Error fetching user data:', error);
    });
        

    $('#editButton').click(function () {
        console.log("edit button clicked");
        $('.text-secondary').each(function () {
            $('#saveButton').show()
            $('#editButton').hide()
            var content = $(this).text().trim();
            $(this).empty().append($('<input>', { type: 'text', value: content, class:'form-control profile_input' }));
        });
    });
    $('#saveButton').click(function() {
        console.log('savebutton clicked');
        $('')
        var contents = [];
        $('.text-secondary').each(function() {
            var content = $(this).find('input').val();
            contents.push(content);
            $(this).empty().text(content);
        });
        var datas = {
            firstname: contents[0],
            lastname: contents[1],
            title: contents[2],
            email: contents[3],
            mobile: contents[4] !== '' ? parseInt(contents[4]) : null,
            address: contents[5]
        };
        console.log(datas);
        var jsonString = JSON.stringify(datas);
        $.ajax({
            url: put_url,
            type: 'PUT',
            data: jsonString,
            contentType: 'application/json',            
            success: function(response) {
                // alert('Profile updated successfully');      
            },
            error: function(error) {
                // Handle error here
                console.error(error);
            }
        });
        $('#saveButton').hide();
        $('#editButton').show();
    });

    $('#upload_image').click(function() {
        console.log('im here');
        var fileInput = document.getElementById('image_input');
        var file = fileInput.files[0];
        var formData = new FormData();
        formData.append('image', file);
        $.ajax({
            url: image_url,
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function(response) {
                console.log('Image uploaded successfully');
                $('#image_profile').attr('src', response.file_url);
                $('.upload_btn').hide();
            },
            error: function(error) {
                console.error('Error uploading image:', error);
                // Handle the error here
            }
        });
    });
});
