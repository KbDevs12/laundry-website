const express = require('express');
const fs = require('fs');
const { check, validationResult } = require('express-validator');
const passwordValidator = require('password-validator');

const app = express();


app.use(express.json());


app.use(express.static('public'));
app.use(express.static('style'));


const schema = new passwordValidator();
schema
    .is().min(8)
    .is().max(100)
    .has().uppercase()
    .has().lowercase()
    .has().digits()
    .has().not().spaces()
    .is().not().oneOf(['Passw0rd', 'Password123']);

// Routes
app.post('/register', [
    check('email').isEmail().normalizeEmail(),
    check('password').custom((value) => {
        if (!schema.validate(value)) {
            throw new Error('Password tidak memenuhi kriteria keamanan');
        }
        return true;
    }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const accounts = JSON.parse(fs.readFileSync(`accounts.json`, 'utf8'));

    if (accounts.accounts.find((acc) => acc.email === email)) {
        return res.status(400).json({ errors: [{ msg: 'Email sudah terdaftar' }] });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Data yang hendak disimpan ke accounts.json:', { email, password: hashedPassword });

    accounts.accounts.push({ email, password: hashedPassword });
    fs.writeFileSync('accounts.json', JSON.stringify(accounts, null, 2), 'utf8');

    res.json({ msg: 'Akun berhasil terdaftar' });
    console.log(`akun terdaftar`)
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const accounts = JSON.parse(fs.readFileSync('accounts.json', 'utf8'));
    const user = accounts.accounts.find((acc) => acc.email === email);
    if (!user) {
        return res.status(401).json({ msg: 'Email atau password salah' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ msg: 'Email atau password salah' });
    }

    res.redirect('/dashboard');
});


app.get('/dashboard', (req, res) => {
    res.sendFile(__dirname + '/dashboard.html');
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
