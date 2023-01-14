const socket = io();

// Dom elements
const $messageForm = document.getElementById("form-m");
const $messageInput = document.getElementById("message");
const $messageSubmitButton = document.getElementById("submit");
const $sendLocation = document.getElementById("send-location");
const $renderMessages = document.getElementById("render-messages");
const $renderLocation = document.getElementById("render-location");

// Templates from script
const $messageTemplate = document.getElementById("message-template").innerHTML;
const $locationTemplate =
  document.getElementById("location-template").innerHTML;

socket.on("message", (message) => {
  console.log(message);
  const html = Mustache.render($messageTemplate, {
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm:A"),
  });
  $renderMessages.insertAdjacentHTML("beforeend", html);
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if ($messageInput.value === "") {
    return;
  }
  $messageSubmitButton.setAttribute("disabled", "disabled");
  const newMessage = $messageInput.value;

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
    socket.emit("sendLocation", { lat, lon }, () => {
      $sendLocation.removeAttribute("disabled");
      console.log("Location co-ordinates have been shared!!!");
    });
  });
});

socket.on("location", (location) => {
  console.log(`location: ${location}`);
  const html = Mustache.render($locationTemplate, {
    location: location,
  });
  $renderLocation.insertAdjacentHTML("beforeend", html);
});
