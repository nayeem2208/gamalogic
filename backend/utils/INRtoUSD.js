import { Convert } from "easy-currencies";


export default async function InrToUsdConverter(amount) {
  try {
    const value = await Convert(amount).from("INR").to("USD");
    return value;
  } catch (error) {
    console.error('Error converting INR to USD:', error);
  }
}
