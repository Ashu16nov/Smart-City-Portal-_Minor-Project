const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://aashutoshhero123_db_user:2mZcouOARK19siWV@cluster0.uj97hem.mongodb.net/complaint_system?appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(async () => {
     console.log("Connected to MongoDB...");
     const db = mongoose.connection.db;
     const complaintsColl = db.collection('complaints');
     
     const total = await complaintsColl.countDocuments();
     console.log("Total complaints before deletion:", total);
     
     // Find the 10 oldest complaints
     const oldDocs = await complaintsColl.find({}).sort({ _id: 1 }).limit(10).toArray();
     
     if (oldDocs.length > 0) {
       const idsToDelete = oldDocs.map(d => d._id);
       const res = await complaintsColl.deleteMany({ _id: { $in: idsToDelete } });
       console.log(`Successfully deleted ${res.deletedCount} old complaints.`);
     } else {
       console.log("No complaints found to delete.");
     }
     
     const newTotal = await complaintsColl.countDocuments();
     console.log("Total complaints remaining:", newTotal);
     
     process.exit(0);
  }).catch(e => {
    console.error(e);
    process.exit(1);
  });
