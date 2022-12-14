const modal = document.getElementById("my-secure-modal");

// Get the <span> element that closes the modal
const closeBtn = document.getElementById("secure-close-btn");

// When the user clicks on <span> (x), close the modal
closeBtn.onclick = function () {
  modal.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

setTimeout(() => {
  modal.style.display = "block";
}, 1000);
