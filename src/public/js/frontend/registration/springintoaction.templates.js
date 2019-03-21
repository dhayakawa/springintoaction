window.JST = {};
window.JST['ajaxSpinnerTemplate'] = _.template(
                        "<div class=\"ajax-spinner-overlay\"><div id=\"floatingCirclesG\"><div class=\"f_circleG\" id=\"frotateG_01\"></div><div class=\"f_circleG\" id=\"frotateG_02\"></div><div class=\"f_circleG\" id=\"frotateG_03\"></div><div class=\"f_circleG\" id=\"frotateG_04\"></div><div class=\"f_circleG\" id=\"frotateG_05\"></div><div class=\"f_circleG\" id=\"frotateG_06\"></div><div class=\"f_circleG\" id=\"frotateG_07\"></div><div class=\"f_circleG\" id=\"frotateG_08\"></div></div></div>"
                    );
window.JST['newProjectRegistrationContactInfoForm'] = _.template(
                        "<div class=\"row\"><div class=\"col-xs-6\"><div class=\"form-group\"><label for=\"inputChurch<%= idx %>\">Church</label><select name=\"contact_info[<%= idx %>][Church]\" class=\"form-control\" id=\"Church<%= idx %>\" required placeholder=\"Church\"><option>Choose Church</option><option value=\"woodlands\">Woodlands Church</option><option value=\"other\">Other</option></select></div></div><div class=\"col-xs-6\"><div style=\"display:none\" class=\"form-group other-church-wrapper\"><label for=\"inputEmail<%= idx %>\">Other Church</label><input type=\"text\" name=\"contact_info[<%= idx %>][ChurchOther]\" class=\"form-control\" id=\"ChurchOther<%= idx %>\" placeholder=\"Church\" value=\"<%= testString %>\"/></div></div></div><div class=\"row\"><div class=\"col-xs-6\"><div class=\"form-group\"><label for=\"inputEmail<%= idx %>\">Email</label><input type=\"text\" name=\"contact_info[<%= idx %>][Email]\" class=\"form-control\" id=\"inputEmail<%= idx %>\" placeholder=\"Email\" required value=\"<%= testEmail %>\"/></div></div><div class=\"col-xs-6\"><div class=\"form-group\"><label for=\"inputMobilePhoneNumber<%= idx %>\">Mobile Phone Number</label><input type=\"text\" name=\"contact_info[<%= idx %>][MobilePhoneNumber]\" class=\"form-control\" id=\"inputMobilePhoneNumber<%= idx %>\" placeholder=\"Mobile Phone Number\" required value=\"<%= testMobilePhoneNumber %>\"/></div></div></div><div class=\"row\"><div class=\"col-xs-6\"><div class=\"form-group\"><label for=\"inputFirstName<%= idx %>\">First Name</label><input type=\"text\" name=\"contact_info[<%= idx %>][FirstName]\" class=\"form-control\" id=\"inputFirstName<%= idx %>\" placeholder=\"First Name\" required value=\"<%= testFirstName %>\"/></div></div><div class=\"col-xs-6\"><div class=\"form-group\"><label for=\"inputLastName<%= idx %>\">Last Name</label><input type=\"text\" name=\"contact_info[<%= idx %>][LastName]\" class=\"form-control\" id=\"inputLastName<%= idx %>\" placeholder=\"Last Name\" required value=\"<%= testLastName %>\"/></div></div></div>"
                    );
window.JST['newProjectRegistrationContactInfoTemplate'] = _.template(
                        "<div class=\"row\"><input type=\"hidden\" name=\"contact_info[<%= idx %>][groveId]\" value=\"<%= groveId %>\" /><div class=\"col-xs-6\"><div class=\"form-group\"><label for=\"inputChurch<%= idx %>\">Church</label><select name=\"contact_info[<%= idx %>][Church]\" class=\"form-control\" id=\"Church<%= idx %>\" required ><option>Choose Church</option><option <% if(Church==='woodlands'){ print('selected'); } %> value=\"woodlands\">Woodlands Church</option><option <% if(Church==='highland'){ print('selected'); } %> value=\"highland\">Highland Church</option><option <% if(Church==='city_point'){ print('selected'); } %> value=\"city_point\">City Point Church</option><option <% if(Church==='hmong_alliance'){ print('selected'); } %> value=\"hmong_alliance\">Hmong Alliance Church</option><option <% if(Church==='other'){ print('selected'); } %> value=\"other\">Other</option></select></div></div><div class=\"col-xs-6\"><div style=\"display:none\" class=\"form-group other-church-wrapper\"><label for=\"inputChurchOther<%= idx %>\">Other Church</label><input type=\"text\" name=\"contact_info[<%= idx %>][ChurchOther]\" class=\"form-control\" id=\"ChurchOther<%= idx %>\" placeholder=\"Church\" value=\"<%= ChurchOther %>\"/></div></div></div><div class=\"row\"><div class=\"col-xs-6\"><div class=\"form-group\"><label for=\"inputEmail<%= idx %>\">Email</label><input type=\"email\" name=\"contact_info[<%= idx %>][Email]\" class=\"form-control\" id=\"inputEmail<%= idx %>\" placeholder=\"Email\" required value=\"<%= Email %>\"/></div></div><div class=\"col-xs-6\"><div class=\"form-group\"><label for=\"inputMobilePhoneNumber<%= idx %>\">Mobile Phone Number</label><input type=\"tel\" name=\"contact_info[<%= idx %>][MobilePhoneNumber]\" class=\"form-control\" id=\"inputMobilePhoneNumber<%= idx %>\" placeholder=\"Mobile Phone Number\" required phoneUS value=\"<%= MobilePhoneNumber %>\"/></div></div></div><div class=\"row\"><div class=\"col-xs-6\"><div class=\"form-group\"><label for=\"inputFirstName<%= idx %>\">First Name</label><input type=\"name\" name=\"contact_info[<%= idx %>][FirstName]\" class=\"form-control\" id=\"inputFirstName<%= idx %>\" placeholder=\"First Name\" required value=\"<%= FirstName %>\"/></div></div><div class=\"col-xs-6\"><div class=\"form-group\"><label for=\"inputLastName<%= idx %>\">Last Name</label><input type=\"name\" name=\"contact_info[<%= idx %>][LastName]\" class=\"form-control\" id=\"inputLastName<%= idx %>\" placeholder=\"Last Name\" required value=\"<%= LastName %>\"/></div></div></div>"
                    );
window.JST['newProjectRegistrationTemplate'] = _.template(
                        "<div class=\"row reservation-wrapper\"><div class=\"col-xs-12\"><p class=\"steps-help\"> How many people would you like to register right now? They must be at least 16 years old.<br><small class=\"text-muted\">*Children under 16 are welcome to participate even though they are not registered.</small><br><br> There are currently <strong><%= volunteersNeeded %></strong> open spots. <br> We'll temporarily reserve the spots for you until you finish registering. </p><form autocomplete=\"new-project-reservation-<% print(Math.random().toString()) %>\" name=\"newProjectReservation\"><input type=\"hidden\" name=\"_token\" value=\"<%= CsrfToken %>\"><input type=\"hidden\" name=\"ProjectID\" value=\"<%= ProjectID %>\"/><div class=\"form-group\"><label for=\"reserve\">Number of people you would like to register</label><input type=\"text\" name=\"reserve\" class=\"form-control\" id=\"reserve\" placeholder=\"Reserve\" tabindex=\"1\" required pattern=\"[0-9]+\" value=\"1\"/></div><button class=\"btn btn-primary btn-sm\">Reserve and Continue</button></form></div></div><script type=\"text/javascript\">document.newProjectReservation.reserve.focus();</script><form autocomplete=\"new-project-registration-<% print(Math.random().toString()) %>\" method=\"POST\" name=\"newProjectRegistration\"><input type=\"hidden\" name=\"_token\" value=\"<%= CsrfToken %>\"><input type=\"hidden\" name=\"ProjectID\" value=\"<%= ProjectID %>\"/><div class=\"registration-form-body-wrapper\"><div class=\"row\"><div class=\"col-xs-12\"><div class=\"registration-form-project-description-panel panel panel-default\"><div class=\"panel-heading\"><a role=\"button\" data-toggle=\"collapse\" class=\"collapse-project-description\" href=\"#collapseProjectDescription\" aria-expanded=\"true\" aria-controls=\"collapseProjectDescription\"><span class=\"glyphicon glyphicon-minus\" aria-hidden=\"true\"></span></a><h3 class=\"panel-title registration-form-site-title\"><%= SiteName %></h3></div><div class=\"panel-body collapse in\" id=\"collapseProjectDescription\"><div class=\"registration-form-project-description\"><%= ProjectDescription %></div></div></div></div></div><div class=\"row\"><div class=\"col-xs-12 steps-wrapper\"><div class=\"col-xs-4 step-one steps active-step\"><h4 class=\"active-step\">Step One</h4><small>Personal Contact Info</small></div><div class=\"col-xs-4 step-two steps\"><h4 class=\"muted-text\">Step Two</h4><small>Register Others?</small></div><div class=\"col-xs-4 step-three steps\"><h4 class=\"muted-text\">Finish</h4><small>Confirm Registrations</small></div></div></div><ul class=\"nav nav-tabs\" role=\"tablist\"><li role=\"presentation\" class=\"active\"><a href=\"#contact-info\" aria-controls=\"contact-info\" role=\"tab\" data-toggle=\"tab\">Contact Info</a></li><li role=\"presentation\"><a href=\"#auto-register\" aria-controls=\"auto-register\" role=\"tab\" data-toggle=\"tab\">register others</a></li><li role=\"presentation\"><a href=\"#confirm-submit\" aria-controls=\"confirm-submit\" role=\"tab\" data-toggle=\"tab\">confirm submit</a></li></ul><div class=\"tab-content\"><div role=\"tabpanel\" class=\"tab-pane fade in active\" id=\"contact-info\"><div class=\"row\"><div class=\"col-xs-12\"><div class=\"step-help\"><div class=\"well well-sm\"> Please start with filling out your personal contact information.<br> If you have a Grove account, please use the email address you use to log into the Grove.<br> All the fields are required. </div></div></div></div><div class=\"personal-contact-info-wrapper\"></div><div class=\"row bottom-nav-btns\"><div class=\"col-sm-12 text-right\"><button class=\"register-others btn btn-default btn-sm\">Register Others <i class=\"fas fa-arrow-alt-circle-right\"></i></button>&nbsp; <button class=\"confirm-and-register btn btn-primary btn-sm\">Confirm Registrations <i class=\"fas fa-arrow-alt-circle-right\"></i></button></div></div></div><div role=\"tabpanel\" class=\"tab-pane fade\" id=\"auto-register\"><div class=\"row\"><div class=\"col-xs-12\"><div class=\"step-help\"></div></div></div><div class=\"row woodlands-only auto-register-question\"><div class=\"col-xs-12\"><div class=\"well well-sm\">Please choose from the following options.</div></div><div class=\"col-xs-12\"><div class=\"radio\"><label class=\"auto-register-family\"><input type=\"radio\" name=\"register-process-type\" class=\"auto-register\" id=\"auto-register-family\" value=\"family\"/> I would like to import my family from the Grove.</label><label class=\"auto-register-lifegroup\"><input type=\"radio\" name=\"register-process-type\" class=\"auto-register\" id=\"auto-register-lifegroup\" value=\"lifegroup\"/> I would like to import my family and life group from the Grove.</label><label class=\"auto-register-manual\"><input type=\"radio\" name=\"register-process-type\" class=\"manual-register\" id=\"auto-register-manual\" value=\"manual\"/> I would like to enter in the contact information for everyone.</label></div></div></div><div class=\"row grove-login\"><div class=\"col-xs-4\"><div class=\"form-group\"><label for=\"inputGroveEmail\">Grove Login:</label><input type=\"text\" name=\"GroveEmail\" autocomplete=\"new-grove-email-<% print(Math.random().toString()) %>\" class=\"form-control\" id=\"inputGroveEmail\" placeholder=\"Grove Login\" required value=\"\" /></div></div><div class=\"col-xs-4\"><div class=\"form-group\"><label for=\"inputGrovePassword\">Grove Password:</label><input type=\"password\" name=\"GrovePassword\" autocomplete=\"new-grove-password-<% print(Math.random().toString()) %>\" class=\"form-control\" id=\"inputGrovePassword\" placeholder=\"Grove Password\" required value=\"<%= testGrovePassword %>\" /></div></div><div class=\"col-xs-4\"><div class=\"form-group\"><label for=\"submit-grove-login-btn\">&nbsp;</label><button id=\"submit-grove-login-btn\" class=\"submit-grove-login-btn btn btn-primary btn-sm\">Import</button></div></div></div><div class=\"row register-list-msgs hidden\"><div class=\"col-xs-12\"><div class=\"well well-sm\"><div class=\"general\"> Please only register children who are 16 and older.<br><small class=\"text-muted\">*Children under 16 are welcome to participate even though they are not registered.</small></div><div class=\"grove-contacts-confirm-list-msg hidden\"> Uncheck any people you do not need to register. </div><div class=\"multiple-register-list-msg hidden\"> All registration fields are required.<br> If you do not have a mobile phone number you can enter your home phone number.<br> If you know it, please use the email address they use to log into the Grove.<br> Please delete any registration spots below that you do not need. </div></div></div></div><div class=\"row grove-register\"><div class=\"col-xs-12 table-responsive\"><table class=\"grove-contacts-confirm-list table table-striped table-condensed\"><tbody></tbody></table></div><div class=\"col-xs-12 overage-question hidden\"><div class=\"alert alert-info overage-msg\">You have <span class=\"overage-amt\"></span> extra reservation spot(s) left.<br>To keep these reservations, you will need to manually enter them now, otherwise we will release them.<br><br>Would you like to keep your extra reservations and manually enter them now? <button class=\"btn btn-success btn-xs overage-question-yes\">Yes</button>&nbsp;<button class=\"btn btn-danger btn-xs overage-question-no\">No</button></div></div></div><div class=\"row manual-multiple-register\"><div class=\"col-xs-12\"><ol class=\"multiple-register-list\"></ol></div></div><div class=\"row bottom-nav-btns\"><div class=\"col-xs-6 text-left\"><button class=\"back-to-contact-info-btn btn btn-primary btn-sm\"><i class=\"fas fa-arrow-alt-circle-left\"></i> Personal Contact Info </button></div><div class=\"col-xs-6 text-right\"><button class=\"confirm-and-register btn btn-primary btn-sm\">Confirm Registrations <i class=\"fas fa-arrow-alt-circle-right\"></i></button></div></div></div><div role=\"tabpanel\" class=\"tab-pane fade\" id=\"confirm-submit\"><div class=\"row\"><div class=\"col-xs-12\"><div class=\"step-help\"><div class=\"well well-sm\">Please confirm everything is correct and submit. We'll be sending you a confirmation email and notifications as we get closer to the date.</div></div></div></div><div class=\"row\"><div class=\"col-xs-12 table-responsive\"><table class=\"project-registration-confirm-list table table-striped table-condensed\"><tbody></tbody></table></div></div><div class=\"row bottom-nav-btns\"><div class=\"col-xs-6 text-left\"><button class=\"back-to-contact-info-btn btn btn-primary btn-sm\"><i class=\"fas fa-arrow-alt-circle-left\"></i> Personal Contact Info </button>&nbsp; <button class=\"back-to-register-others-btn btn btn-primary btn-sm\"><i class=\"fas fa-arrow-alt-circle-left\"></i> Register Others </button></div><div class=\"col-xs-6 text-right\"><button class=\"submit-registration-btn btn btn-success btn-sm\"><i class=\"fas fa-check-circle\"></i> Submit </button></div></div></div></div></div></form>"
                    );
window.JST['projectListFilterGroupTemplate'] = _.template(
                        "<h3 class=\"project-list-filter-title\"><%= filterGroupName %></h3><ul class=\"project-list-filters\"></ul>"
                    );
window.JST['projectListFilterItemTemplate'] = _.template(
                        "<label><%= filterIcon %><input data-field=\"<%= Field %>\" type=\"<%= inputType %>\" <%= bFilterIsChecked ? 'checked' : '' %> name=\"<%= filterName %>\" id=\"<%= filterId %>\" value=\"<%= filterValue %>\"/><%= filterLabel %></label>"
                    );
window.JST['projectListFilterOptionItemTemplate'] = _.template(
                        "<label><%= filterIcon %><input data-field=\"<%= Field %>\" type=\"<%= inputType %>\" <%= bFilterIsChecked %> name=\"<%= filterName %>\" id=\"<%= filterId %>\" value=\"<%= filterValue %>\"/><%= filterLabel %></label>"
                    );
window.JST['projectListItemTemplate'] = _.template(
                        "<td><div class=\"row\"><div class=\"col-xs-7 col-lg-8 site-xs-col site-col\"><%= SiteName %></div><div class=\"col-xs-1 col-lg-1 skills-xs-col skills-col\"><%= SkillsNeeded %></div><div class=\"col-xs-1 col-lg-1 child-xs-col child-friendly-col\"><%= ChildFriendly %></div><div class=\"col-xs-1 col-lg-1 volunteers-xs-col volunteers-col\"><span class=\"label label-default\" title=\"# of People Needed\" data-toggle=\"tooltip\" data-placement=\"top\" ><%= VolunteersNeeded %></span></div><div class=\"col-xs-2 col-lg-1\"><button data-project-id=\"<%= ProjectID %>\" type=\"button\" class=\"btnRegister btn btn-xs btn-primary pull-right\"> Register </button></div></div><div class=\"row\"><div class=\"col-xs-12 col-lg-11 description-col\"><span class=\"project-description-label\">Description:</span><%= ProjectDescription %></div><div class=\"hidden-xs hidden-sm hidden-md col-lg-1\">&nbsp;</div></div></td>"
                    );
window.JST['registrationTemplate'] = _.template(
                        "<div class=\"row\"><nav class=\"col-xs-12 col-sm-3 col-md-3 col-lg-2 filters-navbar filters-navbar-default hidden\"><div class=\"container-fluid\"><!-- Brand and toggle get grouped for better mobile display --><div class=\"filters-navbar-header\"><button type=\"button\" class=\"filters-navbar-toggle collapsed\" data-toggle=\"collapse\" data-target=\"#filters-navbar-collapse\" aria-expanded=\"false\"><span class=\"sr-only\">Toggle Filters</span><span class=\"icon-bar\"></span><span class=\"icon-bar\"></span><span class=\"icon-bar\"></span></button></div><!-- Collect the nav links, forms, and other content for toggling --><div class=\"collapse filters-navbar-collapse\" id=\"filters-navbar-collapse\"><form name=\"filter-project-list-form\" method=\"POST\" action=\"\"><h3 class=\"project-list-filters-title\">Sort By</h3><div><select class=\"form-control\" name=\"sort_by\"><option selected value=\"\">Choose</option><option value=\"sites.SiteName_asc\">Site: A-Z</option><option value=\"sites.SiteName_desc\">Site: Z-A</option><option value=\"projects.PrimarySkillNeeded_asc\">Skills Needed: A-Z</option><option value=\"projects.PrimarySkillNeeded_desc\">Skills Needed: Z-A</option><option value=\"projects.ChildFriendly_desc\">Child Friendly: Yes-No</option><option value=\"projects.ChildFriendly_asc\">Child Friendly: No-Yes</option><option value=\"PeopleNeeded_asc\">People Needed: Low to High</option><option value=\"PeopleNeeded_desc\">People Needed: High to Low</option></select></div><button class=\"btn btn-success btn-lg show-all-projects hidden\">Show All Projects</button><h3 class=\"project-list-filters-title\">Refine By</h3><div class=\"project-list-filters-wrapper\"></div></form></div><!-- /.filters-navbar-collapse --></div><!-- /.container-fluid --></nav><div class=\"col-sm-9 col-lg-10 project-list-wrapper table-responsive\"><div class=\"jumbotron welcome-helper\"><h1>Spring Into Action <%= year %> Registration</h1><p class=\"text-center\">To help you get started, we'll ask you some questions to narrow down the list of projects.</p><div id=\"carasel-welcome-helper\" class=\"carasel slide\"><!-- Wrapper for slides --><div class=\"carasel-inner\" role=\"listbox\"><!-- 0 --><% var goTo = 1; %><div class=\"item active\" data-number=\"<%= goTo - 1 %>\" data-helper-question=\"register-skills-needed\"><p>Do you have experience in a particular area that will help us meet the needs of the schools?<br>If so, select from the list below.</p><select class=\"form-control\" name=\"register-skills-needed\" data-helper-question=\"register-skills-needed\" data-val=\"yes\" data-goto-number=\"<%= goTo %>\"><option value=\"\">Choose</option></select><div class=\"carasel-caption\"><span class=\"btn btn-primary btn-lg\" data-helper-question=\"register-skills-needed\" data-val=\"skip\" data-goto-number=\"<%= goTo %>\" role=\"button\">I don't have particular experience, but I am willing to serve God anywhere. Let's move on to the next question.</span></div></div><!-- 1 --><% goTo = 2; %><div class=\"item\" data-number=\"<%= goTo - 1 %>\" data-helper-question=\"register-school-preference\"><p>If there is a specific school you would like to volunteer at,<br>choose it from the list.</p><select class=\"form-control\" name=\"register-school-preference\" data-helper-question=\"register-school-preference\" data-val=\"yes\" data-goto-number=\"<%= goTo %>\"><option value=\"\">Choose</option></select><div class=\"carasel-caption\"><span class=\"btn btn-primary btn-lg\" data-helper-question=\"register-school-preference\" data-val=\"skip\" data-goto-number=\"<%= goTo %>\" role=\"button\">I don't have a preference, let's move to the next question</span></div></div><!-- 2 --><% goTo = 3; %><div class=\"item\" data-number=\"<%= goTo - 1 %>\" data-helper-question=\"register-multiple\"><p>Do you need to register more than 10 people?</p><div class=\"alert alert-danger hidden register-multiple-warning\" role=\"alert\">Sorry, at this time there are no projects that can take 10 or more people.</div><div class=\"carasel-caption\"><span class=\"btn btn-primary btn-lg\" data-helper-question=\"register-multiple\" data-val=\"yes\" data-goto-number=\"<%= goTo %>\" role=\"button\">Yes</span>&nbsp;<span class=\"btn btn-primary btn-lg\" data-helper-question=\"register-multiple\" data-val=\"no\" data-goto-number=\"<%= goTo %>\" role=\"button\">No</span><span class=\"btn btn-primary btn-lg hidden\" data-helper-question=\"register-multiple\" data-val=\"ok\" data-goto-number=\"<%= goTo %>\" role=\"button\">OK, let's move to the next question</span></div></div><!-- 3 --><% goTo = 4; %><div class=\"item\" data-number=\"<%= goTo - 1 %>\" data-helper-question=\"register-child-friendly\"><p>Are you looking for child friendly projects?</p><div class=\"alert alert-danger hidden register-child-friendly-warning\" role=\"alert\">Sorry, at this time there are no child friendly projects.</div><div class=\"carasel-caption\"><span class=\"btn btn-primary btn-lg\" data-helper-question=\"register-child-friendly\" data-val=\"yes\" data-goto-number=\"<%= goTo %>\" role=\"button\">Yes</span>&nbsp;<span class=\"btn btn-primary btn-lg\" data-helper-question=\"register-child-friendly\" data-val=\"no\" data-goto-number=\"<%= goTo %>\" role=\"button\">No</span><span class=\"btn btn-primary btn-lg hidden\" data-helper-question=\"register-child-friendly\" data-val=\"ok\" data-goto-number=\"<%= goTo %>\" role=\"button\">I'm totally bummed out but, I know I'll survive with God's love, let's move on.</span></div></div><!-- 4 --><% goTo = 0; %><div class=\"item\" data-number=\"4\" data-helper-question=\"show-project-list\"><p class=\"show-project-list-intro\"><span class=\"search-criteria-result-msg\">We found <span class=\"welcome-helper-projects-found-amt\"></span> that met your criteria.</span><br><br>When you find a project that interests you,<br>click the <span class=\"btn btn-primary btn-sm\" role=\"button\">Register</span> button to begin the registration process.</p><div class=\"carasel-caption\"><span class=\"btn btn-success btn-lg\" data-helper-question=\"show-project-list\" data-val=\"yes\" data-goto-number=\"<%= goTo %>\" role=\"button\">Show me the list!</span></div></div></div></div><button class=\"close close-welcome-helper\" data-helper-question=\"skip-questions\" data-val=\"yes\" data-goto-number=\"0\" role=\"button\">&times;</button></div><table class=\"project-list table table-condensed table-striped hidden\"></table></div></div>"
                    );
