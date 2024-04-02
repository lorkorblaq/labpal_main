$(function () {
    console.log("settings.js loaded");
    $('#sec-btn').click(function() {
        console.log("security clicked");
        $("#notifications").hide()  ;
        $("#billing ").hide();
        $("#security ").show();

    });

    $('#not-btn').click(function() {
        $("#billing ").hide();
        $("#security ").hide();
        $("#notifications").show() ;

    });

    $('#bill-btn').click(function() {
        $("#notifications").hide()  ;
        $("#security ").hide();
        $("#billing ").show();

    });
});