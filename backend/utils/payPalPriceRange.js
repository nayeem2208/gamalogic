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
        [30000, "P-1CU327045R943371FM3BRPVI", "annually"],
        [60000, "P-9Y912572NN1022200M2474NI", "annually"],
        [120000, "P-88916218AL1394515M3BSW3A", "annually"],
        [300000, "P-4HH18885DY070713EM3BSXSY", "annually"],
        [600000, "P-5EG25322401701724M3BT4RI", "annually"],
        [900000, "P-59T20254AP482644UM3BT5GA", "annually"],
        [1200000, "P-83C1282346824020HM4ASTVY", "annually"],
        [3000000, "P-71956783FR6971015M3BUCPY", "annually"],
        [6000000, "P-7AX199510N4348730M3BUDHI", "annually"],
        [9000000, "P-5RP18690UV262063EM3BUD5Q", "annually"],
        [12000000, "P-24657049SD194790MM4ASOTI", "annually"],
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
