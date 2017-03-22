angular.module('WorklogJiraApp', ['chart.js'])
   .controller('WorklogJiraController', ['$scope','$http','$q', function($scope, $http, $q) {
       $scope.greeting = "Loading data...";
       var loggedHours = {};
       var httpRequests = [];

       $http({
		  method: 'GET',
		  url: '<your_jira_url>/rest/agile/1.0/board/7860/sprint/24717/issue',
		  crossDomain: true
		}).then(function successCallback(response) {

		    var issues = response['data']['issues'];
		    for(i=0; i < issues.length; i++){
		    	requestIssueWorklog(issues[i].key);
		    }

			$scope.labels = [];
			$scope.data = [];
			$scope.options = {
			    scales: {
			      yAxes: [
			        {
			          display: true,
			          ticks: {
			          	suggestedMin: 0
			          }

			        }
			      ]
			    }
			 };


			$q.all(httpRequests).then(function (ret) {

				var dateYesterday = new Date();
				dateYesterday.setDate(dateYesterday.getDate() - 1);
				var timeStampYesterday = dateYesterday.getTime();

			    for(i=0; i<ret.length; i++){
				    var worklog = ret[i]['data']['worklogs'];

				    if(worklog != null){
					    for(j=0; j < worklog.length; j++){
					    	var displayName = worklog[j]['author'].displayName;
					    	var timeSpentSeconds = worklog[j].timeSpentSeconds;
					    	var timeSpentHours = (timeSpentSeconds / 60) / 60;
					    	
					    	var worklogCreationDate = worklog[j].created;

					    	var d = new Date(worklogCreationDate);
							var worklogTimeStamp = d.getTime(); 

					    	//console.log("Timestamp yesterday :" + timeStampYesterday + " Timestamp worklog :" + worklogTimeStamp);

					    	if(worklogTimeStamp >  timeStampYesterday){					    		
					    		if(!loggedHours.hasOwnProperty(displayName)){
					    			loggedHours[displayName] = 0;
					    		}

					    		loggedHours[displayName] += timeSpentHours;

					    		console.log("Name: "+ displayName +" timeSpentSeconds: " +timeSpentSeconds + " timeSpentHours : " + timeSpentHours);
					    	}
				    		
					    }
				    }
			    }

			    console.log(response);

			    for(var name in loggedHours){
			    	if(loggedHours.hasOwnProperty(name)){
			    		$scope.labels.push(name);
			    		$scope.data.push(loggedHours[name]);
			    	}
			    }

			    $scope.greeting = "NF-e team Worklog (last 24 hours)";

			});

		  }, function errorCallback(response) {
		    alert("Please enable Cross Origin Resource Sharing (CORS)");
		  });

		function requestIssueWorklog(issueId){
			var url = "<your_jira_url>/rest/api/2/issue/" + issueId + "/worklog";
			
			httpRequests.push($http({
			  method: 'GET',
			  url: url,
			  crossDomain: true
			}));
		}

}]);