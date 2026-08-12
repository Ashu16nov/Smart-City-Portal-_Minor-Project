const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {}).then(async () => {
  try {
    const db = mongoose.connection.db;
    const complaintsCollection = db.collection('complaints');
    await complaintsCollection.dropIndex('id_1');
    console.log("SUCCESSFULLY DROPPED OLD INDEX 'id_1'");
  } catch(e) {
    console.log("ERROR DROPPING INDEX (maybe it doesnt exist):", e);
  }
  process.exit();
});
