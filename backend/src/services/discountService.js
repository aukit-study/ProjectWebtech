// 🏷️ Discount Service - Gatekeeper Pattern
// คำนวณส่วนลดฝั่ง Server เท่านั้น ห้าม Frontend ส่งราคามาเอง
class DiscountService {

    static async calculateCheckout(db, courseIds) {

        // ── Step 1: Query ราคาจริงจาก DB ──
        const placeholders = courseIds.map(() => '?').join(', ');
        const courses = await db.all(
            `SELECT id, title, price FROM courses WHERE id IN (${placeholders})`,
            courseIds
        );

        if (courses.length === 0) {
            throw new Error('COURSES_NOT_FOUND');
        }

        // ── Step 2: คำนวณ originalTotal ──
        const originalTotal = courses.reduce((sum, c) => sum + (c.price || 0), 0);
        const itemCount = courses.length;


        // ── Step 3: Dynamic Discount Engine ──
        let discountPercent = 0;
        let discountReason = '';

        if (itemCount > 3 && originalTotal > 1500) {
            discountPercent = 15;
            discountReason = 'ซื้อมากกว่า 3 คอร์ส และ ยอดรวมเกิน ฿1,500 (ลด 15%)';
        } else if (originalTotal > 1500) {
            discountPercent = 10;
            discountReason = 'ยอดรวมเกิน ฿1,500 (ลด 10%)';
        } else if (itemCount > 3) {
            discountPercent = 5;
            discountReason = 'ซื้อมากกว่า 3 คอร์ส (ลด 5%)';
        } else {
            discountReason = 'ไม่มีส่วนลด';
        }

        // ── Step 4: คำนวณราคาสุดท้าย ──              ← ของเดิมไม่มีส่วนนี้เลย
        const discountAmount = Math.round(originalTotal * discountPercent / 100);
        const finalTotal = originalTotal - discountAmount;

        return {
            courses,
            originalTotal,
            discountPercent,
            discountAmount,
            recalculatedTotal: finalTotal,
            discountReason
        };
    }
}

module.exports = DiscountService;