document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // On Compose submit
  document.querySelector('#compose-form').onsubmit = () => {
    console.log('Send email');
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;
    console.log(recipients);
    console.log(subject)
    console.log(body)
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: recipients,
          subject: subject,
          body: body
      })
    })
    .then(response => response.json()
    .then(result => {
        // Print result
        console.log(result);
    }));
  };

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  // Load the emails
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    console.log(emails);
    // ... do something else with emails ...
    emails.forEach(element => {
      const email = document.createElement("div");
      if (element.read === true) {
        email.className = "emailsRead";
        email.innerHTML = `<div class="sender">${element.sender}</div><div class="subject">${element.subject}</div><div class="timestamp">${element.timestamp}</div>`;
      }
      else {
        email.className = "emails";
        email.innerHTML = `<div class="sender">${element.sender}</div><div class="subject">${element.subject}</div><div class="timestamp">${element.timestamp}</div>`;
      }
      email.id = element.id
      email.addEventListener('click', () => load_email(email.id));
      document.querySelector('#emails-view').append(email);
    });
  });
}

function load_email(emailID) {
  console.log(`emailID = ${emailID}`);
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').innerHTML = '';
  document.querySelector('#email-view').style.display = 'block';

  fetch(`/emails/${emailID}`)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);
    const emailData = document.createElement("div");
    emailData.className = "email";
    if (email.archived === false) {
      emailData.innerHTML = `<div class="sender"><strong>From:</strong> ${email.sender}</div><div class="recipient"><strong>To:</strong> ${email.recipients}</div><div class="subject"><strong>Subject: </strong>${email.subject}</div><div class="timestamp"><strong>Timestamp: </strong>${email.timestamp}</div><div class="buttons"><button class="btn btn-sm btn-outline-primary" id="reply">Reply</button><button class="btn btn-sm btn-outline-primary" id="archive">Archive</button></div><hr></div class="body">${email.body}</div>`
    }
    else {
      emailData.innerHTML = `<div class="sender"><strong>From:</strong> ${email.sender}</div><div class="recipient"><strong>To:</strong> ${email.recipients}</div><div class="subject"><strong>Subject: </strong>${email.subject}</div><div class="timestamp"><strong>Timestamp: </strong>${email.timestamp}</div><div class="buttons"><button class="btn btn-sm btn-outline-primary" id="reply">Reply</button><button class="btn btn-sm btn-outline-primary" id="archive">Unarchive</button></div><hr></div class="body">${email.body}</div>`
    }
    document.querySelector('#email-view').append(emailData);
    document.querySelector('#reply').addEventListener('click', () => reply_email(email));
    document.querySelector('#archive').addEventListener('click', () => archive_email(email));
    // ... do something else with email ...
    if (email.read === false) {
      fetch(`/emails/${emailID}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      })
      console.log("Set to read")
    };
});
}

function reply_email(email) {
  console.log(`Reply to email ID: ${email.id}`)
}

function archive_email(email) {
  const button = document.querySelector('#archive')
  if (email.archived === false) {
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: true
      })
    })
    console.log(`Archived email ID: ${email.id}`)
    button.innerHTML = "Unarchive"
  }
  else {
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: false
      })
    })
    console.log(`Unarchived email ID: ${email.id}`)
    button.innerHTML = "Archive"
  }
load_mailbox('inbox');
}