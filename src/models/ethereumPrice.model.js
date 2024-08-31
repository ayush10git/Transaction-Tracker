import mongoose from "mongoose";

const ethereumPriceSchema = new mongoose.Schema({
    price: Number,
    currency: String,
    timestamp: { type: Date, default: Date.now },
  });
  
export const EthereumPrice = mongoose.model('EthereumPrice', ethereumPriceSchema);