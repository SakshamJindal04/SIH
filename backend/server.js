// backend/server.js

// --- 1. ALL IMPORTS AT THE TOP ---
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const qrcode = require('qrcode');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Import your models
const Verification = require('./models/Verification');
const Product = require('./models/Product');
const Customer = require('./models/Customer');

// --- 2. CREATE THE EXPRESS APP ---
const app = express();
const PORT = 3000;

// --- 3. MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// --- 4. DATABASE CONNECTION STRING ---
mongoose.connect(
  "mongodb+srv://Safekart:SafeKartDB2025@cluster0.sclapsl.mongodb.net/Safekart",
  {
    // these options are not needed anymore in latest driver, safe to remove
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  }
)
.then(() => console.log("✅ MongoDB connected successfully!"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// --- 5. NEW LOCAL PRODUCT DATABASE ---
const sampleProducts = [
    // Electronics
    { barcode: '8900000000001', name: 'SmartLED Pro Laptop 14 inch', weight: 1400, mrp: 89999.00 },
    { barcode: '8900000000002', name: 'AuraSound Wireless Headphones', weight: 250, mrp: 7999.00 },
    { barcode: '8900000000003', name: 'PixelSnap 12 Smartphone', weight: 180, mrp: 65000.00 },
    // Groceries
    { barcode: '8901234567890', name: 'Organic Green Tea', weight: 250, mrp: 199.50 },
    { barcode: '8909876543210', name: 'Premium California Almonds', weight: 500, mrp: 750.00 },
    { barcode: '8901122334455', name: 'Rich Aroma Instant Coffee', weight: 100, mrp: 320.00 },
    { barcode: '8900000000004', name: 'Extra Virgin Olive Oil', weight: 1000, mrp: 1250.00 },
    // Apparel
    { barcode: '8900000000005', name: 'Men\'s Cotton Crew T-Shirt (Blue)', weight: 180, mrp: 899.00 },
    { barcode: '8900000000006', name: 'Women\'s Slim Fit Jeans', weight: 450, mrp: 2499.00 },
    // Home Goods
    { barcode: '8900000000007', name: 'EcoLight 9W LED Bulb Pack of 4', weight: 200, mrp: 550.00 },
    { barcode: '8900000000008', name: 'DuraSteel Non-Stick Frying Pan', weight: 700, mrp: 1800.00 },
    // Books
    { barcode: '8900000000009', name: 'The Midnight Library - Novel', weight: 350, mrp: 450.00 },
];

// --- 6. DEFINE ALL API ENDPOINTS ---

/**
 * @route   GET /search-products/:query
 * @desc    Searches the internal product database.
 */
app.get('/search-products/:query', async (req, res) => {
    try {
        const query = req.params.query;
        // Use a regular expression for a case-insensitive search on the product name
        const results = await Product.find({ name: { $regex: query, $options: 'i' } });
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Error during product search.' });
    }
});

/**
 * @route   POST /purchase
 * @desc    Simulates a customer purchasing a product.
 */
// In backend/server.js, find your /purchase endpoint and update it

app.post('/purchase', async (req, res) => {
    try {
        // ADD customerMobile to the destructuring
        const { customerName, customerEmail, customerMobile, productBarcode } = req.body;
        const product = await Product.findOne({ barcode: productBarcode });
        if (!product) {
            return res.status(404).json({ message: "Product not found in master database."});
        }
        // Add the mobile number when creating the new customer
        const newCustomer = new Customer({ 
            name: customerName, 
            email: customerEmail, 
            mobile: customerMobile // <-- ADD THIS LINE
        });
        await newCustomer.save();
        res.status(201).json({ 
            message: "Purchase recorded",
            customerId: newCustomer._id,
            product: product
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error during purchase."});
    }
});

/**
 * @route   POST /verify
 * @desc    Verifies hardware data against the master product database.
 */
app.post('/verify', async (req, res) => {
    try {
        const { barcode, weight, mrp, customerId } = req.body;
        
        const officialProduct = await Product.findOne({ barcode: barcode });

        if (!officialProduct) {
            return res.status(400).json({ status: 'FAIL', reason: 'Barcode not found in company records.' });
        }

        const validationFailures = [];
        if (officialProduct.weight !== weight) {
            validationFailures.push(`Weight mismatch (Expected: ${officialProduct.weight}g, Got: ${weight}g).`);
        }
        if (officialProduct.mrp !== mrp) {
            validationFailures.push(`MRP mismatch (Expected: ₹${officialProduct.mrp}, Got: ₹${mrp}).`);
        }

        if (validationFailures.length > 0) {
            const reason = validationFailures.join(' ');
            const verification = new Verification({ barcode, status: 'FAIL', reason, customer: customerId });
            await verification.save();
            return res.status(400).json({ status: 'FAIL', reason });
        } else {
            const verification = new Verification({ barcode, status: 'PASS', customer: customerId });
            const scanUrl = `http://localhost:3000/scan/${verification._id}`;
            const qrCodeDataURL = await qrcode.toDataURL(scanUrl);
            
            verification.qrCodeData = qrCodeDataURL;
            await verification.save();
            
            return res.status(200).json({ status: 'PASS', verification });
        }
    } catch (error) {
        console.error('Error in /verify:', error);
        res.status(500).json({ status: 'ERROR', message: 'Internal Server Error' });
    }
});

/**
 * @route   GET /scan/:id
 * @desc    This endpoint is accessed when a QR code is scanned.
 */
app.get('/scan/:id', async (req, res) => {
    try {
        const verification = await Verification.findById(req.params.id).populate('customer');
        const product = await Product.findOne({ barcode: verification.barcode });

        if (!verification) {
            return res.status(404).send('<h1>Verification not found.</h1>');
        }

        if (verification.scanCount >= 3) {
            return res.status(403).send(`<div style="font-family: sans-serif; text-align: center; padding: 40px;"><h1 style="color: #e74c3c;">❌ QR Code Expired</h1><p>This QR code has reached its maximum scan limit of 3.</p><p>Product: ${product.name}</p></div>`);
        }

        verification.scanCount += 1;
        await verification.save();

        res.status(200).send(`<div style="font-family: sans-serif; text-align: center; padding: 40px; border: 5px solid #2ecc71; margin: 20px;"><h1 style="color: #2ecc71;">✅ Product Verified</h1><h2>${product.name}</h2><p><strong>Barcode:</strong> ${product.barcode}</p><p><strong>Weight:</strong> ${product.weight}g</p><p><strong>MRP:</strong> ₹${product.mrp.toFixed(2)}</p><hr><h3>Customer Details</h3><p><strong>Name:</strong> ${verification.customer.name}</p><p><strong>Email:</strong> ${verification.customer.email}</p><p><strong>Purchase Date:</strong> ${new Date(verification.customer.purchaseDate).toLocaleString()}</p><hr><h2 style="color: #3498db;">Scan Count: ${verification.scanCount} of 3</h2></div>`);
    } catch (error) {
        res.status(500).send('<h1>Internal Server Error</h1>');
    }
});

/**
 * @route   GET /logs
 * @desc    Retrieves all verification logs.
 */
app.get('/logs', async (req, res) => {
    try {
        const logs = await Verification.find().sort({ timestamp: -1 }).populate('customer');
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching logs' });
    }
});

// --- 7. SERVER STARTUP LOGIC ---

const seedDatabaseIfNeeded = async () => {
    try {
        const productCount = await Product.countDocuments();
        if (productCount === 0) {
            console.log('Product database is empty. Seeding with local data...');
            await Product.insertMany(sampleProducts);
            console.log('✅ Database seeded successfully!');
        } else {
            console.log('Product database already contains data. Skipping seed.');
        }
    } catch (error) {
        console.error('❌ Error during database seeding:', error.message);
    }
};

const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected successfully!');
        await seedDatabaseIfNeeded();
        app.listen(PORT, () => {
            console.log(`🚀 SafeKart Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

startServer();