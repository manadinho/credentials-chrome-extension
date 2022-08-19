// const loginBtn = document.getElementById("loginbtn");
const baseUrl = "http://127.0.0.1:8000/api/";
// const baseUrl = "https://staging.denontek.com.pk/api/";
// const token = localStorage.getItem("_token");
let token;
chrome.storage.sync.get(["_token"], (result) => {
  token = result._token;
  isUserLogin();
});
let headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
  Authorization: `Bearer ${token}`,
};

$("#loginbtn").click(login);
const logoutBtn = document.getElementById("logout");
logoutBtn.addEventListener("click", logout);

const loadCreds = document.getElementById("loadCreds");
loadCreds.addEventListener("click", fetchCredentials);

// login method
function login() {
  const email = $("#email").val();
  const password = $("#password").val();
  if (!loginValidation({ email, password })) {
    return;
  }

  $("#loginbtn").html("Loading..");
  $("#loginbtn").attr("disabled", true);

  fetch(`${baseUrl}login`, {
    method: "post",
    headers,
    body: JSON.stringify({
      email,
      password,
    }),
  })
    .then(async (res) => {
      $("#loginbtn").html("LOGIN");
      $("#loginbtn").attr("disabled", false);
      const response = await res.json();
      if (res.status === 200 && response.success) {
        toastr.success("Login successfull");
        chrome.storage.sync.set(
          {
            _token: response.access_token,
            user: JSON.stringify(response.user),
          },
          () => {
            token = response.access_token;
            resetHeader();
            isUserLogin();
            fetchCredentials();
            return true;
          }
        );
      } else {
        $("#loginbtn").html("LOGIN");
        $("#loginbtn").attr("disabled", false);
        toastr.error("Credentials are not correct");
      }
    })
    .catch((error) => {
      $("#loginbtn").html("LOGIN");
      $("#loginbtn").attr("disabled", false);
      alert(error.message);
    });
}

// validation method
function loginValidation({ email, password }) {
  if (email === "" || password === "") {
    toastr.warning("Please fill all fields");
    return false;
  }
  return true;
}

// JUST TESTING PURPOSE
function getUser(token) {
  fetch(`${baseUrl}get-user`, {
    headers,
  })
    .then((res) => {
      console.log(res);
    })
    .catch((err) => console.log(err.message));
}

// CHECKING TOKEN AND HIDE LOGIN FORM
function isUserLogin() {
  if (token) {
    drawCrdentialsTable();
    $(".login-section").hide();
    $(".welcome-section").show();
    return true;
  }
  $(".welcome-section").hide();
  $(".login-section").show();
}

async function fetchCredentials() {
  try {
    const res = await fetch(`${baseUrl}credentials`, { headers });
    const data = await res.json();
    if (data.data && data.data.length) {
      // chrome.storage.sync.set(
      //   { credentials: JSON.stringify(data.data) },
      //   () => {
      //     drawCrdentialsTable();
      //   }
      // );

      chrome.storage.local.set(
        { credentials: JSON.stringify(data.data) },
        () => {
          drawCrdentialsTable();
        }
      );
    }
  } catch (error) {
    toastr.error(error.message);
  }
}

// DRAW CREDENTIALS TABLE
function drawCrdentialsTable() {
  let tbody = ``;
  chrome.storage.local.get(["credentials"], (result) => {
    const credentials = JSON.parse(result.credentials);
    if (credentials && credentials.length) {
      for (let cred of credentials) {
        tbody += `<tr><td>
            <div class="d-flex px-2 py-1">
                <div>
                    <img style="height:16px" src="${
                      cred.plateform.favicon || "./assets/images/logo.png"
                    }" class="rounded-circle me-2">
                </div>
                <div class="d-flex flex-column justify-content-center">
                    <h6 class="mb-0 text-xs">${cred.title}</h6>
                </div>
            </div></td>
          <td>
            <a class="secure-pass-btn" href="${
              cred.url
            }" target="_blank">Launch</a>
          </td>
          </tr>
            `;
      }
    }
    $("tbody").html(tbody);
    // const buttons = document.querySelectorAll(".btnView");
    // for (var i = 0; i < buttons.length; i++) {
    //   buttons[i].addEventListener("click", (e) => {
    //     alert(e.target.id, "hello");
    //   });
    // }
  });
}

// SEND API CALL TO GET PASSWORD
async function getPassword(element) {
  console.log(element, "hello");
}

// RESET HEADER
async function resetHeader() {
  headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// LOGOUT CURRENT USER
function logout() {
  token = null;
  chrome.storage.sync.set({ _token: null }, () => {
    isUserLogin();
  });
}

document.querySelector("#fillAuto").addEventListener("click", function () {
  // document.querySelector("input[type=text]").value = "admin@ztn.com";
  chrome.runtime.sendMessage("test-channel");
});

/** GET DECRYPTED CREDENTIAL */
function getDecryptedCred(id) {}
