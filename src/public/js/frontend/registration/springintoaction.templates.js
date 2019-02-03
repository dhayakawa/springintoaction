window.JST = {};
window.JST['ajaxSpinnerTemplate'] = _.template(
                        "<div class=\"ajax-spinner-overlay\"><div id=\"floatingCirclesG\"><div class=\"f_circleG\" id=\"frotateG_01\"></div><div class=\"f_circleG\" id=\"frotateG_02\"></div><div class=\"f_circleG\" id=\"frotateG_03\"></div><div class=\"f_circleG\" id=\"frotateG_04\"></div><div class=\"f_circleG\" id=\"frotateG_05\"></div><div class=\"f_circleG\" id=\"frotateG_06\"></div><div class=\"f_circleG\" id=\"frotateG_07\"></div><div class=\"f_circleG\" id=\"frotateG_08\"></div></div></div>"
                    );
window.JST['newProjectRegistrationContactInfoForm'] = _.template(
                        "<div class=\"row\"><div class=\"col-xs-6\"><div class=\"form-group\"><label for=\"inputChurch<%= idx %>\">Church</label><select name=\"contact_info[<%= idx %>][Church]\" class=\"form-control\" id=\"Church<%= idx %>\" required placeholder=\"Church\"><option>Choose Church</option><option value=\"woodlands\">Woodlands Church</option><option value=\"other\">Other</option></select></div></div><div class=\"col-xs-6\"><div style=\"display:none\" class=\"form-group other-church-wrapper\"><label for=\"inputEmail<%= idx %>\">Other Church</label><input type=\"text\" name=\"contact_info[<%= idx %>][ChurchOther]\" class=\"form-control\" id=\"ChurchOther<%= idx %>\" placeholder=\"Church\" value=\"<%= testString %>\"/></div></div></div><div class=\"row\"><div class=\"col-xs-6\"><div class=\"form-group\"><label for=\"inputEmail<%= idx %>\">Email</label><input type=\"text\" name=\"contact_info[<%= idx %>][Email]\" class=\"form-control\" id=\"inputEmail<%= idx %>\" placeholder=\"Email\" required value=\"<%= testEmail %>\"/></div></div><div class=\"col-xs-6\"><div class=\"form-group\"><label for=\"inputMobilePhoneNumber<%= idx %>\">Mobile Phone Number</label><input type=\"text\" name=\"contact_info[<%= idx %>][MobilePhoneNumber]\" class=\"form-control\" id=\"inputMobilePhoneNumber<%= idx %>\" placeholder=\"Mobile Phone Number\" required value=\"<%= testMobilePhoneNumber %>\"/></div></div></div><div class=\"row\"><div class=\"col-xs-6\"><div class=\"form-group\"><label for=\"inputFirstName<%= idx %>\">First Name</label><input type=\"text\" name=\"contact_info[<%= idx %>][FirstName]\" class=\"form-control\" id=\"inputFirstName<%= idx %>\" placeholder=\"First Name\" required value=\"<%= testFirstName %>\"/></div></div><div class=\"col-xs-6\"><div class=\"form-group\"><label for=\"inputLastName<%= idx %>\">Last Name</label><input type=\"text\" name=\"contact_info[<%= idx %>][LastName]\" class=\"form-control\" id=\"inputLastName<%= idx %>\" placeholder=\"Last Name\" required value=\"<%= testLastName %>\"/></div></div></div>"
                    );
window.JST['newProjectRegistrationContactInfoTemplate'] = _.template(
                        "<div class=\"row\"><div class=\"col-xs-6\"><div class=\"form-group\"><label for=\"inputChurch<%= idx %>\">Church</label><select name=\"contact_info[<%= idx %>][Church]\" class=\"form-control\" id=\"Church<%= idx %>\" required ><option>Choose Church</option><option <% if(Church==='woodlands'){ print('selected'); } %> value=\"woodlands\">Woodlands Church</option><option <% if(Church==='other'){ print('selected'); } %> value=\"other\">Other</option></select></div></div><div class=\"col-xs-6\"><div style=\"display:none\" class=\"form-group other-church-wrapper\"><label for=\"inputChurchOther<%= idx %>\">Other Church</label><input type=\"text\" name=\"contact_info[<%= idx %>][ChurchOther]\" class=\"form-control\" id=\"ChurchOther<%= idx %>\" placeholder=\"Church\" value=\"<%= ChurchOther %>\"/></div></div></div><div class=\"row\"><div class=\"col-xs-6\"><div class=\"form-group\"><label for=\"inputEmail<%= idx %>\">Email</label><input type=\"text\" name=\"contact_info[<%= idx %>][Email]\" class=\"form-control\" id=\"inputEmail<%= idx %>\" placeholder=\"Email\" required value=\"<%= Email %>\"/></div></div><div class=\"col-xs-6\"><div class=\"form-group\"><label for=\"inputMobilePhoneNumber<%= idx %>\">Mobile Phone Number</label><input type=\"text\" name=\"contact_info[<%= idx %>][MobilePhoneNumber]\" class=\"form-control\" id=\"inputMobilePhoneNumber<%= idx %>\" placeholder=\"Mobile Phone Number\" required value=\"<%= MobilePhoneNumber %>\"/></div></div></div><div class=\"row\"><div class=\"col-xs-6\"><div class=\"form-group\"><label for=\"inputFirstName<%= idx %>\">First Name</label><input type=\"text\" name=\"contact_info[<%= idx %>][FirstName]\" class=\"form-control\" id=\"inputFirstName<%= idx %>\" placeholder=\"First Name\" required value=\"<%= FirstName %>\"/></div></div><div class=\"col-xs-6\"><div class=\"form-group\"><label for=\"inputLastName<%= idx %>\">Last Name</label><input type=\"text\" name=\"contact_info[<%= idx %>][LastName]\" class=\"form-control\" id=\"inputLastName<%= idx %>\" placeholder=\"Last Name\" required value=\"<%= LastName %>\"/></div></div></div>"
                    );
window.JST['newProjectRegistrationTemplate'] = _.template(
                        "<div class=\"row reservation-wrapper\"><div class=\"col-xs-12\"><p class=\"steps-help\"> How many people, 16 years old or older, would you like to register right now? There are currently <%= volunteersNeeded %> open spots. <br> We'll temporarily reserve the spots for you until you finish registering. </p><form name=\"newProjectReservation\"><input type=\"hidden\" name=\"_token\" value=\"<%= CsrfToken %>\"><input type=\"hidden\" name=\"ProjectID\" value=\"<%= ProjectID %>\" /><div class=\"form-group\"><label for=\"reserve\">Number of people you would like to register</label><input type=\"text\" name=\"reserve\" class=\"form-control\" id=\"reserve\" placeholder=\"Reserve\" tabindex=\"1\" required pattern=\"[0-9]+\" value=\"1\"/></div><button class=\"btn btn-primary btn-sm\">Reserve and Continue</button></form></div></div><script type=\"text/javascript\">document.newProjectReservation.reserve.focus();</script><form name=\"newProjectRegistration\"><input type=\"hidden\" name=\"_token\" value=\"<%= CsrfToken %>\"><input type=\"hidden\" name=\"ProjectID\" value=\"<%= ProjectID %>\"/><div class=\"registration-form-body-wrapper\"><div class=\"row\"><div class=\"col-xs-12\"><div class=\"registration-form-project-description-panel panel panel-default\"><div class=\"panel-heading\"><a role=\"button\" data-toggle=\"collapse\" class=\"collapse-project-description\" href=\"#collapseProjectDescription\" aria-expanded=\"true\" aria-controls=\"collapseProjectDescription\"><span class=\"glyphicon glyphicon-minus\" aria-hidden=\"true\"></span></a><h3 class=\"panel-title registration-form-site-title\"><%= SiteName %></h3></div><div class=\"panel-body collapse in\" id=\"collapseProjectDescription\"><div class=\"registration-form-project-description\"><%= ProjectDescription %></div></div></div></div></div><div class=\"row\"><div class=\"col-xs-12 steps-wrapper\"><div class=\"col-xs-4 step-one steps active-step\"><h4 class=\"active-step\">Step One</h4><small>Personal Contact Info</small></div><div class=\"col-xs-4 step-two steps\"><h4 class=\"muted-text\">Step Two</h4><small>Register Others?</small></div><div class=\"col-xs-4 step-three steps\"><h4 class=\"muted-text\">Finish</h4><small>Confirm and Register</small></div></div></div><ul class=\"nav nav-tabs\" role=\"tablist\"><li role=\"presentation\" class=\"active\"><a href=\"#contact-info\" aria-controls=\"contact-info\" role=\"tab\" data-toggle=\"tab\">Contact Info</a></li><li role=\"presentation\"><a href=\"#auto-register\" aria-controls=\"auto-register\" role=\"tab\" data-toggle=\"tab\">register others</a></li><li role=\"presentation\"><a href=\"#confirm-submit\" aria-controls=\"confirm-submit\" role=\"tab\" data-toggle=\"tab\">confirm submit</a></li></ul><div class=\"tab-content\"><div role=\"tabpanel\" class=\"tab-pane fade in active\" id=\"contact-info\"><div class=\"row\"><div class=\"col-xs-12\"><div class=\"step-help\"> Please start with filling out your personal contact information. All the fields are required. </div></div></div><div class=\"personal-contact-info-wrapper\"></div><div class=\"row bottom-nav-btns\"><div class=\"col-sm-12 text-right\"><button class=\"register-others btn btn-default btn-sm\">Register Others <i class=\"fas fa-arrow-alt-circle-right\"></i></button>&nbsp; <button class=\"confirm-and-register btn btn-primary btn-sm\">Confirm and Register <i class=\"fas fa-arrow-alt-circle-right\"></i></button></div></div></div><div role=\"tabpanel\" class=\"tab-pane fade\" id=\"auto-register\"><div class=\"row\"><div class=\"col-xs-12\"><div class=\"step-help\"> Step help </div></div></div><div class=\"row woodlands-only auto-register-question\"><div class=\"col-xs-12\"><div class=\"radio\"><label><input type=\"radio\" name=\"register-process-type\" class=\"auto-register\" id=\"auto-register-family\" value=\"family\"/> I would you like to try and automatically register my family by logging into the Grove.</label><label><input type=\"radio\" name=\"register-process-type\" class=\"auto-register\" id=\"auto-register-lifegroup\" value=\"lifegroup\"/> I would you like to try and automatically register my life group by logging into the Grove.</label><label><input type=\"radio\" name=\"register-process-type\" class=\"manual-register\" id=\"auto-register-manual\" value=\"manual\"/> No, thanks, just let me enter in the contact information for everyone.</label></div></div></div><div class=\"row grove-login\"><div class=\"col-xs-4\"><div class=\"form-group\"><label for=\"inputGroveEmail\">Grove Email:</label><input type=\"text\" name=\"GroveEmail\" autocomplete=\"off\" class=\"form-control\" id=\"inputGroveEmail\" placeholder=\"Grove Email\" required value=\"<%= testGroveEmail %>\"/></div></div><div class=\"col-xs-4\"><div class=\"form-group\"><label for=\"inputGrovePassword\">Grove Password:</label><input type=\"password\" name=\"GrovePassword\" autocomplete=\"off\" class=\"form-control\" id=\"inputGrovePassword\" placeholder=\"Grove Password\" required value=\"<%= testGrovePassword %>\"/></div></div><div class=\"col-xs-4\"><div class=\"form-group\"><label for=\"submit-grove-login-btn\">&nbsp;</label><button id=\"submit-grove-login-btn\" class=\"submit-grove-login-btn btn btn-primary btn-sm\">Login</button></div></div></div><div class=\"row grove-register\"><div class=\"col-xs-12\"> Uncheck any people you do not need to register. <table class=\"grove-contacts-confirm-list table table-striped table-condensed\"><tbody></tbody></table></div></div><div class=\"row manual-multiple-register\"><div class=\"col-xs-12\"><ol class=\"multiple-register-list\"></ol></div></div><div class=\"row bottom-nav-btns\"><div class=\"col-xs-6 text-left\"><button class=\"back-to-contact-info-btn btn btn-primary btn-sm\"><i class=\"fas fa-arrow-alt-circle-left\"></i> Personal Contact Info</button></div><div class=\"col-xs-6 text-right\"><button class=\"confirm-and-register btn btn-primary btn-sm\">Confirm and Register <i class=\"fas fa-arrow-alt-circle-right\"></i></button></div></div></div><div role=\"tabpanel\" class=\"tab-pane fade\" id=\"confirm-submit\"><div class=\"row\"><div class=\"col-xs-12\"><div class=\"step-help\"> Please confirm everything is correct and submit. We'll be sending you a confirmation email and notifications as we get closer to the date. </div></div></div><div class=\"row\"><div class=\"col-xs-12\"><table class=\"project-registration-confirm-list table table-striped table-condensed\"><tbody></tbody></table></div></div><div class=\"row bottom-nav-btns\"><div class=\"col-xs-6 text-left\"><button class=\"back-to-contact-info-btn btn btn-primary btn-sm\"><i class=\"fas fa-arrow-alt-circle-left\"></i> Personal Contact Info</button><button class=\"back-to-register-others-btn btn btn-primary btn-sm\"><i class=\"fas fa-arrow-alt-circle-left\"></i> Register Others</button></div><div class=\"col-xs-6 text-right\"><button class=\"submit-registration-btn btn btn-success btn-sm\"><i class=\"fas fa-check-circle\"></i> Register</button></div></div></div></div></div></form>"
                    );
window.JST['projectListFilterGroupTemplate'] = _.template(
                        "<h3 class=\"project-list-filter-title\"><%= filterGroupName %></h3><ul class=\"project-list-filters\"></ul>"
                    );
window.JST['projectListFilterItemTemplate'] = _.template(
                        "<label><%= filterIcon %><input data-field=\"<%= Field %>\" type=\"checkbox\" <%= bFilterIsChecked %> name=\"<%= filterName %>\" id=\"<%= filterId %>\" value=\"<%= filterValue %>\"/><%= filterLabel %></label>"
                    );
window.JST['projectListItemTemplate'] = _.template(
                        "<td><div class=\"row\"><div class=\"col-xs-2 col-lg-1\"><button data-project-id=\"<%= ProjectID %>\" type=\"button\" class=\"btnRegister btn btn-xs btn-primary\"> Register </button></div><div class=\"col-xs-6 col-lg-8 site-xs-col site-col\"><%= SiteName %></div><div class=\"col-xs-1 col-lg-1 skills-xs-col skills-col\"><%= SkillsNeeded %></div><div class=\"col-xs-1 col-lg-1 child-xs-col child-friendly-col\"><%= ChildFriendly %></div><div class=\"col-xs-1 col-lg-1 volunteers-xs-col volunteers-col\"><span class=\"label label-primary\" title=\"# of People Needed\" data-toggle=\"tooltip\" data-placement=\"top\" ><%= VolunteersNeeded %></span></div></div><div class=\"row\"><div class=\"hidden-xs col-lg-1\">&nbsp;</div><div class=\"col-xs-12 col-lg-11 description-col\"><span class=\"project-description-label\">Description:</span><%= ProjectDescription %></div></div></td>"
                    );
window.JST['registrationTemplate'] = _.template(
                        "<div class=\"row\"><nav class=\"col-xs-12 col-sm-3 col-md-3 col-lg-2 filters-navbar filters-navbar-default\"><div class=\"container-fluid\"><!-- Brand and toggle get grouped for better mobile display --><div class=\"filters-navbar-header\"><button type=\"button\" class=\"filters-navbar-toggle collapsed\" data-toggle=\"collapse\" data-target=\"#filters-navbar-collapse\" aria-expanded=\"false\"><span class=\"sr-only\">Toggle Filters</span><span class=\"icon-bar\"></span><span class=\"icon-bar\"></span><span class=\"icon-bar\"></span></button></div><!-- Collect the nav links, forms, and other content for toggling --><div class=\"collapse filters-navbar-collapse\" id=\"filters-navbar-collapse\"><form name=\"filter-project-list-form\" method=\"POST\" action=\"\"><h3 class=\"project-list-filters-title\">Sort By</h3><div><select name=\"sort_by\"><option selected value=\"\">Choose</option><option value=\"sites.SiteName_asc\">Site: A-Z</option><option value=\"sites.SiteName_desc\">Site: Z-A</option><option value=\"projects.PrimarySkillNeeded_asc\">Skills Needed: A-Z</option><option value=\"projects.PrimarySkillNeeded_desc\">Skills Needed: Z-A</option><option value=\"projects.ChildFriendly_desc\">Child Friendly: Yes-No</option><option value=\"projects.ChildFriendly_asc\">Child Friendly: No-Yes</option><option value=\"PeopleNeeded_asc\">People Needed: Low to High</option><option value=\"PeopleNeeded_desc\">People Needed: High to Low</option></select></div><h3 class=\"project-list-filters-title\">Refine By</h3><div class=\"project-list-filters-wrapper\"></div></form></div><!-- /.filters-navbar-collapse --></div><!-- /.container-fluid --></nav><div class=\"col-sm-9 col-lg-10 project-list-wrapper table-responsive\"><table class=\"project-list table table-condensed table-striped\"></table></div></div>"
                    );
