const API_EDIT_URL = "/api/edit";
const API_ADD_URL  = "/api/add";

const ADD_LIST_ENTRY =
`<span class='add-item'>
  <br>
  <input class='add-fn' name='new-fn' type='text' placeholder='Name (required)'><input class='add-ln' name='new-ln' type='text' placeholder='Surname'>
  <input class='add-nk' name='new-nk' type='text' placeholder='Nickname'><input class='add-ns' name='new-ns' type='text' placeholder='Notes'>
  <hr>
</span>`
;

shouldReload = false;

$(document).ready(function() {

  //Run once page loads
  setNote("edit-save-message", "No manual changes yet...");

  document.getElementById("action-select").value = "sign-in";
  changeAction("sign-in");
  changeAction("sign-in"); //idk why this has to run twice, but its not exactly high priority to fix
});

//Called when the server responds to a request
const handleResponse = ({ target }) => {
  //"Success" indicates no error, anything else is assumed to be an error.
  console.log("Recieved response: " + target.responseText);
  if(target.responseText=="success") {
    if(shouldReload) {
      location.reload();
    }
  }
  else {
    setNote("action-status", "Error: Input seems to be invalid");
  }
};

//Fuction called by the page, casts the value and sends it to the fuction below
function changeActionMeta(e) {
  changeAction(""+e.value);
}

//Called when the action (e.g. Sign out) is changed
function changeAction(value) {
  //Hide everthing
  setVisibility ("#signin-options", false);
  setVisibility ("#remove-confirm", false);
  setVisibility ("#add-options"   , false);

  //Unhide relevant things
  switch (value) {
    case "sign-in":
      setVisibility ("#signin-options", true);

    case "sign-out":
      break;

    case "remove":
      setVisibility ("#remove-confirm", true);
      break;

    case "add":
      setVisibility ("#add-options"   , true);
      document.getElementById("add-list").innerHTML = "";
      appendNewEntry();
      break;

    default:
      console.log("Invalid Action")
  }
}

//Add entry to the 'add new' list

function appendNewEntry() {
  entry = document.createElement("div");
  entry.innerHTML = ADD_LIST_ENTRY;
  document.getElementById("add-list").appendChild(entry.firstChild);
}

//Sets the innerHTML of a span/div, used to make code slightly neater
function setNote(id, text) {
  document.getElementById(id).innerHTML = text
}

//Submit stuff filled in into the Basic Actions form
function submitRequest() {
  var action = ""+[document.forms["actionsForm"]["action-select"].value];
  var fieldToSet, newValue;
  switch (action) {
    case "sign-in":
      fieldToSet = "location"
      newValue = [document.forms["actionsForm"]["location-select"].value];
      break;

    case "sign-out":
      fieldToSet = "location";
      newValue = "Signed Out";
      break;

    case "remove":
      if ($(".yes-im-sure")[0].checked == true) {
        fieldToSet = "remove";
        newValue = "remove";
      } else {
        return false;
      }
      break;

    case "add":
      shouldReload=true;
      addNewCampers();
      return false;

    default:
      console.log("Invalid Action: " + action);
      return false;
      break;
  }
  shouldReload = true;
  ids = grabIds();
  if (ids.length > 0) {
    sendRequest(fieldToSet, newValue, ids);
    setNote("action-status", "Request sent, page should reload shortly.");
    return true;
  } else {
    setNote("action-status", "Please select at least one person!");
    return false;
  }
}

function addNewCampers() {
  var loc = document.getElementById("add-location-select").value;
  function get(t,v) {return t.getElementsByClassName(v)[0].value;}
  var newCampers = [];

  $(".add-item").each(function() {
    if (!(get(this, "add-fn")=="")) {
      var cObj = { "firstname":get(this, "add-fn"), "lastname":get(this, "add-ln"), "nickname":get(this, "add-nk"), "note":get(this, "add-ns"), "location":loc};
      newCampers.push(cObj);
    }
  });

  out = JSON.stringify(newCampers);

  const xhr = new XMLHttpRequest();
  const data = new FormData();

  data.append("new-campers", out);
  xhr.open("POST", API_ADD_URL);
  xhr.addEventListener("load", handleResponse);
  xhr.send(data);
}
