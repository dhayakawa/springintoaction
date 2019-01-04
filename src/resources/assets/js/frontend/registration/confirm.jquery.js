/* ========================================================================
 * Bootstrap: modal.js v3.3.7
 * http://getbootstrap.com/javascript/#modals
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
    'use strict';

    // MODAL CLASS DEFINITION
    // ======================

    var Confirm = function (element, options) {
        this.options = options
        this.$body = $(document.body)
        this.$element = $(element)
        this.$dialog = this.$element.find('.confirm-dialog')
        this.$backdrop = null
        this.isShown = null
        this.originalBodyPad = null
        this.scrollbarWidth = 0
        this.ignoreBackdropClick = false

        if (this.options.remote) {
            this.$element
                .find('.confirm-content')
                .load(this.options.remote, $.proxy(function () {
                    this.$element.trigger('loaded.bs.confirm')
                }, this))
        }
    }

    Confirm.VERSION = '3.3.7'

    Confirm.TRANSITION_DURATION = 300
    Confirm.BACKDROP_TRANSITION_DURATION = 150

    Confirm.DEFAULTS = {
        backdrop: true,
        keyboard: true,
        show: true
    }

    Confirm.prototype.toggle = function (_relatedTarget) {
        return this.isShown ? this.hide() : this.show(_relatedTarget)
    }

    Confirm.prototype.show = function (_relatedTarget) {
        var that = this
        var e = $.Event('show.bs.confirm', {relatedTarget: _relatedTarget})

        this.$element.trigger(e)

        if (this.isShown || e.isDefaultPrevented()) return

        this.isShown = true

        this.checkScrollbar()
        this.setScrollbar()
        this.$body.addClass('confirm-open')

        this.escape()
        this.resize()

        this.$element.on('click.dismiss.bs.confirm', '[data-dismiss="confirm"]', $.proxy(this.hide, this))

        this.$dialog.on('mousedown.dismiss.bs.confirm', function () {
            that.$element.one('mouseup.dismiss.bs.confirm', function (e) {
                if ($(e.target).is(that.$element)) that.ignoreBackdropClick = true
            })
        })

        this.backdrop(function () {
            var transition = $.support.transition && that.$element.hasClass('fade')

            if (!that.$element.parent().length) {
                that.$element.appendTo(that.$body) // don't move modals dom position
            }

            that.$element
                .show()
                .scrollTop(0)

            that.adjustDialog()

            if (transition) {
                that.$element[0].offsetWidth // force reflow
            }

            that.$element.addClass('in')

            that.enforceFocus()

            var e = $.Event('shown.bs.confirm', {relatedTarget: _relatedTarget})

            transition ?
                that.$dialog // wait for modal to slide in
                    .one('bsTransitionEnd', function () {
                        that.$element.trigger('focus').trigger(e)
                    })
                    .emulateTransitionEnd(Confirm.TRANSITION_DURATION) :
                that.$element.trigger('focus').trigger(e)
        })
    }

    Confirm.prototype.hide = function (e) {
        if (e) e.preventDefault()

        e = $.Event('hide.bs.confirm')

        this.$element.trigger(e)

        if (!this.isShown || e.isDefaultPrevented()) return

        this.isShown = false

        this.escape()
        this.resize()

        $(document).off('focusin.bs.confirm')

        this.$element
            .removeClass('in')
            .off('click.dismiss.bs.confirm')
            .off('mouseup.dismiss.bs.confirm')

        this.$dialog.off('mousedown.dismiss.bs.confirm')

        $.support.transition && this.$element.hasClass('fade') ?
            this.$element
                .one('bsTransitionEnd', $.proxy(this.hideConfirm, this))
                .emulateTransitionEnd(Confirm.TRANSITION_DURATION) :
            this.hideConfirm()
    }

    Confirm.prototype.enforceFocus = function () {
        $(document)
            .off('focusin.bs.confirm') // guard against infinite focus loop
            .on('focusin.bs.confirm', $.proxy(function (e) {
                if (document !== e.target &&
                    this.$element[0] !== e.target &&
                    !this.$element.has(e.target).length) {
                    this.$element.trigger('focus')
                }
            }, this))
    }

    Confirm.prototype.escape = function () {
        if (this.isShown && this.options.keyboard) {
            this.$element.on('keydown.dismiss.bs.confirm', $.proxy(function (e) {
                e.which == 27 && this.hide()
            }, this))
        } else if (!this.isShown) {
            this.$element.off('keydown.dismiss.bs.confirm')
        }
    }

    Confirm.prototype.resize = function () {
        if (this.isShown) {
            $(window).on('resize.bs.confirm', $.proxy(this.handleUpdate, this))
        } else {
            $(window).off('resize.bs.confirm')
        }
    }

    Confirm.prototype.hideConfirm = function () {
        var that = this
        this.$element.hide()
        this.backdrop(function () {
            that.$body.removeClass('confirm-open')
            that.resetAdjustments()
            that.resetScrollbar()
            that.$element.trigger('hidden.bs.confirm')
        })
    }

    Confirm.prototype.removeBackdrop = function () {
        this.$backdrop && this.$backdrop.remove()
        this.$backdrop = null
    }

    Confirm.prototype.backdrop = function (callback) {
        var that = this
        var animate = this.$element.hasClass('fade') ? 'fade' : ''

        if (this.isShown && this.options.backdrop) {
            var doAnimate = $.support.transition && animate

            this.$backdrop = $(document.createElement('div'))
                .addClass('confirm-backdrop ' + animate)
                .appendTo(this.$body)

            this.$element.on('click.dismiss.bs.confirm', $.proxy(function (e) {
                if (this.ignoreBackdropClick) {
                    this.ignoreBackdropClick = false
                    return
                }
                if (e.target !== e.currentTarget) return
                this.options.backdrop == 'static'
                    ? this.$element[0].focus()
                    : this.hide()
            }, this))

            if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

            this.$backdrop.addClass('in')

            if (!callback) return

            doAnimate ?
                this.$backdrop
                    .one('bsTransitionEnd', callback)
                    .emulateTransitionEnd(Confirm.BACKDROP_TRANSITION_DURATION) :
                callback()

        } else if (!this.isShown && this.$backdrop) {
            this.$backdrop.removeClass('in')

            var callbackRemove = function () {
                that.removeBackdrop()
                callback && callback()
            }
            $.support.transition && this.$element.hasClass('fade') ?
                this.$backdrop
                    .one('bsTransitionEnd', callbackRemove)
                    .emulateTransitionEnd(Confirm.BACKDROP_TRANSITION_DURATION) :
                callbackRemove()

        } else if (callback) {
            callback()
        }
    }

    // these following methods are used to handle overflowing modals

    Confirm.prototype.handleUpdate = function () {
        this.adjustDialog()
    }

    Confirm.prototype.adjustDialog = function () {
        var confirmIsOverflowing = this.$element[0].scrollHeight > document.documentElement.clientHeight

        this.$element.css({
            paddingLeft: !this.bodyIsOverflowing && confirmIsOverflowing ? this.scrollbarWidth : '',
            paddingRight: this.bodyIsOverflowing && !confirmIsOverflowing ? this.scrollbarWidth : ''
        })
    }

    Confirm.prototype.resetAdjustments = function () {
        this.$element.css({
            paddingLeft: '',
            paddingRight: ''
        })
    }

    Confirm.prototype.checkScrollbar = function () {
        var fullWindowWidth = window.innerWidth
        if (!fullWindowWidth) { // workaround for missing window.innerWidth in IE8
            var documentElementRect = document.documentElement.getBoundingClientRect()
            fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left)
        }
        this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth
        this.scrollbarWidth = this.measureScrollbar()
    }

    Confirm.prototype.setScrollbar = function () {
        var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10)
        this.originalBodyPad = document.body.style.paddingRight || ''
        if (this.bodyIsOverflowing) this.$body.css('padding-right', bodyPad + this.scrollbarWidth)
    }

    Confirm.prototype.resetScrollbar = function () {
        this.$body.css('padding-right', this.originalBodyPad)
    }

    Confirm.prototype.measureScrollbar = function () { // thx walsh
        var scrollDiv = document.createElement('div')
        scrollDiv.className = 'confirm-scrollbar-measure'
        this.$body.append(scrollDiv)
        var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
        this.$body[0].removeChild(scrollDiv)
        return scrollbarWidth
    }


    // CONFIRM PLUGIN DEFINITION
    // =======================

    function Plugin(option, _relatedTarget) {
        return this.each(function () {
            var $this = $(this)
            var data = $this.data('bs.confirm')
            var options = $.extend({}, Confirm.DEFAULTS, $this.data(), typeof option == 'object' && option)

            if (!data) $this.data('bs.confirm', (data = new Confirm(this, options)))
            if (typeof option == 'string') data[option](_relatedTarget)
            else if (options.show) data.show(_relatedTarget)
        })
    }

    var old = $.fn.confirm

    $.fn.confirm = Plugin
    $.fn.confirm.Constructor = Confirm


    // CONFIRM NO CONFLICT
    // =================

    $.fn.confirm.noConflict = function () {
        $.fn.confirm = old
        return this
    }


    // CONFIRM DATA-API
    // ==============

    $(document).on('click.bs.confirm.data-api', '[data-toggle="confirm"]', function (e) {
        var $this = $(this)
        var href = $this.attr('href')
        var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) // strip for ie7
        var option = $target.data('bs.confirm') ? 'toggle' : $.extend({remote: !/#/.test(href) && href}, $target.data(), $this.data())

        if ($this.is('a')) e.preventDefault()

        $target.one('show.bs.confirm', function (showEvent) {
            if (showEvent.isDefaultPrevented()) return // only register focus restorer if confirm will actually get shown
            $target.one('hidden.bs.confirm', function () {
                $this.is(':visible') && $this.trigger('focus')
            })
        })
        Plugin.call($target, option, this)
    })

}(jQuery);
