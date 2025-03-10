$(document).ready(function () {
    document.querySelector(".hamburger").addEventListener("click", function() {
        document.querySelector(".nav-menu").classList.toggle("active");
    });
    console.log('landing page ready!');
    const navLinks = $('.nav-links a');

        // navLinks.on('click', function (e) {
        //     e.preventDefault();
        //     const targetId = $(this).attr('href').substring(1);
        //     const targetElement = $('h' + targetId);

        //     $('html, body').animate({
        //         scrollTop: targetElement.offset().top
        //     }, 500);
        // });

    const contactForm = $('.contact form');
    contactForm.on('submit', function (e) {
        e.preventDefault();
        alert('Form submitted!');
    });

    $('#hamburger').click(function() {
        console.log('clicked');
        $('#nav-menu').toggleClass('active');
    });

    function validateRecaptcha() {
        var response = grecaptcha.getResponse();
        if(response.length == 0) {
            alert("Please complete the reCAPTCHA verification.");
            return false;
        }
        return true;
    }

    $(".demo-form").submit(function (event) {
        event.preventDefault(); // Prevent default form submission
        var recaptchaResponse = grecaptcha.getResponse(); // Get reCAPTCHA response

        if (recaptchaResponse.length === 0) {
            alert("Please complete the reCAPTCHA verification.");
            return;
        }
        var formData = {
            name: $("input[name='name']").val(),
            email: $("input[name='email']").val(),
            company: $("input[name='company']").val(),
            size: $("input[name='size']").val(),
            recaptcha: recaptchaResponse // Send reCAPTCHA response to backend

        };
        console.log(formData);

        $.ajax({
            url: "/send_demo_request",  // Flask route
            type: "POST",
            contentType: "application/json", // Tell Flask we are sending JSON
            data: JSON.stringify(formData), // Convert to JSON format
            success: function (response) {
                alert(response.message); // Show success message
                $(".demo-form")[0].reset();
                grecaptcha.reset(); // Reset reCAPTCHA

            },
            error: function (xhr, status, error) {
                alert("Error: " + error); // Show error message
            }
        });
    });
    
});
