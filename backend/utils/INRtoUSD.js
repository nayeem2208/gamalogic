import CC from 'currency-converter-lt';

export default async function InrToUsdConverter(amount) {
  try {
    let currencyConverter = new CC({ from: "INR", to: "USD", amount: amount });
    const result = await currencyConverter.convert();
    console.log(`100 INR is approximately ${result} USD`);
    return result;
  } catch (error) {
    console.error('Error converting INR to USD:', error);
  }
}
