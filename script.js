axios.defaults.headers.common['Authorization'] = 'UmZLdtENxpI8L9jhyZU1TJWI';

const user = {
    name: "b"
};

const message = {
    from: "The Senate",
    to: "Todos",
    text: "Power! Unlimited power!",
    type: "message"
};

function enterTheChatRoom() {
    const promise = axios.post("https://mock-api.driven.com.br/api/vm/uol/participants", user);
    promise.catch(userNameError);
    setInterval(keepConnection, 5000);
    setInterval(getMessages, 3000);
}


function keepConnection() {
    axios.post("https://mock-api.driven.com.br/api/vm/uol/status", user);
}

function getMessages() {
    const promise = axios.get("https://mock-api.driven.com.br/api/vm/uol/messages");
    promise.then(showMessages);
}

function showMessages(data) {
    const contentContainer = document.querySelector(".content-container");
    debugger;
    Array.from(data.data).forEach(message => {
        switch (message.type) {
            case "status":
                contentContainer.innerHTML += `
                <div class="message-container status">
                    <p>
                    <span class="timestamp">(${message.time})</span>
                    <span class="user-name">${message.from}</span> ${message.text}
                    </p>
                </div>`
                contentContainer.lastElementChild.scrollIntoView();
                break;

            case "private_message":
                contentContainer.innerHTML += `
                <div class="message-container private">
                    <p>
                    <span class="timestamp">(${message.time})</span>
                    <span class="user-name">${message.from}</span> reservadamente para
                    <span class="user-name">${message.to}</span>: ${message.text}
                    </p>
                </div>`
                contentContainer.lastElementChild.scrollIntoView();
                break;

            case "message":
                contentContainer.innerHTML += `
                <div class="message-container public">
                    <p>
                    <span class="timestamp">(${message.time})</span>
                    <span class="user-name">${message.from}</span> para
                    <span class="user-name">${message.to}</span>: ${message.text}
                    </p>
                </div>`
                contentContainer.lastElementChild.scrollIntoView();
                break;

            default:
                break;
        }
    })
}

function sendMessage() {
    const promise = axios.post("https://mock-api.driven.com.br/api/vm/uol/messages", message);
}

function userNameError(error) {
    if (error.response.status === 400) {
        console.log("working");
    }
}

function openSideMenu() {
    const sideMenu = document.querySelector(".side-menu-background");
    sideMenu.classList.add("activated");
}