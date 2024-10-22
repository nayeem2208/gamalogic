let paypalPrice
if (process.env.APP == 'Beta') {
    paypalPrice = [
        [1000, "P-7NW45488DG075491MM25NWLY", "monthly"],
        [2500, "P-1EE54055GV717671BM2452WA", "monthly"],
        [5000, "P-9Y912572NN1022200M2474NI", "monthly"],
        [10000, "P-93415479X9920982AM24743Y", "monthly"],
        [25000, "P-7G385911N36588604M25ADCQ", "monthly"],
        [50000, "P-0T292263UG2509001M25ADUY", "monthly"],
        [75000, "P-2RF042105E1959722M25AEHQ", "monthly"],
        [100000, "P-1J380710H8242232LM4ASSXI", "monthly"],
        [250000, "P-5PM81472KH310021MM25AFKY", "monthly"],
        [500000, "P-1TT15318H0322951PM25AF3I", "monthly"],
        [750000, "P-2700077055079150VM25AGJI", "monthly"],
        [1000000, "P-67S29215LN183245PM4ASNIY", "monthly"],
        [12000, "P-7NW45488DG075491MM25NWLY", "annually"],
        [30000, "P-642861822H125174XM4LVR5I", "annually"],
        [60000, "P-7AN44135WF1263455M4LVSOQ", "annually"],
        [120000, "P-0U600409VG797471MM4LVTAA", "annually"],
        [300000, "P-02V62927KD940054TM4LVTVA", "annually"],
        [600000, "P-3BB69288VK398404BM4LVY7I", "annually"],
        [900000, "P-80291684742965055M4LVUDY", "annually"],
        [1200000, "P-3ER93865PV808691NM4LVUPA", "annually"],
        [3000000, "P-03C33616VX263094JM4LVU5Y", "annually"],
        [6000000, "P-2TD975038N187041SM4LVVLI", "annually"],
        [9000000, "P-62F09829HV516111GM4LVVVQ", "annually"],
        [12000000, "P-7XA05716Y28451420M4LVV7Y", "annually"],
    ]

}
else{
    paypalPrice = [
        [1000, "P-72U39124UW699140VM3UVDJA", "monthly"],
        [2500, "P-95N96582N5110634CM3UVD5Y", "monthly"],
        [5000, "P-2BD09321277183631M3UVP6A", "monthly"],
        [10000, "P-0UP62863PB423183FM3UVSIY", "monthly"],
        [25000, "P-9TH53220UK3978158M3UVVLI", "monthly"],
        [50000, "P-6B194601HS928963XM3UVWRA", "monthly"],
        [75000, "P-78425286JB9223000M3U24TY", "monthly"],
        [100000, "P-5E207870S54825102M3U25NI", "monthly"],
        [250000, "P-92V14659CH4017010M3U26IQ", "monthly"],
        [500000, "P-9S581294M0625541AM3U27FA", "monthly"],
        [750000, "P-8L4996302T506635GM3U27UA", "monthly"],
        [1000000, "P-22G689928N540831NM3U3COQ", "monthly"],
        [12000, "P-09P99448F15622802M3U3DHA", "annually"],
        [30000, "P-4P1083047P145962AM3U3EHQ", "annually"],
        [60000, "P-8FJ05805WK865450TM3U3FKI", "annually"],
        [120000, "P-86249996XY404550JM3U3GOA", "annually"],
        [300000, "P-4PF792591V539335BM3U3HAY", "annually"],
        [600000, "P-5C050367JW309282HM3U3IEI", "annually"],
        [900000, "P-68C34773GY056461KM3U3JVA", "annually"],
        [1200000, "P-73090635J8051762FM3U3KMQ", "annually"],
        [3000000, "P-3RE78809304001220M3U3LII", "annually"],
        [6000000, "P-43448757LG389983FM3U3MCI", "annually"],
        [9000000, "P-6TY213663V394212CM3U3NFA", "annually"],
        [12000000, "P-8KU33391038351740M3U3OIY", "annually"],
    ]
}
export default paypalPrice
