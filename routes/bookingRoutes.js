const express = require('express');
const router = express.Router();
const db = require('../config/db'); // sesuaikan path jika perlu

const bookingController = require('../controllers/bookingController');

router.get('/homepage', bookingController.homepage);
router.get('/form', bookingController.bookingForm);
router.post('/submit', bookingController.submitBooking);
router.get('/confirmation/:id', bookingController.confirmation);

router.get('/my-bookings', bookingController.userBookings);
router.post('/cancel/:id', bookingController.cancelBooking);

// Tambahan di bookingRoutes.js
router.post('/konfirmasi', (req, res) => {
    // Simulasi: update status booking ke "confirmed"
    res.send("Pembayaran dikonfirmasi. Terima kasih!");
});

router.get('/homepage', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  db.query('SELECT * FROM rooms', (err, rooms) => {
    if (err) return res.send('Gagal mengambil data kamar');
    res.render('homepage', { user: req.session.user, rooms });
  });
});

router.post('/book-room/:id', (req, res) => {
    const roomId = req.params.id; // ✅ ambil dari URL
    db.query('UPDATE rooms SET status = "booked" WHERE id = ?', [roomId], (err, result) => {
        if (err) {
            console.error(err);
            return res.send('❌ Terjadi kesalahan saat booking.');
        }
        res.send('✅ Kamar berhasil dibooking.');
    });
});

// Tampilkan daftar booking milik user
exports.userBookings = (req, res) => {
    const userId = req.session.user.id;
    const sql = `
        SELECT bookings.id AS booking_id, rooms.name AS room_name, checkin, checkout
        FROM bookings 
        JOIN rooms ON bookings.room_id = rooms.id 
        WHERE bookings.user_id = ?
    `;
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.send("Gagal mengambil data booking.");
        }
        res.render('myBookings', { bookings: results });
    });
};

// Batalkan booking
exports.cancelBooking = (req, res) => {
    const bookingId = req.params.id;

    // Dapatkan ID kamar dulu
    db.query('SELECT room_id FROM bookings WHERE id = ?', [bookingId], (err, result) => {
        if (err || result.length === 0) return res.send("Gagal menemukan booking.");

        const roomId = result[0].room_id;

        // Hapus booking
        db.query('DELETE FROM bookings WHERE id = ?', [bookingId], (err2) => {
            if (err2) return res.send("Gagal membatalkan booking.");

            // Kembalikan status kamar
            db.query('UPDATE rooms SET status = "available" WHERE id = ?', [roomId], (err3) => {
                if (err3) return res.send("Booking dibatalkan, tapi gagal update kamar.");
                res.redirect('/booking/my-bookings');
            });
        });
    });
};

module.exports = router;
