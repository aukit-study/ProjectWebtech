// 🏷️ Discount Service - Gatekeeper Pattern
// คำนวณส่วนลดฝั่ง Server เท่านั้น ห้าม Frontend ส่งราคามาเอง
class DiscountService {

    static async calculateCheckout(db, courseIds) {
        console.log("courseIds =", courseIds);
        console.log("originalTotal =", originalTotal);
        console.log("itemCount =", itemCount);

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
        const itemCount     = courses.length;

        console.log("courseIds =", courseIds);
        console.log("originalTotal =", originalTotal);
        console.log("itemCount =", itemCount);

        // ── Step 3: Dynamic Discount Engine ──
let discountPercent = 0;
const reasons = [];

if (itemCount >= 3 && originalTotal > 1500) {
    // ✅ เช็คเงื่อนไขรวมก่อน (priority สูงสุด)
    discountPercent = 15;
    reasons.push('ซื้อ 3 คอร์สขึ้นไป และยอดรวมเกิน ฿1,500 (ลด 15%)');
} else if (originalTotal > 1500) {
    discountPercent = 10;
    reasons.push('ยอดรวมเกิน ฿1,500 (ลด 10%)');
} else if (itemCount >= 3) {
    discountPercent = 5;
    reasons.push('ซื้อตั้งแต่ 3 คอร์สขึ้นไป (ลด 5%)');
}

        const discountReason = reasons.length > 0
            ? reasons.join(' + ')
            : 'ไม่มีส่วนลด';

        // ── Step 4: คำนวณราคาสุดท้าย ──              ← ของเดิมไม่มีส่วนนี้เลย
        const discountAmount  = Math.round(originalTotal * discountPercent / 100);
        const finalTotal      = originalTotal - discountAmount;

        return {
            courses,
            originalTotal,
            discountPercent,
            discountAmount,
            finalTotal,
            discountReason,
        };
    }   // ← ปิด method ที่นี่
}       // ← ปิด class ที่นี่

module.exports = DiscountService;