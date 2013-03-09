/* ==============
 * Statement list
 * --------------
 */
function StatementListCtrl($scope, $http) {
  $http.post('/getStatementList')
    .success(function(data, status) {
        $scope.statements = data;
    });
}

var DEFAULT_SORTER_Z_INDEX = 1000;
var DEFAULT_ENTRY_Z_INDEX = 0;
function handleEntries(scope, element, attrs) {
  $('.entry').draggable({
    drag: function(event, ui) {
      $(this).css('z-index', DEFAULT_SORTER_Z_INDEX + 1);
    },
    revert: true,
    stack: '.entry',
    stop: function(event, ui) {
      $(this).css('z-index', DEFAULT_ENTRY_Z_INDEX);
    }
  });
}

/* =============
 * Sorter widget
 * -------------
 */
function SorterListCtrl($scope, $http) {
  $http.post('/getSpendingCategories')
    .success(function(data, status) {
        $scope.categories = data;
    });
  $scope.newCategory = '';
  $scope.addCategory = function() {
    $scope.categories.push($scope.newCategory);
    $scope.newCategory = '';
  };
}

function handleSorterWidget(scope, element, attrs) {
  var $sorterNew = $('#sorter-new');
  $sorterNew.keypress(function(event) {
      // On 'enter', create a new category.
      if (event.which == 13) {
        scope.addCategory();
        scope.$apply();
      }
  });
}

/* ==============
 * Angular module
 * --------------
 */
angular.module('mymint', [])
  .directive('entry', function() {
    return handleEntries;
  })
  .directive('sorter', function() {
    return handleSorterWidget;
  })
  .directive('category', function() {
    return function(scope, element, attrs) {
      var overClass = 'over';
      function handleDropOnCategory(event, ui) {
        ui.draggable.draggable('option', 'revert', false);
        ui.draggable.addClass('sorted');
        window.setTimeout(function() {
          ui.draggable.css('display', 'none');
        }, 200);
        handleOut.apply($(this));
      }
      function handleOver(event, ui) {
        $(this).addClass(overClass);
      }
      function handleOut(event, ui) {
        $(this).removeClass(overClass);
      }
      $('.sort-category').droppable({
        accept: '.entry',
        drop: handleDropOnCategory,
        over: handleOver,
        out: handleOut,
        tolerance: 'pointer'
      });
    }
  });
