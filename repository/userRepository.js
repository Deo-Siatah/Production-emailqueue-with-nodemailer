const db = require("../infrastructure/db");

class UserRepository {
    async create({name,email,password}) {
        const query = `
            INSERT INTO users (
                name,
                email,
                hashed_password
            )
            VALUES ($1,$2,$3)
            RETURNING *
        `;
        const values = [name,email,password];
        const {rows} = await db.query(query,values);
        return rows[0];
    }

    async findByEmail(email) {
    const query = `
        SELECT
            id,
            name,
            email,
            hashed_password AS password,
            is_verified,
            created_at,
            updated_at
        FROM users
        WHERE email = $1
    `;

    const { rows } = await db.query(query, [email]);

    return rows[0];
}
    async findById(id) {
        const query = `
            SELECT * FROM users 
            WHERE id = $1
        `;
        const {rows} = await db.query(query, [id]);
        return rows[0];
    }

    async verifyUser(id){
        const query = `
            UPDATE users
            SET is_verified = true,
                updated_at = NOW()
            where id = $1
            RETURNING *
        `;
        const {rows} = await db.query(query, [id]);
        return rows[0];
    }
}

module.exports = new UserRepository();