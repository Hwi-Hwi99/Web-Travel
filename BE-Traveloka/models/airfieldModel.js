const mongoose = require('mongoose');

// Sân bay
const airfieldSchema = new mongoose.Schema({
  codeAirfield: {
    type: String,
    required: true,
    unique: true,
  },
  nameAirfield: {
    type: String,
    required: true,
    unique: true,
  },
  city: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
});

const Airfield = mongoose.model('Airfield', airfieldSchema);
module.exports = Airfield;
