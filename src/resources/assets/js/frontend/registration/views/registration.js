(function (App, $) {
    App.Views.ContactInfo = Backbone.View.extend({
        tagName: 'div',
        className: 'contact-info-wrapper',
        template: template('newProjectRegistrationContactInfoTemplate'),
        initialize: function (options) {
            let self = this;
            self.options = options;
            _.bindAll(
                self,
                'render',
                'handleChurchSelection',
                'updateContactInfoData'
            );
            self.contactInfoIdx = self.options.contactInfoIdx;
            self.fieldValidationErrors = [];
            self.bIsWoodlands = false;
            self.parentView = self.options.parentView;
            self.contactInfoData = self.options.contactInfoData;
            self.groveId = !_.isUndefined(self.contactInfoData.groveId) ? self.contactInfoData.groveId : null;
            self.bIsWoodlands = self.contactInfoData.Church === 'woodlands';
            self.$el.data('contact-info-idx', self.contactInfoIdx);
            self.$el.addClass('contact-info-idx-' + self.contactInfoIdx);
            _log('App.Views.ContactInfo.initialize', options);
        },
        events: {
            'change select[id^="Church"]': 'handleChurchSelection',
            'blur input': 'updateContactInfoData'
        },
        render: function () {
            let self = this;
            let tplVars = {
                idx: self.contactInfoIdx,
                groveId: self.contactInfoData.groveId,
                Church: self.contactInfoData.Church,
                ChurchOther: self.contactInfoData.ChurchOther,
                MobilePhoneNumber: self.contactInfoData.MobilePhoneNumber,
                FirstName: self.contactInfoData.FirstName,
                LastName: self.contactInfoData.LastName,
                Email: self.contactInfoData.Email

            };

            let html = self.template(tplVars);
            $(self.el).html(html);

            return self;
        },
        formatPhoneNumber: function (el) {
            let phoneNumber = $(el).val().toString();
            phoneNumber = phoneNumber.replace(/[^\d]/g, '');
            if (phoneNumber.charAt(0) === '1' && phoneNumber.length === 11) {
                phoneNumber = phoneNumber.replace(/^./, '');
            }
            if (phoneNumber.length === 10) {
                $(el).val(phoneNumber.replace(/^(\d{3})(\d{3})(\d+)$/, "($1) $2-$3"));
            } else if (phoneNumber.length === 7) {
                $(el).val(phoneNumber.replace(/^(\d{3})(\d+)$/, "$1-$2"));
            }
        },
        updateContactInfoData: function (e) {
            let self = this;
            self.parentView.resetCheckIfSomeoneIsThereInterval();
            if ($(e.currentTarget).attr('type') === 'tel') {
                self.formatPhoneNumber(e.currentTarget);
            }
            let aMatches = $(e.currentTarget).attr('name').match(/contact_info\[(\d+)\]\[([^\]]*)\]/);
            let contactIdx = aMatches[1];
            let key = aMatches[2];
            self.contactInfoData[key] = $(e.currentTarget).val();

            App.Vars.validator.element('#' + e.currentTarget.id);

        },
        handleChurchSelection: function (e) {
            let self = this;
            self.parentView.resetCheckIfSomeoneIsThereInterval();
            self.bIsWoodlands = $(e.currentTarget).val() === 'woodlands';
            self.contactInfoData.Church = $(e.currentTarget).val();
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
            let self = this;
            return self.bIsWoodlands;
        },
        validateContactInfo: function (bSkipNotifications) {
            let self = this;
            let bShowNotifications = _.isUndefined(bSkipNotifications) ? true : !bSkipNotifications;
            let fields = self.$el.find('input[required]');
            let iInvalidFields = 0;
            let fieldValidationErrors = [];
            _.each(fields, function (val) {
                let $label = $(val).parent().find('label:first-child');
                if ($(val).val() === '') {
                    if (bShowNotifications) {
                        $label.addClass('text-danger');
                        fieldValidationErrors.push($label.text());
                    }
                    iInvalidFields++;
                } else {
                    if (bShowNotifications) {
                        $label.removeClass('text-danger');
                    }
                }
            });
            let $churchSelect = self.$el.find('select[id^="Church"]');
            let $churchSelectLabel = $churchSelect.parent().find('label:first-child');
            if ($churchSelect.val().length === 0 || $churchSelect.val() === 'Choose Church') {
                if (bShowNotifications) {
                    $churchSelectLabel.addClass('text-danger');
                    fieldValidationErrors.push($churchSelectLabel.text());
                }
                iInvalidFields++;
            } else {
                if (bShowNotifications) {
                    $churchSelectLabel.removeClass('text-danger');
                }
            }

            if (bShowNotifications) {
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
            }

            return iInvalidFields === 0;
        },
        getContactInfoData: function () {
            let self = this;
            let fields = self.$el.find('input');
            let data = {};

            let orderedFields = [];
            orderedFields.push(_.find(fields, function (field) {
                return $(field).attr('name').match(/groveId/);
            }));
            orderedFields.push(_.find(fields, function (field) {
                return $(field).attr('name').match(/FirstName/);
            }));
            orderedFields.push(_.find(fields, function (field) {
                return $(field).attr('name').match(/LastName/);
            }));
            orderedFields.push(_.find(fields, function (field) {
                return $(field).attr('name').match(/Email/);
            }));
            orderedFields.push(_.find(fields, function (field) {
                return $(field).attr('name').match(/MobilePhoneNumber/);
            }));
            orderedFields.push(_.find(fields, function (field) {
                return $(field).attr('name').match(/ChurchOther/);
            }));

            _.each(orderedFields, function (val) {
                data[$(val).attr('name')] = $(val).val();
            });
            let $churchSelect = self.$el.find('select[id^="Church"]');
            data[$churchSelect.attr('name')] = $churchSelect.val();

            return data;
        }
    });

    App.Views.RegistrationForm = Backbone.View.extend({
        template: template('newProjectRegistrationTemplate'),
        initialize: function (options) {
            let self = this;
            self.options = options;
            _.bindAll(
                self,
                'render',
                'registerOthers',
                'registerAndConfirm',
                'toggleProjectDescriptionCollapseIcon',
                'confirmReservationTimeout',
                'handleRegisterProcessType',
                'handleGroveLogin',
                'submitRegistration',
                'makeReservations',
                'deleteRegistrationContactListItem',
                'checkForReturnKey',
                'handleOverageQuestion'
            );
            self.bGroveIsLoggedIn = false;
            self.groveId = null;
            self.fieldValidationErrors = [];
            self.bIsWoodlands = false;
            self.contactInfoIdx = 1;
            self.contactInfoViews = [];
            self.parentView = self.options.parentView;
            self.iReserved = 0;
            self.bIsGroveImport = false;
            self.groveContacts = [];
            self.groveContactsFinal = [];
            //App.Vars.reservationTimeoutExpire = 1000 * 60;
            App.Vars.reservedProjectID = null;
            clearTimeout(App.Vars.reservationTimeout);
            clearInterval(App.Vars.reservationInterval);
            //$('body').addClass('project-registration-page');

            _log('App.Views.Registration.initialize', options);
        },
        events: {
            'click form[name="newProjectReservation"] button': 'makeReservations',
            'click .register-others': 'registerOthers',
            'click .confirm-and-register': 'registerAndConfirm',
            'click .submit-registration-btn': 'submitRegistration',
            'click .back-to-contact-info-btn': function (e) {
                this.resetCheckIfSomeoneIsThereInterval();
                e.preventDefault();
                this.$el.find('[href="#contact-info"]').trigger('click');
                this.updateActiveStep('.step-one.steps')
            },
            'click .back-to-register-others-btn': 'backToRegisterOthers',
            'click .collapse-project-description': function (e) {
                e.preventDefault();
            },
            'hidden.bs.collapse #collapseProjectDescription': 'toggleProjectDescriptionCollapseIcon',
            'shown.bs.collapse #collapseProjectDescription': 'toggleProjectDescriptionCollapseIcon',
            'click [name="register-process-type"]': 'handleRegisterProcessType',
            'click .submit-grove-login-btn': 'handleGroveLogin',
            'click .manual-delete-registration-contact': 'deleteRegistrationContactListItem',
            'keypress [name="GrovePassword"]': 'checkForReturnKey',
            'click .overage-question-yes': 'handleOverageQuestion',
            'click .overage-question-no': 'handleOverageQuestion',
            'click .grove-contacts-confirm-list [type="checkbox"].grove-contact': 'handleGroveContactCheckbox',
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
                testGrovePassword: ''
            };
            if (App.Vars.devMode) {
                tplVars.testGrovePassword = 'jack1455';
            }
            $(self.el).html(self.template(tplVars));
            let contactInfoDataValues = {
                groveId: null,
                Church: '',
                ChurchOther: '',
                MobilePhoneNumber: '',
                FirstName: '',
                LastName: '',
                Email: ''
            };

            // if (App.Vars.devMode) {
            //     contactInfoDataValues = {
            //         groveId: null,
            //         Church: 'woodlands',
            //         ChurchOther: '',
            //         MobilePhoneNumber: '7153054840',
            //         FirstName: 'David',
            //         LastName: 'Hayakawa',
            //         Email: 'david.hayakawa@gmail.com'
            //     };
            // }
            self.contactInfoViews[0] = new App.Views.ContactInfo({
                el: self.$el.find('.personal-contact-info-wrapper'),
                parentView: self,
                contactInfoIdx: 0,
                contactInfoData: contactInfoDataValues
            });

            self.$el.find('.personal-contact-info-wrapper').replaceWith(self.contactInfoViews[0].render().el);
            App.Vars.validator = self.$el.find('[name="newProjectRegistration"]').validate({
                debug: false,
                onkeyup: false,
                onclick: false,
                onsubmit: false,
                focusInvalid: false,
                errorClass: 'error',
                rules: {
                    // simple rule, converted to {required:true}
                    name: "required",
                    // compound rule
                    email: {
                        required: true,
                        email: true
                    }
                }
            });

            return self;
        },
        resetCheckIfSomeoneIsThereInterval: function () {
            let self = this;
            self.parentView.resetCheckIfSomeoneIsThereInterval();
        },
        checkForReturnKey: function (e) {
            if (e.which == 13 || e.keyCode == 13) {
                //code to execute here
                $('#submit-grove-login-btn').trigger('click');
            }
        },
        makeReservations: function (e) {
            let self = this;
            e.preventDefault();
            self.resetCheckIfSomeoneIsThereInterval();

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
                    self.updateReservedAmtMsg();
                    setTimeout(function () {
                        $('.reservation-successful').remove();
                        $('.reservation-wrapper').hide();
                        self.updateStepsViewAndNavBtns();
                        $('.registration-form-body-wrapper').show();
                        $('#collapseProjectDescription').collapse('show');
                        $('[name="contact_info[0][Church]"]')[0].focus({preventScroll: false});
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
                        let expirationMsg = 'Your reservation has expired.';
                        $confirm.find('.confirm-body').find('.confirm-question').html('<div>' + expirationMsg + '</div>');
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
        updateStepsViewAndNavBtns: function () {
            let self = this;
            if (self.iReserved < 2) {
                $('.register-others.btn').hide();
                $('#contact-info .confirm-and-register').show();
                $('.back-to-register-others-btn').hide();
                $('.go-to-step-two-btn').hide();
                $('.back-to-step-two-btn').hide();
                $('.step-two').hide();
            } else {
                $('#contact-info .confirm-and-register').hide();
                $('.go-to-step-two-btn').show();
                $('.back-to-step-two-btn').show();
                $('.step-two').show();
            }
        },
        backToRegisterOthers: function (e) {
            let self = this;
            self.resetCheckIfSomeoneIsThereInterval();
            e.preventDefault();
            self.setUpRegisterOthers();
            self.$el.find('[href="#auto-register"]').trigger('click');
            self.updateActiveStep('.step-two.steps');
            if (self.bIsGroveImport) {
                $('[name="register-process-type"]').prop('checked', false);
                self.showGroveContactList();
            } else {
                self.buildManualContactInfo();
            }
        },
        setPersonRegistering: function () {
            let self = this;
            self.contactInfoViews[0].contactInfoData = {
                groveId: $('[name="contact_info[0][groveId]"]').val(),
                Church: $('[name="contact_info[0][Church]"]').val(),
                ChurchOther: $('[name="contact_info[0][ChurchOther]"]').val(),
                MobilePhoneNumber: $('[name="contact_info[0][MobilePhoneNumber]"]').val(),
                FirstName: $('[name="contact_info[0][FirstName]"]').val(),
                LastName: $('[name="contact_info[0][LastName]"]').val(),
                Email: $('[name="contact_info[0][Email]"]').val()
            }
        },
        registerOthers: function (e) {
            let self = this;
            self.resetCheckIfSomeoneIsThereInterval();
            e.preventDefault();
            self.setPersonRegistering();

            let valid = self.contactInfoViews[0].validateContactInfo();
            //console.log('valid',valid)
            if (valid) {
                self.setStepAsValidated('.step-one.steps', $(e.currentTarget));
                if (self.getContactInfoViewsLength() === 1) {
                    self.setUpRegisterOthers();
                    self.$el.find('[href="#auto-register"]').trigger('click');
                    self.updateActiveStep('.step-two.steps');
                    if ($('#collapseProjectDescription').is(':visible')) {
                        $('#collapseProjectDescription').collapse('toggle');
                    }
                } else {
                    self.backToRegisterOthers(e);
                }
            } else {
                self.setStepAsInValid('.step-one.steps', $(e.currentTarget));
                self.$el.find('[href="#contact-info"]').trigger('click');
            }
        },
        buildManualContactInfo: function (contacts, bOnlyCreateForGroveOverage, bAllowEmptyContact) {
            let self = this;

            let iStartIdx = 0;
            bOnlyCreateForGroveOverage = _.isUndefined(bOnlyCreateForGroveOverage) ? false : bOnlyCreateForGroveOverage;
            bAllowEmptyContact = _.isUndefined(bAllowEmptyContact) ? true : bAllowEmptyContact;
            // reserved minus person registering
            let iLimit = self.iReserved - 1;
            //console.log('buildManualContactInfo before empty', bOnlyCreateForGroveOverage, self.$el.find('.manual-multiple-register .multiple-register-list').html())
            self.$el.find('.manual-multiple-register .multiple-register-list').empty();
            self.contactInfoIdx = 1;

            if (bOnlyCreateForGroveOverage) {
                bAllowEmptyContact = true;
                contacts = null;
                iStartIdx = self.iReserved - self.groveContacts.length - 1;
                iLimit = iStartIdx + self.iReserved - self.groveContacts.length - 1;
                let iListStartIdx = self.iReserved - iStartIdx;
                // Needs to be the next idx of the entire list including the person registering
                self.contactInfoIdx = iListStartIdx;
                $('.multiple-register-list').attr('start', iListStartIdx);
            } else {
                $('.multiple-register-list').attr('start', 1);
            }

            for (let i = iStartIdx; i < iLimit; i++) {
                let contact = !_.isNull(contacts) && !_.isUndefined(contacts) && !_.isUndefined(contacts[i]) ? contacts[i] : {};
                let bSkip = false;
                if (self.bIsGroveImport) {
                    //console.log({bAllowEmptyContact: bAllowEmptyContact,contact:contact})
                    if (!bAllowEmptyContact && _.isEmpty(contact)) {
                        bSkip = true;
                    }
                }
                if (!bSkip) {
                    //console.log('buildManualContactInfo add to self.contactInfoViews',{contactInfoIdx: self.contactInfoIdx,bOnlyCreateForGroveOverage: bOnlyCreateForGroveOverage, contact: contact});
                    self.contactInfoViews[self.contactInfoIdx] = new App.Views.ContactInfo({
                        parentView: self,
                        contactInfoIdx: self.contactInfoIdx,
                        contactInfoData: {
                            groveId: !_.isUndefined(contact['groveId']) ? contact['groveId'] : null,
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
            self.resetCheckIfSomeoneIsThereInterval();
            if (e.currentTarget.id === 'auto-register-manual') {
                self.hideGroveLogin();
                $('.auto-register-question').addClass('hidden');
                $('.register-list-msgs').removeClass('hidden');
                $('.register-list-msgs .grove-contacts-confirm-list-msg ').addClass('hidden');
                $('.register-list-msgs .multiple-register-list-msg').removeClass('hidden');
                $('.manual-multiple-register').show();
                self.buildManualContactInfo();
            } else {
                $('.manual-multiple-register').hide();
                App.Vars.registrationProcessType = e.currentTarget.id;
                let $groveEmail = $('[name="GroveEmail"]');
                if (_.isEmpty($groveEmail.val())) {
                    $groveEmail.val(self.contactInfoViews[0].contactInfoData.Email);
                }
                $('.grove-login').show();
                $('[name="GrovePassword"]')[0].focus({preventScroll: false});
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
        getUniqueGroveContacts: function (groveContacts) {
            let uniqGroveContacts = [];

            _.each(groveContacts, function (groveContact) {
                if (uniqGroveContacts.length) {
                    if (!_.find(uniqGroveContacts, function (uniqGroveContact) {
                        return _.isEqual([uniqGroveContact.FirstName.toLowerCase().trim(), uniqGroveContact.LastName.toLowerCase().trim(), uniqGroveContact.Email.toLowerCase().trim()], [groveContact.FirstName.toLowerCase().trim(), groveContact.LastName.toLowerCase().trim(), groveContact.Email.toLowerCase().trim()]);
                    })) {
                        uniqGroveContacts.push(groveContact);
                    }
                } else {
                    // automatically add the first item
                    uniqGroveContacts.push(groveContact);
                }
            });
            return uniqGroveContacts;
        },
        handleGroveLogin: function (e) {
            let self = this;
            self.resetCheckIfSomeoneIsThereInterval();
            e.preventDefault();
            let $submitBtn = $(e.currentTarget);
            $submitBtn.siblings('.spinner').remove();
            $submitBtn.siblings('.grove-login-result-msg').remove();
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

                    self.bIsGroveImport = true;
                    if (response.success) {
                        self.bGroveIsLoggedIn = true;
                        self.groveId = response.groveLoggedInId;
                        // set the groveId of the person registering if applicable
                        if (_.isEmpty(self.contactInfoViews[0].contactInfoData.groveId) && !_.isEmpty($('[name="GroveEmail"]').val()) && self.contactInfoViews[0].contactInfoData.Email === $('[name="GroveEmail"]').val()) {
                            self.contactInfoViews[0].contactInfoData.groveId = self.groveId;
                            // set the input too in case it's checked
                            $('[name="contact_info[0][groveId]"]').val(self.groveId);
                        }
                        $submitBtn.after('<span class="grove-login-result-msg text-success">Login Successful</span>');
                        self.hideGroveLogin(false);

                        $('.auto-register-question').addClass('hidden');
                        $('.register-list-msgs').removeClass('hidden');
                        $('.register-list-msgs .grove-contacts-confirm-list-msg ').removeClass('hidden');
                        $('.register-list-msgs .multiple-register-list-msg').addClass('hidden');
                        let personRegistering = self.contactInfoViews[0].contactInfoData;

                        let contactInfo = _.reject(response.contact_info, function (val) {
                            return _.isEqual([personRegistering.FirstName.toLowerCase().trim(), personRegistering.LastName.toLowerCase().trim(), personRegistering.Email.toLowerCase().trim()], [val.FirstName.toLowerCase().trim(), val.LastName.toLowerCase().trim(), val.Email.toLowerCase().trim()]);
                        });
                        self.groveContacts = self.getUniqueGroveContacts(self.groveContacts.concat(contactInfo));
                        self.showGroveContactList();
                    } else {
                        $submitBtn.after('<span class="grove-login-result-msg text-danger">Login Failed</span>');
                    }
                },
                fail: function (response) {
                    console.error(response)
                    $submitBtn.after('<span class="grove-login-result-msg text-danger">Login Error</span>');
                }
            })
        },
        hideGroveLogin: function (bDelayAndFade) {
            if (_.isUndefined(bDelayAndFade) || (!_.isUndefined(bDelayAndFade) && !bDelayAndFade)) {
                $('.grove-login').hide();
            } else if (!_.isUndefined(bDelayAndFade) && bDelayAndFade) {
                // wait a couple seconds and then hide the grove login form
                setTimeout(function () {
                    $('.grove-login').fadeOut("slow", function () {
                        $('[name="GroveEmail"]').val();
                        $('[name="GrovePassword"]').val();
                    });
                }, 2000);
            }
            $('.grove-login-result-msg').remove()
        },
        getGroveOverageAmt: function () {
            let self = this;
            let overageAmt = self.iReserved - ($('.grove-register').find('.grove-contacts-confirm-list tbody tr').length + 1);
            return overageAmt > 0 ? overageAmt : 0;
        },
        getIsGroveOverage: function () {
            let self = this;
            return self.getGroveOverageAmt() > 0;
        },
        handleGroveContactCheckbox: function (e) {
            let self = this;
            self.resetCheckIfSomeoneIsThereInterval();
            let bChecked = e.currentTarget.checked;
            let contactIdx = $(e.currentTarget).data('contact-idx');
            let contactViewIdx = contactIdx + 1;

            if (!bChecked) {
                $('.contact-info-idx-' + contactViewIdx).siblings('.manual-delete-registration-contact').trigger('click');
            }
        },
        showGroveContactList: function () {
            let self = this;
            let data = {};
            let html = '';

            $('.overage-question').addClass('hidden');
            $('.manual-multiple-register').hide();
            if (_.isArray(self.groveContacts) && self.groveContacts.length) {
                let startIdx = 0;
                let limit = self.groveContacts.length;
                let iCnt = 1;
                for (let i = startIdx; i < limit; i++) {
                    data = self.groveContacts[i];

                    let bAddGroveContact = $('.grove-register').find('.grove-contacts-confirm-list tbody').find('[data-grove-id="' + data.groveId + '"]').length === 0;
                    if (bAddGroveContact) {
                        html = '<tr data-grove-id="' + data.groveId + '"><td><label>' + iCnt + '. <input type="checkbox" checked class="grove-contact" id="grove_contact_' + i + '" data-grove-id="' + data.groveId + '"  data-contact-idx="' + i + '" name="grove_contact[' + i + '][confirm]" value="1"/></label></td>';
                        _.each(data, function (val, key) {
                            if (val !== 'woodlands' && key !== 'groveId') {
                                html += '<td><label data-key="' + key + '" for="grove_contact_' + i + '">' + val + '</label></td>';
                            }
                        });
                        html += '</tr>';
                        $('.grove-register').find('.grove-contacts-confirm-list tbody').append(html);
                    }
                    iCnt++;
                }
                $('.grove-register').show();
            }
            // Show the manual registrant forms if there are more reservations available
            if (self.getIsGroveOverage()) {
                self.showOverageQuestion();
            }
        },
        handleOverageQuestion: function (e) {
            let self = this;
            self.resetCheckIfSomeoneIsThereInterval();
            e.preventDefault();
            $('.overage-question').addClass('hidden');
            if ($(e.currentTarget).hasClass('overage-question-yes')) {
                self.buildOverageList();
            } else {
                // reduce reservations
                self.iReserved = self.iReserved - self.getGroveOverageAmt();
            }
            self.updateReservedAmtMsg();
        },
        showOverageQuestion: function () {
            let self = this;
            let $overageQuestion = $('.overage-question');
            $overageQuestion.removeClass('hidden');
            $overageQuestion.find('.overage-amt').text(self.getGroveOverageAmt());
        },
        buildOverageList: function () {
            let self = this;

            $('.register-list-msgs').removeClass('hidden');
            $('.register-list-msgs .grove-contacts-confirm-list-msg ').removeClass('hidden');
            $('.register-list-msgs .multiple-register-list-msg').removeClass('hidden');
            self.buildManualContactInfo(self.groveContacts, true);
            $('.manual-multiple-register').show();
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
            $('.project-registration-confirm-list tbody').empty();
            _.each(self.contactInfoViews, function (val, key) {
                if (!_.isUndefined(val)) {
                    try {
                        data = val.getContactInfoData();
                        //console.log('buildConfirmationList loops through contactInfoViews', data)
                        let bSkip = false;
                        if (self.bIsGroveImport) {
                            //console.log(data)
                            if (data['FirstName'] === '') {
                                //bSkip = true;
                            }
                        }
                        if (!bSkip) {
                            html = '<tr data-key-grove-id="' + data['contact_info[' + key + '][groveId]'] + '">';
                            _.each(data, function (val, key) {
                                let bIsGroveIdKey = key.match(/groveId/);
                                if (!bIsGroveIdKey) {
                                    html += '<td data-key="' + key + '">' + val + '</td>';
                                }
                            });
                            html += '</tr>';
                            $('.project-registration-confirm-list tbody').append(html);
                        }
                    } catch (e) {
                    }
                }
            });

        },
        getCheckedGroveContacts: function () {
            let self = this;
            let aNotChecked = $('.grove-contact').not(':checked').toArray().reverse();

            $.each(aNotChecked, function (idx, el) {
                let contactIdx = $(el).data('contact-idx');
                self.groveContacts = _.reject(self.groveContacts, function (val, key) {
                    return key === contactIdx;
                });
            });

            return self.groveContacts;
        },
        deleteRegistrationContactListItem: function (e) {
            let self = this;
            self.resetCheckIfSomeoneIsThereInterval();
            e.preventDefault();
            let iDeletedContactInfoIdx = $(e.currentTarget).parent('li').find('.contact-info-wrapper').data('contact-info-idx');
            self.contactInfoViews = _.reject(self.contactInfoViews, function (val) {
                return !_.isUndefined(val) && $(val.el).hasClass('contact-info-idx-' + iDeletedContactInfoIdx);
            });
            $(e.currentTarget).parent('li').remove();
            self.iReserved--;
            if (App.Vars.bTooManyRegistrants) {
                let numberOfRegistrants = self.$el.find('.manual-multiple-register .multiple-register-list li').length;
                // remove error notice if it's fixed
                if (self.iReserved > numberOfRegistrants) {
                    $('#auto-register').find('.auto-register-too-many-registrants-error').remove();
                    App.Vars.bTooManyRegistrants = false;
                }
            }
            self.updateReservedAmtMsg();
        },
        updateReservedAmtMsg: function () {
            let self = this;
            $('.reserved-amt-msg').text(self.iReserved);
            if (self.iReserved === 0) {
                $('.reserved-amt-msg').parent().addClass('text-danger')
            }
            self.updateStepsViewAndNavBtns();
        },
        getManualContactsTotal: function (bIncludeEmptyManualSpots) {
            let self = this;
            let iNumberOfManualContactRegistrants = 0;
            let $listItems = self.$el.find('.manual-multiple-register .multiple-register-list li');
            if ($listItems.length && self.getContactInfoViewsLength()) {
                bIncludeEmptyManualSpots = !_.isUndefined(bIncludeEmptyManualSpots) ? bIncludeEmptyManualSpots : true;

                if (bIncludeEmptyManualSpots) {
                    iNumberOfManualContactRegistrants = $listItems.length;
                } else {
                    _.each($listItems, function (liItem) {
                        let iContactInfoIdx = $(liItem).find('.contact-info-wrapper').data('contact-info-idx');
                        let contactInfoView = _.find(self.contactInfoViews, function (val) {
                            return !_.isUndefined(val) ? $(val.el).hasClass('contact-info-idx-' + iContactInfoIdx) : false;
                        });
                        if (contactInfoView) {
                            iNumberOfManualContactRegistrants += contactInfoView.validateContactInfo(false) ? 1 : 0;
                        }
                    });
                }
            }

            return iNumberOfManualContactRegistrants;
        },
        getRegistrantsTotal: function (bIncludeEmptyManualSpots) {
            let self = this;
            bIncludeEmptyManualSpots = !_.isUndefined(bIncludeEmptyManualSpots) ? bIncludeEmptyManualSpots : false;
            let iPersonRegistering = 1;
            let iNumberOfManualContactRegistrants = self.getManualContactsTotal(bIncludeEmptyManualSpots);
            let iNumberOfCheckedGroveRegistrants = self.getCheckedGroveContacts().length;
            return iPersonRegistering + iNumberOfManualContactRegistrants + iNumberOfCheckedGroveRegistrants;
        },
        /**
         * We can't use self.getContactInfoViewsLength() b/c of
         * skipped index numbers
         * @returns {number}
         */
        getContactInfoViewsLength: function (bIncludeGroveContacts) {
            let self = this;
            let cnt = 0;
            bIncludeGroveContacts = !_.isUndefined(bIncludeGroveContacts) ? bIncludeGroveContacts : true;
            _.each(self.contactInfoViews, function (contactView, key) {
                if (!_.isUndefined(contactView)) {
                    if (!bIncludeGroveContacts) {
                        let bIsInGroveContactList = _.find(self.groveContacts, function (groveContact) {
                            return _.isEqual([contactView.contactInfoData.FirstName.toLowerCase().trim(), contactView.contactInfoData.LastName.toLowerCase().trim(), contactView.contactInfoData.Email.toLowerCase().trim()], [groveContact.FirstName.toLowerCase().trim(), groveContact.LastName.toLowerCase().trim(), groveContact.Email.toLowerCase().trim()]);
                        });
                        if (!bIsInGroveContactList) {
                            cnt++;
                        }
                    } else {
                        cnt++;
                    }
                }
            });
            return cnt;
        },
        registerAndConfirm: function (e) {
            let self = this;
            self.resetCheckIfSomeoneIsThereInterval();
            e.preventDefault();
            self.setPersonRegistering();
            let bPersonRegisteringValid = self.contactInfoViews[0].validateContactInfo();
            //console.log({bPersonRegisteringValid: bPersonRegisteringValid})
            if (bPersonRegisteringValid) {
                self.setStepAsValidated('.step-one.steps', $(e.currentTarget));
                if (self.getContactInfoViewsLength() === 1) {
                    if ($('#collapseProjectDescription').is(':visible')) {
                        $('#collapseProjectDescription').collapse('toggle');
                    }
                }
            } else {
                self.setStepAsInValid('.step-one.steps', $(e.currentTarget));
                self.$el.find('[href="#contact-info"]').trigger('click');
                return;
            }

            // the personal contact info is already valid
            let valid = 1;

            /**
             * Need to validate any manually entered registrants now
             */
            for (let i = 1; i < self.iReserved; i++) {
                if (!_.isUndefined(self.contactInfoViews[i])) {
                    valid += self.contactInfoViews[i].validateContactInfo() ? 1 : 0;
                }
            }
            App.Vars.bTooManyRegistrants = false;
            let possibleCnt = self.getCheckedGroveContacts().length + self.getContactInfoViewsLength(false);
            /*console.log({
             checkGroveContacts: self.getCheckedGroveContacts().length,
             ContactInfoViewsLength: self.getContactInfoViewsLength(false),
             possibleCnt: possibleCnt,
             iReserved: self.iReserved
             })*/
            if (self.iReserved < possibleCnt) {
                App.Vars.bTooManyRegistrants = true;
                valid = 0;
                let overAmt = self.getContactInfoViewsLength(false) - self.iReserved;

                let alertMessage = 'Sorry, there are only ' + self.iReserved + ' spots reserved.  Please remove ' + overAmt + ' of your registrations or choose a different project.';
                let $alertHtml = $('<div class="alert alert-danger auto-register-too-many-registrants-error" role="alert">' + alertMessage + '</div>');
                $('#auto-register').find('.auto-register-too-many-registrants-error').remove();
                $('#auto-register').find('.bottom-nav-btns').before($alertHtml);
            }
            //console.log('valid', valid === self.getContactInfoViewsLength(),{valid:valid, getContactInfoViewsLength: self.getContactInfoViewsLength(), getContactInfoViewsLengthFalse: self.getContactInfoViewsLength(false), contactInfoViews: self.contactInfoViews})
            if (valid === self.getContactInfoViewsLength()) {
                self.setStepAsValidated('.step-two.steps', $(e.currentTarget));
                if (self.bIsGroveImport) {
                    self.groveContacts = self.getCheckedGroveContacts();
                    if (self.groveContacts.length) {
                        if (self.getManualContactsTotal(true)) {
                            //console.log('registerAndConfirm for bIsGroveImport',{contactInfoViews: self.contactInfoViews, groveContacts: self.groveContacts})
                            _.each(self.contactInfoViews, function (contactView, idx) {
                                if (idx > 0 && !_.isUndefined(contactView)) {
                                    let bIsInGroveContactList = _.find(self.groveContacts, function (groveContact) {
                                        return _.isEqual([contactView.contactInfoData.FirstName.toLowerCase().trim(), contactView.contactInfoData.LastName.toLowerCase().trim(), contactView.contactInfoData.Email.toLowerCase().trim()], [groveContact.FirstName.toLowerCase().trim(), groveContact.LastName.toLowerCase().trim(), groveContact.Email.toLowerCase().trim()]);
                                    });
                                    // add any contactViews to the groveContact List that aren't there.
                                    if (!bIsInGroveContactList && !_.isEmpty(contactView.contactInfoData.FirstName)) {
                                        //console.log('registerAndConfirm for bIsGroveImport. adding contactView to self.groveContacts', contactView.contactInfoData)
                                        //console.log('contactView data to push into grove contacts',self.convertContactViewDataToGroveContact(contactView.getContactInfoData(), idx));
                                        self.groveContacts.push(self.convertContactViewDataToGroveContact(contactView.getContactInfoData(), idx));
                                    }
                                }
                            });
                        }
                        //console.log('building ManualContactInfo with self.groveContacts for submission should have d@d.com',{groveContacts: self.groveContacts});
                        self.buildManualContactInfo(self.groveContacts, false, false);
                        // needs to show so the post uses the form data but it won't be visible to user?
                        $('.manual-multiple-register').show();
                    }
                }
                self.buildConfirmationList();
                /**
                 * Move on to next tab
                 */
                self.$el.find('[href="#confirm-submit"]').trigger('click');
                self.updateActiveStep('.step-three.steps')
            } else {
                if (self.bIsGroveImport) {
                    if (self.groveContacts.length && App.Vars.bTooManyRegistrants) {
                        // TODO: make sure this is correct
                        self.$el.find('.manual-multiple-register .multiple-register-list').empty();
                        // keep the person registering
                        self.contactInfoViews = [self.contactInfoViews[0]];
                        $('.manual-multiple-register').hide();
                    } else {
                        // remove valid contacts
                        _.each(self.contactInfoViews, function (contactView, key) {
                            if (!_.isUndefined(contactView)) {
                                //self.groveContacts.concat();

                                let bIsInGroveContactList = _.find(self.groveContacts, function (groveContact) {
                                    return _.isEqual([contactView.contactInfoData.FirstName.toLowerCase().trim(), contactView.contactInfoData.LastName.toLowerCase().trim(), contactView.contactInfoData.Email.toLowerCase().trim()], [groveContact.FirstName.toLowerCase().trim(), groveContact.LastName.toLowerCase().trim(), groveContact.Email.toLowerCase().trim()]);
                                });

                                // add any contactViews to the groveContact List that aren't there.
                                if (bIsInGroveContactList && contactView.validateContactInfo(false) === 1) {
                                    self.contactInfoViews = _.reject(self.contactInfoViews, function (val) {
                                        return !_.isUndefined(val) && val.cid === contactView.cid;
                                    });
                                }
                            }
                        });
                    }
                } else {
                    $('.manual-multiple-register').show();
                }
                self.setStepAsInValid('.step-two.steps', $(e.currentTarget));
            }
        },
        convertContactViewDataToGroveContact: function (contactViewData, idx) {
            let groveData = {
                groveId: 0,
                Email: "",
                MobilePhoneNumber: "",
                FirstName: "",
                LastName: "",
                Church: "",
                ChurchOther: ""
            };
            _.each(groveData, function (val, key) {
                //console.log(val, key)
                groveData[key] = contactViewData['contact_info[' + idx + '][' + key + ']'];
            });
            return groveData;
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
            self.resetCheckIfSomeoneIsThereInterval();
            e.preventDefault();
            let $submitBtn = $('.submit-registration-btn');
            if ($submitBtn.hasClass('disabled')) {
                return;
            }
            $submitBtn.addClass('disabled');
            $submitBtn.siblings('.spinner').remove();
            let $spinnerWrapper = $('<div style="position:relative;display:inline-block;margin-right:5px;top:3px;"></div>');
            $spinnerWrapper.append(App.Vars.spinnerHtml);
            $submitBtn.before($spinnerWrapper);
            let formData = new FormData($('form[name="newProjectRegistration"]')[0]);
            // for (var pair of formData.entries()) {
            //     //console.log(pair[0] + ', ' + pair[1]);
            // }

            $.ajax({
                type: "post",
                dataType: "json",
                url: 'project_registration',
                data: formData,
                processData: false,
                contentType: false,
                success: function (response) {
                    $spinnerWrapper.remove();
                    if (response.success) {
                        $submitBtn.removeClass('disabled');
                        $submitBtn.siblings('.spinner').remove();
                        App.Vars.reservedProjectID = null;
                        App.Vars.registrationProcessType = null;
                        clearTimeout(App.Vars.reservationTimeout);
                        clearInterval(App.Vars.reservationInterval);
                        let iCountDown = 5;
                        let $alertHtml = $('<div class="alert alert-success registration-success-alert" role="alert">Project Registration Succeeded</div><div class="registration-success-msg">' + response.msg + '</div>');

                        App.Vars.SIAModalRegistrationForm.find('.modal-header').remove();
                        App.Vars.SIAModalRegistrationForm.find('.modal-footer').find('button').remove();
                        App.Vars.SIAModalRegistrationForm.find('.modal-body').html($alertHtml);
                        App.Vars.SIAModalRegistrationForm.find('.modal-footer').append('<div class="reload-msg">This will automatically close in <span>' + iCountDown + '</span> seconds.</div>');
                        App.Vars.SIAModalRegistrationForm.find('.modal-footer').append('<button class="text-center btn btn-success close-registration-modal">Close</button>');
                        let bSkipCloseAndReload = false;
                        App.Vars.SIAModalRegistrationForm.find('.modal-footer').find('.close-registration-modal').on('click', function (e) {
                            e.preventDefault();
                            bSkipCloseAndReload = true;
                            App.Vars.SIAModalRegistrationForm.modal('hide');
                            location.reload(true);
                        });

                        let reloadInterval = setInterval(function () {
                            App.Vars.SIAModalRegistrationForm.find('.reload-msg > span').text(iCountDown--);
                            if (iCountDown <= 0) {
                                if (!bSkipCloseAndReload) {
                                    App.Vars.SIAModalRegistrationForm.modal('hide');
                                    location.reload(true);
                                }
                                clearInterval(reloadInterval);
                            }
                        }, 1000);
                    } else {
                        $submitBtn.removeClass('disabled');
                        $submitBtn.siblings('.spinner').remove();
                        self.$el.find('.submission-error').remove();
                        let alertMessage = response.msg;
                        alertMessage += self.buildRegistrationErrorMsg(response);
                        if (alertMessage !== '') {
                            let $alertHtml = $('<div class="alert alert-danger submission-error" role="alert">' + alertMessage + '</div>');
                            $submitBtn.parents('.tab-pane').append($alertHtml);
                        }
                    }
                },
                fail: function (response) {
                    $spinnerWrapper.remove();
                    $submitBtn.siblings('.spinner').remove();
                    $submitBtn.removeClass('disabled');
                    console.error('fail', response)
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    $spinnerWrapper.remove();
                    $submitBtn.siblings('.spinner').remove();
                    $submitBtn.removeClass('disabled');
                    console.error('error', jqXHR, textStatus, errorThrown)
                }
            });
        },
        buildRegistrationErrorMsg: function (response) {
            let self = this;
            let sErrorMsg = '';
            let sRegisteredMsg = '';
            let sAlreadyRegisteredMsg = '';
            let sRegistrationFailedMsg = '';
            if (response.aRegistered.length) {
                self.iReserved -= response.aRegistered.length;
                self.updateReservedAmtMsg();
                sRegisteredMsg = '<div>The following people were successfully registered.<ol>';
                sRegisteredMsg += _.map(response.aRegistered, function (registrant, idx) {
                    return '<li>' + registrant.FirstName + ' ' + registrant.LastName + '</li>';
                }).join("\n");
                sRegisteredMsg += '</ol></div>';
            }
            if (response.aAlreadyRegistered.length) {
                sAlreadyRegisteredMsg = '<div>The following people were already registered for a project and cannot register again.<ol>';
                sAlreadyRegisteredMsg += _.map(response.aAlreadyRegistered, function (registrant, idx) {
                    return '<li>' + registrant.FirstName + ' ' + registrant.LastName + '</li>';
                }).join("\n");
                sAlreadyRegisteredMsg += '</ol></div>';
            }
            if (response.aRegistrationFailed.length) {
                sRegistrationFailedMsg = '<div>An error occurred while attempting to register the following people.<ol>';
                sRegistrationFailedMsg += _.map(response.aRegistrationFailed, function (registrant, idx) {
                    return '<li>' + registrant.FirstName + ' ' + registrant.LastName + '</li>';
                }).join("\n");
                sRegistrationFailedMsg += '</ol>Please click the [Register] button to try again. If the problem persists, please contact Pastor Doug Schneider and let him know.</div>';
            }
            if (self.getContactInfoViewsLength() === 1) {
                sErrorMsg += "<div>Sorry, we were not able to complete your registration.</div>";
            } else {
                if (response.aRegistered.length) {
                    sErrorMsg += "<div>Sorry, we were not able to complete some of your registrations.</div>";
                } else {
                    sErrorMsg += "<div>Sorry, we were not able to complete any of your registrations.</div>";
                }
            }
            sErrorMsg += sAlreadyRegisteredMsg;
            sErrorMsg += sRegistrationFailedMsg;
            sErrorMsg += sRegisteredMsg;

            return sErrorMsg;
        }

    });

    App.Views.Registration = Backbone.View.extend({
        template: template('registrationTemplate'),
        projectListViewClass: App.Views.ProjectList,
        projectFilterGroupViewClass: App.Views.ProjectFilterGroup,
        registrationFormViewClass: App.Views.RegistrationForm,
        initialize: function (options) {
            let self = this;
            self.options = options;
            _.bindAll(self, 'render', 'updateProjectsList', 'showRegistrationForm', 'removeReservations', 'checkProjectRegistrations', 'welcomeHelperAction', 'removeFromActiveFiltersContainer');
            $('body').addClass('project-registration-page');
            self.parentView = self.options.parentView;
            self.projectModelToRegister = null;
            clearInterval(App.Vars.confirmSomeoneIsThereInterval);
            App.Vars.confirmSomeoneIsThereInterval = null;
            clearInterval(App.Vars.checkIfSomeoneIsThereInterval);
            clearTimeout(App.Vars.reservationTimeout);
            clearInterval(App.Vars.checkRegistrationsInterval);
            clearInterval(App.Vars.reservationInterval);
            App.Vars.checkRegistrationsInterval = setInterval($.proxy(self.checkProjectRegistrations, self), App.Vars.checkRegistrationsIntervalSeconds);
            // reduce interval time of non-activity if at church
            if (self.getIsPublicChurchKiosk()) {
                App.Vars.checkIfSomeoneIsThereIntervalSeconds = App.Vars.checkIfSomeoneIsThereKioskIntervalSeconds;
            }

            _log('App.Views.Registration.initialize', options);
        },
        events: {
            'change [name="sort_by"]': 'updateProjectsList',
            'click input[type="checkbox"][name^="filter["]': 'updateProjectsList',
            'click input[type="radio"][name^="filter["]': 'updateProjectsList',
            'change select[name^="filter["]': 'updateProjectsList',
            'click span[data-helper-question]': 'welcomeHelperAction',
            'click button[data-helper-question]': 'welcomeHelperAction',
            'change [name="register-skills-needed"]': 'welcomeHelperAction',
            'change [name="register-school-preference"]': 'welcomeHelperAction',
            'click .active-filter-btn': 'removeFromActiveFiltersContainer',
            'click .show-all-projects': 'showAllProjects',
        },
        render: function () {
            let self = this;
            // Add template to this views el now so child view el selectors exist when they are instantiated
            self.$el.html(self.template({
                year: new Date().getFullYear()
            }));
            self.showWelcomeHelper();

            App.Views.skillFilterGroup = self.skillFilterGroup = new self.projectFilterGroupViewClass({
                parentView: self,
                collection: App.Collections.skillFiltersCollection,
                filterGroupName: 'Experience Needed'
            });
            self.$('.project-list-filters-wrapper').append(self.skillFilterGroup.render().el);

            App.Views.siteFilterGroup = self.siteFilterGroup = new self.projectFilterGroupViewClass({
                parentView: self,
                collection: App.Collections.siteFiltersCollection,
                filterGroupName: 'Site'
            });
            self.$('.project-list-filters-wrapper').append(self.siteFilterGroup.render().el);

            App.Views.peopleNeededFilterGroup = self.peopleNeededFilterGroup = new self.projectFilterGroupViewClass({
                parentView: self,
                collection: App.Collections.peopleNeededFiltersCollection,
                filterGroupName: '<i class="fas fa-users"></i> People Needed'
            });
            self.$('.project-list-filters-wrapper').append(self.peopleNeededFilterGroup.render().el);

            App.Views.childFriendlyFilterGroup = self.childFriendlyFilterGroup = new self.projectFilterGroupViewClass({
                parentView: self,
                collection: App.Collections.childFriendlyFiltersCollection,
                filterGroupName: '<i class="fas fa-child"></i> Child Friendly'
            });
            self.$('.project-list-filters-wrapper').append(self.childFriendlyFilterGroup.render().el);

            App.Views.projectListView = self.projectListView = new self.projectListViewClass({
                el: self.$('.project-list'),
                parentView: self,
                collection: App.Collections.allProjectsCollection,
                model: App.Models.projectModel
            });

            self.projectListView.render();
            self.listenTo(App.Views.projectListView, 'register-for-project', self.showRegistrationForm);
            return self;
        },
        getIsPublicChurchKiosk: function () {
            let self = this;
            return App.Vars.churchIPAddress && App.Vars.remoteIPAddress && _.isEqual(App.Vars.churchIPAddress, App.Vars.remoteIPAddress);
        },
        initCarasel: function () {
            let self = this;
            self.$caraselHelper = self.$el.find('#carasel-welcome-helper');
            self.$caraselHelper.carasel();
        },
        showWelcomeHelper: function () {
            let self = this;
            // Stop the interval if it exists
            App.Vars.checkIfSomeoneIsThereInterval && clearInterval(App.Vars.checkIfSomeoneIsThereInterval);
            self.$el.find('.project-list, .filters-navbar').addClass('hidden');
            self.$el.find('.project-list-wrapper').removeClass('col-sm-9 col-lg-10').addClass('col-sm-12 col-lg-12');
            self.$el.find('.welcome-helper').show();
            App.Collections.skillFiltersCollection.each(function (model) {
                self.$el.find('[name="register-skills-needed"]').append('<option value="' + model.get('filterId') + '">' + model.get('filterLabel') + '</option>')
            });
            App.Collections.siteFiltersCollection.each(function (model) {
                self.$el.find('[name="register-school-preference"]').append('<option value="' + model.get('filterId') + '">' + model.get('filterLabel') + '</option>')
            });
            self.initCarasel();

        },
        hideWelcomeHelper: function () {
            let self = this;
            self.$el.find('.project-list-wrapper').removeClass('col-sm-12 col-lg-12').addClass('col-sm-9 col-lg-10');
            self.$el.find('.project-list, .filters-navbar').removeClass('hidden');
            self.$el.find('.welcome-helper').hide();
            if (self.getIsPublicChurchKiosk()) {
                let $resetNotice = $('.header').find('.reset-notice');
                if ($resetNotice.length === 0) {
                    $resetNotice = $('<div class="alert alert-info reset-notice" role="alert">If you are at a kiosk at church, please <a class="btn btn-success btn-xs" href="/">Click to Reset</a> the page for the next person if you decide not to register. Thank You.</div>');
                    $('#filters-navbar-collapse').prepend($resetNotice);
                } else {
                    $resetNotice.show();
                }
            }
        },
        /**
         * Every user interaction should really call this and reset it
         */
        resetCheckIfSomeoneIsThereInterval: function () {
            let self = this;
            if (self.getIsPublicChurchKiosk()) {
                App.Vars.checkIfSomeoneIsThereInterval && clearInterval(App.Vars.checkIfSomeoneIsThereInterval);
                App.Vars.checkIfSomeoneIsThereInterval = setInterval($.proxy(self.checkIfSomeoneIsThere, self), App.Vars.checkIfSomeoneIsThereIntervalSeconds);
            }
        },
        checkIfSomeoneIsThere: function () {
            let self = this;

            // don't show the confirm modal if it is already waiting for a response
            if (!App.Vars.confirmSomeoneIsThereInterval) {
                let $checkIfSomeIsThereIntervalModal = getSIAConfirmModal('confirmSomeoneIsThereInterval');
                $checkIfSomeIsThereIntervalModal.on('show.bs.confirm', function (event) {
                    let $confirm = $(this);
                    let iCountDown = 60;
                    $confirm.find('.confirm-body').find('button.btn-no').remove();
                    $confirm.find('.confirm-body').find('.confirm-question').html('<div>Hi, Are you still there?<br>The page will automatically reset in <span class="reset-countdown">' + iCountDown + '</span> seconds if you do not respond.</div>');
                    App.Vars.confirmSomeoneIsThereInterval && clearInterval(App.Vars.confirmSomeoneIsThereInterval);
                    App.Vars.confirmSomeoneIsThereInterval = setInterval(function () {
                        $confirm.find('.confirm-body').find('.reset-countdown').text(iCountDown--);
                        if (iCountDown <= 0) {
                            App.Vars.confirmSomeoneIsThereInterval && clearInterval(App.Vars.confirmSomeoneIsThereInterval);
                            App.Vars.confirmSomeoneIsThereInterval = null;
                            // just in case there are any lingering reservations
                            self.removeReservations();
                            location.reload(true);
                        }
                    }, 1000);
                    $confirm.find('.confirm-body').find('button').on('click', function (e) {
                        e.preventDefault();
                        App.Vars.confirmSomeoneIsThereInterval && clearInterval(App.Vars.confirmSomeoneIsThereInterval);
                        App.Vars.confirmSomeoneIsThereInterval = null;
                        self.resetCheckIfSomeoneIsThereInterval();
                        $confirm.confirm('hide');
                    });

                });

                $checkIfSomeIsThereIntervalModal.confirm('show');
            }
        },
        welcomeHelperAction: function (e) {
            let self = this;
            e.preventDefault();
            self.resetCheckIfSomeoneIsThereInterval();
            let $btn = $(e.currentTarget);
            let helperQuestion = $btn.data('helper-question');
            let btnAction = $btn.data('val');
            let bApplyFilter = btnAction === 'yes';
            let bSkipGoToSlide = false;
            let gotoCaraselNumber = $btn.data('goto-number');
            //console.log({btn: $btn,btnAction:btnAction,helperQuestion:helperQuestion,gotoCaraselNumber:gotoCaraselNumber})
            switch (helperQuestion) {
                case 'register-skills-needed':
                    if (bApplyFilter) {
                        // Use the value of the select option to find the correct input to click
                        self.$el.find('#' + $btn.val()).trigger('click');
                    }
                    break;
                case 'register-school-preference':
                    if (bApplyFilter) {
                        // Use the value of the select option to find the correct input to click
                        self.$el.find('#' + $btn.val()).trigger('click');
                    }
                    break;
                case 'register-multiple':
                    if (bApplyFilter) {
                        let $peopleNeededCheckboxes = self.$el.find('[name="filter[peopleNeeded][]"]');
                        // first, uncheck all the peopleNeeded inputs
                        $peopleNeededCheckboxes.prop('checked', false);
                        let bListAmtFound = false;
                        self.$el.find('.project-list').find('.volunteers-col').find('.label').each(function (idx, el) {
                            let iAmt = parseInt($(el).text().trim());
                            if (!bListAmtFound && iAmt >= 10) {
                                bListAmtFound = true;
                            }
                        });

                        let bAmtFound = false;
                        // find a checkbox that is at least 10, click it and exit loop
                        if (bListAmtFound) {
                            _.each($peopleNeededCheckboxes, function (checkbox, key) {
                                let iAmt = parseInt($(checkbox).val());
                                if (!bAmtFound && iAmt >= 10) {
                                    bAmtFound = true;
                                    $(checkbox).trigger('click');
                                }
                            });
                        }
                        // Show a warning that there aren't any projects with 10 open spots
                        if (!bAmtFound || !bListAmtFound) {
                            bSkipGoToSlide = true;
                            self.$el.find('.' + helperQuestion + '-warning').removeClass('hidden');
                            self.$el.find('.btn[data-helper-question="' + helperQuestion + '"][data-val!="ok"]').addClass('hidden');
                            self.$el.find('.btn[data-helper-question="' + helperQuestion + '"][data-val="ok"]').removeClass('hidden');
                        }
                    }
                    break;
                case 'register-child-friendly':
                    if (bApplyFilter) {
                        let bHasChildFriendlyFilterOption = self.$el.find('#filter_childFriendly_Yes').length;
                        let bListHasChildFriendlyProjectsAvailable = self.$el.find('.project-list').find('.child-friendly-col').find('i.text-success').length;
                        // Click the input if it exists and if the current list has child friendly projects
                        if (bHasChildFriendlyFilterOption && bListHasChildFriendlyProjectsAvailable) {
                            self.$el.find('#filter_childFriendly_Yes').trigger('click')
                        } else {
                            bSkipGoToSlide = true;
                            // Change the warning if the peopleNeeded filter removed all the child friendly projects
                            if (bHasChildFriendlyFilterOption && !bListHasChildFriendlyProjectsAvailable) {
                                self.$el.find('.' + helperQuestion + '-warning').html('Sorry, at this time there are no child friendly projects with the applied filters.')
                            }
                            self.$el.find('.' + helperQuestion + '-warning').removeClass('hidden');
                            self.$el.find('.btn[data-helper-question="' + helperQuestion + '"][data-val!="ok"]').addClass('hidden');
                            self.$el.find('.btn[data-helper-question="' + helperQuestion + '"][data-val="ok"]').removeClass('hidden');
                        }
                    }
                    break;
                case 'skip-questions':
                case 'show-project-list':
                    // hide jumbotron and show project list and filters
                    self.hideWelcomeHelper();
                    break;
            }

            if (!bSkipGoToSlide) {
                if (!$('.ajax-spinner-overlay').length) {
                    gotoCaraselNumber = self.checkIfNextSlideIsValid(gotoCaraselNumber);
                    self.showNextSlide(gotoCaraselNumber);
                } else {
                    let waitInterval = setInterval(function () {
                        if (!$('.ajax-spinner-overlay').length) {
                            clearInterval(waitInterval);
                            gotoCaraselNumber = self.checkIfNextSlideIsValid(gotoCaraselNumber);
                            self.showNextSlide(gotoCaraselNumber);
                        }
                    }, 500);
                }
            }
        },
        checkIfNextSlideIsValid: function (gotoCaraselNumber) {
            let self = this;
            let gotoCaraselNumberOrig = gotoCaraselNumber;
            let $slide = self.$el.find('.item[data-number="' + gotoCaraselNumber + '"]');
            let helperQuestion = $slide.data('helper-question');

            /**
             * These are required to be in the order of the slides or the fall throughs won't work correctly
             */
            switch (helperQuestion) {
                case 'register-school-preference':
                    let bListHasSchoolAvailableChoices = self.$el.find('[name="filter[site][]"]').length > 1;
                    let aAvailableSites = [];
                    // Update select and remove unavailable sites
                    if (bListHasSchoolAvailableChoices) {
                        self.$el.find('.project-list').find('.site-col').each(function (idx, el) {
                            aAvailableSites.push($(el).text().trim());
                        });
                        self.$el.find('[name="register-school-preference"]').find('option').each(function (idx, el) {
                            if (!_.isEmpty($(el).val())) {
                                if (!_.contains(aAvailableSites, $(el).text().trim())) {
                                    $(el).remove();
                                }
                            }
                        });
                    }
                    if (!bListHasSchoolAvailableChoices) {
                        // Skip this question
                        gotoCaraselNumber++;
                    } else {
                        return gotoCaraselNumber;
                    }

                case 'register-multiple':
                    let $peopleNeededCheckboxes = self.$el.find('[name="filter[peopleNeeded][]"]');
                    let bListAmtFound = false;
                    self.$el.find('.project-list').find('.volunteers-col').find('.label').each(function (idx, el) {
                        let iAmt = parseInt($(el).text());
                        if (!bListAmtFound && iAmt >= 10) {
                            bListAmtFound = true;
                        }
                    });

                    let bAmtFound = false;
                    // find a checkbox that is at least 10, click it and exit loop
                    _.each($peopleNeededCheckboxes, function (checkbox, key) {
                        let iAmt = parseInt($(checkbox).val());
                        if (!bAmtFound && iAmt >= 10) {
                            bAmtFound = true;
                        }
                    });
                    if (!bAmtFound || !bListAmtFound) {
                        // Skip this question
                        gotoCaraselNumber++;
                    } else {
                        return gotoCaraselNumber;
                    }

                case 'register-child-friendly':
                    let bHasChildFriendlyFilterOption = self.$el.find('#filter_childFriendly_Yes').length;
                    let bListHasChildFriendlyProjectsAvailable = self.$el.find('.project-list').find('.child-friendly-col').find('i.text-success').length;
                    // Click the input if it exists and if the current list has child friendly projects
                    if (!bHasChildFriendlyFilterOption || !bListHasChildFriendlyProjectsAvailable) {
                        // Skip this question
                        gotoCaraselNumber++;
                    }

            }
            //console.log('passed in gotoCaraselNumber:', gotoCaraselNumberOrig,'started with helperQuestion:', helperQuestion,'return gotoCaraselNumber"', gotoCaraselNumber)
            return gotoCaraselNumber;
        },
        showNextSlide: function (gotoCaraselNumber) {
            let self = this;
            if (gotoCaraselNumber === 4) {
                let iProjectCnt = self.$el.find('.project-list').find('tbody tr').length;
                let $searchCriteriaResultMsg = self.$el.find('.search-criteria-result-msg');
                let iCheckedCnt = $('.active-filters-container').find('.active-filter-btn').length;
                let projectStr = iProjectCnt === 1 ? 'project' : 'projects';

                if (iCheckedCnt === 0) {
                    let verb = iProjectCnt === 1 ? 'is' : 'are';
                    $searchCriteriaResultMsg.html('We like your flexibility, there ' + verb + ' ' + iProjectCnt + ' ' + projectStr + ' for you to choose from.');
                } else {
                    $searchCriteriaResultMsg.find('.welcome-helper-projects-found-amt').text(iProjectCnt + ' ' + projectStr);
                }
            }
            self.$caraselHelper.carasel(gotoCaraselNumber);
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
                        let matchingModel = _.where(response.all_projects, {ProjectID: ProjectID});
                        if (matchingModel.length) {
                            if (PeopleNeeded !== matchingModel[0].PeopleNeeded) {
                                bReset = true;
                            }
                        }
                    });
                    //App.Vars.reservedProjectID === null
                    if (bReset) {
                        App.Collections.allProjectsCollection.reset(response.all_projects);
                        App.Collections.siteFiltersCollection.reset(response.projectFilters.site);
                        App.Collections.peopleNeededFiltersCollection.reset(response.projectFilters.peopleNeeded);
                        App.Collections.childFriendlyFiltersCollection.reset(response.projectFilters.childFriendly);
                        App.Collections.skillFiltersCollection.reset(response.projectFilters.skill);
                    }
                },
                fail: function (response) {
                    //window.growl(response.msg, 'error');
                    //window.ajaxWaiting('remove', '.project-list-wrapper');
                }
            })
        },
        showAllProjects: function (e) {
            let self = this;
            e.preventDefault();
            $('.active-filter-btn').remove();
            $('input[type="hidden"][data-checkbox-id]').remove();
            $('.show-all-projects').addClass('hidden');
            $('.project-list-filter-group').find('.project-list-filters').show();
            self.updateProjectsList();
        },
        addToActiveFiltersContainer: function (checkbox) {
            let self = this;
            let checkboxId = checkbox.id;
            let $checkbox = $(checkbox);
            let $filterGroup = $checkbox.parents('.project-list-filter-group');
            let $filtersList = $filterGroup.find('.project-list-filters');
            let filterType = $filterGroup.find('.project-list-filter-title').text();
            let filterLabel = $checkbox.parent().text();

            let $btn = $('<button data-field="' + $checkbox.data('field') + '" data-checkbox-id="' + checkboxId + '" class="btn btn-primary btn-xs active-filter-btn"><i class="fas fa-times-circle"></i>' + filterLabel + '</button>');
            $filtersList.hide();
            $filterGroup.find('.project-list-filter-title').after($btn);
            // We replace the clicked checkbox with a hidden input in case the ajax call removes it.
            $checkbox.remove();
            $filterGroup.prepend('<input type="hidden" data-checkbox-id="' + checkboxId + '" name="' + $checkbox.attr('name') + '" value="' + $checkbox.val() + '" />');
            $('.show-all-projects').removeClass('hidden');
        },
        removeFromActiveFiltersContainer: function (e) {
            let self = this;
            e.preventDefault();
            let $input = null;
            // If the user starts playing with the applied filters before the
            // the welcome helper is done, close it. The results would be
            // wonky anyhow.
            if ($('.welcome-helper').is(':visible')) {
                // TODO: handle the removed applied filter in the welcome helper code so we don't have to hide it here
                self.hideWelcomeHelper();
            }
            /**
             * The goal is to remove the filter from the ajax call.
             * First we see if there is a checkbox to click, if it
             * doesn't exist then we remove the hidden input
             */
            if ($('input[type="checkbox"]#' + $(e.currentTarget).data('checkboxId')).length) {
                $input = $('input[type="checkbox"]#' + $(e.currentTarget).data('checkboxId'));
                if ($input.prop('checked')) {
                    // uncheck to trigger ajax call to update results
                    $input.trigger('click');
                }
                // show the group again
                $input.parents('.project-list-filter-group').find('.project-list-filters').show();
            } else if ($('input[type="hidden"][data-checkbox-id="' + $(e.currentTarget).data('checkboxId') + '"]').length) {
                $input = $('input[type="hidden"][data-checkbox-id="' + $(e.currentTarget).data('checkboxId') + '"]');
                // show the group again
                $input.parents('.project-list-filter-group').find('.project-list-filters').show();
                // delete input and update results
                $input.remove();
                self.updateProjectsList();
            } else {
                // last ditch effort
                self.updateProjectsList();
                // TODO: show the parent group again?
            }
            // remove active filter btn
            $(e.currentTarget).remove();
            if (!$('.active-filter-btn').length) {
                $('.show-all-projects').addClass('hidden');
            }
        },
        updateProjectsList: function (e) {
            let self = this;

            self.resetCheckIfSomeoneIsThereInterval();
            if (!_.isUndefined(e) && $(e.currentTarget).prop('checked')) {
                self.addToActiveFiltersContainer(e.currentTarget);
            }
            window.ajaxWaiting('show', '.project-list-wrapper');
            let formData = $('form[name="filter-project-list-form"]').serialize();
            $.ajax({
                type: "get",
                dataType: "json",
                url: 'project_registration/filter_project_list',
                data: formData,
                processData: false,
                success: function (response) {
                    App.Collections.allProjectsCollection.reset(response.all_projects);
                    App.Collections.siteFiltersCollection.reset(response.projectFilters.site);
                    App.Collections.peopleNeededFiltersCollection.reset(response.projectFilters.peopleNeeded);
                    App.Collections.childFriendlyFiltersCollection.reset(response.projectFilters.childFriendly);
                    App.Collections.skillFiltersCollection.reset(response.projectFilters.skill);
                    if (_.isEmpty(response)) {
                        let resultsMsg = 'No projects found';
                        if ($('.active-filters-container').find('.active-filter-btn').length) {
                            resultsMsg = 'No projects found, try removing one of the applied filters.';
                        }
                        self.$el.find('.project-list-wrapper').append('<div class="no-projects-found">' + resultsMsg + '</div>')
                    } else {
                        self.$el.find('.project-list-wrapper').find('.no-projects-found').remove();
                    }
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
                parentView: self,
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
                modal.find('.modal-footer').find('.reserved-msg').remove();
                modal.find('.modal-footer').append('<div class="reserved-msg pull-left">Currently Reserving <span class="reserved-amt-msg">0</span> Spots</div>');
            });
            App.Vars.SIAModalRegistrationForm.SIAModal('show');

            App.Vars.SIAModalRegistrationForm.find('button[data-dismiss="modal"]').off().on('click', function (e) {
                e.preventDefault();
                if (typeof App.Vars.reservedProjectID !== 'undefined' && App.Vars.reservedProjectID !== null) {
                    let $confirmCloseRegistrationFormModal = getSIAConfirmModal('confirmCloseRegistrationForm');

                    App.Vars.SIAModalRegistrationForm.on('shown.bs.modal', function (event) {
                        if ($('[name="reserve"]').length) {
                            $('[name="reserve"]')[0].focus({preventScroll: false});
                        }
                    });
                    $confirmCloseRegistrationFormModal.on('show.bs.confirm', function (event) {
                        let $confirmModal = $(this);

                        _log('App.Vars.reservationTimeout', App.Vars.reservationTimeout, 'App.Vars.reservedProjectID', App.Vars.reservedProjectID);
                        $confirmModal.find('.confirm-body').find('.confirm-question').html("If you close the registration form now you will lose your reserved spots for this project.<br><br>Do you still wish to close?");
                        $confirmModal.find('.confirm-body').find('button').on('click', function (e) {
                            e.preventDefault();
                            let $confirmModalBtn = $(this);
                            if ($confirmModalBtn.hasClass('btn-yes')) {
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
                    $('.reserved-amt-msg').text('0');
                },
                fail: function (response) {
                    if (App.Vars.devMode) {
                        console.error(response);
                        if (App.Vars.devMode) {
                            alert('removingReservations error' + response);
                        }
                    }
                }
            })
        }
    });
})(window.App, jQuery);
