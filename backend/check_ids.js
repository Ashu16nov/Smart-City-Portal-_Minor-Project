const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://aashutoshhero123_db_user:2mZcouOARK19siWV@cluster0.uj97hem.mongodb.net/complaint_system?appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(async () => {
     const db = mongoose.connection.db;
     const complaintsColl = db.collection('complaints');
     const all = await complaintsColl.find({}).toArray();
     console.log("DB DATA:");
     console.log(all.map(c => ({ id: c._id, cId: c.complaintId, status: c.status })));
     process.exit(0);
  }).catch(e => {
    process.exit(1);
  });
