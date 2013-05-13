$(function () {

  // Initialize menu
  var menu = SideMenu({ "container": ".menu", "default": ".orange", "position": 2 });

  // Bind page-level behaviors
  $(document).on("sidemenu:resize", AdjustContents);
  $(document).on("sidemenu:active-changed", ActiveChanged);
  $(document).on("sidemenu:active-hidden", VisibilityChanged);

  $(document).on("pjax:send", function () { $(".contents").hide(); });
  $(document).on("pjax:success", function () { $(".contents").fadeIn(); });

  $(".menu a").click(function () { return false; });

  // Helper methods

  /**
   * Hides the contents when the main visibility option has been hidden
   *
   * @param {Event} e
   * @param {Object} $active
   */
  function VisibilityChanged(ev, $element) {
    $(".contents").fadeOut();
  }

  /**
   * Adjusts options starting point based on current size. 
   */
  function AdjustContents() {
    var $activeElement = menu.GetActiveElement();

    if ($activeElement.size() > 0) {
      var top = parseInt($activeElement.css("top").replace("px"), 10) + $activeElement.outerHeight() + 30;

      $(".contents").css("padding-top", top + "px");
    }
  }

  /**
   * Fetches new contents based on the selected option url.
   *
   * @param {Event} e
   * @param {Object} $active
   */
  function ActiveChanged(e, $active) {
    AdjustContents();
    $.pjax({url: $active.find("a").attr("href"), container: ".contents"});
  }

});