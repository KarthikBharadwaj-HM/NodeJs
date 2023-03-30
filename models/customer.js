const mongoose = require("mongoose");
const { Schema } = mongoose;

const tierAndDetailsSchema = new Schema({
  tier: {
    type: String,
    required: true,
  },
  benefits: {
    type: [String],
    required: true,
  },
  active: {
    type: Boolean,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
});

const customerSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  birthdate: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  accounts: [Number],
  tier_and_details: tierAndDetailsSchema,
});

module.exports = customerSchema;
// module.exports = model("Customer", customerSchema);
