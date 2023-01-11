const socket = io();
// socket.on("countUpdate", (count) => {
//   console.log(`The count has been updated to ${count}`);
// });
// console.log(btnAdd);
// document.querySelector("#increment").addEventListener("click", () => {
//   console.log("clicked");
//   socket.emit("increment");
// });
socket.on("message", (message) => {
  console.log(message);
});

document.querySelector("form").addEventListener("submit", (e) => {
  e.preventDefault();
  const newMessage = e.target.elements.message.value;
  console.log("form working");
  socket.emit("newMessage", newMessage);
});

document.querySelector("#send-location").addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation not supported by browser");
  }
  navigator.geolocation.getCurrentPosition((position) => {
    console.log(position);
    const { coords } = position;
    console.log(coords);
    const { latitude: lat, longitude: lon } = coords;
    socket.emit("sendLocation", { lat, lon });
  });
});

socket.on("location", (location) => {
  console.log(`location: ${location}`);
});
