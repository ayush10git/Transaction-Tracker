import { asyncHandler } from "../utils/asyncHandler.js";
import { Transaction } from "../models/transaction.model.js";
import axios from "axios";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import cron from "node-cron";
import { EthereumPrice } from "../models/ethereumPrice.model.js";

export const getTransaction = asyncHandler(async (req, res) => {
  const { address } = req.params;

  const response = await axios.get(`https://api.etherscan.io/api`, {
    params: {
      module: "account",
      action: "txlist",
      address: address,
      startblock: 0,
      endblock: 99999999,
      sort: "asc",
      apikey: process.env.ETHERSCAN_API_KEY,
    },
  });

  const transactions = response.data.result;

  if (!transactions || transactions.length === 0) {
    throw new ApiError(404, "No transactions found for this address.");
  }

  for (const tx of transactions) {
    const existingTx = await Transaction.findOne({ hash: tx.hash });
    if (!existingTx) {
      await new Transaction({ ...tx, address }).save();
    }
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, transactions, "Transactions fetched successfully.")
    );
});

cron.schedule("*/10 * * * *", async () => {
  try {
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price",
      {
        params: {
          ids: "ethereum",
          vs_currencies: "inr",
        },
      }
    );

    const ethPrice = response.data.ethereum.inr;

    const priceEntry = new EthereumPrice({
      price: ethPrice,
      currency: "INR",
    });

    await priceEntry.save();
    console.log(`Ethereum price of ${ethPrice} INR stored in the database.`);
  } catch (error) {
    console.error("Error fetching Ethereum price:", error);
  }
});

export const getLast15Prices = asyncHandler(async (req, res) => {
  const prices = await EthereumPrice.find().sort({ timestamp: -1 }).limit(15);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        prices,
        "Last 15 Ethereum prices fetched Successfully."
      )
    );
});

export const getTotalExpenses = asyncHandler(async (req, res) => {
  const { address } = req.params;

  const transactions = await Transaction.find({ address });

  let totalExpenses = 0;

  transactions.forEach((tx) => {
    const gasUsed = parseFloat(tx.gasUsed);
    const gasPrice = parseFloat(tx.gasPrice);
    totalExpenses += (gasPrice * gasUsed) / 1e18;
  });

  const latestPriceEntry = await EthereumPrice.findOne().sort({
    timestamp: -1,
  });

  if (!latestPriceEntry) {
    throw new ApiError(404, "Ethereum price not found.");
  }

  const currentPrice = latestPriceEntry.price;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        address,
        totalExpensesInEther: totalExpenses,
        currentPriceInINR: currentPrice,
      },
      "Total expenses fetched successfully."
    )
  );
});
