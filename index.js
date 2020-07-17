const express = require('express');
var bodyParser = require('body-parser');
const request = require('request');

const appToken= 'EAAJVepgEpfQBAMl4IIOXb7aabBTJPkX158O9vVdtES4ybhHTG4ZAYHBLVswlnRsZCkS7uToQ2jGJWfH660baN4ZBy20OV4oU2lsF5ljCcym01uNw6v4qsH18iPpf3wVMKHSZBM0gR41J4wKLUrdAk5wBu3jeZBzZAqpKZCjZAECyMFg6iaOUgOqxXAf93zHYEpwZD';

const app = express();
app.use(bodyParser.json());
app.listen(3000, function () {
    console.log("El servidor esta funcionando")
});

var formData = {
    "get_started":[
        {
            "payload":"GET_STARTED_PAYLOAD"
        }
    ]
};

//Rutas
app.get('/', function (req, res) {
    res.send('Hola Bienvenido al taller');
});

app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] == 'Bot_RH_proyecto'){
        console.log("webhook verificado!");
        res.status(200).send(req.query["hub.challenge"]);
    }else {
        console.error("La verificacion ha fallado, porque los tokens no coinciden");
        res.sendStatus(403);
    }
});

app.get('/setup',function(req,res){
    setupGetStartedButton(res);
});

app.post('/webhook', function (req, res) {
    var data = req.body;

    if (data.object === 'page') {

        data.entry.forEach(function(entry) {
            var pageID = entry.id;
            var timeOfEvent = entry.time;

            entry.messaging.forEach(function(event) {
                if (event.message) {
                    receivedMessage(event);
                } else {
                    if(event.postback && event.postback.payload === GET_STARTED_PAYLOAD )
                    {
                        //present user with some greeting or call to action
                        var msg = "Hi ,I'm a Bot ,and I was created to help you easily .... "
                        sendMessage(event.sender.id,msg);
                    }

                }
            });
        });

        res.sendStatus(200);
    }
});

function receivedMessage(event) {
    var senderID = event.sender.id;
    var messageText = event.message.text;
    evaluarMensaje(senderID, messageText)

}

function evaluarMensaje(recipientId, mensaje) {
    if (isContain(mensaje, 'ayuda')){
        finalMessage ='En que puedo ayudarte';
    }else {
        finalMessage ='No puedo contestar a eso por el momento';
    }
    sendMessage(recipientId, finalMessage);
}

function sendMessage(recipientId, message) {
    callSendAPI(recipientId, message);
}

function callSendAPI(sender_psid, response) {
    // Construct the message body
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    }

    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": appToken },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('message sent!')
        } else {
            console.error("Unable to send message:" + err);
        }
    });
}

function isContain(sentence, word) {
    return sentence.indexOf(word) > -1;
}

function setupGetStartedButton(res){
    var messageData = {
        "get_started":[
            {
                "payload":"GET_STARTED_PAYLOAD"
            }
        ]
    };

    // Start the request
    request({
            url: 'https://graph.facebook.com/v2.6/me/messenger_profile?access_token='+ appToken,
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            form: messageData
        },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // Print out the response body
                res.send(body);

            } else {
                // TODO: Handle errors
                res.send(body);
            }
        });
}