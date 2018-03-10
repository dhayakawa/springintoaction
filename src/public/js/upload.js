function initializeFileUploadObj(el) {
    $(el).fileupload({
        url: App.Vars.sAjaxFileUploadURL,
        dataType: 'json',
        done: function (e, data) {
            let self = this
            //console.log(data)
            $('#file_progress_' + self.id).fadeTo(0, 'slow');
            $('#file_' + self.id).val('')
            $('#file_chosen_' + self.id).empty()
            $.each(data.files, function (index, file) {
                let sFileName = file.name
                let sExistingVal = $('#file_' + self.id).val().length > 0 ? $('#file_' + self.id).val() + ',' : ''
                $('#file_' + self.id).val(sExistingVal + sFileName)
                $('#file_chosen_' + self.id).append(sFileName + '<br>')
            });

        },
        start: function (e) {
            let self = this
            $('#file_progress_' + self.id).fadeTo('fast', 1);
        },
        progress: function (e, data) {
            let self = this
            let progress = parseInt(data.loaded / data.total * 100, 10);

            $('#file_progress_' + self.id + ' .meter').css(
                'width',
                progress + '%'
            ).find('p').html(progress + '%');
        }
    }).prop('disabled', !$.support.fileInput)
        .parent().addClass($.support.fileInput ? undefined : 'disabled');
}


// initialize all file upload inputs on the page at load time
initializeFileUploadObj($('form#quote_request input[type="file"]'));
