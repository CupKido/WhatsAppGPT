const axios = require('axios');

const apiURL = 'https://api.openai.com/v1/chat/completions';

module.exports.role_options = {
    USER: 'user',
    ASSISTANT: 'assistant',
    SYSTEM: 'system',
    get_role_message : (role, message) =>{
        return {
            role: role,
            content: message
        }
    }
  };

module.exports.supported_models = {
    GPT_3_5_TURBO : "gpt-3.5-turbo",
        GPT_4 : "gpt-4"
}

module.exports.getResponseWithHistory = (history, model, loaded, apiKey) => {
    const refactored_user_history = history.map((message) => {
        return module.exports.role_options.get_role_message(message[0], message[1])
    });
    console.log(refactored_user_history);
    const headers = {
        "Content-Type": "application/json",
        Authorization: "Bearer " + apiKey
    }
    
    const data = {
        "model" : model,
        "messages": refactored_user_history
    }

    return axios.post(apiURL, data, { headers: headers }).then((res) => {
        const answer = res.data.choices[0].message.content;
        const tokenAmount = res.data.usage.total_tokens;
        return { answer, tokenAmount, model }
    }).catch((err) => {
        console.log(err)
    });
}

