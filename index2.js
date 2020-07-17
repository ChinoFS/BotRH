const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')

const APP_TOKEN = 'EAAJVepgEpfQBAMl4IIOXb7aabBTJPkX158O9vVdtES4ybhHTG4ZAYHBLVswlnRsZCkS7uToQ2jGJWfH660baN4ZBy20OV4oU2lsF5ljCcym01uNw6v4qsH18iPpf3wVMKHSZBM0gR41J4wKLUrdAk5wBu3jeZBzZAqpKZCjZAECyMFg6iaOUgOqxXAf93zHYEpwZD'

var app = express()

app.use(bodyParser.json())

var PORT = process.env.PORT || 3000;

app.listen(PORT,function(){
    console.log('Server listen localhost:3000')
})

app.get('/',function(req, res){
    res.send('Funcionando webhook')
})

app.get('/webhook',function(req, res){
    if(req.query['hub.verify_token'] === 'Bot_RH_proyecto'){
        res.send(req.query['hub.challenge'])
    }else{
        res.send('Esta no es tu pagina')
    }
})

app.post('/webhook',function(req, res){
    var data = req.body
    if(data.object == 'page'){
        data.entry.forEach(function(pageEntry){
            pageEntry.messaging.forEach(function(messagingEvent){
                if(messagingEvent.message){
                    getMessage(messagingEvent)
                }
            })
        })
    }
    res.sendStatus(200)
})

function getMessage(event){
    var senderID = event.sender.id
    var messageText = event.message.text

    evaluarMensaje(senderID, messageText)
}

function evaluarMensaje(senderID, messageText){
    var mensaje = '';

    if(isContain(messageText,'ayuda')){
        mensaje = 'Por el momento no te puedo ayudar :('
    }else if(isContain(messageText,'perfil')){
        enviarMensajeTemplate(senderID)
    }else{
        mensaje = 'solo se repetir las cosas T_T '+ messageText
    }
    enviarMensajeTexto(senderID, mensaje)
}

function enviarMensajeTemplate(senderID){
    var messageData = {
        recipient: {
            id : senderID
        },
        message: {
            attachment :{
                type: "template",
                payload: {
                    template_type: 'generic',
                    elements: [elementTemplate(),elementTemplate(),elementTemplate(),elementTemplate()]
                }
            }
        }
    }

    callSendAPI(messageData)
}

function elementTemplate(){
    return {
        title: "Joseph Esteban Carrasco",
        subtitle: "Programador freelance & Youtuber",
        item_url: "http://informaticomanchay.com",
        image_url: "https://s-media-cache-ak0.pinimg.com/564x/ef/e8/ee/efe8ee7e20537c7af84eaaf88ccc7302.jpg",
        buttons: [
            buttonTemplate('Contactame','http://informaticomanchay.com/contacto'),
            buttonTemplate('Portafolio','http://informaticomanchay.com/')
        ]
    }
}

function buttonTemplate(title,url){
    return {
        type: 'web_url',
        url: url,
        title: title
    }
}

//enviar texto plano
function enviarMensajeTexto(senderID, mensaje){
    var messageData = {
        recipient : {
            id: senderID
        },
        message: {
            text: mensaje
        }
    }

    callSendAPI(messageData)
}

function callSendAPI(messageData){
    //api de facebook
    request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: APP_TOKEN},
        method: 'POST',
        json: messageData
    },function(error, response, data){
        if(error)
            console.log('No es posible enviar el mensaje')
        else
            console.log('Mensaje enviado')
    })
}

function isContain(texto, word){
    if(typeof texto=='undefined' || texto.lenght<=0) return false
    return texto.indexOf(word) > -1
}