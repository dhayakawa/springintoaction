$(function () {
    $('.button-new-contact').on('click', function (e) {
        e.preventDefault();
        $('[name="ContactID"]').attr('required', false);
        $('.new-contact-info').find('input').attr('required',true);
        $('.new-contact-info').show();
        $('[name="ContactID"]').val('add_me')
    });
    $('[name="ContactID"]').on('change', function (e) {
        var contactID = $(this).val();

        if (contactID !== '') {
            $(this).attr('required', 'required');
            $('.new-contact-info').find('input').attr('required', false);
            $('.new-contact-info').hide();
        }
    });
    $('[name="SiteID"]').on('change', function (e) {
        var siteID = $(this).val();
        var $contact = $('[name="ContactID"]');
        var $options = $contact.find('option');
        if (siteID !== '') {
            $options.hide();
            $contact.find('option[siteid="' + siteID + '"]').show();
        } else {
            $options.show();
        }
    });
});
