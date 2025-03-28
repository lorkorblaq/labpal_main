$(document).ready(function() {
  function showSignInForm() {
    $('.signIn').addClass('active-dx').removeClass('inactive-sx');
    $('.signUp').addClass('inactive-dx').removeClass('active-sx');
  }

  function showSignUpForm() {
    $('.signIn').addClass('inactive-sx').removeClass('active-dx');
    $('.signUp').addClass('active-sx').removeClass('inactive-dx');
  }

  $('.log-in').on('click', function() {
    showSignInForm();
  });

  $('.back').on('click', function() {
    showSignUpForm();
  });

  $('#reg_org').on('click', function() {
    // alert('Registration for labs is not available at the moment. Please check back later.');
    $('#myModal_org').css('display', 'block');
  });
  $('#reg_lab').on('click', function() {
    // alert('Registration for labs is not available at the moment. Please check back later.');
    $('#myModal_lab').css('display', 'block');
  });

  $('.close').on('click', function() {
    $('.modal').css('display', 'none');
  });

  // Optionally, close the modal when clicking outside of the modal content
  $(window).on('click', function(event) {
    if ($(event.target).is('.modal')) {
        $('.modal').css('display', 'none');
    }
  });

  // Get the overlay, popup elements, close button, and iframe
  var $popupOverlay = $("#popupOverlay");
  var $openPopupBtn = $("#intro_vid");
  var $closePopupBtn = $(".close");
  var $youtubeVideo = $("#youtubeVideo");

  // YouTube video embed URL
  var videoURL = "https://www.youtube.com/embed/8_7yLfQmJTE";

  // When the user clicks the link, show the popup and load the video
  $openPopupBtn.on('click', function(event) {
    event.preventDefault(); // Prevent default link behavior
    $popupOverlay.css('display', 'block'); // Show the popup
    $youtubeVideo.attr('src', videoURL + "?autoplay=1"); // Load the video with autoplay
  });

  // When the user clicks on the close button, close the popup and stop the video
  $closePopupBtn.on('click', function() {
    $popupOverlay.css('display', 'none'); // Hide the popup
    $youtubeVideo.attr('src', ''); // Stop the video by clearing the iframe source
  });

  // When the user clicks outside the popup, close it
  $(window).on('click', function(event) {
    if ($(event.target).is($popupOverlay)) {
      $popupOverlay.css('display', 'none'); // Hide the popup
      $youtubeVideo.attr('src', ''); // Stop the video
    }
  });

  // $("#resetPasswordModal").hide();

  $("#openResetModal").click(function() {
      $("#resetPasswordModal").addClass("show");
  });

  $(".close, .resetModal").click(function(event) {
      if (event.target === this) $("#resetPasswordModal").removeClass("show");
  });

  $("#sendResetLink").click(function(event) {
    console.log("submitting");
      event.preventDefault();
      var email = $("#resetEmail").val();
      console.log(email);
      $.ajax({
          url: "/send_reset_link",
          type: "POST",
          data: {
              email: email
          },
          success: function(data) {
              $("#resetPasswordModal").fadeOut();
              alert(data);
          },
          error: function(data) {
              alert("An error occurred. Please try again later.");
          }
      });
  });

  const orgIdInput = document.querySelector('input[name="org_id"]');
  const labsDropdown = document.querySelector('select[name="lab"]');

  $(orgIdInput).on('input', function () {
      const orgId = $(this).val().trim();
      console.log('Org ID:', orgId);
      if (orgId) {
          $.ajax({
              url: `/get-labs?org_id=${orgId}`,
              method: 'GET',
              dataType: 'json',
              success: function (data) {
                  // Clear existing options
                  $(labsDropdown).html('<option value="" disabled selected>Select a lab</option>');
                  if (data.labs) {
                      data.labs.forEach(function (lab) {
                          const option = $('<option></option>').val(lab).text(lab);
                          $(labsDropdown).append(option);
                      });
                  } else if (data.error) {
                      alert(data.error);
                  }
              },
              error: function (xhr, status, error) {
                  console.error('Error fetching labs:', error);
                  alert('An error occurred while fetching labs.');
              }
          });
      }
  });
});