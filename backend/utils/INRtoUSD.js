import axios from "axios";

export default async function InrToUsdConverter(amount) {
    try {
        const response=await axios('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/inr.json')

        const exchangeRate = response.data.inr.usd;

        if (!exchangeRate) {
            throw new Error(`Invalid target currency: ${targetCurrency}`);
        }

        const convertedAmount = amount * exchangeRate;
        return convertedAmount;
    } catch (error) {
        console.error('Error converting INR to USD:', error);

    }
}
