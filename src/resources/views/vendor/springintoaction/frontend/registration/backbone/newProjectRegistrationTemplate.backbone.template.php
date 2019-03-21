<div class="row reservation-wrapper">
    <div class="col-xs-12">
        <p class="steps-help">
            How many people would you like to register right now? They must be at least 16 years old.<br><br>
            There are currently <strong><%= volunteersNeeded %></strong> open spots. <br>
            We'll temporarily reserve the spots for you until you finish registering.<br>
            <small class="text-muted">*Children under 16 are welcome to participate even though they are not registered.</small>
        </p>
        <form autocomplete="new-project-reservation-<% print(Math.random().toString()) %>" name="newProjectReservation">
            <input type="hidden" name="_token" value="<%= CsrfToken %>">
            <input type="hidden" name="ProjectID" value="<%= ProjectID %>"/>
            <div class="form-group">
                <label for="reserve">Number of people you would like to register</label>
                <input type="text"
                    name="reserve"
                    class="form-control"
                    id="reserve"
                    placeholder="Reserve"
                    tabindex="1"
                    required pattern="[0-9]+"
                    value="1"/>
            </div>
            <button class="btn btn-primary btn-sm">Reserve and Continue</button>
        </form>
    </div>
</div>
<script type="text/javascript">document.newProjectReservation.reserve.focus();</script>
<form autocomplete="new-project-registration-<% print(Math.random().toString()) %>" method="POST" name="newProjectRegistration">
    <input type="hidden" name="_token" value="<%= CsrfToken %>">
    <input type="hidden" name="ProjectID" value="<%= ProjectID %>"/>
    <div class="registration-form-body-wrapper">
        <div class="row">
            <div class="col-xs-12">
                <div class="registration-form-project-description-panel panel panel-default">
                    <div class="panel-heading">
                        <a role="button"
                            data-toggle="collapse"
                            class="collapse-project-description"
                            href="#collapseProjectDescription"
                            aria-expanded="true"
                            aria-controls="collapseProjectDescription"><span class="glyphicon glyphicon-minus"
                                aria-hidden="true"></span></a>
                        <h3 class="panel-title registration-form-site-title"><%= SiteName %></h3>
                    </div>
                    <div class="panel-body collapse in" id="collapseProjectDescription">
                        <div class="registration-form-project-description"><%= ProjectDescription %></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-xs-12 steps-wrapper">
                <div class="col-xs-4 step-one steps active-step">
                    <h4 class="active-step">Step One</h4>
                    <small>Personal Contact Info</small>
                </div>
                <div class="col-xs-4 step-two steps">
                    <h4 class="muted-text">Step Two</h4>
                    <small>Register Others?</small>
                </div>
                <div class="col-xs-4 step-three steps">
                    <h4 class="muted-text">Finish</h4>
                    <small>Confirm and Register</small>
                </div>
            </div>
        </div>
        <ul class="nav nav-tabs" role="tablist">
            <li role="presentation" class="active"><a href="#contact-info"
                    aria-controls="contact-info"
                    role="tab"
                    data-toggle="tab">Contact Info</a></li>
            <li role="presentation"><a href="#auto-register" aria-controls="auto-register" role="tab" data-toggle="tab">register
                    others</a>
            </li>
            <li role="presentation"><a href="#confirm-submit"
                    aria-controls="confirm-submit"
                    role="tab"
                    data-toggle="tab">confirm
                    submit</a>
            </li>

        </ul>
        <div class="tab-content">
            <div role="tabpanel" class="tab-pane fade in active" id="contact-info">
                <div class="row">
                    <div class="col-xs-12">
                        <div class="step-help">
                            <div class="well well-sm">
                                Please start with filling out your personal contact information.<br>
                                If you have a Grove account, please use the email address you use to log into the Grove.<br>
                                All the fields are required.
                            </div>
                        </div>
                    </div>
                </div>
                <div class="personal-contact-info-wrapper"></div>
                <div class="row bottom-nav-btns">
                    <div class="col-sm-12 text-right">
                        <button class="register-others btn btn-default btn-sm">Register Others
                            <i class="fas fa-arrow-alt-circle-right"></i></button>&nbsp;
                        <button class="confirm-and-register btn btn-primary btn-sm">Confirm and Register
                            <i class="fas fa-arrow-alt-circle-right"></i></button>
                    </div>
                </div>
            </div>
            <div role="tabpanel" class="tab-pane fade" id="auto-register">
                <div class="row">
                    <div class="col-xs-12">
                        <div class="step-help">

                        </div>
                    </div>
                </div>
                <div class="row woodlands-only auto-register-question">
                    <div class="col-xs-12">
                        <div class="well well-sm">Please choose from the following options.</div>
                    </div>
                    <div class="col-xs-12">
                        <div class="radio">
                            <label class="auto-register-family"><input
                                    type="radio"
                                    name="register-process-type"
                                    class="auto-register"
                                    id="auto-register-family"
                                    value="family"/> I would like to import my family from the Grove.</label>
                            <label class="auto-register-lifegroup"><input
                                    type="radio"
                                    name="register-process-type"
                                    class="auto-register"
                                    id="auto-register-lifegroup"
                                    value="lifegroup"/> I would like to import my family and life group from the Grove.</label>
                            <label class="auto-register-manual"><input
                                    type="radio"
                                    name="register-process-type"
                                    class="manual-register"
                                    id="auto-register-manual"
                                    value="manual"/> I would like to enter in the contact information for everyone.</label>
                        </div>
                    </div>
                </div>
                <div class="row grove-login">
                    <div class="col-xs-4">
                        <div class="form-group">
                            <label for="inputGroveEmail">Grove Login:</label>
                            <input type="text"
                                name="GroveEmail"
                                autocomplete="new-grove-email-<% print(Math.random().toString()) %>"
                                class="form-control"
                                id="inputGroveEmail"
                                placeholder="Grove Login"
                                required
                                value=""
                            />
                        </div>
                    </div>
                    <div class="col-xs-4">
                        <div class="form-group">
                            <label for="inputGrovePassword">Grove Password:</label>
                            <input type="password"
                                name="GrovePassword"
                                autocomplete="new-grove-password-<% print(Math.random().toString()) %>"
                                class="form-control"
                                id="inputGrovePassword"
                                placeholder="Grove Password"
                                required
                                value="<%= testGrovePassword %>"
                            />
                        </div>
                    </div>
                    <div class="col-xs-4">
                        <div class="form-group">
                            <label for="submit-grove-login-btn">&nbsp;</label>
                            <button id="submit-grove-login-btn" class="submit-grove-login-btn btn btn-primary btn-sm">Import</button>
                        </div>
                    </div>
                </div>
                <div class="row register-list-msgs hidden">
                    <div class="col-xs-12">
                        <div class="well well-sm">
                            <div class="general">
                                Please only register children who are 16 and older.<br>
                                <small class="text-muted">*Children under 16 are welcome to participate even though they are not registered.</small>
                            </div>
                            <div class="grove-contacts-confirm-list-msg hidden">
                                Uncheck any people you do not need to register.
                            </div>
                            <div class="multiple-register-list-msg hidden">
                                All registration fields are required.<br>
                                If you do not have a mobile phone number you can enter your home phone number.<br>
                                If you know it, please use the email address they use to log into the Grove.<br>
                                Please delete any registration spots below that you do not need.
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row grove-register">
                    <div class="col-xs-12 table-responsive">
                        <table class="grove-contacts-confirm-list table table-striped table-condensed">
                            <tbody></tbody>
                        </table>
                    </div>
                    <div class="col-xs-12 overage-question hidden">
                        <div class="alert alert-info overage-msg">You have <span class="overage-amt"></span> extra reservation spot(s) left.<br>To keep these reservations, you will need to manually enter them now, otherwise we will release them.<br><br>Would you like to keep your extra reservations and manually enter them now?
                            <button class="btn btn-success btn-xs overage-question-yes">Yes</button>&nbsp;<button class="btn btn-danger btn-xs overage-question-no">No</button>
                        </div>
                    </div>
                </div>
                <div class="row manual-multiple-register">
                    <div class="col-xs-12">
                        <ol class="multiple-register-list"></ol>
                    </div>
                </div>
                <div class="row bottom-nav-btns">
                    <div class="col-xs-6 text-left">
                        <button class="back-to-contact-info-btn btn btn-primary btn-sm">
                            <i class="fas fa-arrow-alt-circle-left"></i> Personal Contact Info
                        </button>
                    </div>
                    <div class="col-xs-6 text-right">
                        <button class="confirm-and-register btn btn-primary btn-sm">Confirm and Register
                            <i class="fas fa-arrow-alt-circle-right"></i></button>
                    </div>
                </div>
            </div>
            <div role="tabpanel" class="tab-pane fade" id="confirm-submit">
                <div class="row">
                    <div class="col-xs-12">
                        <div class="step-help">
                            <div class="well well-sm">Please confirm everything is correct and submit. We'll be sending you a confirmation
                                email and notifications as we get closer to the date.</div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-xs-12 table-responsive">
                        <table class="project-registration-confirm-list table table-striped table-condensed">
                            <tbody></tbody>
                        </table>
                    </div>
                </div>
                <div class="row bottom-nav-btns">
                    <div class="col-xs-6 text-left">
                        <button class="back-to-contact-info-btn btn btn-primary btn-sm">
                            <i class="fas fa-arrow-alt-circle-left"></i> Personal Contact Info
                        </button>&nbsp;
                        <button class="back-to-register-others-btn btn btn-primary btn-sm">
                            <i class="fas fa-arrow-alt-circle-left"></i> Register Others
                        </button>
                    </div>
                    <div class="col-xs-6 text-right">
                        <button class="submit-registration-btn btn btn-success btn-sm">
                            <i class="fas fa-check-circle"></i> Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</form>
