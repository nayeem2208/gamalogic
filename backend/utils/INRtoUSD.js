import axios from "axios";

export default async function InrToUsdConverter(creditOfRazorpay) {
    try {
        const creditCostMappings = [
            [1000, 7],
            [2500, 16],
            [5000, 30],
            [10000, 40],
            [25000, 75],
            [50000, 125],
            [75000, 175],
            [100000, 200],
            [250000, 400],
            [500000, 600],
            [750000, 800],
            [1000000, 1000],
          ];

          const matchDollar = creditCostMappings.find(([credit, _]) => credit === creditOfRazorpay);

          if (matchDollar) {
            const [credit, dollar] = matchDollar;
            console.log(`Matched Credit: ${credit}, Dollar: ${dollar}`);
            return dollar; // Return the dollar amount
          } else {
            console.log("No match found");
            return null; // Return null if no match is found
          }
    } catch (error) {
        console.error('Error converting INR to USD:', error);

    }
}
