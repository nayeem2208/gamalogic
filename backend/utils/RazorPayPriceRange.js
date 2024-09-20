let RazorpayPrice 
if (process.env.APP == 'Beta') {
    RazorpayPrice= [
    [1000, "plan_OlAsJTdkA47ryc", "monthly"],
    [2500, "plan_OlAqxHhXfdM0Pt", "monthly"],
    [5000, "plan_OocUfqjIJngDRx", "monthly"],
    [10000, "plan_OocVUaa6qg7K4j", "monthly"],
    [25000, "plan_OocW5Xn9neGghX", "monthly"],
    [50000, "plan_OocXAaNujKzIC9", "monthly"],
    [75000, "plan_OocXnYNUZCSRNE", "monthly"],
    [100000, "plan_OocZQJgk4o3Tq2", "monthly"],
    [250000, "plan_OocbmfJMMm42ag", "monthly"],
    [500000, "plan_OocavQNmkAGA17", "monthly"],
    [750000, "plan_OodcGqSASinSCz", "monthly"],
    [1000000, "plan_OodcldnLxZm94F", "monthly"],
    [12000, "plan_OodfI7QrhDmnFZ", "annually"],
    [30000, "plan_Oodis8wG6fwni4", "annually"],
    [60000, "plan_OodjYFd6Im90gI", "annually"],
    [120000, "plan_OodkOvm1Wztouq", "annually"],
    [300000, "plan_OodlA3mSUZUUv4", "annually"],
    [600000, "plan_OodmGapWMwCegL", "annually"],
    [900000, "plan_Oodn41MASjZy9f", "annually"],
    [1200000, "plan_OodoneORwNGFS5", "annually"],
    [3000000, "plan_Oodpoh0iToJqfo", "annually"],
    [6000000, "plan_OodqdASHFmZDQ2", "annually"],
    [9000000, "plan_OodrOY1DYVQHVV", "annually"],
    [12000000, "plan_OodsIgpxQBKzLr", "annually"]
]
}
else{
    RazorpayPrice= [
        [1000, "plan_OygwOd8TXIWvgI", "monthly"],
        [2500, "plan_Oygy5IIYB1E9JJ", "monthly"],
        [5000, "plan_OygyxlsbMTkn3n", "monthly"],
        [10000, "plan_OygzzP8NcUnZ3V", "monthly"],
        [25000, "plan_Oyh1w3dJbIjBEB", "monthly"],
        [50000, "plan_Oyh2kQ4AnEHKng", "monthly"],
        [75000, "plan_Oyh3fjAyq4Gb2R", "monthly"],
        [100000, "plan_Oyh4qG8wh0uHlY", "monthly"],
        [250000, "plan_Oyh5vuOpbSBZk5", "monthly"],
        [500000, "plan_Oyh6cRSA3Yw5Be", "monthly"],
        [750000, "plan_Oyh7jG2kh5HkX4", "monthly"],
        [1000000, "plan_Oyh8fo0msESNxQ", "monthly"],
        [12000, "plan_OyhEboIv3Yd2Ma", "annually"],
        [30000, "plan_OyhFTObPJgmKjF", "annually"],
        [60000, "plan_OyhGxnBc0UJbFg", "annually"],
        [120000, "plan_OyhIfRsYMuxuLc", "annually"],
        [300000, "plan_OyhJWYl3RY9SPa", "annually"],
        [600000, "plan_OyhMlDn6R6AJiQ", "annually"],
        [900000, "plan_OyhNRH3swmhZNb", "annually"],
        [1200000, "plan_OyhO8Fc6RQWeoF", "annually"],
        [3000000, "plan_OyhPEv9W7fGQav", "annually"],
        [6000000, "plan_OyhQI1UwdJpDah", "annually"],
        [9000000, "plan_OyhRej8x6JcYpl", "annually"],
        [12000000, "plan_OyhS9IoFQJKRSF", "annually"]
    ]
}
export default RazorpayPrice
