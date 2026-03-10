const db = require('./server/config/database');
async function run() {
    try {
        const users = await db.query("SELECT name, email, department_name, level, stream, year, funding_type, department FROM users WHERE role='student' LIMIT 10");
        console.log(JSON.stringify(users, null, 2));
    } catch (e) {
        console.error(e.message);
    } finally {
        process.exit(0);
    }
}
run();
