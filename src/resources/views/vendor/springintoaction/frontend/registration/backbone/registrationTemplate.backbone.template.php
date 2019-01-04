<div class="row">
    <nav class="col-xs-12 col-sm-3 col-md-3 col-lg-2 filters-navbar filters-navbar-default">
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
        <table class="project-list table table-condensed table-striped"></table>
    </div>
</div>
