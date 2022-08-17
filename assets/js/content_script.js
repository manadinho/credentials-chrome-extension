// const baseUrl = "http://127.0.0.1:8000/api/";
const baseUrl = "https://staging.denontek.com.pk/api/";
let token;
let headers;
let plarform = null;

chrome.storage.sync.get(["_token"], (result) => {
  token = result._token;
  headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
});

// const passwordFields = document.getElementsByTagName("input");
// for (let i = 0; i < passwordFields.length; i++) {
//   if (passwordFields[i].type.toLowerCase() === "password") {
//     console.log("===", passwordFields[i].type);
//     passwordFields[i].classList.add("secure-password");
//   }
// }

// fetch(chrome.runtime.getURL("popup/index.html"))
//   .then((r) => r.text())
//   .then((html) => {
//     document.body.insertAdjacentHTML("beforeend", html);
//     // not using innerHTML as it would break js event listeners of the page
//   });
let currentUrl = document.location.href;

/** CHECKING URL ENDS WITH / */
const url_split = currentUrl.split("");
if (url_split[url_split.length - 1] === "/") {
  url_split.pop();
  currentUrl = url_split.join("");
}

chrome.storage.local.get(["credentials"], (result) => {
  const credentials = JSON.parse(result.credentials);

  if (credentials.length) {
    platform = credentials.find((credential) => credential.url === currentUrl);

    if (platform) {
      document.querySelector("#securePasModal").style.display = "block";
    }
  }
});

/** GET EMAIL FIELD */
function getEmailField() {
  let email = null;
  email = document.querySelector("input[type=email]");

  if (!email) {
    email = document.querySelector("input[name=email]");
  }

  if (!email) {
    email = document.querySelector("input[id=email]");
  }

  if (!email) {
    email = document.querySelector("input[name=user]");
  }

  if (!email) {
    email = document.querySelector("input[id=user]");
  }

  if (!email) {
    email = document.querySelector("input[name=username]");
  }

  if (!email) {
    email = document.querySelector("input[name=user]");
  }

  if (!email) {
    email = document.querySelector("input[id=username]");
  }

  if (!email) {
    email = document.querySelector("input[name=userName]");
  }

  if (!email) {
    email = document.querySelector("input[id=userName]");
  }

  return email;
}

/** GET PASSWORD FIELD */
function getPasswordField() {
  let password = null;
  password = document.querySelector("input[type=password]");

  if (!password) {
    password = document.querySelector("input[name=password]");
  }

  if (!password) {
    password = document.querySelector("input[id=password]");
  }

  if (!password) {
    password = document.querySelector("input[name=pass]");
  }

  if (!password) {
    password = document.querySelector("input[id=pass]");
  }

  return password;
}

/** GET SUBMIT BUTTON */
function getSubmintBtn() {
  let btn = null;
  btn = document.querySelector("button[id=login_submit]");

  if (!btn) {
    btn = document.querySelector("button[name=login]");
  }

  if (!btn) {
    btn = document.querySelector("button[id=login]");
  }

  if (!btn) {
    btn = document.querySelector("button[id=loginbutton]");
  }

  if (!btn) {
    btn = document.querySelector("button[id=loginButton]");
  }

  if (!btn) {
    btn = document.querySelector("button[id=loginbtn]");
  }

  if (!btn) {
    btn = document.querySelector("button[id=loginBtn]");
  }

  if (!btn) {
    btn = document.querySelector("button[name=signin]");
  }

  if (!btn) {
    btn = document.querySelector("button[id=signin]");
  }

  if (!btn) {
    btn = document.querySelector("button[type=submit]");
  }

  if (!btn) {
    btn = document.querySelector("button");
  }

  return btn;
}

function getDecryptedCreds(encryptionKey) {
  // const encryptionKey = prompt("Please enter you secrete key");

  fetch(`${baseUrl}credentials/view`, {
    method: "post",
    headers,
    body: JSON.stringify({
      encryptionKey,
      id: platform.id,
    }),
  })
    .then(async (res) => {
      if (res.status === 200) {
        document.querySelector("#securePasModal").style.display = "none";
        const response = await res.json();

        if (!response.success) {
          toast(response.message);
          return;
        }

        const email = getEmailField();
        const password = getPasswordField();
        const submitBtn = getSubmintBtn();

        if (email && password && submitBtn) {
          toast("Credential matched successfully.");
          email.focus();
          email.value = response.record.user_name;
          email.focus();
          email.value = "";
          document.execCommand("insertText", false, response.record.user_name);
          email.dispatchEvent(new Event("change", { bubbles: true }));

          password.focus();
          password.value = "";
          document.execCommand(
            "insertText",
            false,
            response.record.decryptedPassword
          );
          password.dispatchEvent(new Event("change", { bubbles: true }));
          submitBtn.click();
          return;
        }
        toast("Please contact with provider.");
      } else {
        const response = await res.json();
        toast(response.message);
      }
    })
    .catch((error) => {
      alert(error.message);
    });
}

const popupHtml = document.createElement("div");
popupHtml.innerHTML = `
<div id="securePasModal" class="secure-pass-modal">

  <div class="secure-pass-modal-content">
    <div class="secure-pass-modal-header">
        <span class="secure-pass-close">&times;</span>
        <p>Please Enter Encryption Key To Secure Login</p>
    </div>
    <div class="secure-pass-form">
        <input type="txt" id="secure-pass-input" class="secure-pass-input" placeholder="Enter Encryption Key" />
      </div>
      <div class="secure-pass-btns-section">
        <button class="secure-pass-btn" id="secure-pass-submit">Submit</button>
      </div>
  </div>

</div>`;

document.body.appendChild(popupHtml);

document
  .querySelector("#secure-pass-submit")
  .addEventListener("click", function () {
    const key = document.querySelector("#secure-pass-input").value;
    if (!key || key === " ") {
      toast("Please enter encryption key");
      return;
    }

    getDecryptedCreds(key);
  });

/** CLOSE MODAL */
document
  .querySelector(".secure-pass-close")
  .addEventListener("click", function () {
    document.querySelector("#securePasModal").style.display = "none";
  });

/** TOAST MESSAGE */

function toast(message = "Secure Pass") {
  const toastHtml = document.createElement("div");
  toastHtml.innerHTML = `
      <div id="secure-pass-snackbar">${message}</div>
    `;
  document.body.appendChild(toastHtml);
  const toaster = document.getElementById("secure-pass-snackbar");
  toaster.className = "show";
  setTimeout(function () {
    toaster.className = toaster.className.replace("show", "");
  }, 4000);
}
