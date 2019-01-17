(function (App) {


/**
     * Bootstap Backbone models & collections for initial page load
     */

    App.Vars.appInitialData = {"random":90419348,"all_projects":[{"ProjectID":493,"SiteName":"Bannach Elementary School","ProjectDescription":"The location is in the hallway very near the main office. I believe the hallway runs east. The tallest tree should be around 88\u0022, shorter is alright. Should look similar to the blue ribbon school of excellence tree. and the wall will need to be cleaned before the tree is painted.","PrimarySkillNeeded":"3","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":494,"SiteName":"Bannach Elementary School","ProjectDescription":"3 targets for throwing balls at are to be painted on the south half green wall on the playground behind the school. See Deb Neff for the designs that she would like painted on the wall.","PrimarySkillNeeded":"3","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":495,"SiteName":"Bannach Elementary School","ProjectDescription":"Paint playground equipment behind the school. Start with the faded out firetruck. It is currently pink. They want it painted red again. Chip or wire brush and loose paint off the structure and repaint it red. If there is extra time when the firetruck is finished then move on to the other playground equipment and cover over any chipped paint.","PrimarySkillNeeded":"3","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":497,"SiteName":"Bannach Elementary School","ProjectDescription":"The little free library is out front of the school. It is to be cleaned up and repainted cream and maroon.","PrimarySkillNeeded":"3","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":446,"SiteName":"Ben Franklin Junior High","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":453,"SiteName":"Ben Franklin Junior High","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":454,"SiteName":"Ben Franklin Junior High","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":457,"SiteName":"Ben Franklin Junior High","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":458,"SiteName":"Ben Franklin Junior High","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":459,"SiteName":"Ben Franklin Junior High","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":461,"SiteName":"Ben Franklin Junior High","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":462,"SiteName":"Ben Franklin Junior High","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":463,"SiteName":"Ben Franklin Junior High","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":464,"SiteName":"Ben Franklin Junior High","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":465,"SiteName":"Ben Franklin Junior High","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":466,"SiteName":"Ben Franklin Junior High","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":467,"SiteName":"Ben Franklin Junior High","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":468,"SiteName":"Ben Franklin Junior High","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":469,"SiteName":"Ben Franklin Junior High","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":502,"SiteName":"Boston School Forest","ProjectDescription":"Build 16-20 Leopold benches for \u0022nature nook\u0022 areas throughout the forest. Give benches first coat of polyurethane.","PrimarySkillNeeded":"6","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":503,"SiteName":"Boston School Forest","ProjectDescription":"Build and install archery racks in new shed if not yet completed. Help move in.","PrimarySkillNeeded":"6","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":505,"SiteName":"Boston School Forest","ProjectDescription":"Complete outhouse soffits and facia after roof... replaced in 2018.","PrimarySkillNeeded":"5","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":418,"SiteName":"Boston School Forest","ProjectDescription":"","PrimarySkillNeeded":"4","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":501,"SiteName":"Boston School Forest","ProjectDescription":"Spread woodchips from piles and chipper product on trails, rake, move rocks, etc.","PrimarySkillNeeded":"4","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":504,"SiteName":"Boston School Forest","ProjectDescription":"Level ground around new shed and ampitheater. Spread mulch for finished look.","PrimarySkillNeeded":"4","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":420,"SiteName":"Boston School Forest","ProjectDescription":"Paint 2nd coat on new archery shed built in 2018; we have the paint already.","PrimarySkillNeeded":"3","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":414,"SiteName":"Jefferson Elementary School","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":416,"SiteName":"Jefferson Elementary School","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":419,"SiteName":"Jefferson Elementary School","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":421,"SiteName":"Jefferson Elementary School","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":491,"SiteName":"Jefferson Elementary School","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":492,"SiteName":"Jefferson Elementary School","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":441,"SiteName":"Kennedy Elementary School","ProjectDescription":"100\u0022 x 40\u0022   Shelves at 10\u0022, 20\u0022, 30\u0022\n\nOak wood with a poly finish\nSemi-gloss\nAdjustable Shelves \n\nNeeds to hold book baskets that are 10\u0022 wide x 16\u0022 deep","PrimarySkillNeeded":"5","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":444,"SiteName":"Kennedy Elementary School","ProjectDescription":"The staff is looking for two larger storage solutions for paper work and health supplies.  One in the main health room, and another cabinet in the health bathroom. \n\nMain Health Room:\nCurrently, they only have one section of cabinets on the wall in the main health room, and they are looking to add additional cabinet space on the far wall.  They are wanting the existing metal wall cabinet removed, and a new wooden one built that would be much larger.   If we could add locks to the doors , that would be \u0027blue sky\u0027 wishes. \n\nThey did not have specifics on size or finishes, just that they would like it to be bigger than the existing metal cabinet and either painted or polyed.  Staff mentioned that they wanted to be sure there was enough headroom for people lying on the bed. \n\nHealth Bathroom:\nThey would like an additional permanent cabinet on one of the walls in the bathroom.  Preferably the wall next to the existing floor cabinet, that is near the toilet.  Need to be sure there is enough head room for someone using the toilet.","PrimarySkillNeeded":"5","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":443,"SiteName":"Kennedy Elementary School","ProjectDescription":"Plant 3 to 4 new trees on the 3-6th grade playground.  The trees will be purchased already (PTO), and will be on site.  SIA will need to plant them.\n\nLay new wood chips  under the school sign in the front of the building, and also throughout the back landscaping (where work was done last year - by the track).  If there are extra wood chips, border the trees on the playground.  \n\n** Note:  wood chips will need to border the gaga pit too.  This will be listed on the gaga pit project too. \n\nClean out and tidy up the flower beds in these areas as well.  \n\n** Note:  avoid the small strip of landscaping near the front door, that lines the front of the school.  FHA handles this area, and they would like to continue to do so.","PrimarySkillNeeded":"4","ChildFriendly":1,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":439,"SiteName":"Kennedy Elementary School","ProjectDescription":"Located on the 3-6th grade playground.  \n* Will follow the specs and materials from Jefferson\u0027s Pit","PrimarySkillNeeded":"2","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":445,"SiteName":"Kennedy Elementary School","ProjectDescription":"54\u0022 max height\nAt least a 6 x 5 grid for awards (standard paper size awards 8 x 11)\nPlexiglass surface","PrimarySkillNeeded":"2","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":440,"SiteName":"Kennedy Elementary School","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":442,"SiteName":"Kennedy Elementary School","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":399,"SiteName":"Madison Elementary School","ProjectDescription":"Paint the room. 29\u0027X 4\u0022 X 30\u0027, 1.5 walls foldable - Paint, 1\/2 wall includes window, 1 wall cabinets, 1 wall whiteboard.","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":455,"SiteName":"Madison Elementary School","ProjectDescription":"Additional book bins for the picture book section of the library. Match bin previously built by Doug Schneider. 2\u0027X3\u0027 H X4\u0027-2\u0027 L X 2\u0027 - O\u0022 W. Have all 4 wheels turn.\u00a0","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":456,"SiteName":"Madison Elementary School","ProjectDescription":"Bookshelf for Room 118, grades 4-6. Library books on each shelf (multiple shelves)\nWood is great. 5\u0027-O\u0022 X 3\u0027- 0\u0022","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":460,"SiteName":"Madison Elementary School","ProjectDescription":"Large shelving unit to be built and placed in the back of the room to hold drums (30 tall tubanos). Unit to cover the world map. \n\n16\u0022 X 27\u0022 (Ht)\n(dia)\n17\u0022X25\u0022 (Ht)\n(dia)\n\nPlace a curtain across the shelves. \n\nWall opening = 88\u0022 (Ht) X 13\u0027 - 2\u0022 (L)","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":470,"SiteName":"Madison Elementary School","ProjectDescription":"Fix several bookshelves.\n 1 to replace = 1\u0027 deep x 25\u0022 wide x 36\u0022 T (2 photos)\nBack repair = 35 1\/\/2\u0022 W X 24 1\/2\u0022 T (2 photos)\n                            24 1\/2\u0022 W X 47 1\/2\u0022 T (2 photos)\nRepair bottom of shelves so books do not fall through (2 photos)","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":485,"SiteName":"Madison Elementary School","ProjectDescription":"Gym record board for fitness and 5\/6 Track Meet\n-Jefferson - Wood\/Plexiglass\n-Prefer in the red area (4 blocks) = 32\u0022","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":415,"SiteName":"McDill Elementary School","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":447,"SiteName":"McDill Elementary School","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":448,"SiteName":"McDill Elementary School","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":449,"SiteName":"McDill Elementary School","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":450,"SiteName":"McDill Elementary School","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":451,"SiteName":"McDill Elementary School","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":452,"SiteName":"McDill Elementary School","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":406,"SiteName":"McKinley Center Elementary","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":413,"SiteName":"McKinley Center Elementary","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":417,"SiteName":"McKinley Center Elementary","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":438,"SiteName":"McKinley Center Elementary","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":476,"SiteName":"P. J. Jacobs Junior High","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":477,"SiteName":"P. J. Jacobs Junior High","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":478,"SiteName":"P. J. Jacobs Junior High","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":479,"SiteName":"P. J. Jacobs Junior High","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":480,"SiteName":"P. J. Jacobs Junior High","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":481,"SiteName":"P. J. Jacobs Junior High","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":482,"SiteName":"P. J. Jacobs Junior High","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":483,"SiteName":"P. J. Jacobs Junior High","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":402,"SiteName":"Plover-Whiting Elementary","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":403,"SiteName":"Plover-Whiting Elementary","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":404,"SiteName":"Plover-Whiting Elementary","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":405,"SiteName":"Plover-Whiting Elementary","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":409,"SiteName":"Plover-Whiting Elementary","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":410,"SiteName":"Plover-Whiting Elementary","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":484,"SiteName":"Plover-Whiting Elementary","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":489,"SiteName":"Roosevelt Elementary School","ProjectDescription":"","PrimarySkillNeeded":"1","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":490,"SiteName":"Roosevelt Elementary School","ProjectDescription":"","PrimarySkillNeeded":"1","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":488,"SiteName":"Roosevelt Elementary School","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":471,"SiteName":"Stevens Point Area Senior High","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":473,"SiteName":"Stevens Point Area Senior High","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":474,"SiteName":"Stevens Point Area Senior High","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":475,"SiteName":"Stevens Point Area Senior High","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":498,"SiteName":"Stevens Point Area Senior High","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":499,"SiteName":"Stevens Point Area Senior High","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":422,"SiteName":"Washington Elementary School","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":423,"SiteName":"Washington Elementary School","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":424,"SiteName":"Washington Elementary School","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":425,"SiteName":"Washington Elementary School","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":426,"SiteName":"Washington Elementary School","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":427,"SiteName":"Washington Elementary School","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":428,"SiteName":"Washington Elementary School","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":429,"SiteName":"Washington Elementary School","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":430,"SiteName":"Washington Elementary School","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":431,"SiteName":"Washington Elementary School","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":432,"SiteName":"Washington Elementary School","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":433,"SiteName":"Washington Elementary School","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":434,"SiteName":"Washington Elementary School","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":435,"SiteName":"Washington Elementary School","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":436,"SiteName":"Washington Elementary School","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":437,"SiteName":"Washington Elementary School","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4},{"ProjectID":472,"SiteName":"Washington Elementary School","ProjectDescription":"","PrimarySkillNeeded":"","ChildFriendly":0,"VolunteersNeededEst":20,"VolunteersAssigned":16,"PeopleNeeded":4}],"project":[],"select_options":{"ProjectSkillNeededOptions":{"Construction":2,"Painting":3,"Landscaping":4,"Finish Carpentry":5,"General Carpentry":6,"Cabinetry":7,"General":8,"Cleaning":9}},"bIsLocalEnv":true,"auth":[],"project_volunteers":[],"volunteers":[],"projectFilters":{"site":[{"filterIcon":"","filterName":"filter[site][]","filterId":"filter_site_1","filterLabel":"Bannach Elementary School","FilterIsChecked":"","Field":"sites.SiteName","FieldID":1},{"filterIcon":"","filterName":"filter[site][]","filterId":"filter_site_2","filterLabel":"Ben Franklin Junior High","FilterIsChecked":"","Field":"sites.SiteName","FieldID":2},{"filterIcon":"","filterName":"filter[site][]","filterId":"filter_site_3","filterLabel":"Boston School Forest","FilterIsChecked":"","Field":"sites.SiteName","FieldID":3},{"filterIcon":"","filterName":"filter[site][]","filterId":"filter_site_5","filterLabel":"Jefferson Elementary School","FilterIsChecked":"","Field":"sites.SiteName","FieldID":5},{"filterIcon":"","filterName":"filter[site][]","filterId":"filter_site_6","filterLabel":"Kennedy Elementary School","FilterIsChecked":"","Field":"sites.SiteName","FieldID":6},{"filterIcon":"","filterName":"filter[site][]","filterId":"filter_site_7","filterLabel":"Madison Elementary School","FilterIsChecked":"","Field":"sites.SiteName","FieldID":7},{"filterIcon":"","filterName":"filter[site][]","filterId":"filter_site_8","filterLabel":"McDill Elementary School","FilterIsChecked":"","Field":"sites.SiteName","FieldID":8},{"filterIcon":"","filterName":"filter[site][]","filterId":"filter_site_9","filterLabel":"McKinley Center Elementary","FilterIsChecked":"","Field":"sites.SiteName","FieldID":9},{"filterIcon":"","filterName":"filter[site][]","filterId":"filter_site_10","filterLabel":"P. J. Jacobs Junior High","FilterIsChecked":"","Field":"sites.SiteName","FieldID":10},{"filterIcon":"","filterName":"filter[site][]","filterId":"filter_site_11","filterLabel":"Plover-Whiting Elementary","FilterIsChecked":"","Field":"sites.SiteName","FieldID":11},{"filterIcon":"","filterName":"filter[site][]","filterId":"filter_site_13","filterLabel":"Roosevelt Elementary School","FilterIsChecked":"","Field":"sites.SiteName","FieldID":13},{"filterIcon":"","filterName":"filter[site][]","filterId":"filter_site_14","filterLabel":"Stevens Point Area Senior High","FilterIsChecked":"","Field":"sites.SiteName","FieldID":14},{"filterIcon":"","filterName":"filter[site][]","filterId":"filter_site_15","filterLabel":"Washington Elementary School","FilterIsChecked":"","Field":"sites.SiteName","FieldID":15}],"skill":[{"filterIcon":"\u003Ci title=\u0022Construction\u0022 class=\u0022skills-icon filter-list-item-icon construction-icon\u0022\u003E\u003C\/i\u003E","filterName":"filter[skill][]","filterLabel":"Construction","filterId":"filter_skill_2","FilterIsChecked":"","Field":"projects.PrimarySkillNeeded","FieldID":2},{"filterIcon":"\u003Ci title=\u0022Finish Carpentry\u0022 class=\u0022skills-icon filter-list-item-icon finish-carpentry-icon\u0022\u003E\u003C\/i\u003E","filterName":"filter[skill][]","filterLabel":"Finish Carpentry","filterId":"filter_skill_5","FilterIsChecked":"","Field":"projects.PrimarySkillNeeded","FieldID":5},{"filterIcon":"\u003Ci title=\u0022General\u0022 class=\u0022skills-icon filter-list-item-icon general-skill-icon\u0022\u003E\u003C\/i\u003E","filterName":"filter[skill][]","filterLabel":"General","filterId":"filter_skill_8","FilterIsChecked":"","Field":"projects.PrimarySkillNeeded","FieldID":8},{"filterIcon":"\u003Ci title=\u0022General Carpentry\u0022 class=\u0022skills-icon filter-list-item-icon general-carpentry-icon\u0022\u003E\u003C\/i\u003E","filterName":"filter[skill][]","filterLabel":"General Carpentry","filterId":"filter_skill_6","FilterIsChecked":"","Field":"projects.PrimarySkillNeeded","FieldID":6},{"filterIcon":"\u003Ci title=\u0022Landscaping\u0022 class=\u0022skills-icon filter-list-item-icon landscaping-icon\u0022\u003E\u003C\/i\u003E","filterName":"filter[skill][]","filterLabel":"Landscaping","filterId":"filter_skill_4","FilterIsChecked":"","Field":"projects.PrimarySkillNeeded","FieldID":4},{"filterIcon":"\u003Ci title=\u0022Painting\u0022 class=\u0022skills-icon filter-list-item-icon painting-icon\u0022\u003E\u003C\/i\u003E","filterName":"filter[skill][]","filterLabel":"Painting","filterId":"filter_skill_3","FilterIsChecked":"","Field":"projects.PrimarySkillNeeded","FieldID":3}],"childFriendly":[{"filterIcon":"\u003Ci title=\u0022Child Friendly\u0022 class=\u0022text-danger fas fa-child\u0022\u003E\u003C\/i\u003E","filterName":"filter[childFriendly][]","filterId":"filter_childFriendly_No","filterLabel":"No","FilterIsChecked":"","Field":"projects.ChildFriendly","FieldID":""},{"filterIcon":"\u003Ci title=\u0022Child Friendly\u0022 class=\u0022text-success fas fa-child\u0022\u003E\u003C\/i\u003E","filterName":"filter[childFriendly][]","filterId":"filter_childFriendly_Yes","filterLabel":"Yes","FilterIsChecked":"","Field":"projects.ChildFriendly","FieldID":""}],"peopleNeeded":[{"filterIcon":"","filterName":"filter[peopleNeeded][]","filterId":"filter_peopleNeeded0","filterLabel":4,"FilterIsChecked":"","Field":"projects.PeopleNeeded","FieldID":""}]}};
    App.Vars.Auth = App.Vars.appInitialData['auth'];
    App.Vars.devMode = App.Vars.appInitialData['bIsLocalEnv'];
    App.Vars.selectOptions = App.Vars.appInitialData['select_options'];

    App.Models.projectModel = new App.Models.Project([]);

    /**
     * Models for the contacts and volunteer management
     */
    App.Models.volunteerModel = new App.Models.Volunteer(false);

})(window.App);
