function SpendingCategoriesListCtrl($scope, $http) {
  $http.post('/getSpendingCategories')
    .success(function(data, status) {
        $scope.categories = data;
    });
}

function StatementListCtrl($scope, $http) {
  $http.post('/getStatementList')
    .success(function(data, status) {
        $scope.statements = data;
    });
}

$(document).ready(function() {
  var $sorterNew = $('#sorter-new');
  $sorterNew.keypress(function(event) {
    // On 'enter', create a new category.
    if (event.which == 13) {
      $sorterNew.before($('<div>')
                         .attr('id', $sorterNew.val())
                         .addClass('sort-category')
                         .html($sorterNew.val()));
      $sorterNew.val('');
    }
  });
});