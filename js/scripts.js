/*!
    * Start Bootstrap - SB Admin Pro v2.0.2 (https://shop.startbootstrap.com/product/sb-admin-pro)
    * Copyright 2013-2021 Start Bootstrap
    * Licensed under SEE_LICENSE (https://github.com/StartBootstrap/sb-admin-pro/blob/master/LICENSE)
    */
window.addEventListener('DOMContentLoaded', event => {
    // Activate feather
    feather.replace();

    // Enable tooltips globally
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Enable popovers globally
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // Activate Bootstrap scrollspy for the sticky nav component
    const stickyNav = document.body.querySelector('#stickyNav');
    if (stickyNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#stickyNav',
            offset: 82,
        });
    }

    // Toggle the side navigation
    const sidebarToggle = document.body.querySelector('#sidebarToggle');
    if (sidebarToggle) {
        // Uncomment Below to persist sidebar toggle between refreshes
        // if (localStorage.getItem('sb|sidebar-toggle') === 'true') {
        //     document.body.classList.toggle('sidenav-toggled');
        // }
        sidebarToggle.addEventListener('click', event => {
            event.preventDefault();
            document.body.classList.toggle('sidenav-toggled');
            localStorage.setItem('sb|sidebar-toggle', document.body.classList.contains('sidenav-toggled'));
        });
    }

    // Close side navigation when width < LG
    const sidenavContent = document.body.querySelector('#layoutSidenav_content');
    if (sidenavContent) {
        sidenavContent.addEventListener('click', event => {
            const BOOTSTRAP_LG_WIDTH = 992;
            if (window.innerWidth >= 992) {
                return;
            }
            if (document.body.classList.contains("sidenav-toggled")) {
                document.body.classList.toggle("sidenav-toggled");
            }
        });
    }

    // Add active state to sidbar nav links
    let searchParams = new URLSearchParams(window.location.search)
    let activatedPath = searchParams.get('page')
    // let activatedPath = window.location.pathname.match(/([\w-]+\.html)+$/, '$1');
    if (activatedPath) {
        activatedPath = activatedPath;
    } else {
        activatedPath = 'index.html';
    }

    const targetAnchors = document.body.querySelectorAll('[href="' + activatedPath + '"].nav-link');

    targetAnchors.forEach(targetAnchor => {
        let parentNode = targetAnchor.parentNode;
        while (parentNode !== null && parentNode !== document.documentElement) {
            if (parentNode.classList.contains('collapse')) {
                parentNode.classList.add('show');
                const parentNavLink = document.body.querySelector(
                    '[data-bs-target="#' + parentNode.id + '"]'
                );
                parentNavLink.classList.remove('collapsed');
                parentNavLink.classList.add('active');
            }
            parentNode = parentNode.parentNode;
        }
        targetAnchor.classList.add('active');
    });
    //API GET call + modal pop-up
    $(document.body).on('click', '.APILink a', function (e) {
        $('#APIContent').html('<label class="form-check-label" >Are you sure you want to ' + $(this).attr('actionname') + '?</label><br><nothing class="APIConfirmed"><a href="' + $(this).attr('href') + '"><button id="Confirmed" class="btn btn-primary APIConfirmed">Yes</button></a></nothing><nothing class="APIDenied">  <button data-bs-dismiss="modal" class="btn btn-primary APIDenied">No</button>');
        e.preventDefault();
        document.getElementById("PopModal").click();
    });


    $(document.body).on('click', '.APIConfirmed a', function (e) {
        e.preventDefault();
        $('#APIContent').html('<div class="spinner-border text-primary" role="status"><span class="sr-only"></span></div></span>');
        var usedurl = $(this).attr('href');
        var jsonOptions = (function () {
            var json = null;
            $.ajax({
                'async': true,
                'global': false,
                'url': usedurl,
                'dataType': "json",
                'success': function (data) {
                    json = data;
                    $('#APIContent').html(json.Results);
                },
                'error': function (xhr, ajaxOptions, thrownError) {
                    $('#APIContent').html('Failed to connect to API: ' + thrownError);
                }
            });
            return json;
        })();
    });
});



//retrieving form data to normal json object
function getFormData($form) {
    var unindexed_array = $form.serializeArray();
    var indexed_array = {};

    $.map(unindexed_array, function (n, i) {
        indexed_array[n['name']] = n['value'];
    });

    return indexed_array;
}
//Posting a form
function PostForm(FormID, PostAPI) {
    var $form = $('#' + FormID);
    var postdata = getFormData($form);
    $('#APIContent').html('<div class="spinner-border text-primary" role="status"><span class="sr-only"></span></div></span>');
    document.getElementById("PopModal").click();
    $.ajax({
        'async': true,
        'global': false,
        'url': PostAPI,
        'type': "post",
        'data': JSON.stringify(postdata),
        'contentType': "application/json",
        'success': function (data) {
            $('#APIContent').html(data.Results);
        },
        'error': function (xhr, ajaxOptions, thrownError) {
            $('#APIContent').html('Failed to connect to API: ' + thrownError);
        }
    });


}
var tries = 0;
function GetAPIData(url, guid) {
    return new Promise((resolve, reject) => {
        let ajaxsettings = {
            type: 'GET',
            url: url + '?GUID=' + guid,
            success: function (data) {
                tries++;
                if (data.Waiting) {
                    setTimeout(function () {
                        $.ajax(ajaxsettings);
                    }, 5000);
                } else {
                    if (tries >= 60) {
                        reject("Failed to retrieve data in 5 minutes");
                    } else {
                        resolve(data);
                    }
                }
            }
        }
        $.ajax(ajaxsettings);
    })
}

// Escape HTML entities to protect against XSS attacks.
function escapeHTML(text) {
    'use strict';
    return text.replace(/[\"&'\/<>]/g, function (a) {
        return {
            '"': '&quot;', '&': '&amp;', "'": '&#39;',
            '/': '&#47;', '<': '&lt;', '>': '&gt;'
        }[a];
    });
}
