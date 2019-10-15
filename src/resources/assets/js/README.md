# Admin

## App.Views.Backend

* Validates required options
* closes or removes View and its child Views 

## App.Views.GridManagerContainerToolbar
* Responsible for hiding edit button

Events  
``` javascript 1.6
    events: {
        'click .btnAdd': 'addGridRow',
        'click .btnEdit': 'editGridRow',
        'click .btnDeleteChecked': 'deleteCheckedRows',
        'click .btnClearStored': 'clearStoredColumnState',
    }
```



## App.Views.ManagedGrid

Events
``` javascript 1.6
    events: {
        'focusin tbody tr': 'refreshView',
        'mouseenter thead th button': 'showColumnHeaderLabel',
        'mouseenter tbody td': 'showTruncatedCellContentPopup',
        'mouseleave tbody td': 'hideTruncatedCellContentPopup',
        'click tbody td': 'hideTruncatedCellContentPopup',
        'click .overlay-top,.overlay-bottom': 'showRadioBtnEditHelpMsg',
    }
```

renderGrid(e, saveStateKey)
* Responsible for rendering backgrid
* Sets up backgrid events for inline editing and refreshing view when the backgrid collection is reset or a model in the backgrid collection is edited
* Shows a popup of cell content if some of the content is hidden

_refreshView(e) 
* Responsible for setting the current row for the grid
* Setting the model id of the current row or null if there aren't any rows, to local storage
* Positioning the overlays over the remaining grid rows to help eliminate race conditions


