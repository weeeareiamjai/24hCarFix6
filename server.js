const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 5000;

// 1. Middleware Setup
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.use(cors()); 
app.use(express.json()); 
app.use(express.static(__dirname)); 

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// สร้าง uploads directory
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
app.use('/uploads', express.static(uploadDir));

// 2. Multer Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + Date.now() + ext);
    }
});
const upload = multer({ storage: storage });

// --------------------------------------------------------
// ข้อมูลจำลอง (Database Mocks)
// --------------------------------------------------------

let posts = [
    {
        id: 1,
        user: 'AutoExpert',
        text: 'ใครมีประสบการณ์เปลี่ยนโช๊คอัพบ้างครับ? ยี่ห้อไหนดีสุดสำหรับรถ Eco Car?',
        timestamp: Date.now() - 3600000,
        media_url: null,
        type: 'text',
        comments: [
            { user: 'CarLover', text: 'แนะนำ Monroe Reflex ครับ นุ่มหนึบกำลังดีเลย', timestamp: Date.now() - 3000000 },
            { user: 'MechanicBob', text: 'ต้องดูงบด้วยนะ ถ้าเน้นประหยัด KYB ก็ใช้ได้', timestamp: Date.now() - 2800000 }
        ]
    }
];

// ข้อมูลสินค้าอะไหล่รถยนต์ (25 รายการ)
let products = [
    {
        id: 101,
        name: "น้ำมันเครื่องสังเคราะห์ 100%",
        brand: "Mobil 1",
        price: 2500,
        image: "/uploads/p1.png",
        description: "สูตรพิเศษสำหรับเครื่องยนต์เบนซิน ช่วยปกป้องเครื่องยนต์ได้ดีเยี่ยม"
    },
    {
        id: 102,
        name: "กรองน้ำมันเครื่อง",
        brand: "Bosch",
        price: 350,
        image: "/uploads/p2.jpg",
        description: "กรองสิ่งสกปรกได้ละเอียด ยืดอายุการใช้งานเครื่องยนต์"
    },
    {
        id: 103,
        name: "แบตเตอรี่รถยนต์ (แห้ง)",
        brand: "GS Battery",
        price: 3200,
        image: "/uploads/p3.png",
        description: "ไม่ต้องดูแลน้ำกลั่น ไฟแรง สตาร์ทติดง่าย ทนทาน"
    },
    {
        id: 104,
        name: "ยางปัดน้ำฝน (คู่)",
        brand: "3M",
        price: 450,
        image: "/uploads/p4.jpg",
        description: "รีดน้ำได้เกลี้ยง ทนต่อแสงแดดและรังสี UV ติดตั้งง่าย"
    },
    {
        id: 105,
        name: "หัวเทียน Iridium",
        brand: "NGK",
        price: 1200,
        image: "/uploads/p5.jpg",
        description: "จุดระเบิดแม่นยำ ช่วยประหยัดน้ำมัน อัตราเร่งดีขึ้น"
    },
    {
        id: 106,
        name: "น้ำยาหล่อเย็น (Coolant)",
        brand: "Toyota",
        price: 650,
        image: "//uploads/p6.png",
        description: "ป้องกันสนิมและตระกรัน ช่วยระบายความร้อนได้ดี"
    },
    {
        id: 107,
        name: "ยางรถยนต์ Pilot Sport 4",
        brand: "Michelin",
        price: 15000,
        image: "/uploads/p7.jpg",
        description: "ยางสปอร์ตสมรรถนะสูง ยึดเกาะถนนดีเยี่ยมทั้งแห้งและเปียก (ราคานี้ 4 เส้น)"
    },
    {
        id: 108,
        name: "ผ้าเบรกหน้า (คู่)",
        brand: "Brembo",
        price: 2800,
        image: "/uploads/p8.jpg",
        description: "เบรกมั่นใจ ระยะเบรกสั้นลง ทนความร้อนสูง"
    },
    {
        id: 109,
        name: "ไส้กรองอากาศ (Air Filter)",
        brand: "K&N",
        price: 1800,
        image: "/uploads/p9.jpg",
        description: "กรองฝุ่นได้ดี ล้างทำความสะอาดได้ เพิ่มอัตราเร่ง"
    },
    {
        id: 110,
        name: "แว็กซ์เคลือบสีรถ",
        brand: "Meguiar's",
        price: 950,
        image: "/uploads/p10.png",
        description: "ให้ความเงางามฉ่ำลึก ปกป้องสีรถจากรอยขีดข่วนและ UV"
    },
    {
        id: 111,
        name: "กล้องติดรถยนต์ 4K",
        brand: "Xiaomi 70mai",
        price: 3500,
        image: "/uploads/p11.png",
        description: "ความละเอียด 4K คมชัดทั้งกลางวันกลางคืน มี GPS ในตัว"
    },
    {
        id: 112,
        name: "ที่วางโทรศัพท์ในรถ (แม่เหล็ก)",
        brand: "Baseus",
        price: 250,
        image: "/uploads/p12.jpg",
        description: "ยึดแน่น ไม่หลุดง่าย หมุนได้ 360 องศา"
    },
    {
        id: 113,
        name: "พรมปูพื้นรถยนต์เข้ารูป",
        brand: "Ei Products",
        price: 1900,
        image: "/uploads/p13.jpg",
        description: "วัสดุเกรด A กันน้ำ ทำความสะอาดง่าย เข้ารูปกับตัวรถ"
    },
    {
        id: 114,
        name: "หลอดไฟหน้า LED (ขั้ว H4)",
        brand: "Philips",
        price: 1450,
        image: "/uploads/p14.jpg",
        description: "สว่างกว่าหลอดเดิม 200% แสงสีขาวนวล ไม่แยงตาเพื่อนร่วมทาง"
    },
    {
        id: 115,
        name: "แม่แรงตะเข้ 2 ตัน",
        brand: "Smart Tool",
        price: 1100,
        image: "/uploads/p15.jpg",
        description: "แข็งแรง ทนทาน ยกรถได้ง่าย สำหรับเปลี่ยนยางฉุกเฉิน"
    },
    {
        id: 116,
        name: "ผ้าไมโครไฟเบอร์ (แพ็ค 3 ผืน)",
        brand: "3M",
        price: 199,
        image: "/uploads/p16.jpg",
        description: "เนื้อนุ่ม ไม่ทิ้งรอยขนแมว ซับน้ำได้ดีเยี่ยม"
    },
    {
        id: 117,
        name: "น้ำมันเบรก DOT 4",
        brand: "Shell",
        price: 250,
        image: "/uploads/p17.png",
        description: "ทนความร้อนสูง ป้องกันการเกิดฟองอากาศในระบบเบรก"
    },
    {
        id: 118,
        name: "น้ำมันพวงมาลัยพาวเวอร์",
        brand: "PTT",
        price: 180,
        image: "/uploads/p18.jpg",
        description: "ช่วยให้พวงมาลัยหมุนง่าย ลดการสึกหรอของปั๊มพาวเวอร์"
    },
    {
        id: 119,
        name: "เครื่องดูดฝุ่นในรถยนต์",
        brand: "Xiaomi",
        price: 1290,
        image: "/uploads/p19.png",
        description: "ไร้สาย แรงดูดสูง ขนาดกะทัดรัด พกพาสะดวก"
    },
    {
        id: 120,
        name: "จัมพ์สตาร์ทรถยนต์ (Power Bank)",
        brand: "70mai",
        price: 2200,
        image: "/uploads/p20.jpg",
        description: "สตาร์ทรถได้เมื่อแบตหมด และใช้ชาร์จมือถือได้"
    },
    {
        id: 121,
        name: "ปั๊มลมไฟฟ้าติดรถยนต์",
        brand: "Michelin",
        price: 1500,
        image: "/uploads/p21.png",
        description: "เติมลมยางอัตโนมัติ ตั้งค่าแรงดันได้ มีไฟฉายในตัว"
    },
    {
        id: 122,
        name: "กรองแอร์ PM 2.5",
        brand: "Denso",
        price: 450,
        image: "/uploads/p22.png",
        description: "กรองฝุ่นละอองขนาดเล็ก PM 2.5 ได้อย่างมีประสิทธิภาพ"
    },
    {
        id: 123,
        name: "น้ำหอมปรับอากาศในรถ",
        brand: "Ambi Pur",
        price: 129,
        image: "/uploads/p23.png",
        description: "ขจัดกลิ่นอับ ให้ความหอมสดชื่นยาวนาน"
    },
    {
        id: 124,
        name: "ปลอกหุ้มพวงมาลัยหนังแท้",
        brand: "Sparco",
        price: 890,
        image: "/uploads/p24.jpg",
        description: "จับกระชับมือ ระบายอากาศได้ดี ดีไซน์สปอร์ต"
    },
    {
        id: 125,
        name: "โช๊คอัพหน้า (คู่)",
        brand: "Tokico",
        price: 3500,
        image: "/uploads/p25.png",
        description: "นุ่มนวล เกาะถนน รองรับแรงกระแทกได้ดี"
    }
];


// --------------------------------------------------------
// API Routes
// --------------------------------------------------------

// --- Feed Routes ---
app.get('/api/posts', (req, res) => {
    res.json(posts);
});

app.post('/api/posts', upload.single('media_file'), (req, res) => {
    if (!req.body.post_text) {
        if (req.file) fs.unlink(req.file.path, () => { });
        return res.status(400).json({ message: 'กรุณาใส่ข้อความในโพสต์' });
    }

    const newPost = {
        id: posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1,
        // *** LOGIN LOGIC: ใช้ชื่อ User ที่ส่งมา ถ้าไม่มีใช้ Guest ***
        user: req.body.user || 'Current User (Guest)',
        // ********************************************************
        text: req.body.post_text,
        timestamp: Date.now(),
        media_url: req.file ? `http://localhost:${port}/uploads/${req.file.filename}` : null,
        type: req.file ? (req.file.mimetype.startsWith('video/') ? 'video' : 'image') : 'text',
        comments: []
    };

    posts.unshift(newPost);
    res.status(201).json({ message: 'โพสต์สำเร็จ', post: newPost });
});

app.post('/api/posts/:postId/comments', (req, res) => {
    const postId = parseInt(req.params.postId);
    const commentText = req.body.comment_text;
    const post = posts.find(p => p.id === postId);

    if (!post) return res.status(404).json({ message: 'ไม่พบโพสต์' });
    if (!commentText) return res.status(400).json({ message: 'กรุณาใส่ข้อความ' });

    const newComment = {
        // *** LOGIN LOGIC: ใช้ชื่อ User ที่ส่งมา ถ้าไม่มีใช้ Guest ***
        user: req.body.user || 'Current User (Guest)',
        // ********************************************************
        text: commentText.trim(),
        timestamp: Date.now()
    };

    if (!post.comments) post.comments = [];
    post.comments.push(newComment);

    res.status(201).json({ message: 'คอมเมนต์สำเร็จ', comment: newComment });
});

// --- Shop Routes ---
app.get('/api/products', (req, res) => {
    res.json(products);
});


// Start Server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});