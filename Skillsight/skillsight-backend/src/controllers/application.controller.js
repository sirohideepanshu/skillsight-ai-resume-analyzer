import db from "../config/db.js"

export const createApplication = async (req, res) => {

try {

const { job_id } = req.body
const user_id = req.user.id

await db.query(
"INSERT INTO applications (job_id, candidate_id) VALUES ($1,$2)",
[job_id, user_id]
)

res.json({message:"Application submitted"})

} catch (error) {

console.error(error)
res.status(500).json({error:"Application failed"})

}

}