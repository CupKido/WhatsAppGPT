const axios = require('axios');
const express = require('express');
const app = express();
require('dotenv').config();
const https = require('https');
const fs = require('fs');
app.use(express.json());
const gpt_module = require('./gpt_module.js');

const token = process.env.META_TOKEN;
const token2 = process.env.TOKEN3;
// console.log(token)
const message_history = {};
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    console.log('get')
    if(req.query['hub.verify_token'] === 'wowcool'){
        res.send(req.query['hub.challenge'])
    }else{
        res.send('Error, wrong token')
    }
});


const sendMessageTo = async (fromId, recipientId, message) => {
    const body = {
        messaging_product: 'whatsapp',
        "recipient_type": "individual",
        "to": recipientId,
        "type": "text",
        "text": { // the text object
            "preview_url": false,
            "body": message
            }
      };
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
    }
    axios.post('https://graph.facebook.com/v17.0/' + fromId + '/messages', body, { headers }).then((res) => {
        console.log(res.data)
    }).catch((err) => {
        console.log("ERROR")
        console.log(err)
    });
    
}

const handleWhatsappWebhook = async (entry) => {
 try{
    
    if (
        entry &&
        entry[0].changes &&
        entry[0].changes[0] &&
        entry[0].changes[0].value.messages &&
        entry[0].changes[0].value.messages[0]
      ) {
        let phone_number_id = entry[0].changes[0].value.metadata.phone_number_id;
        const messages = entry[0].changes[0].value.messages;
        // added message to history
        let message = messages[0].text.body;
        let from = messages[0].from;
        if (message_history[from] === undefined){
            message_history[from] = [];
        }
        message_history[from].push(['user', message]);
        gpt_module.getResponseWithHistory(message_history[from], gpt_module.supported_models.GPT_3_5_TURBO, false, process.env.OPENAI_KEY).then((res) => {
            message_history[from].push(['assistant', res.answer]);
            // if length is longer than 10, remove first message
            if(message_history[from].length > 6){
                message_history[from].shift();
            }
            sendMessageTo(phone_number_id, from, res.answer)
            // console.log(res)
        });
        
    }
 }catch(err){
     console.log(err)
 }
}
//app.post('/', (req, res) => {
//    console.log('post', req.body, req.query, req.params)
//    res.status(200);
//});
app.post("/", async (req, res) => {
    // Parse the request body from the POST
    let body = req.body;
    console.log('post', body)
    if(body.object === 'whatsapp_business_account'){
        handleWhatsappWebhook(body.entry)
    }
    // let message = req.body.entry[0].changes[0].value.messages[0].text.body;
    // console.log('post', message, body)
    res.status(200).send('OK');
    // Check the Incoming webhook message
});

app.listen(port, () => {
  console.log('Server is running on PORT:',port);
});


// const body = { "messaging_product": "whatsapp", "to": "972544332629", "type": "template", "template": { "name": "hello_world", "language": { "code": "en_US" } } }

// const headers = {
//     'Content-Type': 'application/json',
//     'Authorization': 'Bearer EAANciU8JtvUBAPLB7UlsI2reUJlgptE5ZBNXNz6kdXZAkez8IMk7TNDqpaz4hj6HvQH0G8JMqdpLvEPJ8tLxWcUQ1C4X0ayin9q0rQnEuNYK651G9KZAZAez2bASZBEX9yqqAEIiGepZBZBZBDF8mwKR0mZAD3yt7fL5G2cqaFyaBp837QHZAuCbYcWiuxshdZBkidisH3SolNfT0PjlvwZA9ZCjv'
// }
// axios.post('https://graph.facebook.com/v17.0/103343679512682/messages', body, { headers: headers }).then((res) => {
//     console.log(res.data)
// }).catch((err) => {
//     console.log(err)
// });