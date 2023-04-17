axios.defaults.headers.common['Authorization'] = 'UmZLdtENxpI8L9jhyZU1TJWI';
let lastMessage = '';
const myUser = {
    name: ""
};
const contentContainer = document.querySelector(".content-container");
const activeUsersContainer = document.querySelector(".active-users-container");
const visibilityContainerPublic = document.querySelector("#public");
const visibilityContainerPrivate = document.querySelector("#private");
const loadingScreen = document.querySelector(".loading");
const mainPage = document.querySelector(".main-page");
let ricipientName = "Todos";
let userStillActive = false;
let messageType = "message";
const visibilityArea = document.querySelector(".visibility-area");
const input = document.querySelector("#message");
let confirmationButton;
input.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        document.querySelector(".pointer").click();
    }
});



function enterChatRoom(button) {
    confirmationButton = button;
    myUser.name = button.parentElement.querySelector("input").value;
    button.parentElement.classList.remove("activated");
    loadingScreen.classList.add("activated");
    const promise = axios.post("https://mock-api.driven.com.br/api/vm/uol/participants", myUser);
    promise.then(startSession);
    promise.catch(userNameError);
}

function startSession() {
    loadingScreen.classList.remove("activated");
    mainPage.classList.remove("hidden");
    keepConnection();
    setInterval(keepConnection, 5000);
    getMessages();
    setInterval(getMessages, 3000);
    getParticipants();
    setInterval(getParticipants, 10000);
}

function userNameError(error) {
    if (error.response.status === 400) {
        loadingScreen.classList.remove("activated");
        confirmationButton.parentElement.classList.add("activated");
        confirmationButton.parentElement.querySelector("input").value = '';
    }
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
                    <div class="message-container status" data-test="message">
                        <p>
                        <span class="timestamp">(${message.time})</span>
                        <span class="user-name">${message.from}</span> ${message.text}
                        </p>
                    </div>`
                break;

            case "private_message":
                if (message.from === myUser.name || message.to === myUser.name) {
                    contentContainer.innerHTML += `
                    <div class="message-container private" data-test="message">
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
                    <div class="message-container public" data-test="message">
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
    if (message.text !== '') {
        input.value = '';
        const promise = axios.post("https://mock-api.driven.com.br/api/vm/uol/messages", message);
        promise.then(getMessages);
        promise.catch(reloadPage);
    }
}

function reloadPage(error) {
    window.location.reload();
}

function getParticipants() {
    const promise = axios.get("https://mock-api.driven.com.br/api/vm/uol/participants");
    promise.then(showActiveUsers);
    promise.catch(e => {
        console.log(e);
    });
}

function showActiveUsers(data) {
    userStillActive = false;
    activeUsersContainer.innerHTML = `
    <div class="user-container selected" onclick="selectRicipient(this)" data-test="all">
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
            <div class="user-container" onclick="selectRicipient(this)" data-test="participant">
                <ion-icon name="person-circle"></ion-icon>
                <div class="user-info">
                  <div class="name">${user.name}</div>
                  <div>
                    <ion-icon name="checkmark-outline" data-test="check"></ion-icon>
                  </div>
                </div>
              </div>`
            if (ricipientName === user.name) {
                activeUsersContainer.lastElementChild.classList.add("selected");
                userStillActive = true;
            }
        }
    });
    /*if (!userStillActive) {
        activeUsersContainer.firstElementChild.classList.add("selected");
        ricipientName = "Todos";
        visibilityContainerPrivate.classList.remove("selected");
        visibilityContainerPublic.classList.add("selected");
    }*/
    setMessageVisibility();
}

function openSideMenu() {
    const sideMenu = document.querySelector(".side-menu-background");
    sideMenu.classList.add("activated");
    document.querySelector("body").classList.add("scroll-disable");
}

function closeSideMenu() {
    const sideMenu = document.querySelector(".side-menu-background");
    sideMenu.classList.remove("activated");
    document.querySelector("body").classList.remove("scroll-disable");
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
    if (ricipient.querySelector(".name").innerHTML === "Todos") {
        visibilityContainerPrivate.classList.remove("selected");
        visibilityContainerPublic.classList.add("selected");
    }
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