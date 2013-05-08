
function menu_resize() {
  var $options = $(".menu li");
  var window_height = $(window).height();
  var option_height = window_height / $options.size();

  var start_ypoint = 0;

  $options.each(function(idx, ele) {
    var $ele  = $(ele);
    $ele.css("font-size", (option_height * 0.03) + "em");

    var width = $ele.outerWidth();
    var height = $ele.outerHeight();

    $ele.css("line-height", option_height + "px");
    $ele.css("height", option_height);
    $ele.css("top", start_ypoint + "px");
    $ele.css("left", "-" + (width - 10) + "px");
    start_ypoint += option_height;
  });

}

function menu_hide_all() {

}

function menu_scroll(direction) {
  var $options = $(".menu li");
  var options_length = $options.size();
  var window_height = $(window).height();
  var option_height = window_height / options_length;

  $($options[0]).clone().appendTo(".menu"); //css("top", option_height * options_length).animate({ top: option_height * (options_length - 1) });
  $options = $(".menu li");
  options_length = $options.size();

  for(var idx = 0; idx < options_length; idx++) {
    var $opt = $($options[idx]);

    $opt.css("top", (option_height * idx) + "px");

    // Close option if it is open.

    // Animate the scroll
    $opt.animate({ top: (option_height * (idx - 1)) + "px" }, function() { console.log("complete"); if(idx == options_length - 1) { console.log($options[0]); $($options[0]).remove(); } });
  }

  $($options[0]).remove();
}

function menu_scroll_up() {
  menu_scroll(-1);
}

function menu_scroll_down() {
  menu_scroll(1);
}

function menu_animate_wave() {
  var $options = $(".menu li");
  var totalduration = 0;

  // Forward
  $options.each(function(idx, ele) {
    var $ele = $(ele);
    totalduration += (70 * (idx - 1));

    setTimeout(function() {
      $ele.animate({ left: 0 }, 200, function() {
        $ele.animate({
          left: -($ele.outerWidth() - 10)
        });
      });
    }, 80 * (idx));
  });

  // Backwards
  setTimeout(function() {
    $($options.get().reverse()).each(function(idx, ele) {
      setTimeout(
        function() {
          $(ele).effect("bounce", { times: 2, direction: "right", distance: 10 + (idx * 3) }, 900 + (idx * 20));
        }, 70 * idx);
    });
  }, totalduration);

}

function menu_option_show($ele) {
  if($ele[0].nodeName != "LI") {
    $ele = $ele.closest("li");
  }

  $ele.animate({
    left: 0
  });
}

function menu_option_hide($ele) {
  if($ele[0].nodeName != "LI") {
    $ele = $ele.closest("li");
  }

  $ele.animate({
    left: -($ele.outerWidth() - 10)
  });
}

function menu_initialize() {
  menu_resize();
  menu_animate_wave();

  var $options = $(".menu li");

  $options.mouseenter(function(e) { menu_option_show($(e.target)); });
  $options.mouseleave(function(e) { menu_option_hide($(e.target)); });

  // Open default one based on the url
}

$(function() { setTimeout(menu_initialize, 300); });
$(window).resize(menu_resize);