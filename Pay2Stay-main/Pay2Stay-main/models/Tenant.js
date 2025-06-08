const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String, 
    tenantId: String,
    contact: String 
});

const Tenant = mongoose.models.Tenant || mongoose.model('Tenant', tenantSchema);

module.exports = Tenant;
