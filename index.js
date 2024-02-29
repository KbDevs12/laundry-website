const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login-register.html'));
});

app.post('/register', (req, res) => {
    const { name, email, password } = req.body;

    // Read the existing users from users.json
    const usersPath = path.join(__dirname, 'public', 'users.json');
    let users = [];
    if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    }

    // Add the new user
    users.push({ name, email, password });

    // Write the updated users back to users.json
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

    res.send('User registered successfully');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
