const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function initSuperAdmin() {
  const usersPath = path.join(__dirname, 'users.json');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const initialData = {
    users: [
      {
        id: 'superadmin',
        username: 'superadmin',
        email: 'admin@freshbites.com',
        password: hashedPassword,
        role: 'superadmin',
        createdAt: new Date().toISOString()
      }
    ]
  };

  fs.writeFileSync(usersPath, JSON.stringify(initialData, null, 2));
  console.log('✅ Super admin created!');
  console.log('Username: superadmin');
  console.log('Password: admin123');
  console.log('⚠️  Please change this password after first login!');
}

initSuperAdmin();
