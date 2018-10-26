$(function () {
    function showSiteProjects(aSiteProjects) {
        let $tBody = $('.site-projects .table tbody');
        $tBody.empty();
        if (aSiteProjects && aSiteProjects.length) {
            $.each(aSiteProjects, function (idx, value) {
                //console.log(idx, value)
                if (!value.OriginalRequest.match(/test/i)) {
                    let budgetSources         = '';
                    let aProjectBudgetSources = value.BudgetSources.split(/,/);
                    $.each(aProjectBudgetSources, function (key, val) {
                        if (typeof aBudgetSources[val] !== 'undefined') {
                            budgetSources += aBudgetSources[val] + ', ';
                        }
                    });
                    budgetSources = budgetSources.replace(/, $/, '');
                    $tBody.append('<tr><td>' + value.SequenceNumber + '</td><td>' + value.OriginalRequest.replace(/(\r\n|\n)/,'<br>') + '</td><td>' + budgetSources + '</td></tr>');
                }
            })
        }

        if ($tBody.children().length){
            $('.no-site-projects').hide();
            $('.site-projects .table').show();
        } else {
            $('.site-projects .table').hide();
            $('.no-site-projects').show();
        }
    }

    $('.button-new-contact').on('click', function (e) {
        e.preventDefault();
        $('[name="ContactID"]').attr('required', false);
        $('.new-contact-info').find('input').attr('required', true);
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
        var siteID        = $(this).val();
        var $contact      = $('[name="ContactID"]');
        var $options      = $contact.find('option');
        if (siteID !== '') {
            $('.site-projects').show();
            let aSiteProjects = typeof aaProjects[siteID] !== 'undefined' ? aaProjects[siteID] : [];
            showSiteProjects(aSiteProjects);
        } else {
            $('.site-projects').hide();
        }
        if (siteID !== '') {
            $options.hide();
            $contact.find('option[siteid="' + siteID + '"]').show();
        } else {
            $options.show();
        }
    });
});
