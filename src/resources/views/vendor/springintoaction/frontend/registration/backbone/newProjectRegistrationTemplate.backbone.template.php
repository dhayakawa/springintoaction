<div class="row reservation-wrapper">
    <div class="col-xs-12">
        <p class="steps-help">
            How many people, 16 years old or older, would you like to register right now? There are currently <%= volunteersNeeded %> open
            spots. <br>
            We'll temporarily reserve the spots for you until you finish registering.
        </p>
        <form name="newProjectReservation">
            <input type="hidden" name="_token" value="<%= CsrfToken %>">
            <input type="hidden" name="ProjectID" value="<%= ProjectID %>" />
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
<form name="newProjectRegistration">
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
                            Please start with filling out your personal contact information. All the fields are
                            required.
                        </div>
                    </div>
                </div>
                <div class="personal-contact-info-wrapper"></div>
                <div class="row bottom-nav-btns">
                    <div class="col-sm-12 text-right">
                        <button class="register-others btn btn-default btn-sm">Register Others</button>&nbsp;
                        <button class="confirm-and-register btn btn-primary btn-sm">Confirm and Register</button>
                    </div>
                </div>
            </div>
            <div role="tabpanel" class="tab-pane fade" id="auto-register">
                <div class="row">
                    <div class="col-xs-12">
                        <div class="step-help">
                            Step help
                        </div>
                    </div>
                </div>
                <div class="row woodlands-only auto-register-question">
                    <div class="col-xs-12">
                        <div class="radio">
                            <label><input
                                    type="radio"
                                    name="register-process-type[]"
                                    class="auto-register"
                                    id="auto-register-family"
                                    value="family"/> I would you like to try and automatically register my family by logging into the Grove.</label>
                            <label><input
                                    type="radio"
                                    name="register-process-type[]"
                                    class="auto-register"
                                    id="auto-register-lifegroup"
                                    value="lifegroup"/> I would you like to try and automatically register my life group by logging into the Grove.</label>
                            <label><input
                                    type="radio"
                                    name="register-process-type[]"
                                    class="manual-register"
                                    id="auto-register-manual"
                                    value="manual"/> No, thanks, just let me enter manually enter in the contact information.</label>
                        </div>
                    </div>
                </div>
                <div class="row grove-login">
                    <div class="col-xs-4">
                        <div class="form-group">
                            <label for="inputGroveEmail">Grove Email:</label>
                            <input type="text"
                                   name="GroveEmail"
                                   class="form-control"
                                   id="inputGroveEmail"
                                   placeholder="Grove Email"
                                   required
                                   value="<%= testGroveEmail %>"/>
                        </div>
                    </div>
                    <div class="col-xs-4">
                        <div class="form-group">
                            <label for="inputGrovePassword">Grove Password:</label>
                            <input type="password"
                                   name="GrovePassword"
                                   class="form-control"
                                   id="inputGrovePassword"
                                   placeholder="Grove Password"
                                   required
                                   value="<%= testGrovePassword %>"/>
                        </div>
                    </div>
                    <div class="col-xs-4">
                        <div class="form-group">
                            <label for="submit-grove-login-btn">&nbsp;</label>
                            <button id="submit-grove-login-btn" class="submit-grove-login-btn btn btn-primary btn-sm">Login</button>
                        </div>
                    </div>
                </div>

                <div class="row grove-register">
                    <div class="col-xs-12">
                        Uncheck any people you do not need to register.
                        <table class="grove-contacts-confirm-list table table-striped table-condensed">
                            <tbody></tbody>
                        </table>
                    </div>
                </div>
                <div class="row manual-multiple-register">
                    <div class="col-xs-12">
                        <ol class="multiple-register-list"></ol>
                    </div>
                </div>
                <div class="row bottom-nav-btns">
                    <div class="col-xs-6 text-left">
                        <button class="back-to-contact-info-btn btn btn-primary btn-sm">Back to Personal Contact Info</button>
                    </div>
                    <div class="col-xs-6 text-right">
                        <button class="confirm-and-register btn btn-primary btn-sm">Confirm and Register</button>
                    </div>
                </div>
            </div>
            <div role="tabpanel" class="tab-pane fade" id="confirm-submit">
                <div class="row">
                    <div class="col-xs-12">
                        <div class="step-help">
                            Please confirm everything is correct and submit. We'll be sending you a confirmation
                            email and notifications as we get closer to the date.
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-xs-12">
                        <table class="project-registration-confirm-list table table-striped table-condensed">
                            <tbody></tbody>
                        </table>
                    </div>
                </div>
                <div class="row bottom-nav-btns">
                    <div class="col-xs-6 text-left">
                        <button class="back-to-register-others-btn btn btn-primary btn-sm">Back to Register Others</button>
                    </div>
                    <div class="col-xs-6 text-right">
                        <button class="submit-registration-btn btn btn-primary btn-sm">Register</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</form>
