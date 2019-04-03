var ExpoNotificationMessage = function(to, title, body) {
  this.to = to;
  this.title = title;
  this.body = body;
};

var getExpoTokenArray = function(expoToken) {
  // START: parse the attribute that contain the token
  // used for the notification
  var expoTokenArray = [];
  if (expoToken) expoTokenArray = expoToken.split(",,").filter(Boolean);
  // END
  return expoTokenArray;
};

var createExpoMessage = function(expoTokensArray, message, messageProb,minimumValue) {
  var msg = [];

	if(message) {
    messageProb = messageProb ? " also there is a problem with the probs " + messageProb : "";
    message = 'sorry but tanks '+ message+ ' contain less than ' + minimumValue + "% " + messageProb;
	} else {
    message = 'sorry but there is a problem with  probs in ' + messageProb;
  }
  for (var i = 0; i < expoTokensArray.length; i += 1) {
    msg.push(
      new ExpoNotificationMessage(
        "ExponentPushToken[" + expoTokensArray[i] + "]",
        "Hello",
        message
      )
    );
  }
  return msg;
};

// parse tanksBarometer
var expoTokenArray = getExpoTokenArray(metadata.shared_notificationToken);
var tanksBarometerArray = JSON.parse(metadata.shared_tanks_barometer);
var minimumValue = metadata.shared_minimumValue;


var tanksName = ["tank1", "tank2", "tank3", "tank4", "tank5"];


var voltageName = ["voltage1", "voltage2", "voltage3", "voltage4", "voltage5"];
var voltageNameLength = voltageName.length;

// check msg properties (names included in voltageName array) which have values less than 0.5 and return an array which contain all their index
var validTankName = [];
var inValidTankName = [];
for(var i = 0; i < voltageNameLength; i++) {
	if(msg[voltageName[i]] && Number(msg[voltageName[i]]) > 0.5) {
    validTankName.push(tanksName[i]);
  }
	else {
    inValidTankName.push(tanksName[i]);
  }

	//create a new array which contain list of tankname for which voltage > 0.5
}


// get property key of the msg, it should be the same as
// Object.keys(msg)(case where msg contain only tank property)

tanksName = validTankName;
if (tanksName.length) {
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

  if (minimumValue && expoTokenArray.length && pourcentagesArray.length) {
    var pourcentagesArrayLength = pourcentagesArray.length;
    var messageToAppendInNotification = "",
      msg = "";

    for (var i = 0; i < pourcentagesArrayLength; i++) {
      if (pourcentagesArray[i] < minimumValue / 100) {
        messageToAppendInNotification += (tankIndex[i] + 1) + " ";
      }
		}
		
		var messageAboutDeviceProblem = '';
		if (inValidTankName.length) {
			messageAboutDeviceProblem = inValidTankName.join(' ');
		}

    if (messageToAppendInNotification || messageAboutDeviceProblem)
      msg = createExpoMessage(expoTokenArray, messageToAppendInNotification, messageAboutDeviceProblem, minimumValue);

    return { msg: msg, metadata: metadata, msgType: msgType };
  }
} else if (inValidTankName.length) {

	var messageAboutDeviceProblem = inValidTankName.join(' ');

	if(messageAboutDeviceProblem) {
		msg = createExpoMessage(expoTokenArray, '', messageAboutDeviceProblem,'');
	}

	return { msg: msg, metadata: metadata, msgType: msgType };

}

return false;
