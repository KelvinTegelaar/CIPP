$(document).ready(function () {
    let searchParams = new URLSearchParams(window.location.search)
    var currentTenant = '';
    if (searchParams.has('page')) {
        let param = searchParams.get('page')
        $('#bodycontent').load(param + '.html');
    }

    $(".SpecialNavLink").on('click', 'a', function (e) {
        e.preventDefault();
        searchParams = new URLSearchParams(window.location.search)
        currentTenant = searchParams.get('Tenantfilter');
        if(currentTenant && currentTenant !== ''){
            history.pushState(null, null, '?page=' + $(this).attr('href') + '&Tenantfilter=' + currentTenant);
        }
        else {
            history.pushState(null, null, '?page=' + $(this).attr('href'));
        }

        $('#bodycontent').load($(this).attr('href') + '.html');
        $(".sidenav-menu a").removeClass("active");
        $(".sidenav-menu a[aria-expanded='true']").addClass("active");
        $(".SpecialNavLink a").removeClass("active");
        $(this).addClass("active");
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