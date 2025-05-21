const db = require('../config/db');

exports.profile = (req, res) => {
    const user = req.session.user;
    res.render('profile', { user });
};
//halo
exports.updateProfile = (req, res) => {

  const userId = req.session.user.id;
  const { fullname, phone } = req.body;

  db.query(
    'UPDATE users SET fullname = ?, phone = ? WHERE id = ?',
    [fullname, phone, userId],
    (err, result) => {
      if (err) return res.send('Gagal update profil');

      req.session.user.fullname = fullname;
      req.session.user.phone = phone;

      res.redirect('/user/profile');
    }
  );
};


exports.userBookings = (req, res) => {
    const userId = req.session.user.id;

    db.query(`
        SELECT bookings.id AS booking_id, rooms.name AS room_name, checkin, checkout
        FROM bookings 
        JOIN rooms ON bookings.room_id = rooms.id 
        WHERE bookings.user_id = ?
    `, [userId], (err, results) => {
        if (err) return res.send('Gagal mengambil booking.');
        res.render('myBookings', { bookings: results });
    });
};
