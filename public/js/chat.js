const socket = io();

// Dom elements
const $messageForm = document.getElementById("form-m");
const $messageInput = document.getElementById("message");
const $messageSubmitButton = document.getElementById("submit");
const $sendLocation = document.getElementById("send-location");
const $renderMessages = document.getElementById("render-messages");
const $renderSidebar = document.getElementById("sidebar");
// Templates from script
const $messageTemplate = document.getElementById("message-template").innerHTML;
const $locationTemplate =
  document.getElementById("location-template").innerHTML;
const $sidebarTemplate = document.getElementById("sidebar-template").innerHTML;
// query strings options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

// autoscroll function
const autoScroll = () => {
  const $newMessage = $renderMessages.lastElementChild;

  // height of new message computation
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // visible height computation
  const visibleHeight = $renderMessages.offsetHeight;

  // message container height
  const containerHeight = $renderMessages.scrollHeight;

  // distance scrolled
  const offsetScroll = $renderMessages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= offsetScroll) {
    $renderMessages.scrollTop = $renderMessages.scrollHeight;
  }
};
// server

// Receiving message data from client side server
socket.on("message", (message) => {
  const html = Mustache.render($messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("ddd, h:mm:A"),
  });
  $renderMessages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

// receiving location data from client side server
socket.on("location", (location) => {
  console.log(`location: ${location.url}`);
  const html = Mustache.render($locationTemplate, {
    username: location.username,
    location: location.url,
    createdAt: moment(location.createdAt).format("h:mm:A"),
  });

  $renderMessages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

// receiving users data in room from client side server
socket.on("userData", ({ room, users }) => {
  const html = Mustache.render($sidebarTemplate, {
    room: room,
    users,
  });
  $renderSidebar.insertAdjacentHTML("beforeend", html);
});
$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if ($messageInput.value === "") {
    return;
  }
  $messageSubmitButton.setAttribute("disabled", "disabled");
  const newMessage = $messageInput.value;

  // emitting to client server upon submitting new message
  socket.emit("newMessage", newMessage, (error) => {
    $messageSubmitButton.removeAttribute("disabled");
    $messageInput.value = "";
    $messageInput.focus();
    if (error) {
      return console.log(error);
    }
    console.log("Message has been delivered!!");
  });
});

$sendLocation.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation not supported by browser");
  }
  $sendLocation.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((position) => {
    // console.log(position);
    const { coords } = position;
    // console.log(coords);
    const { latitude: lat, longitude: lon } = coords;

    // emitting to client server upon sending location
    socket.emit("sendLocation", { lat, lon }, () => {
      $sendLocation.removeAttribute("disabled");
      console.log("Location co-ordinates have been shared!!!");
    });
  });
});

// emittting to client server upon joining room
socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
