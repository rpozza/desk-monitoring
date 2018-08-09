const express = require('express');
const app = express();
const axios = require('axios');
const myconf = require("../../server-secret.json")
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: myconf.emailUser,
        pass: myconf.emailPass
    }
});

app.use(express.static('dist'));
app.get('/api/*', (req,res) => {
    axios.get('http://' + myconf.lwm2mserverAPIhost + req.url)
        .then((response) => {
            res.json(response.data);
        })
        .catch((err) =>{
            res.status(500)
            res.send('LWM2M Client Not Registered/Available');
        })
});
app.post('/api/sendmail', bodyParser.json(), (req,res) => {
    const mailOptions = {
        from: myconf.emailUser,
        to: req.body.to,
        subject: req.body.sub, //'User Notification Service',
        html: '<p>' + req.body.mes + '</p>'
    };
    transporter.sendMail(mailOptions, function(err,info){
        if (err)
            console.log(err);
    })
});
app.listen(myconf.serverPort, () => console.log ("Node.JS Server listening on port "+ myconf.serverPort));
