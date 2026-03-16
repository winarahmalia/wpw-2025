const db = require('../config/db');

exports.homepage = (req, res) => {
    db.query('SELECT * FROM rooms', (err, rooms) => {
    res.render('homepage', { user: req.session.user, rooms });
});
};

exports.bookingForm = (req, res) => {
    const roomId = req.query.roomId;
    res.render('booking', { roomId });
};

exports.submitBooking = (req, res) => {
    const { checkin, checkout, roomId } = req.body;
    const userId = req.session.user.id;

    // Validasi dulu sebelum insert
    if (new Date(checkout) <= new Date(checkin)) {
        return res.send("Tanggal check-out harus setelah check-in.");
    }

    // Simpan booking
    db.query(
        'INSERT INTO bookings (user_id, room_id, checkin, checkout) VALUES (?, ?, ?, ?)',
        [userId, roomId, checkin, checkout],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.send("Gagal menyimpan booking.");
            }

            // Update status kamar
            db.query(
                'UPDATE rooms SET status = "booked" WHERE id = ?',
                [roomId],
                (err2) => {
                    if (err2) {
                        console.error(err2);
                        return res.send("Booking tersimpan, tapi gagal memperbarui status kamar.");
                    }

                    // Redirect ke halaman konfirmasi
                    res.redirect(`/booking/confirmation/${result.insertId}`);
                }
            );
        }
    );
};

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

exports.confirmation = (req, res) => {
    const bookingId = req.params.id;
    db.query('SELECT * FROM bookings WHERE id = ?', [bookingId], (err, booking) => {
        res.render('confirmation', { booking: booking[0] });
    });
};

exports.cancelBooking = (req, res) => {
    const bookingId = req.params.id;

    db.query('SELECT room_id FROM bookings WHERE id = ?', [bookingId], (err, result) => {
        if (err || result.length === 0) {
            console.error(err);
            return res.send('Booking tidak ditemukan.');
        }

        const roomId = result[0].room_id;
        db.query('DELETE FROM bookings WHERE id = ?', [bookingId], (err2) => {
            if (err2) {
                console.error(err2);
                return res.send('Gagal membatalkan booking.');
            }

            db.query('UPDATE rooms SET status = "available" WHERE id = ?', [roomId], (err3) => {
                if (err3) {
                    console.error(err3);
                    return res.send('Booking dibatalkan, tapi gagal mengupdate status kamar.');
                }

                res.redirect('/booking/my-bookings');
            });
        });
    });
};

