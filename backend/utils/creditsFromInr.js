function CreditsFromInr(amount,period){
    let creditMappings
    let monthly=[
        [6,558,1000],
        [14,1302,2500],
        [25,2325,5000],
        [30,2790,10000],
        [65,6045,25000],
        [90,8370,50000],
        [125,11625,75000],
        [150,13950,100000],
        [230,21390,250000],
        [400,37200,500000],
        [600,55800,750000],
        [800,74400,1000000]
    ]

    let annually=[
        [5,465,1000],
        [12,1116,2500],
        [20,1860,5000],
        [25,2325,10000],
        [55,5115,25000],
        [65,6045,50000],
        [75,6975,75000],
        [85,7905,100000],
        [180,16740,250000],
        [350,32550,500000],
        [525,48825,750000],
        [700,65100,1000000],
    ]
    if(period=='is_monthly'||period=='monthly'){
        creditMappings=monthly
    }
    else{
        creditMappings=annually
    }

    const match = creditMappings.find(([_, mappedAmount]) => mappedAmount === amount);

    if (match) {
        const [dollarRate, , credits] = match;
        return { dollarRate, credits };
    } else {
        return null; 
    }
}

export default CreditsFromInr