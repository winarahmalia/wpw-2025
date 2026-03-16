const db = require('../config/db');

exports.showLogin = (req, res) => res.render('login');

exports.login = (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
        if (results.length > 0) {
            req.session.user = results[0];
            res.redirect('/booking/homepage');
        } else {
            res.send('Login gagal!');
        }
    });
};

exports.getLoginPage = (req, res) => {
  res.render('login'); // login.ejs
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

  // Cek apakah username sudah ada
  db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (err) {
      console.error(err);
      return res.send('Terjadi kesalahan saat cek username.');
    }

    if (results.length > 0) {
      return res.send('Username sudah digunakan, silakan pilih yang lain.');
    }

    // Simpan user baru
    db.query(
      'INSERT INTO users (username, password, fullname, phone) VALUES (?, ?, ?, ?)',
      [username, password, fullname, phone],
      (err2, result) => {
        if (err2) {
          console.error(err2);
          return res.send('Gagal mendaftar.');
        }

        // Login otomatis setelah registrasi
        db.query('SELECT * FROM users WHERE id = ?', [result.insertId], (err3, users) => {
          if (err3) return res.send('Registrasi berhasil, tapi gagal login.');
          req.session.user = users[0];
          res.redirect('/booking/homepage');
        });
      }
    );
  });
};
