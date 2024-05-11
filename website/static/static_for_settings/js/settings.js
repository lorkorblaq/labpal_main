$(function () {
    console.log("settings.js loaded");
    $('#sec-btn').click(function() {
        console.log("security clicked");
        $("#notifications").hide()  ;
        $("#billing ").hide();
        $("#data ").hide();
        $("#security ").show();

    });

    $('#not-btn').click(function() {
        $("#billing ").hide();
        $("#security ").hide();
        $("#data ").hide();
        $("#notifications").show() ;

    });

    $('#data-btn').click(function() {
        $("#billing ").hide();
        $("#security ").hide();
        $("#notifications").hide();
        $("#data ").show();

    });

    $('#bill-btn').click(function() {
        $("#notifications").hide()  ;
        $("#security ").hide();
        $("#data ").hide();
        $("#billing ").show();

    });
});