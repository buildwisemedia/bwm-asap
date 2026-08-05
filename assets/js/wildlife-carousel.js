/* Wildlife gallery controls without a jQuery timing dependency. */
(function () {
  'use strict';

  var carousel = document.getElementById('carousel');
  if (!carousel) return;

  function setClass(node, className) {
    if (node) node.className = className;
  }

  function moveToSelected(target) {
    var selected = carousel.querySelector('.selected');
    if (!selected) return;
    if (target === 'next') selected = selected.nextElementSibling || selected;
    else if (target === 'prev') selected = selected.previousElementSibling || selected;
    else if (target && target.parentElement === carousel) selected = target;

    var next = selected.nextElementSibling;
    var previous = selected.previousElementSibling;
    var previousSecond = previous && previous.previousElementSibling;
    var nextSecond = next && next.nextElementSibling;

    setClass(selected, 'selected');
    setClass(previous, 'prev');
    setClass(next, 'next');
    setClass(previousSecond, 'prevLeftSecond');
    setClass(nextSecond, 'nextRightSecond');

    var node = nextSecond && nextSecond.nextElementSibling;
    while (node) {
      setClass(node, 'hideRight');
      node = node.nextElementSibling;
    }
    node = previousSecond && previousSecond.previousElementSibling;
    while (node) {
      setClass(node, 'hideLeft');
      node = node.previousElementSibling;
    }
  }

  carousel.addEventListener('click', function (event) {
    var item = event.target.closest('#carousel > div');
    if (item) moveToSelected(item);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      moveToSelected(event.key === 'ArrowLeft' ? 'prev' : 'next');
      event.preventDefault();
    }
  });

  var previousButton = document.getElementById('prev');
  var nextButton = document.getElementById('next');
  if (previousButton) previousButton.addEventListener('click', function () { moveToSelected('prev'); });
  if (nextButton) nextButton.addEventListener('click', function () { moveToSelected('next'); });
})();
