var ExpoNotificationMessage = function(to, title, body) {
	this.to = to;
	this.title = title;
	this.body = body;
};

var getExpoTokenArray = function(expoToken) {
	// START: parse the attribute that contain the token
	// used for the notification
	var expoTokenArray = [];
	if(expoToken)
		expoTokenArray = expoToken.split(",,").filter(Boolean);
	// END
	return expoTokenArray;
}

var createExpoMessage = function(expoTokensArray, message) {
	var msg = [];
	for (var i = 0; i < expoTokensArray.length; i+=1) {
		msg.push(new ExpoNotificationMessage(
			"ExponentPushToken[" + expoTokensArray[i] + "]",
			"Hello",
			"sorry but tanks "+ message +" of the tanks contain less than " + minimumValue + "%"
		))
	}
	return msg;
}

// parse tanksBarometer
var tanksBarometerArray = JSON.parse(metadata.shared_tanks_barometer);

// get property key of the msg, it should be the same as
// Object.keys(msg)(case where msg contain only tank property)
var tanksName = ["tank1", "tank2", "tank3", "tank4", "tank5"];

// get msgIntegerPartArray (array which contain the integer part of every msg property)
// also get tankIndex, [0,1,2,3,4] which gonna be used to get the correct 
//barometer array from tanksBarometerArray
var msgIntegerPartArray = [];
var tankIndex = [];
for (var i = 0; i < tanksName.length; i += 1) {
	msgIntegerPartArray.push(~~Number(msg[tanksName[i]]));
	tankIndex.push(Number(tanksName[i].substr(-1)) - 1);
}

// calculate pourcentage for every tank
var pourcentagesArray = [];
for (var i = 0; i < msgIntegerPartArray.length; i += 1) {
	pourcentagesArray.push(
		tanksBarometerArray[tankIndex[i]][msgIntegerPartArray[i]] /
			tanksBarometerArray[tankIndex[i]][
				tanksBarometerArray[tankIndex[i]].length - 1
			]
	);
}

// minimum Pourcentage, gotten from shared attribute

var expoTokenArray = getExpoTokenArray(metadata.shared_notificationToken);
var minimumValue = metadata.shared_minimumValue;
if (minimumValue && expoTokenArray.length && pourcentagesArray.length ) {

  var pourcentagesArrayLength = pourcentagesArray.length;
	var messageToAppendInNotification = '', msg = '';

  for(var i = 0; i < pourcentagesArrayLength; i++) {
		if ( pourcentagesArray[i] < (minimumValue/100) ) {
			messageToAppendInNotification += (i+1) + ' ';
		}
  }
  
  if(messageToAppendInNotification)
    msg = createExpoMessage(expoTokenArray, messageToAppendInNotification);

  return { msg: msg, metadata: metadata, msgType: msgType };



}

return false;