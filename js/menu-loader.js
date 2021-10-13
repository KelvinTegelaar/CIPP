$(document).ready(function () {

    let searchParams = new URLSearchParams(window.location.search)
    if (searchParams.has('page')) {
        let param = searchParams.get('page')

        $('#bodycontent').load(param + '.html'), function () {
        };
    }

    $(".SpecialNavLink").on('click', 'a', function (e) {
        e.preventDefault();
        history.pushState(null, null, '?page=' + $(this).attr('href'));
        $('#bodycontent').load($(this).attr('href') + '.html', function () {

        });

    });
    var jsonOptions = (function () {
        var json = null;
        $.ajax({
            'async': false,
            'global': false,
            'url': '.auth/me',
            'dataType': "json",
            'success': function (data) {
                json = data;
            }
        });
        return json;
    })();

    $('#usernamelower').text(jsonOptions.clientPrincipal.userDetails);
    $('#usernameupper').text(jsonOptions.clientPrincipal.userDetails);


});

