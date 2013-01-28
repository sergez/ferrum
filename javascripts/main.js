$(document).ready(function() {
    $('.accordion').on('click', '.accordion-inner a', function () {
        $(this).parent().addClass('active').siblings().removeClass('active');
    });
    
    $('pre code').each(function(i, e) {
        hljs.highlightBlock(e)
    });
});