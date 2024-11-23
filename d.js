'use strict';

const chatInput = document.querySelector('#chat_input');
const typingIndicator = document.querySelector('#typing');
const sendButton = document.querySelector('#send');
const chatMessages = document.querySelector('#chat_messages');
const chatBoxBody = document.querySelector('#chat_box_body');

const profile = {
  my: {
    name: 'You',
    pic: 'https://via.placeholder.com/30?text=U',
  },
  other: {
    name: 'AI Bot',
    pic: 'https://via.placeholder.com/30?text=B',
  },
};

const API_URL = 'https://api-inference.huggingface.co/models/gpt2';
const API_KEY = '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';
const GEMINI_API_KEY = 'AIzaSyDn463tQhMveGgtqw82s5dUQoF6vuPeDG8';

function renderProfile(profileType) {
  return `
    <div class="profile ${profileType}-profile">
      <img src="${profile[profileType].pic}" alt="${profile[profileType].name}" width="30" height="30">
      <span>${profile[profileType].name}</span>
    </div>`;
}

function renderMessage(profileType, message) {
  return `<div class="message ${profileType}-message">${message}</div>`;
}

function appendMessage(profileType, message) {
  const profileHtml = renderProfile(profileType);
  const messageHtml = renderMessage(profileType, message);
  chatMessages.insertAdjacentHTML('beforeend', profileHtml + messageHtml);
  chatBoxBody.scrollTop = chatBoxBody.scrollHeight;
}

function sendMessage(profileType, text) {
  if (!text.trim()) return;
  appendMessage(profileType, text);
  chatInput.value = '';
}

async function fetchChatGPTResponse(userInput) {
  try {

    console.log(userInput);

    const requestBody = {
      contents: [
        {
          parts: [
            { text: userInput }
          ]
        }
      ]
    };
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
    });
  
    // Check if the response status is OK
    if (!response.ok) {
      console.error(`HTTP error! Status: ${response.status}`);
      const errorBody = await response.text();
      console.error('Error body:', errorBody);
      return;
    }
  
    // Log the raw response text to see what is returned
    const rawData = await response.text();
    console.log("Raw response: ", rawData);
  
    // Try to parse the response as JSON
    const data = JSON.parse(rawData);
    console.log("Parsed response: ", data);

    // if (data.choices && data.choices.length > 0) {
      return data.candidates[0].content.parts[0].text.trim();
   
  } catch (error) {
    return 'Sorry, there was an error connecting to the server.';
  }
}

async function handleBotResponse(userInput) {
  typingIndicator.classList.add('active');
  const botResponse = await fetchChatGPTResponse(userInput);
  typingIndicator.classList.remove('active');
  appendMessage('other', botResponse);
}

chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    const userInput = chatInput.value;
    sendMessage('my', userInput);
    handleBotResponse(userInput);
  }
});

sendButton.addEventListener('click', () => {
  const userInput = chatInput.value;
  sendMessage('my', userInput);
  handleBotResponse(userInput);
});

