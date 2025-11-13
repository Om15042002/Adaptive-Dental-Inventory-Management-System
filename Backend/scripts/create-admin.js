const bcrypt = require('bcryptjs');
const { connectDB } = require('../src/config/database');

async function createDefaultAdmin() {
    try {
        console.log('Creating default admin user...');
        
        const connection = await connectDB();
        
        // Check if admin user already exists
        const [existingAdmin] = await connection.execute(
            'SELECT id FROM users WHERE username = ? OR role = ?',
            ['admin', 'admin']
        );
        
        if (existingAdmin.length > 0) {
            console.log('Admin user already exists. Skipping creation.');
            await connection.end();
            return;
        }
        
        // Create default admin credentials
        const defaultAdmin = {
            username: 'admin',
            email: 'admin@dental-inventory.com',
            password: 'Admin@123',
            role: 'admin'
        };
        
        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(defaultAdmin.password, saltRounds);
        
        // Insert admin user
        const [result] = await connection.execute(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            [defaultAdmin.username, defaultAdmin.email, hashedPassword, defaultAdmin.role]
        );
        
        await connection.end();
        
        console.log('✅ Default admin user created successfully!');
        console.log('📋 Login credentials:');
        console.log('   Username: admin');
        console.log('   Password: Admin@123');
        console.log('   Role: admin');
        console.log('');
        console.log('⚠️  Please change the default password after first login!');
        
    } catch (error) {
        console.error('❌ Error creating default admin user:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    createDefaultAdmin();
}

module.exports = createDefaultAdmin;