axios.defaults.headers.common['Authorization'] = 'UmZLdtENxpI8L9jhyZU1TJWI';
let lastMessage = '';
const myUser = {
    name: "ken"
};
const contentContainer = document.querySelector(".content-container");
const activeUsersContainer = document.querySelector(".active-users-container");
const visibilityContainerPublic = document.querySelector("#public");
const visibilityContainerPrivate = document.querySelector("#private");
let ricipientName = "Todos";
let userStillActive = false;
let messageType = "message";
const visibilityArea = document.querySelector(".visibility-area");

function enterTheChatRoom() {
    const promise = axios.post("https://mock-api.driven.com.br/api/vm/uol/participants", myUser);
    promise.catch(userNameError);
    setInterval(keepConnection, 5000);
    setInterval(getMessages, 3000);
    getParticipants();
    setInterval(getParticipants, 1000);
}


function keepConnection() {
    const promise = axios.post("https://mock-api.driven.com.br/api/vm/uol/status", myUser);
    promise.catch(userNameError);
}

function getMessages() {
    const promise = axios.get("https://mock-api.driven.com.br/api/vm/uol/messages");
    promise.then(showMessages);
}

function showMessages(data) {
    contentContainer.innerHTML = '';
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
                break;

            case "private_message":
                if (message.from === myUser.name || message.to === myUser.name) {
                    contentContainer.innerHTML += `
                    <div class="message-container private">
                        <p>
                        <span class="timestamp">(${message.time})</span>
                        <span class="user-name">${message.from}</span> reservadamente para
                        <span class="user-name">${message.to}</span>: ${message.text}
                        </p>
                    </div>`
                }
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
                break;

            default:
                break;
        }
    });
    if (contentContainer.lastElementChild.querySelector("span").innerHTML !== lastMessage) {
        contentContainer.lastElementChild.scrollIntoView();
    }
    lastMessage = contentContainer.lastElementChild.querySelector("span").innerHTML;
}

function sendMessage() {
    const messageText = document.querySelector("#message").value;
    const message = {
        from: myUser.name,
        to: ricipientName,
        text: messageText,
        type: messageType
    };
    const promise = axios.post("https://mock-api.driven.com.br/api/vm/uol/messages", message);
    promise.then(getMessages);
}

function userNameError(error) {
    if (error.response.status === 400) {

    }
}

function getParticipants() {
    const promise = axios.get("https://mock-api.driven.com.br/api/vm/uol/participants");
    promise.then(showActiveUsers);
    promise.catch(userNameError);
}

function showActiveUsers(data) {
    userStillActive = false;
    activeUsersContainer.innerHTML = `
    <div class="user-container selected" onclick="selectRicipient(this)">
            <ion-icon name="people"></ion-icon>
            <div class="user-info">
              <div class="name">Todos</div>
              <div>
                <ion-icon name="checkmark-outline"></ion-icon>
              </div>
            </div>
          </div>`;
    if (ricipientName !== activeUsersContainer.firstElementChild.querySelector(".name").innerHTML) {
        activeUsersContainer.firstElementChild.classList.remove("selected");
    }
    Array.from(data.data).forEach(user => {
        if (user.name !== myUser.name) {
            activeUsersContainer.innerHTML += `
            <div class="user-container" onclick="selectRicipient(this)">
                <ion-icon name="person-circle"></ion-icon>
                <div class="user-info">
                  <div class="name">${user.name}</div>
                  <div>
                    <ion-icon name="checkmark-outline"></ion-icon>
                  </div>
                </div>
              </div>`
            if (ricipientName === user.name) {
                activeUsersContainer.lastElementChild.classList.add("selected");
                userStillActive = true;
            }
        }
    });
    if (!userStillActive) {
        activeUsersContainer.firstElementChild.classList.add("selected");
        ricipientName = "Todos";
        visibilityContainerPrivate.classList.remove("selected");
        visibilityContainerPublic.classList.remove("selected");
    }
    setMessageVisibility();
}

function openSideMenu() {
    const sideMenu = document.querySelector(".side-menu-background");
    sideMenu.classList.add("activated");
    contentContainer.classList.add("scroll-disable");
}

function closeSideMenu() {
    const sideMenu = document.querySelector(".side-menu-background");
    sideMenu.classList.remove("activated");
}

function selectRicipient(ricipient) {
    if (ricipient.querySelector(".name").innerHTML !== ricipientName) {
        ricipientName = ricipient.querySelector(".name").innerHTML;
    };
    Array.from(document.querySelectorAll(".user-container")).forEach(container => {
        if (container.querySelector(".name").innerHTML !== ricipientName) {
            container.classList.remove("selected");
        }
    });
    ricipient.classList.add("selected");
    setMessageVisibility();
}

function selectVisibilityType(type) {
    if (ricipientName !== "Todos") {
        if (type.id === "public") {
            visibilityContainerPrivate.classList.remove("selected");
            type.classList.add("selected");
            messageType = "message";
        }
        else {
            visibilityContainerPublic.classList.remove("selected");
            type.classList.add("selected");
            messageType = "private_message";
        }
    }
    setMessageVisibility();
}

function setMessageVisibility() {
    if (messageType === "message" && ricipientName !== "Todos") {
        visibilityArea.innerHTML = `Enviando para ${ricipientName}`;
    }
    else if (messageType === "private_message" && ricipientName !== "Todos") {
        visibilityArea.innerHTML = `Enviando para ${ricipientName} (reservadamente)`;
    }
    else {
        visibilityArea.innerHTML = `Enviando para ${ricipientName}`;
    }
}