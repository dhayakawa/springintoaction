/**
 * Backgrid demo implementation of multiple plugins.
 */

// Database server credentials
let restURL = "https://backgriddemo-rest.herokuapp.com/?territories=";

// Helper functions
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    let regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

let qs = (function (a) {
    if (a == "") {
        return {};
    }
    let b = {};
    for (let i = 0; i < a.length; ++i) {
        let p = a[i].split('=', 2);
        if (p.length == 1) {
            b[p[0]] = "";
        }
        else {
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
    }
    return b;
})(window.location.search.substr(1).split('&'));

// Plugin settings
let pluginSettings = {
    // Official backgrid plugins
    "backgrid-paginator": true,
    "backgrid-filter": false,
    "backgrid-select-all": true,

    // Un-official backgrid plugins
    "backgrid-columnmanager": true,
    "backgrid-grouped-columns": true,
    "backgrid-sizeable-columns": true,
    "backgrid-orderable-columns": true,
    "backgrid-advanced-filter": true
};

function initSettings() {
    // Check if there are any settings set at all in the GET parameters
    let params = qs;

    if (qs.length === 0) {
        // TODO: Check if there are saved settings

        return;
    }

    let overridden = false;
    _.each(params, function (query, key) {
        let value = query === "true";

        if (_.has(pluginSettings, key)) {
            overridden = true;
            pluginSettings[key] = value;
        }
    });

    if (overridden) {
        // Disable remaining plugins
        _.each(pluginSettings, function (value, key) {
            pluginSettings[key] = (_.has(qs, key)) ? value : false;
        });
    }
}

initSettings();

// Set checkbox values
function setCheckboxValues() {
    // Get all checkboxes and set selected value
    $("#pluginsettings input:checkbox").each(function () {
        let checkboxValue = $(this).val();

        if (_.has(pluginSettings, checkboxValue)) {
            $(this).prop('checked', pluginSettings[checkboxValue]);
        }
    });
}

setCheckboxValues();

// Create singleton column collection
let columnCol;

function getColumnCollection() {
    if (columnCol) {
        return columnCol;
    }

    let extraSettings = {
        "select-column": {
            nesting: [],
            width: 50,
            resizeAble: false,
            orderable: false
        },
        "tid": {
            width: 50,
            nesting: ["General"],
            resizeable: false,
            orderable: true
        },
        "name": {
            width: "*",
            nesting: ["General"],
            resizeable: false,
            orderable: true
        },
        "pop": {
            width: 150,
            nesting: ["Custom", "numbers"],
            resizeable: true,
            orderable: true
        },
        "percentage": {
            width: 100,
            nesting: ["Custom", "numbers"],
            resizeable: true,
            orderable: true
        },
        "date": {
            width: 100,
            nesting: ["Custom"],
            resizeable: true,
            orderable: true
        },
        "url": {
            width: "150",
            nesting: ["Custom"],
            resizeable: true,
            orderable: true
        },
        "columnmanager-header": {
            width: "58",
            nesting: [],
            resizeable: false,
            orderable: false
        }
    };

    let columnDefinition = [{
        name: "tid", // The key of the model attribute
        label: "ID", // The name to display in the header
        editable: false, // By default every cell in a column is editable, but *ID* shouldn't be
        cell: Backgrid.IntegerCell.extend({
            orderSeparator: ""
        })
    }, {
        name: "name",
        label: "Name",
        cell: "string", // This is converted to "StringCell" and a corresponding class in the Backgrid package namespace is looked up
        filterType: "string"
    }, {
        name: "pop",
        label: "Population",
        cell: "integer", // An integer cell is a number cell that displays humanized integers
        filterType: "integer"
    }, {
        name: "percentage",
        label: "% of World Population",
        cell: "number", // A cell type for floating point value, defaults to have a precision 2 decimal numbers
        filterType: "number"
    }, {
        name: "date",
        label: "Date",
        cell: "date"
    }, {
        name: "url",
        label: "URL",
        cell: "uri" // Renders the value in an HTML anchor element
    }];

    if (pluginSettings["backgrid-select-all"]) {
        columnDefinition.unshift({
            name: "select-column",
            cell: "select-row",
            headerCell: "select-all"
        });
    }

    if (pluginSettings["backgrid-columnmanager"]) {
        columnDefinition.push({
            name: "columnmanager-header",
            label: "visibility",
            cell: "boolean",
            alwaysVisible: true,
            headerCell: Backgrid.Extension.ColumnManager.ColumnVisibilityHeaderCell
        });
    }

    if (pluginSettings["backgrid-grouped-columns"]) {
        for (let i = 0; i < columnDefinition.length; i++) {
            let columnDef = columnDefinition[i];
            if (_.has(extraSettings, columnDef.name)) {
                columnDef.nesting = extraSettings[columnDef.name].nesting;
            }
        }
    }

    if (pluginSettings["backgrid-sizeable-columns"]) {
        for (let j = 0; j < columnDefinition.length; j++) {
            let column = columnDefinition[j];
            if (_.has(extraSettings, column.name)) {
                column.nesting = extraSettings[column.name].nesting;
                column.resizeable = extraSettings[column.name].resizeable;
                column.width = extraSettings[column.name].width;
            }
        }
    }

    if (pluginSettings["backgrid-orderable-columns"]) {
        for (let j = 0; j < columnDefinition.length; j++) {
            let columno = columnDefinition[j];
            if (_.has(extraSettings, columno.name)) {
                columno.orderable = extraSettings[columno.name].orderable;
            }
        }
    }

    let columns = new Backgrid.Extension.OrderableColumns.orderableColumnCollection(columnDefinition);
    columns.setPositions().sort();
    columnCol = columns;
    return columns;
}

// Create singleton data collection
let dataCol;

function getDataCollection() {
    if (dataCol) {
        return dataCol;
    }

    // Setup data
    let data = [{
        "name": "Afghanistan",
        "url": "http://en.wikipedia.org/wiki/Afghanistan",
        "pop": 25500100,
        "date": "2013-01-01",
        "percentage": 0.36,
        "tid": 1
    }, {
        "name": "Albania",
        "url": "http://en.wikipedia.org/wiki/Albania",
        "pop": 2831741,
        "date": "2011-10-01",
        "percentage": 0.04,
        "tid": 2
    }, {
        "name": "Algeria",
        "url": "http://en.wikipedia.org/wiki/Algeria",
        "pop": 37100000,
        "date": "2012-01-01",
        "percentage": 0.53,
        "tid": 3
    }, {
        "name": "American Samoa (USA)",
        "url": "http://en.wikipedia.org/wiki/American_Samoa",
        "pop": 55519,
        "date": "2010-04-01",
        "percentage": 0.00079,
        "tid": 4
    }, {
        "name": "Andorra",
        "url": "http://en.wikipedia.org/wiki/Andorra",
        "pop": 78115,
        "date": "2011-07-01",
        "percentage": 0.0011,
        "tid": 5
    }, {
        "name": "Angola",
        "url": "http://en.wikipedia.org/wiki/Angola",
        "pop": 20609294,
        "date": "2012-07-01",
        "percentage": 0.29,
        "tid": 6
    }, {
        "name": "Anguilla (UK)",
        "url": "http://en.wikipedia.org/wiki/Anguilla",
        "pop": 13452,
        "date": "2011-05-11",
        "percentage": 0.00019,
        "tid": 7
    }, {
        "name": "Antigua and Barbuda",
        "url": "http://en.wikipedia.org/wiki/Antigua_and_Barbuda",
        "pop": 86295,
        "date": "2011-05-27",
        "percentage": 0.0012,
        "tid": 8
    }, {
        "name": "Argentina",
        "url": "http://en.wikipedia.org/wiki/Argentina",
        "pop": 40117096,
        "date": "2010-10-27",
        "percentage": 0.57,
        "tid": 9
    }, {
        "name": "Armenia",
        "url": "http://en.wikipedia.org/wiki/Armenia",
        "pop": 3275700,
        "date": "2012-06-01",
        "percentage": 0.046,
        "tid": 10
    }, {
        "name": "Aruba (Netherlands)",
        "url": "http://en.wikipedia.org/wiki/Aruba",
        "pop": 101484,
        "date": "2010-09-29",
        "percentage": 0.0014,
        "tid": 11
    }, {
        "name": "Australia",
        "url": "http://en.wikipedia.org/wiki/Australia",
        "pop": 22808690,
        "date": "2012-11-11",
        "percentage": 0.32,
        "tid": 12
    }, {
        "name": "Austria",
        "url": "http://en.wikipedia.org/wiki/Austria",
        "pop": 8452835,
        "date": "2012-07-01",
        "percentage": 0.12,
        "tid": 13
    }, {
        "name": "Azerbaijan",
        "url": "http://en.wikipedia.org/wiki/Azerbaijan",
        "pop": 9235100,
        "date": "2012-01-01",
        "percentage": 0.13,
        "tid": 14
    }, {
        "name": "Bahamas",
        "url": "http://en.wikipedia.org/wiki/The_Bahamas",
        "pop": 353658,
        "date": "2010-05-03",
        "percentage": 0.005,
        "tid": 15
    }, {
        "name": "Bahrain",
        "url": "http://en.wikipedia.org/wiki/Bahrain",
        "pop": 1234571,
        "date": "2010-04-27",
        "percentage": 0.018,
        "tid": 16
    }, {
        "name": "Bangladesh",
        "url": "http://en.wikipedia.org/wiki/Bangladesh",
        "pop": 152518015,
        "date": "2012-07-16",
        "percentage": 2.16,
        "tid": 17
    }, {
        "name": "Barbados",
        "url": "http://en.wikipedia.org/wiki/Barbados",
        "pop": 274200,
        "date": "2010-07-01",
        "percentage": 0.0039,
        "tid": 18
    }, {
        "name": "Belarus",
        "url": "http://en.wikipedia.org/wiki/Belarus",
        "pop": 9459000,
        "date": "2012-09-01",
        "percentage": 0.13,
        "tid": 19
    }, {
        "name": "Belgium",
        "url": "http://en.wikipedia.org/wiki/Belgium",
        "pop": 10839905,
        "date": "2010-01-01",
        "percentage": 0.15,
        "tid": 20
    }, {
        "name": "Belize",
        "url": "http://en.wikipedia.org/wiki/Belize",
        "pop": 312971,
        "date": "2010-05-12",
        "percentage": 0.0044,
        "tid": 21
    }, {
        "name": "Benin",
        "url": "http://en.wikipedia.org/wiki/Benin",
        "pop": 9352000,
        "date": "2012-07-01",
        "percentage": 0.13,
        "tid": 22
    }, {
        "name": "Bermuda (UK)",
        "url": "http://en.wikipedia.org/wiki/Bermuda",
        "pop": 64237,
        "date": "2010-05-20",
        "percentage": 0.00091,
        "tid": 23
    }, {
        "name": "Bhutan",
        "url": "http://en.wikipedia.org/wiki/Bhutan",
        "pop": 720679,
        "date": "2012-07-01",
        "percentage": 0.01,
        "tid": 24
    }, {
        "name": "Bolivia",
        "url": "http://en.wikipedia.org/wiki/Bolivia",
        "pop": 10426155,
        "date": "2010-07-01",
        "percentage": 0.15,
        "tid": 25
    }, {
        "name": "Bosnia and Herzegovina",
        "url": "http://en.wikipedia.org/wiki/Bosnia_and_Herzegovina",
        "pop": 3868621,
        "date": "2012-06-30",
        "percentage": 0.055,
        "tid": 26
    }, {
        "name": "Botswana",
        "url": "http://en.wikipedia.org/wiki/Botswana",
        "pop": 2024904,
        "date": "2011-08-22",
        "percentage": 0.029,
        "tid": 27
    }, {
        "name": "Brazil",
        "url": "http://en.wikipedia.org/wiki/Brazil",
        "pop": 193946886,
        "date": "2012-07-01",
        "percentage": 2.75,
        "tid": 28
    }, {
        "name": "British Virgin Islands (UK)",
        "url": "http://en.wikipedia.org/wiki/British_Virgin_Islands",
        "pop": 29537,
        "date": "2010-07-01",
        "percentage": 0.00042,
        "tid": 29
    }, {
        "name": "Brunei",
        "url": "http://en.wikipedia.org/wiki/Brunei",
        "pop": 393162,
        "date": "2011-06-20",
        "percentage": 0.0056,
        "tid": 30
    }, {
        "name": "Bulgaria",
        "url": "http://en.wikipedia.org/wiki/Bulgaria",
        "pop": 7364570,
        "date": "2011-02-01",
        "percentage": 0.1,
        "tid": 31
    }];

    let dataCollection = (pluginSettings["backgrid-paginator"]) ?
        new Backbone.PageableCollection(data, {
            state: {
                pageSize: 15
            },
            mode: "client" // page entirely on the client side
        }) : new Backbone.Collection(data);

    return dataCollection;
}

// Render the grid
function renderGrid(gridContainerId) {
    let gridObjects = {
        elId: gridContainerId
    };

    // Empty DOM
    $(gridContainerId).empty();

    // Get column collection
    let columnCollection = getColumnCollection();

    // Get data collection
    let dataCollection = getDataCollection();

    // backgrid-columnmanager enabled?
    let colManager;
    if (pluginSettings["backgrid-columnmanager"]) {
        colManager = new Backgrid.Extension.ColumnManager(columnCollection, {
            initialColumnsVisible: 4,
            saveState: true,
            loadStateOnInit: App.Vars.bBackgridColumnManagerLoadStateOnInit
        });
    }

    // backgrid-advanced-filter enabled?
    if (pluginSettings["backgrid-advanced-filter"]) {
        let $info = $("<hr><p><strong>Advanced-filter notes:</strong><br/>" +
            "Filter will be applied when 'apply' is clicked. The 'save' button will save the filter (session only in this demo) and output the result to the console. " +
            "Please note that the database is hosted through a free heroku/mongolab instance. This means that the initial filter" +
            "action might take a while because the instance might have to spin up when it has been idle for a while. Reference " +
            "backend implementation can be found <a href\"https://github.com/WRidder/backgrid-demo-server\">here</a>." +
            "</p><hr>");

        // Initialize a client-side filter to filter on the client
        // mode pageable collection's cache.
        let advancedFilter = gridObjects.advancedFilter = new Backgrid.Extension.AdvancedFilter.Main({
            collection: dataCollection,
            columns: columnCollection
        });

        // Render the filter
        let $advancedFilterContainer = $("<div class='advanced-filter-container'></div>").appendTo($(gridContainerId));
        $advancedFilterContainer.append(advancedFilter.render().el);
        $advancedFilterContainer.append($info);

        // Bind to save event as per example
        advancedFilter.on("filter:save", function (filterId, filterModel) {
            console.log("Currently active filter saved. ");
            console.log(" >> Filter model: ", filterModel);
            console.log(" >> Filter export as object: ", filterModel.exportFilter("mongo"));
            console.log(" >> Filter export as string: ", filterModel.exportFilter("mongo", true));
        });

        let dataFiltered = false;
        advancedFilter.on("filter:apply", _.debounce(function (filterId, filterModel) {
            let requestFilter = filterModel.exportFilter("mongo", true);
            let encodedFilter = encodeURIComponent(requestFilter);
            console.log("Applying filter: ", requestFilter);

            // Set opacity of grid while loading
            $(gridContainerId).fadeTo("fast", 0.33);

            $.getJSON(restURL + encodedFilter, function (data) {
                // Parse data
                let resultData = [];
                _.each(data, function (obj) {
                    delete obj._id;
                    resultData.push(obj);
                });

                console.log("Filtered data loaded: ", resultData, "for filter: ", requestFilter);
                if (pluginSettings["backgrid-paginator"]) {
                    dataCollection.fullCollection.reset(resultData);
                }
                else {
                    dataCollection.reset(resultData);
                }
                $(gridContainerId).fadeTo("fast", 1);
                dataFiltered = true;
            });
        }), 2000, true);

        // Reset data on filter close and/or filter loaded
        advancedFilter.on("filter:close filter:loaded filter:remove", _.debounce(function () {
            if (dataFiltered) {
                console.log("Filter closed/loaded/removed resetting data.");

                // Set opacity of grid while loading
                $(gridContainerId).fadeTo("fast", 0.33);

                $.getJSON(restURL + encodeURIComponent("{}"), function (data) {
                    // Parse data
                    let resultData = [];
                    _.each(data, function (obj) {
                        delete obj._id;
                        resultData.push(obj);
                    });

                    console.log("Original data loaded: ", resultData);
                    if (pluginSettings["backgrid-paginator"]) {
                        dataCollection.fullCollection.reset(resultData);
                    }
                    else {
                        dataCollection.reset(resultData);
                    }
                    $(gridContainerId).fadeTo("fast", 1);
                    dataFiltered = false;
                });
            }
        }), 2000, true);
    }
    else if (pluginSettings["backgrid-filter"]) {
        // backgrid-filter enabled?
        // Initialize a client-side filter to filter on the client
        // mode pageable collection's cache.
        let filter = gridObjects.filter = new Backgrid.Extension.ClientSideFilter({
            collection: dataCollection,
            fields: ['name']
        });

        // Render the filter
        let $filterContainer = $("<div id='filter-container'></div>").appendTo($(gridContainerId));
        $filterContainer.append(filter.render().el);

        // Add some space to the filter and move it to the right
        $(filter.el).css({float: "right", margin: "20px"});
    }

    let Header = Backgrid.Header;
    if (pluginSettings["backgrid-grouped-columns"]) {
        Header = Backgrid.Extension.GroupedHeader;
    }

    // Initialize a new Grid instance
    let grid = gridObjects.grid = new Backgrid.Grid({
        header: Header,
        columns: columnCollection,
        collection: dataCollection
    });

    // Render the grid
    let $grid = $("<div></div>").appendTo(gridContainerId).append(grid.render().el);

    // backgrid-paginator enabled?
    if (pluginSettings["backgrid-paginator"]) {
        // Initialize the paginator
        let paginator = new Backgrid.Extension.Paginator({
            collection: dataCollection
        });

        // Render the paginator
        $grid.after(paginator.render().el);
    }

    if (pluginSettings["backgrid-sizeable-columns"] || pluginSettings["backgrid-orderable-columns"]) {
        // Add sizeable columns
        let sizeAbleCol = new Backgrid.Extension.SizeAbleColumns({
            collection: dataCollection,
            columns: columnCollection,
            grid: grid
        });
        $grid.find('thead').before(sizeAbleCol.render().el);

        if (pluginSettings["backgrid-sizeable-columns"]) {
            // Add resize handlers
            let sizeHandler = new Backgrid.Extension.SizeAbleColumnsHandlers({
                sizeAbleColumns: sizeAbleCol,
                saveColumnWidth: true
            });
            $grid.find('thead').before(sizeHandler.render().el);
        }

        if (pluginSettings["backgrid-orderable-columns"]) {
            // Make columns reorderable
            let orderHandler = new Backgrid.Extension.OrderableColumns({
                grid: grid,
                sizeAbleColumns: sizeAbleCol
            });
            $grid.find('thead').before(orderHandler.render().el);
        }
    }

    return gridObjects;
}

// Init
let gridObjects1 = renderGrid("#grid-container1");
let gridObjects2 = renderGrid("#grid-container2");

// Watch for changes
// On change, change query string containing only activated plugins
$("#pluginsettings input:checkbox").change(function () {
    if (_.has(pluginSettings, $(this).val())) {
        // Update setting
        pluginSettings[$(this).val()] = $(this).prop('checked');

        // Create query string
        let queryString = $.param(pluginSettings);

        // Update query string (will re-render the page) if no pushState is available.
        document.location = "?" + queryString;
    }
});

$("#btnLogStored").click(function () {
    console.log(JSON.parse(localStorage.getItem("backgrid-colmgr")));
});

$("#btnClearStored").click(function () {
    localStorage.clear();
});

let indx = 1;
$("#btnAddColumn").click(function () {
    let columns = getColumnCollection();
    columns.add({
        name: "rndm" + indx,
        label: "Rndm #" + indx++,
        cell: "string",
        resizeable: true,
        orderable: true,
        nesting: ["random"],
        width: 120,
        displayOrder: 8 + indx
    });
});

$("#btnRemoveColumn").click(function () {
    let columns = getColumnCollection();
    let rndmColumn = columns.find(function (column) {
        return column.get("name").search("rndm") > -1;
    });

    if (rndmColumn) {
        columns.remove(rndmColumn);
    }
    else {
        console.warn("No random column available for removal");
    }
});

$("#btnRemoveSecondGrid").click(function () {
    // Remove filter if present
    if (gridObjects2.filter) {
        gridObjects2.filter.remove();
    }

    // Remove grid instance
    gridObjects2.grid.remove();

    // Remove grid element
    $(gridObjects2.elId).remove();
});
