$(document).ready(function () {
    let tenant = getParameterByName("Tenantfilter");
    let searchParams = new URLSearchParams(window.location.search)
    if (searchParams.has('page')) {
        let param = searchParams.get('page')
        $('#bodycontent').load(param + '.html');
    }

    $(".SpecialNavLink").on('click', 'a', function (e) {
        e.preventDefault();
        if(tenant){
            history.pushState(null, null, '?page=' + $(this).attr('href') + '&Tenantfilter=' + tenant);
        }
        else {
            history.pushState(null, null, '?page=' + $(this).attr('href'));
        }

        $('#bodycontent').load($(this).attr('href') + '.html')
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

function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}