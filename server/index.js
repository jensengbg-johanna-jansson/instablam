const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const webpush = require('web-push');
const app = express();
const port = 4000;

app.use(cors());
app.use(bodyParser.json());

const vapidKeys = {
    publicKey: 'BDa4UWwW77sOdakipgCnc-WehUillhgk4NCo93zjn5AbjXHkQSFaysAYc6tgLikg6ik8Zx7eMIkDYfN3CicSGHs',
    privateKey: 'jpDOC_waLHdm0zfIX-NSw_cElG-XnlWDKgTJty5YrWE'
}  
webpush.setVapidDetails(
    'mailto:myuserid@email.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

const sendNotification = (subscription, dataToSend='') => {
    webpush.sendNotification(subscription, dataToSend);
}

app.get('/', (req, res) => res.send('Hello World!'));

const dummyDb = { subscription: null };

const saveToDatabase = async subscription => {
  dummyDb.subscription = subscription;
}

const removeFromDatabase = async () => {
  dummyDb.subscription = null;
}

app.post('/save-subscription', async (req, res) => {
  const subscription = req.body;
  await saveToDatabase(subscription);
  res.json({ message: 'successfully saved subscription' });
});

app.get('/send-notification', (req, res) => {
    const subscription = dummyDb.subscription;
    const message = 'Hello World';
    sendNotification(subscription, message);
    res.json({ message: 'successfully removed subscription' });
});

app.delete('/delete-subscription', async (req, res) => {
  await removeFromDatabase();
  res.json
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));