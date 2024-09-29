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

});
