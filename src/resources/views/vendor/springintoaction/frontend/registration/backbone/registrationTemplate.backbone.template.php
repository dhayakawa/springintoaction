<div class="row">
    <nav class="col-xs-12 col-sm-3 col-md-3 col-lg-2 filters-navbar filters-navbar-default hidden">
        <div class="container-fluid">
            <!-- Brand and toggle get grouped for better mobile display -->
            <div class="filters-navbar-header">
                <button type="button"
                        class="filters-navbar-toggle collapsed"
                        data-toggle="collapse"
                        data-target="#filters-navbar-collapse"
                        aria-expanded="false">
                    <span class="sr-only">Toggle Filters</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>
            </div>

            <!-- Collect the nav links, forms, and other content for toggling -->
            <div class="collapse filters-navbar-collapse" id="filters-navbar-collapse">
                <form name="filter-project-list-form" method="POST" action="">
                    <h3 class="project-list-filters-title">Sort By</h3>
                    <div>
                        <select name="sort_by">
                            <option selected value="">Choose</option>
                            <option value="sites.SiteName_asc">Site: A-Z</option>
                            <option value="sites.SiteName_desc">Site: Z-A</option>
                            <option value="projects.PrimarySkillNeeded_asc">Skills Needed: A-Z</option>
                            <option value="projects.PrimarySkillNeeded_desc">Skills Needed: Z-A</option>
                            <option value="projects.ChildFriendly_desc">Child Friendly: Yes-No</option>
                            <option value="projects.ChildFriendly_asc">Child Friendly: No-Yes</option>
                            <option value="PeopleNeeded_asc">People Needed: Low to High</option>
                            <option value="PeopleNeeded_desc">People Needed: High to Low</option>
                        </select>
                    </div>
                    <h3 class="project-list-filters-title">Refine By</h3>
                    <div class="project-list-filters-wrapper"></div>
                </form>
            </div><!-- /.filters-navbar-collapse -->
        </div><!-- /.container-fluid -->
    </nav>
    <div class="col-sm-9 col-lg-10 project-list-wrapper table-responsive">
        <div class="jumbotron welcome-helper">
            <h1>Welcome To Spring Into Action <%= year %></h1>
            <p class="text-center">We'll help you get started with finding a project to volunteer for by narrowing down the list.</p>
            <div id="carousel-welcome-helper" class="carousel slide">
                <!-- Wrapper for slides -->
                <div class="carousel-inner" role="listbox">
                    <div class="item active">
                        <p>Do you need to register more than 10 people?</p>
                        <div class="alert alert-danger hidden register-multiple-warning" role="alert">Sorry, at this time there are no projects that can take 10 or more people.</div>
                        <div class="carousel-caption">
                            <span class="btn btn-primary btn-lg" data-helper-question="register-multiple" data-val="yes" data-goto-number="1" role="button">Yes</span>&nbsp;<span class="btn btn-primary btn-lg" data-helper-question="register-multiple" data-val="no" data-goto-number="1" role="button">No</span><span class="btn btn-primary btn-lg hidden" data-helper-question="register-multiple" data-val="ok" data-goto-number="1" role="button">OK</span>
                        </div>
                    </div>
                    <div class="item">
                        <p>Are you looking for child friendly projects?</p>
                        <div class="alert alert-danger hidden register-child-friendly-warning" role="alert">Sorry, at this time there are no projects left that are child friendly.</div>
                        <div class="carousel-caption">
                            <span class="btn btn-primary btn-lg" data-helper-question="register-child-friendly" data-val="yes" data-goto-number="2" role="button">Yes</span>&nbsp;<span class="btn btn-primary btn-lg" data-helper-question="register-child-friendly" data-val="no" data-goto-number="2" role="button">No</span><span class="btn btn-primary btn-lg hidden" data-helper-question="register-child-friendly" data-val="ok" data-goto-number="2" role="button">OK</span>
                        </div>
                    </div>
                    <div class="item">
                        <p>If there is a specific school you would like to volunteer at?</p>
                        <div class="carousel-caption">
                            <span class="btn btn-primary btn-lg" data-helper-question="register-school" data-val="yes" data-goto-number="3" role="button">Yes</span>&nbsp;<span class="btn btn-primary btn-lg" data-helper-question="register-school" data-val="no" data-goto-number="4" role="button">No</span>
                        </div>
                    </div>
                    <div class="item">
                        <p>Choose a school from the list.</p>
                        <select name="register-school-preference" data-helper-question="register-school-preference" data-val="yes" data-goto-number="4"><option value="">Choose</option></select>
                        <div class="carousel-caption">
                            <span class="btn btn-primary btn-lg" data-helper-question="register-school-preference" data-val="skip" data-goto-number="4" role="button">Skip</span>
                        </div>
                    </div>
                    <div class="item">
                        <p class="show-project-list-intro"><span class="search-criteria-result-msg">We found <span class="welcome-helper-projects-found-amt"></span> that met your criteria.</span><br><br>When you find a project that interests you,<br>click the
                            <span class="btn btn-primary btn-sm" role="button">Register</span> button to begin the registration process.</p>

                        <div class="carousel-caption">
                            <span class="btn btn-success btn-lg" data-helper-question="show-project-list" data-val="yes" data-goto-number="0" role="button">Show me the list!</span>
                        </div>
                    </div>
                </div>
            </div>
            <button class="close close-welcome-helper" data-helper-question="skip-questions" data-val="yes" data-goto-number="0" role="button">&times;</button>
        </div>
        <table class="project-list table table-condensed table-striped hidden"></table>
    </div>
</div>
