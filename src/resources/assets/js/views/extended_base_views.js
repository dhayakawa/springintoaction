(function (App) {
    App.Views.Backend = Backbone.View.fullExtend({
        close: function () {
            this.remove();
            // handle other unbinding needs, here
            if (!_.isUndefined(this.childViews)) {
                _.each(this.childViews, function (childView) {
                    if (childView.close) {
                        try {
                            childView.close();
                        } catch (e) {
                        }
                    } else if (childView.remove) {
                        try {
                            childView.remove();
                        } catch (e) {
                        }
                    }
                })
            }
        },
    });
    App.Views.ManagedGrid = App.Views.Backend.fullExtend({

        refreshView: function (e) {
            let self = this;
            let currentModelID = 0;
            let $RadioElement = null;
            let $TableRowElement = null;
            _log('App.Views.ProjectTab.updateProjectTabView.event', 'event triggered:', e);
            if (typeof e === 'object' && !_.isUndefined(e.id) && !_.isUndefined(e.attributes)) {
                $RadioElement = self.$gridContainer.find('input[type="radio"][name="' + this.model.idAttribute + '"][value="' + e.id + '"]');
                $TableRowElement = $RadioElement.parents('tr');
            } else if (typeof e === 'object' && !_.isUndefined(e.target)) {
                $TableRowElement = $(e.currentTarget);
                $RadioElement = $TableRowElement.find('input[type="radio"][name="' + this.model.idAttribute + '"]');
            } else if (typeof e === 'object' && !_.isUndefined(e.data)) {
                if (self.$gridContainer.find('[type="radio"][name="' + this.model.idAttribute + '"]:checked').length === 0) {
                    $TableRowElement = self.$gridContainer.find('tbody tr:first-child');
                    $RadioElement = $TableRowElement.find('input[type="radio"]');
                } else {
                    $RadioElement = self.$gridContainer.find('[type="radio"][name="' + this.model.idAttribute + '"]:checked');
                    $TableRowElement = $RadioElement.parents('tr');
                }

            }
            self.$currentRow = $TableRowElement;

            if ($RadioElement !== null && $TableRowElement !== null) {
                // click is only a visual indication that the row is selected. nothing should be listening for this click
                $RadioElement.trigger('click');
                currentModelID = $RadioElement.val();

                // Highlight row
                $TableRowElement.siblings().removeAttr('style');
                $TableRowElement.css('background-color', App.Vars.rowBgColorSelected);

            }
            self.positionOverlays(self.backgrid);
            if (App.Vars.mainAppDoneLoading && currentModelID && $('#' + this.options.tab).data('current-model-id') !== currentModelID) {
                window.ajaxWaiting('show', self.backgridWrapperClassSelector);
                // Refresh tabs on new row select
                this.model.url = '/admin/' + self.options.tab + '/' + currentModelID;
                this.model.fetch({
                    reset: true,
                    success: function (model, response, options) {
                        self.currentModelID = self.model.get(self.model.idAttribute);
                        $('#' + self.options.tab).data('current-model-id', self.currentModelID);
                        //console.log('tab model fetch', self.options.tab, currentModelID, self.model)
                        window.ajaxWaiting('remove', self.backgridWrapperClassSelector);
                    },
                    error: function (model, response, options) {
                        window.ajaxWaiting('remove', self.backgridWrapperClassSelector);
                        growl(response.msg, 'error')
                    }
                });

            }

        },
        getModalForm: function () {
            return '';
        },
        showRadioBtnEditHelpMsg: function () {
            growl('Select/click the radio button at the beginning of the row to edit the data', 'info');
        },
        positionOverlays: function (e) {
            let self = this;
            let width, height;
            if (!_.isUndefined(self.$gridContainer)) {
                width = 0;
                self.$gridContainer.find('thead th:nth-child(n+3)').each(function (idx, el) {
                    width += parseInt($(el).outerWidth());
                });
                self.$el.find('.overlay-top,.overlay-bottom').css('width', width);
            } else {
                let ii = setInterval(function () {
                    let w = e.$el.find('thead th:nth-child(3)').outerWidth();

                    if (w > 0) {
                        width = 0;
                        e.$el.find('thead th:nth-child(n+3)').each(function (idx, el) {
                            width += parseInt($(el).outerWidth());
                        });
                        self.$el.find('.overlay-top,.overlay-bottom').css('width', width)
                        clearInterval(ii);
                    }
                }, 1000);
            }
            // get current row
            if (e && !self.$currentRow) {
                let $checkedInput = e.$el.find('[type="radio"][name$="ID"]:checked')
                if ($checkedInput.length) {
                    self.$currentRow = $checkedInput.parents('tr');
                }
            }

            if (!_.isNull(self.$currentRow) && !_.isUndefined(self.$currentRow[0])) {
                let rowHeight = self.$currentRow.outerHeight();
                let gridHeight = self.$currentRow.parents('.backgrid').outerHeight();
                //console.log('self.$currentRow', _.isUndefined(self.$currentRow[0].rowIndex), self.$currentRow)
                if (self.$el.find('table.backgrid tbody tr').length === 1) {
                    self.$el.find('.overlay-top,.overlay-bottom').hide();
                } else if (!_.isUndefined(self.$currentRow[0].rowIndex) && self.$currentRow[0].rowIndex === 1) {
                    self.$el.find('.overlay-top').hide();
                    self.$el.find('.overlay-bottom').show();
                    self.$el.find('.overlay-bottom').css({'top': (rowHeight * 2), 'height': gridHeight - (rowHeight * 2)})
                } else {
                    self.$el.find('.overlay-top').show();
                    self.$el.find('.overlay-top').css({'top': rowHeight, 'height': rowHeight * (self.$currentRow[0].rowIndex - 1)})
                    self.$el.find('.overlay-bottom').css({'top': (rowHeight * (1 + self.$currentRow[0].rowIndex)), 'height': gridHeight - (rowHeight * self.$currentRow[0].rowIndex) - rowHeight})
                }
            }
        },
        showColumnHeaderLabel: function (e) {
            let self = this;
            let $element = $(e.currentTarget).parents('th');
            let element = $element[0];

            let bOverflown = element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
            if (bOverflown) {
                $element.attr('title', $element.find('button').text());
            }
            //_log('App.Views.Projects.showColumnHeaderLabel.event', e);
        },
        showTruncatedCellContentPopup: function (e) {
            let self = this;

            let $element = $(e.currentTarget);
            let element = e.currentTarget;

            let bOverflown = element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
            if (bOverflown) {
                $element.popover({
                    placement: 'auto auto',
                    padding: 0,
                    container: 'body',
                    content: function () {
                        return $(this).text()
                    }
                });
                $element.popover('show');
            }
            //_log('App.Views.SiteVolunteer.showTruncatedCellContent.event', e, element, bOverflown);
        },
        hideTruncatedCellContentPopup: function (e) {
            let self = this;

            let $element = $(e.currentTarget);
            let element = e.currentTarget;

            let bOverflown = element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
            if (bOverflown) {
                $element.popover('hide');
            }
            //_log('App.Views.SiteVolunteer.hideTruncatedCellContent.event', e, element, bOverflown);
        },
    });
})(window.App);
