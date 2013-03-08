function StatementListCtrl($scope, $http) {
  $http.post('/getStatementList')
      .success(function(data, status) {
          $scope.statements = data;
      });
}
function StatementDataCtrl($scope, $http) {
  $http.post('/getStatementData')
  .success(function(data, status) {
           $scope.statements = data;
           });
}