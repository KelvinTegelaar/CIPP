// For more details see: https://getbootstrap.com/docs/5.0/components/toasts/#usage

window.addEventListener('DOMContentLoaded', event => {

    const toastBasicEl = document.getElementById('toastBasic');
    const toastNoAutohideEl = document.getElementById('toastNoAutohide');
    
    const toastBasic = new bootstrap.Toast(toastBasicEl);
    const toastNoAutohide = new bootstrap.Toast(toastNoAutohideEl);

    const toastBasicTrigger = document.getElementById('toastBasicTrigger');
    if (toastBasicTrigger) {
        toastBasicTrigger.addEventListener('click', event => {
            console.log('asd');
            toastBasic.show();
        });
    }

    const toastNoAutohideTrigger = document.getElementById('toastNoAutohideTrigger');
    if (toastNoAutohideTrigger) {
        toastNoAutohideTrigger.addEventListener('click', event => {
            toastNoAutohide.show();
        });
    }

})
