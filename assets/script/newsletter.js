var newsletterSubscriptionForm = document.getElementById('newsletter-subscription-form')

var emailInput = document.getElementById('email-input');
var newsletterSubscribeButton = document.getElementById('email-submit-button');

newsletterSubscriptionForm.addEventListener('submit', function (event) {
    event.preventDefault();

    var emailAddress = emailInput.value;

    sendEmail(emailAddress);
});

async function sendEmail(emailAddress) {
    // code fragment
    var body = {
        "to": "jiminac495@cubene.com",
        "subject": "Signed Up",
        "html": "<p>Lorem ipsum dolor..., <b>vel</b> luctu.</p>",
        "company": "Group Two",
        "sendername": "Group Two"
    };


    var response = await fetch('https://email-724e.restdb.io/mail', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-apikey': '65c081ccbdc5b25dae12d715',
            'Cache-Control': 'no-cache',
        },
        body,
    })
    console.log(response)

    var data = await response.json();
    console.log(data);
}