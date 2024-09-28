
import axios from "axios";

export default async function InrToUsdSubscriptionConverter(creditOfRazorpay,period) {
    try {
        console.log(creditOfRazorpay,period,'credit and period')
        let creditCostMappings
        let MonthlyCreditCostMappings = [
            [1000, 6, "P-7NW45488DG075491MM25NWLY"],
            [2500, 14, "P-1EE54055GV717671BM2452WA"],
            [5000, 25, "P-9Y912572NN1022200M2474NI"],
            [10000, 30, "P-93415479X9920982AM24743Y"],
            [25000, 65, "P-7G385911N36588604M25ADCQ"],
            [50000, 90, "P-0T292263UG2509001M25ADUY"],
            [75000, 125, "P-2RF042105E1959722M25AEHQ"],
            [100000, 150, "P-4EE36151CK288270NM25AE4A"],
            [250000, 230, "P-5PM81472KH310021MM25AFKY"],
            [500000, 400, "P-1TT15318H0322951PM25AF3I"],
            [750000, 600, "P-2700077055079150VM25AGJI"],
            [1000000, 800, "P-4U4028875R361382AM3BRMRQ"],
          ];
        
        
         let AnnualCreditCostMappings = [
          [1000, 60, "P-7NW45488DG075491MM25NWLY"],
          [2500, 144, "P-1CU327045R943371FM3BRPVI"],
          [5000, 240, "P-1LG25877VL011492YM3BRRBY"],
          [10000, 300, "P-88916218AL1394515M3BSW3A"],
          [25000, 660, "P-4HH18885DY070713EM3BSXSY"],
          [50000, 780, "P-5EG25322401701724M3BT4RI"],
          [75000, 900, "P-59T20254AP482644UM3BT5GA"],
          [100000, 1020, "P-2D194344DY3417204M3BUBTI"],
          [250000, 2160, "P-71956783FR6971015M3BUCPY"],
          [500000, 4200, "P-7AX199510N4348730M3BUDHI"],
          [750000, 6300, "P-5RP18690UV262063EM3BUD5Q"],
          [1000000, 8400, "P-3XJ08785U0027370EM3BUEZY"],
        ];
        if(period=='is_monthly'||period=='monthly'){
            creditCostMappings=MonthlyCreditCostMappings
        }
        else{
            creditCostMappings=AnnualCreditCostMappings
        }

          const matchDollar = creditCostMappings.find(([credit, _]) => credit === creditOfRazorpay);

          if (matchDollar) {
            const [credit, dollar,id] = matchDollar;
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
