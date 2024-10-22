
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
          [2500, 144, "P-642861822H125174XM4LVR5I"],
          [5000, 240, "P-7AN44135WF1263455M4LVSOQ"],
          [10000, 300, "P-0U600409VG797471MM4LVTAA"],
          [25000, 660, "P-02V62927KD940054TM4LVTVA"],
          [50000, 780, "P-3BB69288VK398404BM4LVY7I"],
          [75000, 900, "P-80291684742965055M4LVUDY"],
          [100000, 1020, "P-3ER93865PV808691NM4LVUPA"],
          [250000, 2160, "P-03C33616VX263094JM4LVU5Y"],
          [500000, 4200, "P-2TD975038N187041SM4LVVLI"],
          [750000, 6300, "P-62F09829HV516111GM4LVVVQ"],
          [1000000, 8400, "P-7XA05716Y28451420M4LVV7Y"],
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
