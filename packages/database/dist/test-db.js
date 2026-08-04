"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
async function testConnection() {
    try {
        console.log('Testing Prisma Database Connection...');
        const userCount = await index_1.prisma.user.count();
        console.log('✅ Connection SUCCESS! Total Users in DB:', userCount);
        process.exit(0);
    }
    catch (err) {
        console.error('❌ Connection FAILED:', err.message);
        process.exit(1);
    }
}
testConnection();
//# sourceMappingURL=test-db.js.map