$(document).ready(function () {
    $(".wizardbutton").click(function (e) {
        e.preventDefault();
        $($(this).attr('href')).tab("show");
    });

});