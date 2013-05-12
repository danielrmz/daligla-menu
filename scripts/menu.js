(function ($) {

  function log(msg) {
    if (console.log) {
      console.log(msg);
    }
  }

  /**
   * SideMenu creates a scrolling main menu sticked to the left hand side
   *
   * @constructor
   */
  function SideMenu(options) {
    var self = this;
    this._options = options || {};
    this._menuContainer = options["container"] ? $(options["container"]) :  null;
    this._default = options["default"] ? $(options["default"]) : null;

    // Initialize page events
    $(function () {
      setTimeout(function () { self.Initialize(); }, 300);
      $(window).resize(function () { self.Resize(); });
    });
  }

  SideMenu.prototype.DOWN = 1;
  SideMenu.prototype.UP = -1;
  SideMenu.prototype._options = null;
  SideMenu.prototype._menuContainer = null;
  SideMenu.prototype._initialized = false;
  SideMenu.prototype._default = null;

  /**
   * Initializes page events and initial behavior
   *
   * @this
   */
  SideMenu.prototype.Initialize = function () {
    var self = this;

    if (this._initialized) {
      return this;
    }

    self.Resize().Wave(function () { if (self._default !== null) { self.ActivateOption(self._default); } });

    var $options = self.GetOptions();

    $options.mouseenter(function (e) { self.ShowOption($(e.target)); });
    $options.mouseleave(function (e) { self.HideOption($(e.target)); });
    $options.find("a").click(function (e) { self.ActivateOption($(e.target)); });

    this._initialized = true;

    return this;
  };

  /**
   * Scrolls a certain amount of elements of the menu
   * 
   * @param {number}       amount   Ranges of 1-max
   * @param {Function}     callback
   */
  SideMenu.prototype.ScrollUp = function (amount, callback) {
    return this.Scroll(this.UP, amount, callback);
  };

  /**
   * Scrolls a certain amount of elements of the menu
   * 
   * @param {number}       amount   Ranges of 1-max
   * @param {Function}     callback
   */
  SideMenu.prototype.ScrollDown = function (amount, callback) {
    return this.Scroll(this.DOWN, amount, callback);
  };

  /**
   * Scrolls the specified element to the given position
   *
   * @param {HTMLElement}  $element   jQuery element to be displayed 
   * @param {number}       position   Ranges of 1-max
   */
  SideMenu.prototype.ScrollTo = function (element, position, callback) {
    var $ele = $(element),
      idx = $ele.data("idx");

    position = position - 1;

    if (idx < position) {
      this.ScrollDown(position - idx, callback);
    } else if (idx > position) {
      this.ScrollUp(idx - position, callback);
    }
  };

  /**
   * Does the main scrolling behavior of the elements of the list
   *
   * @param {number} direction -1/1
   * @param {number} amount   Amount of options to scroll
   * @param {Function} callback 
   */
  SideMenu.prototype.Scroll = function (direction, amount, callback) {
    var self = this;
    var menuAction = direction === this.UP ? "appendTo" : "prependTo";
    var $container = this.GetContainer();
    var $options   = this.GetOptions();
    var $toRemove  = direction === this.UP ? $options.slice(0, amount) : $options.slice(-amount);
    var window_height = $(window).height(),
      option_height = window_height / $options.size();

    callback = callback || function () { };
    amount = amount || 1;

    $options.css("position", "absolute");

    //this.HideActiveOptions();
    $toRemove.clone(true)[menuAction](self.GetContainer());

    self.SetPositions(option_height);

    var resetPositions = function () {
      $toRemove.remove();
      self.SetPositions(option_height);
      $container.css("top", "0");
      $options.css("position", "fixed");
      callback();
    };

    if (direction === self.UP) {
      $container.animate({ "top": (-(option_height * amount)) + "px"}, 2000, "easeOutElastic", resetPositions);
    } else if (direction === self.DOWN) {
      $container.css("top", (-(option_height * amount)) + "px").animate({ "top": "0"}, 1000, "easeInOutElastic", resetPositions);
    }
  };

  /**
   * Hides all the active options
   *
   * @returns Promise
   */
  SideMenu.prototype.HideActiveOptions = function () {
    var $elements = $(".menu-active");

    $elements.each(function (idx, ele) {
      var $ele = $(ele);
      $ele.animate({
        left: -($ele.outerWidth() - 10)
      }, 1000, "easeOutBack", function () { $elements.removeClass("menu-active"); });
    });

    return $elements.promise();
  };


  /**
   * Activates the specified element and moves it to the second position
   *
   * @param {HTMLElement}  $element   jQuery element to be displayed 
   */
  SideMenu.prototype.ActivateOption = function ($element) {
    // Hide active ones
    var $active = $(".menu-active");
    var self = this;

    $active.removeClass("menu-active");

    self.HideOption($active, true).done(function () {

      // Enable selected
      var $li = $element[0].nodeName !== "LI" ? $element.closest("li") : $element;
      $li.addClass("menu-transition");

      self.HideOption($li, true).done(function () {
        self.ScrollTo($li, 2,
          function () {
            $li.addClass("menu-active");
            $li.animate({"width" : "100%"});
            $li.removeClass("menu-transition");
          }
          );
      });

    });

  };

  /**
   * Resizes all the options heights based on the current window height. 
   *
   * @this
   */
  SideMenu.prototype.Resize = function () {
    var $options = this.GetOptions(),
      window_height = $(window).height(),
      option_height = window_height / $options.size();

    this.SetPositions(option_height);

    return this;
  };

  /**
   * Sets the position and other properties (height, top, left, font size) to the
   * option elements of the menu. 
   *
   * @param {number}  option_height 
   * @this
   */
  SideMenu.prototype.SetPositions = function (option_height) {
    var $options = this.GetOptions(),
      start_ypoint = 0;

    $options.each(function (idx, ele) {
      var $ele  = $(ele),
        width = $ele.outerWidth(),
        height = $ele.outerHeight();

      $ele.data("idx", idx)
          .css("font-size", (option_height * 0.03) + "em")
          .css("line-height", option_height + "px")
          .css("height", option_height)
          .css("top", start_ypoint + "px")
          .css("left", "-" + (width - 10) + "px");

      start_ypoint += option_height;
    });

    return this;
  };

  /**
   * Provides a wave animation to the menu options
   *
   * @param {Function}  callback
   * @this
   */
  SideMenu.prototype.Wave = function (callback) {
    var self = this,
      $options = self.GetOptions(),
      totalduration = 0;

    // Forward
    $options.each(function (idx, ele) {
      var $ele = $(ele);
      totalduration += (70 * (idx - 1));
      $ele.addClass("menu-transition");

      setTimeout(function () {
        $ele.animate({ left: 0 }, 200, function () {
          $ele.animate({
            left: -($ele.outerWidth() - 10)
          });
        });
      }, 80 * idx);
    });

    // Backwards
    setTimeout(function () {
      var $reversed = $($options.get().reverse());

      $reversed.each(function (idx, ele) {
        var $ele = $(ele),
          distance = 10 + (idx * 3),
          duration = 900 + (idx * 20),
          intime = 70 * idx;

        setTimeout(
          function () {
            $ele.effect("bounce", { times: 2, direction: "right", distance: distance }, duration, function () {
              $ele.removeClass("menu-transition");
              if (idx === $reversed.size() - 1) {
                callback();
              }
            });
          },
          intime
        );
      });

    }, totalduration);



    return this;
  };

  /**
   * Returns the container of the options
   *
   * @return {HTMLElement}
   */
  SideMenu.prototype.GetContainer = function () {
    return $(this._menuContainer);
  };

  /**
   * Returns the options available on the list
   */
  SideMenu.prototype.GetOptions = function () {
    return $(this._menuContainer).find("li");
  };

  /**
   * Displays the specified element
   *
   * @param {Object}  $ele    jQuery encapsulated element to be displayed
   * @param {boolean} force   Indicates if we should force the update
   * @returns promise
   */
  SideMenu.prototype.ShowOption = function ($ele, force) {
    return this.ToggleVisibilityOption($ele, force, function ($e) {
      $e.animate({
        left: 0
      });
    });
  };

  /**
   * Hides the specified element
   *
   * @param {Object}  $ele    jQuery encapsulated element to hide
   * @param {boolean} force   Indicates if we should force the update
   * @returns promise
   */
  SideMenu.prototype.HideOption = function ($ele, force) {
    return this.ToggleVisibilityOption($ele, force, function ($e) {
      $e.css("width", "auto");
      $e.animate({
        left: -($ele.outerWidth() - 10)
      });
    });
  };

  /**
   * Validates certain aspects before doing the specified transition
   *
   * @param {Object}  $ele    jQuery encapsulated element to be displayed
   * @param {boolean} force   Indicates if we should force the update
   * @param {Function} animation  Animation to be execued
   * @returns promise
   */
  SideMenu.prototype.ToggleVisibilityOption = function ($ele, force, animation) {
    animation = animation || function () {};

    if ($ele.size() === 0) {
      return $ele.promise();
    }

    if ($ele[0].nodeName !== "LI") {
      $ele = $ele.closest("li");
    }

    if ($ele.hasClass("menu-transition") && !force) {
      return $ele.promise();
    }

    animation($ele);

    return $ele.promise();
  };


  var singleton = null;
  window.SideMenu = function (options) {
    if (singleton === null) {
      singleton = new SideMenu(options);
    }

    return singleton;
  };

})(jQuery);
