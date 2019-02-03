(function (App) {
    App.Views.ContactInfo = Backbone.View.extend({
        tagName: 'div',
        className: 'contact-info-wrapper',
        template: template('newProjectRegistrationContactInfoTemplate'),
        initialize: function (options) {
            let self = this;
            this.options = options;
            _.bindAll(
                this,
                'render',
            );
            this.contactInfoIdx = this.options.contactInfoIdx;
            this.fieldValidationErrors = [];
            this.bIsWoodlands = false;
            this.parentView = this.options.parentView;
            this.contactInfoData = this.options.contactInfoData;
            self.bIsWoodlands = self.contactInfoData.Church === 'woodlands';
            this.$el.addClass('contact-info-idx-' + self.contactInfoIdx);
            _log('App.Views.ContactInfo.initialize', options);
        },
        events: {
            'change select[id^="Church"]': 'handleChurchSelection',
        },
        render: function () {
            let self = this;
            let tplVars = {
                idx: self.contactInfoIdx,
                Church: self.contactInfoData.Church,
                ChurchOther: self.contactInfoData.ChurchOther,
                MobilePhoneNumber: self.contactInfoData.MobilePhoneNumber,
                FirstName: self.contactInfoData.FirstName,
                LastName: self.contactInfoData.LastName,
                Email: self.contactInfoData.Email

            };

            let html = this.template(tplVars);
            $(this.el).html(html);

            return this;
        },
        handleChurchSelection: function (e) {
            let self = this;
            self.bIsWoodlands = $(e.currentTarget).val() === 'woodlands';
            let $otherChurchWrapper = self.$el.find('.other-church-wrapper');
            if (self.bIsWoodlands) {
                $otherChurchWrapper.hide();
                $otherChurchWrapper.find('[id^="ChurchOther"]').removeAttr('required');
            } else {
                $otherChurchWrapper.show();
                $otherChurchWrapper.find('[id^="ChurchOther"]').attr('required', '');
            }
        },
        getIsWoodlands: function () {
            return this.bIsWoodlands;
        },
        validateContactInfo: function () {
            let self = this;
            let fields = self.$el.find('input[required]');
            let iInvalidFields = 0;
            let fieldValidationErrors = [];
            _.each(fields, function (val) {
                if ($(val).val() === '') {
                    $(val).siblings('label').addClass('text-danger');
                    fieldValidationErrors.push($(val).siblings('label').text());
                    iInvalidFields++;
                } else {
                    $(val).siblings('label').removeClass('text-danger');
                }
            });
            let $churchSelect = self.$el.find('select[id^="Church"]');
            if ($churchSelect.val().length === 0 || $churchSelect.val() === 'Choose Church') {
                $churchSelect.siblings('label').addClass('text-danger');
                fieldValidationErrors.push($churchSelect.siblings('label').text());
                iInvalidFields++;
            } else {
                $churchSelect.siblings('label').removeClass('text-danger');
            }

            let alertMessage = '';
            if (fieldValidationErrors.length) {
                alertMessage = 'Please enter all required information';
                alertMessage += '<br>';
                $.each(fieldValidationErrors, function (idx, msg) {
                    alertMessage += msg + ' is missing<br>';
                });
                fieldValidationErrors = [];
            }

            self.$el.find('.contact-info-error').remove();
            if (alertMessage !== '') {
                let $alertHtml = $('<div class="alert alert-danger contact-info-error" role="alert">' + alertMessage + '</div>');
                self.$el.append($alertHtml);
            }

            return iInvalidFields === 0;
        },
        getContactInfoData: function () {
            let self = this;
            let fields = self.$el.find('input');

            let data = {};
            _.each(fields, function (val) {
                data[$(val).attr('name')] = $(val).val();
            });
            let $churchSelect = self.$el.find('select[id^="Church"]');
            data[$churchSelect.attr('name')] = $churchSelect.val();
            // _.sortBy(data, function (val,key) {
            //     console.log(val, key)
            //     return 1;
            // });
            return data;
        }
    });

    App.Views.RegistrationForm = Backbone.View.extend({
        template: template('newProjectRegistrationTemplate'),
        initialize: function (options) {
            let self = this;
            this.options = options;
            _.bindAll(
                this,
                'render',
                'registerOthers',
                'registerAndConfirm',
                'toggleProjectDescriptionCollapseIcon',
                'makeReservations',
                'confirmReservationTimeout',
                'handleRegisterProcessType',
                'handleGroveLogin',
                'submitRegistration',
                'makeReservations',
                'deleteRegistrationContactListItem'
            );
            this.fieldValidationErrors = [];
            this.bIsWoodlands = false;
            this.contactInfoIdx = 1;
            this.contactInfoViews = [];
            this.parentView = this.options.parentView;
            this.iReserved = 0;
            this.bIsGroveImport = false;
            this.groveContacts = [];
            this.groveContactsFinal = [];
            App.Vars.reservationTimeoutExpire = 1000 * 60;
            App.Vars.reservedProjectID = null;
            clearTimeout(App.Vars.reservationTimeout);
            clearInterval(App.Vars.reservationInterval);
            $('body').addClass('project-registration-page');

            _log('App.Views.Registration.initialize', options);
        },
        events: {
            'click .register-others': 'registerOthers',
            'click .confirm-and-register': 'registerAndConfirm',
            'click .submit-registration-btn': 'submitRegistration',
            'click .back-to-contact-info-btn': function (e) {
                e.preventDefault();
                this.$el.find('[href="#contact-info"]').trigger('click');
                this.updateActiveStep('.step-one.steps')
            },
            'click .back-to-register-others-btn': function (e) {
                e.preventDefault();
                this.$el.find('[href="#auto-register"]').trigger('click');
                this.updateActiveStep('.step-two.steps')
            },
            'click .collapse-project-description': function (e) {
                e.preventDefault();
            },
            'hidden.bs.collapse #collapseProjectDescription': 'toggleProjectDescriptionCollapseIcon',
            'shown.bs.collapse #collapseProjectDescription': 'toggleProjectDescriptionCollapseIcon',
            'click form[name="newProjectReservation"] button': 'makeReservations',
            'click [name="register-process-type"]': 'handleRegisterProcessType',
            'click .submit-grove-login-btn': 'handleGroveLogin',
            'click .manual-delete-registration-contact': 'deleteRegistrationContactListItem'
        },
        render: function () {
            let self = this;
            let tplVars = {
                CsrfToken: $('meta[name="csrf-token"]').attr('content'),
                ProjectID: self.model.get('ProjectID'),
                volunteersNeeded: self.model.getVolunteersNeeded(),
                SiteName: self.model.get('SiteName'),
                ProjectDescription: self.model.get('ProjectDescription'),
                testString: '',
                testDBID: 0,
                testGroveEmail: 'david.hayakawa@gmail.com',
                testGrovePassword: 'jack1455'

            };
            $(this.el).html(this.template(tplVars));
            let contactInfoDataValues = {
                Church: '',
                ChurchOther: '',
                MobilePhoneNumber: '',
                FirstName: '',
                LastName: '',
                Email: ''
            };
            if (App.Vars.devMode){
                contactInfoDataValues = {
                    Church: 'woodlands',
                    ChurchOther: '',
                    MobilePhoneNumber: '7153054840',
                    FirstName: 'David',
                    LastName: 'Hayakawa',
                    Email: 'david.hayakawa@gmail.com'
                };
            }
            self.contactInfoViews[0] = new App.Views.ContactInfo({
                el: self.$el.find('.personal-contact-info-wrapper'),
                parentView: self,
                contactInfoIdx: 0,
                contactInfoData: contactInfoDataValues
            });

            self.$el.find('.personal-contact-info-wrapper').replaceWith(self.contactInfoViews[0].render().el);

            return this;
        },
        makeReservations: function (e) {
            e.preventDefault();
            let self = this;
            let $projectReservationForm = $('form[name="newProjectReservation"]');
            let formData = $projectReservationForm.serialize();
            App.Vars.reservedProjectID = self.model.get('ProjectID');
            let iReserved = $projectReservationForm.find('[name="reserve"]').val();
            let volunteersNeeded = self.model.getVolunteersNeeded();
            if (iReserved === '') {
                let alertMessage = 'Please enter a number to continue.';
                let $alertHtml = $('<div class="alert alert-danger reservation-error" role="alert">' + alertMessage + '</div>');
                $projectReservationForm.find('.reservation-error').remove();
                $projectReservationForm.prepend($alertHtml);
                return false;
            } else if (parseInt(iReserved) > parseInt(volunteersNeeded)) {
                let alertMessage = 'Sorry, there are only ' + self.model.getVolunteersNeeded() + ' spots left. Please reduce your reservations ' +
                                   'or choose a different project.';
                let $alertHtml = $('<div class="alert alert-danger reservation-error" role="alert">' + alertMessage + '</div>');
                $projectReservationForm.find('.reservation-error').remove();
                $projectReservationForm.prepend($alertHtml);
                return false;
            } else {
                $projectReservationForm.find('.reservation-error').remove();
            }
            self.iReserved = parseInt(iReserved);
            $projectReservationForm.append(App.Vars.spinnerHtml);
            $.ajax({
                type: "post",
                dataType: "json",
                url: 'project_registration/reserve',
                data: formData,
                success: function (response) {
                    self.startReservationTimeout();
                    $projectReservationForm.find('.spinner').remove();
                    $projectReservationForm.append('<span class="reservation-successful text-success">Reservation Successful</span>');
                    setTimeout(function () {
                        $('.reservation-successful').remove();
                        $('.reservation-wrapper').hide();
                        self.updateStepsView();
                        $('.registration-form-body-wrapper').show();
                        $('#collapseProjectDescription').collapse('show');
                    }, 1000);

                },
                fail: function (response) {
                    console.error(response)
                }
            })
        },
        startReservationTimeout: function () {
            let self = this;
            clearTimeout(App.Vars.reservationTimeout);
            App.Vars.reservationTimeout = setTimeout(self.confirmReservationTimeout, App.Vars.reservationTimeoutExpire);
        },
        confirmReservationTimeout: function () {
            let self = this;
            clearTimeout(App.Vars.reservationTimeout);
            let $confirmReservationTimeoutModal = getSIAConfirmModal('confirmReservationTimeout');

            $confirmReservationTimeoutModal.on('show.bs.confirm', function (event) {
                let $confirm = $(this);
                let iCountDown = 60;
                $confirm.find('.confirm-body').find('.confirm-question').html('<div>You will automatically lose your reserved spots in <span class="reservation-countdown">' + iCountDown + '</span> seconds. Would you like another 5 minutes?</div>');
                clearInterval(App.Vars.reservationInterval);
                App.Vars.reservationInterval = setInterval(function () {
                    $confirm.find('.confirm-body').find('.reservation-countdown').text(iCountDown--);
                    if (iCountDown <= 0) {
                        self.parentView.removeReservations();
                        clearInterval(App.Vars.reservationInterval);
                        $confirm.find('.confirm-body').find('.confirm-question').html('<div>Your reservation has expired.</div>');
                        $confirm.find('.confirm-body').find('button.btn-yes').remove();
                        $confirm.find('.confirm-body').find('button.btn-no').text('OK');
                    }
                }, 1000);
                $confirm.find('.confirm-body').find('button').on('click', function (e) {
                    e.preventDefault();
                    clearInterval(App.Vars.reservationInterval);
                    if ($(this).hasClass('btn-yes')) {
                        App.Vars.reservationTimeout = setTimeout(self.confirmReservationTimeout, App.Vars.reservationTimeoutExpire);
                    } else {
                        self.parentView.removeReservations();
                    }
                    $confirm.confirm('hide');
                });

            });
            if (!self.$el.is(':visible')) {
                clearTimeout(App.Vars.reservationTimeout);
                clearInterval(App.Vars.reservationInterval);
                App.Vars.reservedProjectID = null;
                return true;
            } else {
                $confirmReservationTimeoutModal.confirm('show');
            }
        },
        updateStepsView: function () {
            let self = this;
            if (self.iReserved < 2) {
                $('.register-others.btn').hide();
                $('.back-to-register-others-btn').hide();
                $('.go-to-step-two-btn').hide();
                $('.back-to-step-two-btn').hide();
                $('.step-two').hide();
            } else {
                $('.go-to-step-two-btn').show();
                $('.back-to-step-two-btn').show();
                $('.step-two').show();
            }
        },
        registerOthers: function (e) {
            let self = this;
            e.preventDefault();
            let valid = self.contactInfoViews[0].validateContactInfo();
            if (valid) {
                self.setStepAsValidated('.step-one.steps', $(e.currentTarget));
                self.setUpRegisterOthers();
                self.$el.find('[href="#auto-register"]').trigger('click');
                self.updateActiveStep('.step-two.steps');
                if ($('#collapseProjectDescription').is(':visible')) {
                    $('#collapseProjectDescription').collapse('toggle');
                }

            } else {
                self.setStepAsInValid('.step-one.steps', $(e.currentTarget));
            }
        },
        buildManualContactInfo: function (contacts) {
            let self = this;
            let iExtraRegistrations = self.iReserved - 1;
            self.$el.find('.manual-multiple-register .multiple-register-list').empty();
            self.contactInfoIdx = 1;

            for (let i = 0; i < iExtraRegistrations; i++) {
                let contact = typeof contacts !== 'undefined' && typeof contacts[i] !== 'undefined' ? contacts[i] : {};

                self.contactInfoViews[self.contactInfoIdx] = new App.Views.ContactInfo({
                    parentView: self,
                    contactInfoIdx: self.contactInfoIdx,
                    contactInfoData: {
                        Church: !_.isUndefined(contact['Church']) ? contact['Church'] : '',
                        ChurchOther: !_.isUndefined(contact['ChurchOther']) ? contact['ChurchOther'] : '',
                        MobilePhoneNumber: !_.isUndefined(contact['MobilePhoneNumber']) ? contact['MobilePhoneNumber'] : '',
                        FirstName: !_.isUndefined(contact['FirstName']) ? contact['FirstName'] : '',
                        LastName: !_.isUndefined(contact['LastName']) ? contact['LastName'] : '',
                        Email: !_.isUndefined(contact['Email']) ? contact['Email'] : ''
                    }
                });
                let $deleteBtn = $('<a href="#" class="manual-delete-registration-contact text-danger"><i class="fas fa-trash"></i> delete</a>');
                self.$el.find('.manual-multiple-register .multiple-register-list').append($('<li>').append($deleteBtn).append(self.contactInfoViews[self.contactInfoIdx].render().el));
                self.contactInfoIdx++;

            }

        },
        setUpRegisterOthers: function () {
            let self = this;

            if (self.contactInfoViews[0].getIsWoodlands()) {
                $('.woodlands-only').show()
            } else {
                $('.woodlands-only').hide();
                $('.manual-multiple-register').show();
                self.buildManualContactInfo();
            }

        },
        handleRegisterProcessType: function (e) {
            let self = this;
            if (e.currentTarget.id === 'auto-register-manual') {
                $('.grove-login').hide();
                $('.manual-multiple-register').show();
                self.buildManualContactInfo();

            } else {
                $('.manual-multiple-register').hide();
                $('.grove-login').show();
                App.Vars.registrationProcessType = e.currentTarget.id;
            }
        },
        setBottomNavBtnsState: function (panel, state) {
            let $buttons = $(panel).find('.bottom-nav-btns').find('button');
            if (state === 'disabled') {
                $buttons.attr('disabled', 'disabled');
            } else {
                $buttons.removeAttr('disabled');
            }
        },
        handleGroveLogin: function (e) {
            let self = this;
            e.preventDefault();
            let $submitBtn = $(e.currentTarget);
            $submitBtn.siblings('.spinner').remove();
            $submitBtn.siblings('.reservation-successful').remove();
            $submitBtn.after(App.Vars.spinnerHtml);
            $.ajax({
                type: "post",
                dataType: "json",
                url: 'project_registration/grove_login',
                data: {
                    _token: $('meta[name="csrf-token"]').attr('content'),
                    GroveEmail: $('[name="GroveEmail"]').val(),
                    GrovePassword: $('[name="GrovePassword"]').val(),
                    RegisterProcessType: $('[name="register-process-type"]:checked').val()
                },
                success: function (response) {
                    $submitBtn.siblings('.spinner').remove();
                    $submitBtn.after('<span class="reservation-successful text-success">Login Successful</span>');
                    self.bIsGroveImport = true;

                    self.groveContacts = response.contact_info;
                    self.showGroveContactList();
                },
                fail: function (response) {
                    console.error(response)
                }
            })
        },
        showGroveContactList: function () {
            let self = this;
            let data = {};
            let html = '';
            if (self.groveContacts.length) {
                for (let i = 0; i < self.groveContacts.length; i++) {
                    data = self.groveContacts[i];
                    let iCnt = i + 1;
                    html = '<tr><td><label>' + iCnt + '. <input type="checkbox" checked class="grove-contact" id="grove_contact_' + i + '" data-contact-idx="' + i + '" name="grove_contact[' + i + '][confirm]" value="1"/></label></td>';
                    _.each(_.values(data), function (val, key) {
                        if (val !== 'woodlands') {
                            html += '<td><label for="grove_contact_' + i + '">' + val + '</label></td>';
                        }
                    });
                    html += '</tr>';
                    $('.grove-register').find('.grove-contacts-confirm-list tbody').append(html);
                }
                $('.grove-register').show();
            }
        },
        toggleProjectDescriptionCollapseIcon: function (e) {
            let icon = $('.collapse-project-description').find('span');
            if (icon.hasClass('glyphicon-plus')) {
                icon.removeClass('glyphicon-plus').addClass('glyphicon-minus');
            } else if (icon.hasClass('glyphicon-minus')) {
                icon.removeClass('glyphicon-minus').addClass('glyphicon-plus');
            }
        },
        buildConfirmationList: function () {
            let self = this;
            let data = {};
            let html = '';

            _.each(self.contactInfoViews, function (val, key) {
                try {
                    data = val.getContactInfoData();

                    html = '<tr>';
                    _.each(_.values(data), function (val, key) {
                        html += '<td>' + val + '</td>';
                    });
                    html += '</tr>';
                    $('.project-registration-confirm-list tbody').append(html);
                } catch (e) {
                } finally {
                }
            });

        },
        getCheckedGroveContacts: function () {
            let self = this;
            let $notChecked = $('.grove-contact').not(':checked').toArray().reverse();

            $.each($notChecked, function (idx, el) {
                let contactIdx = $(el).data('contact-idx');
                self.groveContacts = _.reject(self.groveContacts, function (val, key) {
                    return key === contactIdx;
                });
            });

            return self.groveContacts;
        },
        deleteRegistrationContactListItem: function (e) {
            let self = this;
            e.preventDefault();
            $(e.currentTarget).parent('li').remove();
            if (App.Vars.bTooManyRegistrants) {
                let numberOfRegistrants = self.$el.find('.manual-multiple-register .multiple-register-list li').length;
                // remove error notice if it's fixed
                if (self.iReserved > numberOfRegistrants) {
                    $('#auto-register').find('.auto-register-too-many-registrants-error').remove();
                }
            }
        },
        registerAndConfirm: function (e) {
            let self = this;
            e.preventDefault();

            if (self.bIsGroveImport) {
                self.groveContacts = self.getCheckedGroveContacts();

                if (self.groveContacts.length) {
                    self.buildManualContactInfo(self.groveContacts);
                    $('.manual-multiple-register').show();
                }
            }
            // the personal contact info is already valid
            let valid = 1;

            for (let i = 1; i < self.iReserved; i++) {
                if (typeof self.contactInfoViews[i] !== 'undefined') {
                    valid += self.contactInfoViews[i].validateContactInfo() ? 1 : 0;
                }
            }
            App.Vars.bTooManyRegistrants = false;
            if (self.iReserved < self.contactInfoViews.length) {
                App.Vars.bTooManyRegistrants = true;
                valid = 0;
                let over = self.contactInfoViews.length - self.iReserved;

                let alertMessage = 'Sorry, there are only ' + self.iReserved + ' spots reserved.  Please remove ' + over + ' of your registrations ' +
                                   'or choose a different project.';
                let $alertHtml = $('<div class="alert alert-danger auto-register-too-many-registrants-error" role="alert">' + alertMessage + '</div>');
                $('#auto-register').find('.auto-register-too-many-registrants-error').remove();
                $('#auto-register').find('.bottom-nav-btns').before($alertHtml);
            }
            if (valid) {
                self.setStepAsValidated('.step-two.steps', $(e.currentTarget));
                self.buildConfirmationList();
                self.$el.find('[href="#confirm-submit"]').trigger('click');
                self.updateActiveStep('.step-three.steps')
            } else {
                if (self.bIsGroveImport) {
                    if (self.groveContacts.length && App.Vars.bTooManyRegistrants) {
                        self.$el.find('.manual-multiple-register .multiple-register-list').empty();
                        // keep the person registering
                        self.contactInfoViews = [self.contactInfoViews[0]];
                        $('.manual-multiple-register').hide();
                    }
                } else {

                }
                self.setStepAsInValid('.step-two.steps', $(e.currentTarget));
            }
        },
        updateActiveStep: function (stepClassSelector) {
            let self = this;
            // reset all
            self.$el.find('.steps-wrapper').find('.steps, h4').removeClass('active-step');
            self.$el.find('.steps-wrapper').find('h4').addClass('muted-text');
            // make new step active
            self.$el.find('.steps-wrapper').find(stepClassSelector).addClass('active-step');
            self.$el.find('.steps-wrapper').find(stepClassSelector).find('h4')
                .addClass('active-step').removeClass('muted-text');
        },
        setStepAsValidated: function (stepClassSelector, $btn) {
            let self = this;
            self.$el.find('.steps-wrapper').find(stepClassSelector).removeClass('text-danger').addClass('text-success');
            $btn.parents('.tab-pane').find('.contact-info-error').remove();
        },
        setStepAsInValid: function (stepClassSelector, $btn) {
            let self = this;
            self.$el.find('.steps-wrapper').find(stepClassSelector).removeClass('text-success').addClass('text-danger');

        },
        submitRegistration: function (e) {
            let self = this;
            e.preventDefault();
            let formData = new FormData($('form[name="newProjectRegistration"]')[0]);
            // for (var pair of formData.entries()) {
            //     console.log(pair[0] + ', ' + pair[1]);
            // }
            $.ajax({
                type: "post",
                dataType: "json",
                url: 'project_registration',
                data: formData,
                processData: false,
                contentType: false,
                success: function (response) {
                    if (response.success) {
                        App.Vars.reservedProjectID = null;
                        App.Vars.registrationProcessType = null;
                        clearTimeout(App.Vars.reservationTimeout);
                        clearInterval(App.Vars.reservationInterval);
                        let iCountDown = 5;
                        let $alertHtml = $('<div class="alert alert-success registration-success-alert" role="alert">Project Registration Succeeded</div><div class="registration-success-msg">' + response.msg + '</div>');

                        App.Vars.Modal.find('.modal-header').remove();
                        App.Vars.Modal.find('.modal-footer').find('button').remove();
                        App.Vars.Modal.find('.modal-body').html($alertHtml);
                        App.Vars.Modal.find('.modal-footer').append('<div class="reload-msg">This will automatically close in <span>' + iCountDown + '</span> seconds.</div>');
                        App.Vars.Modal.find('.modal-footer').append('<button class="text-center btn btn-success close-registration-modal">Close</button>');
                        let bSkipCloseAndReload = false;
                        App.Vars.Modal.find('.modal-footer').find('.close-registration-modal').on('click', function (e) {
                            e.preventDefault();
                            bSkipCloseAndReload = true;
                            App.Vars.Modal.modal('hide');
                            location.reload(true);
                        });

                        let reloadInterval = setInterval(function () {
                            App.Vars.Modal.find('.reload-msg > span').text(iCountDown--);
                            if (iCountDown <= 0) {
                                if (!bSkipCloseAndReload) {
                                    App.Vars.Modal.modal('hide');
                                    location.reload(true);
                                }
                                clearInterval(reloadInterval);
                            }
                        }, 1000);
                    }
                },
                fail: function (response) {
                    console.error(response)
                }
            });
        }

    });

    App.Views.Registration = Backbone.View.extend({
        template: template('registrationTemplate'),
        projectListViewClass: App.Views.ProjectList,
        projectFilterGroupViewClass: App.Views.ProjectFilterGroup,
        registrationFormViewClass: App.Views.RegistrationForm,
        initialize: function (options) {
            let self = this;
            this.options = options;
            _.bindAll(this, 'render', 'updateProjectsList', 'showRegistrationForm', 'removeReservations', 'checkProjectRegistrations');

            this.parentView = this.options.parentView;
            this.projectModelToRegister = null;
            clearTimeout(App.Vars.reservationTimeout);
            clearInterval(App.Vars.checkRegistrationsInterval);
            clearInterval(App.Vars.reservationInterval);
            App.Vars.checkRegistrationsInterval = setInterval(this.checkProjectRegistrations, App.Vars.checkRegistrationsIntervalSeconds);
            _log('App.Views.Registration.initialize', options);
        },
        events: {
            'change [name="sort_by"]': 'updateProjectsList',
            'click input[type="checkbox"][name^="filter"]': 'updateProjectsList',
        },
        render: function (e) {
            let self = this;
            // Add template to this views el now so child view el selectors exist when they are instantiated
            self.$el.html(this.template());

            App.Views.siteFilterGroup = this.siteFilterGroup = new this.projectFilterGroupViewClass({
                parentView: this,
                collection: App.Collections.siteFiltersCollection,
                filterGroupName: 'Site'
            });
            this.$('.project-list-filters-wrapper').append(this.siteFilterGroup.render().el);

            App.Views.skillFilterGroup = this.skillFilterGroup = new this.projectFilterGroupViewClass({
                parentView: this,
                collection: App.Collections.skillFiltersCollection,
                filterGroupName: 'Skills Needed'
            });
            this.$('.project-list-filters-wrapper').append(this.skillFilterGroup.render().el);

            App.Views.childFriendlyFilterGroup = this.childFriendlyFilterGroup = new this.projectFilterGroupViewClass({
                parentView: this,
                collection: App.Collections.childFriendlyFiltersCollection,
                filterGroupName: '<i class="fas fa-child"></i> Child Friendly'
            });
            this.$('.project-list-filters-wrapper').append(this.childFriendlyFilterGroup.render().el);

            App.Views.peopleNeededFilterGroup = this.peopleNeededFilterGroup = new this.projectFilterGroupViewClass({
                parentView: this,
                collection: App.Collections.peopleNeededFiltersCollection,
                filterGroupName: '<i class="fas fa-users"></i> People Needed'
            });
            this.$('.project-list-filters-wrapper').append(this.peopleNeededFilterGroup.render().el);

            App.Views.projectListView = this.projectListView = new this.projectListViewClass({
                el: this.$('.project-list'),
                parentView: this,
                collection: App.Collections.allProjectsCollection,
                model: App.Models.projectModel
            });

            this.projectListView.render();
            this.listenTo(App.Views.projectListView, 'register-for-project', this.showRegistrationForm);
            return this;
        },
        checkProjectRegistrations: function () {
            let formData = $('form[name="filter-project-list-form"]').serialize();

            $.ajax({
                type: "get",
                dataType: "json",
                url: 'project_registration/filter_project_list',
                data: formData,
                success: function (response) {
                    let bReset = false;
                    App.Collections.allProjectsCollection.each(function (model, key) {
                        let PeopleNeeded = model.get('PeopleNeeded');
                        let ProjectID = model.get('ProjectID');
                        let matchingModel = _.where(response, {ProjectID: ProjectID});
                        if (matchingModel.length) {
                            if (PeopleNeeded !== matchingModel[0].PeopleNeeded) {
                                bReset = true;
                            }
                        }
                    });
                    //App.Vars.reservedProjectID === null
                    if (bReset) {
                        App.Collections.allProjectsCollection.reset(response);
                    }
                },
                fail: function (response) {
                    //window.growl(response.msg, 'error');
                    //window.ajaxWaiting('remove', '.project-list-wrapper');
                }
            })
        },
        updateProjectsList: function () {
            window.ajaxWaiting('show', '.project-list-wrapper');
            let formData = $('form[name="filter-project-list-form"]').serialize();
            $.ajax({
                type: "get",
                dataType: "json",
                url: 'project_registration/filter_project_list',
                data: formData,
                processData: false,
                success: function (response) {
                    App.Collections.allProjectsCollection.reset(response);
                    //window.growl(response.msg, response.success ? 'success' : 'error');
                    window.ajaxWaiting('remove', '.project-list-wrapper');
                },
                fail: function (response) {

                    //window.growl(response.msg, 'error');
                    window.ajaxWaiting('remove', '.project-list-wrapper');
                }
            })
        },
        getRegistrationForm: function () {
            let self = this;

            App.Views.registrationFormViewClass = new self.registrationFormViewClass({
                parentView: this,
                model: self.projectModelToRegister
            });

            return App.Views.registrationFormViewClass.render().el;
        },
        showRegistrationForm: function (e) {
            let self = this;

            self.projectModelToRegister = e.model;
            App.Vars.SIAModalRegistrationForm = getSIAModal('RegistrationForm');

            App.Vars.SIAModalRegistrationForm.on('show.bs.modal', function (event) {
                let modal = $(this);
                modal.find('.modal-title').html('Project Registration');
                modal.find('.modal-body').html(self.getRegistrationForm());
                modal.find('.save.btn').off().on('click', function (e) {
                    e.preventDefault();
                    self.create($.unserialize(modal.find('form').serialize()));
                    App.Vars.SIAModalRegistrationForm.SIAModal('hide');
                });

            });
            App.Vars.SIAModalRegistrationForm.SIAModal('show');

            App.Vars.SIAModalRegistrationForm.find('button[data-dismiss="modal"]').off().on('click', function (e) {
                e.preventDefault();
                if (typeof App.Vars.reservedProjectID !== 'undefined' && App.Vars.reservedProjectID !== null) {
                    let $confirmCloseRegistrationFormModal = getSIAConfirmModal('confirmCloseRegistrationForm');

                    $confirmCloseRegistrationFormModal.on('show.bs.confirm', function (event) {
                        let $confirmModal = $(this);

                        _log('App.Vars.reservationTimeout', App.Vars.reservationTimeout, 'App.Vars.reservedProjectID', App.Vars.reservedProjectID);
                        $confirmModal.find('.confirm-body').find('.confirm-question').html("If you close the registration form now you will lose your reserved spots for this project.<br><br>Do you still wish to close?");
                        $confirmModal.find('.confirm-body').find('button').on('click', function (e) {
                            e.preventDefault();
                            if ($(this).hasClass('btn-yes')) {
                                $confirmModal.confirm('hide');
                                App.Vars.SIAModalRegistrationForm.SIAModal('hide');
                                $('.modal-backdrop').remove();
                                self.removeReservations();
                            } else {
                                $confirmModal.confirm('hide');
                            }
                        });
                    });
                    $confirmCloseRegistrationFormModal.confirm('show');
                } else {
                    App.Vars.SIAModalRegistrationForm.SIAModal('hide');
                }
            });

        },
        removeReservations: function () {
            let self = this;

            $.ajax({
                type: "get",
                url: 'project_registration/delete_reservation/' + App.Vars.reservedProjectID,
                success: function (response) {
                    App.Vars.reservedProjectID = null;
                    self.checkProjectRegistrations();
                },
                fail: function (response) {
                    if (App.Vars.devMode) {
                        console.error(response);
                        alert('removingReservations error' + response);
                    }
                }
            })
        }
    });
})(window.App);
