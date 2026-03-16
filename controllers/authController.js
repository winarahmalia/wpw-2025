const db = require('../config/db'); // Pastikan file db.js kamu ada di folder config

exports.showLogin = (req, res) => res.render('login');

exports.getLoginPage = (req, res) => res.render('login');

exports.login = (req, res) => {
    const { username, password } = req.body;
    
    // 1. Tambahkan pengaman err agar tidak crash
    db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Terjadi kesalahan koneksi database.");
        }

        // 2. Tambahkan pengecekan 'results &&' sebelum '.length'
        if (results && results.length > 0) {
            req.session.user = results[0];
            res.redirect('/booking/homepage');
        } else {
            res.send('Login gagal! Periksa kembali username dan password.');
        }
    });
};

exports.logout = (req, res) => {
    req.session.destroy();
    res.redirect('/');
};

exports.getRegisterPage = (req, res) => {
    res.render('register');
};

exports.postRegister = (req, res) => {
    const { username, password, fullname, phone } = req.body;

    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) {
            console.error(err);
            return res.send('Terjadi kesalahan saat cek username.');
        }

        // Tambahkan pengaman results
        if (results && results.length > 0) {
            return res.send('Username sudah digunakan, silakan pilih yang lain.');
        }

        db.query(
            'INSERT INTO users (username, password, fullname, phone) VALUES (?, ?, ?, ?)',
            [username, password, fullname, phone],
            (err2, result) => {
                if (err2) {
                    console.error(err2);
                    return res.send('Gagal mendaftar.');
                }

                db.query('SELECT * FROM users WHERE id = ?', [result.insertId], (err3, users) => {
                    if (err3 || !users || users.length === 0) return res.send('Registrasi berhasil, tapi gagal login.');
                    req.session.user = users[0];
                    res.redirect('/booking/homepage');
                });
            }
        );
    });
};