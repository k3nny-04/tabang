const evacData = [
  {
    "Barangay": "Abella",
    "Evacuation_Name": "Abella Barangay Hall",
    "Capacity": 750,
    "Manager": "Apolinario C. Malana Jr.",
    "Contact": 9124333583,
    "Lat": 13.62523103,
    "Long": 123.1782281
  },
  {
    "Barangay": "Bagumbayan Sur",
    "Evacuation_Name": "Sta. Cruz Event Center",
    "Capacity": 250,
    "Manager": "Augusto Borromeo",
    "Contact": 9463333113,
    "Lat": 13.62875039,
    "Long": 123.180416
  },
  {
    "Barangay": "Bagumbayan Sur",
    "Evacuation_Name": "Bagumbayan Sur Barangay Hall",
    "Capacity": 250,
    "Manager": "Albert Cao",
    "Contact": 9484894973,
    "Lat": 13.63268469,
    "Long": 123.1867494
  },
  {
    "Barangay": "Bagumbayan Sur",
    "Evacuation_Name": "Abcede Elementary School",
    "Capacity": 100,
    "Manager": "Maria Grace N. Pimentel",
    "Contact": 9103788813,
    "Lat": 13.6332808,
    "Long": 123.1858729
  },
  {
    "Barangay": "Bagumbayan Norte",
    "Evacuation_Name": "Bagumbayan Norte Barangay Hall",
    "Capacity": 500,
    "Manager": "Ric G. Reyes",
    "Contact": 9461103495,
    "Lat": 13.63869729,
    "Long": 123.1845658
  },
  {
    "Barangay": "Balatas",
    "Evacuation_Name": "Pagcor Multi Purpose Building",
    "Capacity": 250,
    "Manager": "Allen Reondanga",
    "Contact": 9178121442,
    "Lat": 13.62748332,
    "Long": 123.2087073
  },
  {
    "Barangay": "Balatas",
    "Evacuation_Name": "Balatas High School",
    "Capacity": 300,
    "Manager": "Shiela Taugan",
    "Contact": 9381752488,
    "Lat": 13.62771505,
    "Long": 123.2096292
  },
  {
    "Barangay": "Balatas",
    "Evacuation_Name": "Balatas Elementary School",
    "Capacity": 100,
    "Manager": "Jesus P. Aguilar",
    "Contact": 9186807310,
    "Lat": 13.6290999,
    "Long": 123.2098807
  },
  {
    "Barangay": "Balatas",
    "Evacuation_Name": "Mac Mariano Elementary School",
    "Capacity": 175,
    "Manager": "Raquel A. Papa",
    "Contact": 9397188808,
    "Lat": 13.63111011,
    "Long": 123.2014762
  },
  {
    "Barangay": "Balatas",
    "Evacuation_Name": "Naga City Science High School",
    "Capacity": 300,
    "Manager": "Baby F. Laurente",
    "Contact": 9285523678,
    "Lat": 13.6281119,
    "Long": 123.2056018
  },
  {
    "Barangay": "Calauag",
    "Evacuation_Name": "Camarines Sur National High School Annex",
    "Capacity": 1500,
    "Manager": "Lenon O. Vibar",
    "Contact": 9301072328,
    "Lat": 13.63390754,
    "Long": 123.1925831
  },
  {
    "Barangay": "Calauag",
    "Evacuation_Name": "Calauag Barangay Hall",
    "Capacity": 750,
    "Manager": "Marlyn G. Balcueva",
    "Contact": 9382603854,
    "Lat": 13.64325943,
    "Long": 123.1911137
  },
  {
    "Barangay": "Cararayan",
    "Evacuation_Name": "Cararayan Barangay Hall",
    "Capacity": 350,
    "Manager": "Diego Apin",
    "Contact": 9218897499,
    "Lat": 13.62878523,
    "Long": 123.2400494
  },
  {
    "Barangay": "Cararayan",
    "Evacuation_Name": "Cararayan National High School",
    "Capacity": 50,
    "Manager": "Joy Unica",
    "Contact": 9466088480,
    "Lat": 13.62962223,
    "Long": 123.2380635
  },
  {
    "Barangay": "Cararayan",
    "Evacuation_Name": "Don Manuel I. Abella Central School",
    "Capacity": 500,
    "Manager": "Joy Unica",
    "Contact": 9466088480,
    "Lat": 13.62911821,
    "Long": 123.2399999
  },
  {
    "Barangay": "Cararayan",
    "Evacuation_Name": "San Rafael Elementary School Sped Center",
    "Capacity": 50,
    "Manager": "Luningning Mortega",
    "Contact": "",
    "Lat": 13.63223512,
    "Long": 123.2274127
  },
  {
    "Barangay": "Carolina",
    "Evacuation_Name": "Carolina Barangay Hall",
    "Capacity": 100,
    "Manager": "Marites S. Sarol",
    "Contact": 9177909563,
    "Lat": 13.66384514,
    "Long": 123.2891688
  },
  {
    "Barangay": "Carolina",
    "Evacuation_Name": "Teodora Moscoso Elementary School",
    "Capacity": 100,
    "Manager": "Ronald A. Enriquez",
    "Contact": 9177289547,
    "Lat": 13.66379104,
    "Long": 123.2682206
  },
  {
    "Barangay": "Carolina",
    "Evacuation_Name": "Carolina National High School",
    "Capacity": 100,
    "Manager": "Ramon T. Reyta",
    "Contact": 9177129504,
    "Lat": 13.66137808,
    "Long": 123.2906496
  },
  {
    "Barangay": "Carolina",
    "Evacuation_Name": "Yabu Elementary School",
    "Capacity": 100,
    "Manager": "Salvacion D. Boragay",
    "Contact": 9177919571,
    "Lat": 13.64328471,
    "Long": 123.2937331
  },
  {
    "Barangay": "Concepcion Grande",
    "Evacuation_Name": "Concepcion Grande Elementary School",
    "Capacity": 750,
    "Manager": "Gemma C. Falabi",
    "Contact": "",
    "Lat": 13.61983327,
    "Long": 123.2205207
  },
  {
    "Barangay": "Concepcion Grande",
    "Evacuation_Name": "Concepcion Grande Barangay Hall",
    "Capacity": 150,
    "Manager": "Jerrold R. Rito",
    "Contact": 9088658325,
    "Lat": 13.62027861,
    "Long": 123.2201871
  },
  {
    "Barangay": "Concepcion Pequena",
    "Evacuation_Name": "Naga City People's Hall",
    "Capacity": 635,
    "Manager": "Anna Mae Alimad",
    "Contact": 907906501,
    "Lat": 13.62605123,
    "Long": 123.1985772
  },
  {
    "Barangay": "Concepcion Pequena",
    "Evacuation_Name": "Concepcion Pequena National High School",
    "Capacity": 300,
    "Manager": "Jacquilyn M. Tuy",
    "Contact": 9070539952,
    "Lat": 13.61690241,
    "Long": 123.2053751
  },
  {
    "Barangay": "Dayangdang",
    "Evacuation_Name": "Naga City Youth Center",
    "Capacity": 75,
    "Manager": "Achilles Felipe",
    "Contact": 9173078962,
    "Lat": 13.62865924,
    "Long": 123.196886
  },
  {
    "Barangay": "Dayangdang",
    "Evacuation_Name": "Dayangdang Barangay Hall",
    "Capacity": 225,
    "Manager": "Achilles Felipe",
    "Contact": 9173078962,
    "Lat": 13.62959989,
    "Long": 123.1936694
  },
  {
    "Barangay": "Dinaga",
    "Evacuation_Name": "Naga City People's Mall",
    "Capacity": 50,
    "Manager": "Jerry O. Casin",
    "Contact": 9772377412,
    "Lat": 13.62064354,
    "Long": 123.1836593
  },
  {
    "Barangay": "Del Rosario",
    "Evacuation_Name": "Del Rosario Barangay Hall",
    "Capacity": 100,
    "Manager": "Rosalinda Marpuri",
    "Contact": 9947215623,
    "Lat": 13.63214352,
    "Long": 123.169551
  },
  {
    "Barangay": "Del Rosario",
    "Evacuation_Name": "Barangay Health Center",
    "Capacity": 100,
    "Manager": "Rosalinda Marpuri",
    "Contact": 9947215623,
    "Lat": 13.62287364,
    "Long": 123.242742
  },
  {
    "Barangay": "Del Rosario",
    "Evacuation_Name": "Del Rosario Elementary School",
    "Capacity": 300,
    "Manager": "Rosalinda Marpuri",
    "Contact": 9947215623,
    "Lat": 13.61775717,
    "Long": 123.2365934
  },
  {
    "Barangay": "Del Rosario",
    "Evacuation_Name": "Villa Corazon Elementary School",
    "Capacity": 250,
    "Manager": "Janice Orpiada",
    "Contact": 9483718917,
    "Lat": 13.62321581,
    "Long": 123.2312311
  },
  {
    "Barangay": "Del Rosario",
    "Evacuation_Name": "Del Rosario High School",
    "Capacity": 250,
    "Manager": "Necita Nacor",
    "Contact": 9932815960,
    "Lat": 13.61835238,
    "Long": 123.2394568
  },
  {
    "Barangay": "Igualdad",
    "Evacuation_Name": "Naga City People's Mall",
    "Capacity": 600,
    "Manager": "Kgd. Julius M. Vargas",
    "Contact": 9618421944,
    "Lat": 13.62064354,
    "Long": 123.1836593
  },
  {
    "Barangay": "Igualdad",
    "Evacuation_Name": "Multi Purpose Hall",
    "Capacity": 60,
    "Manager": "Ana Mae S. Briones",
    "Contact": 9101638528,
    "Lat": 13.62205308,
    "Long": 123.181903
  },
  {
    "Barangay": "Lerma",
    "Evacuation_Name": "Jmr Coliseum",
    "Capacity": "1,000",
    "Manager": "Ronald C. Garcia",
    "Contact": 9387900617,
    "Lat": 13.62017779,
    "Long": 123.1882364
  },
  {
    "Barangay": "Liboton",
    "Evacuation_Name": "Liboton Barangay Hall",
    "Capacity": 30,
    "Manager": "Marvin P. Pinpeño",
    "Contact": 9092010651,
    "Lat": 13.63770401,
    "Long": 123.1902358
  },
  {
    "Barangay": "Liboton",
    "Evacuation_Name": "Camarines Sur National High School Annex",
    "Capacity": 265,
    "Manager": "Rodelia Masapol/Mark Villaflores",
    "Contact": 9517642821,
    "Lat": 13.63390754,
    "Long": 123.1925831
  },
  {
    "Barangay": "Mabolo",
    "Evacuation_Name": "Mabolo Barangay Hall",
    "Capacity": 200,
    "Manager": "Rain Reyes",
    "Contact": 9618114700,
    "Lat": 13.61435684,
    "Long": 123.1824784
  },
  {
    "Barangay": "Mabolo",
    "Evacuation_Name": "Als Building",
    "Capacity": 200,
    "Manager": "Glen Francisco",
    "Contact": 9615974191,
    "Lat": 13.62041299,
    "Long": 123.1779427
  },
  {
    "Barangay": "Pacol",
    "Evacuation_Name": "Leon Mercado High School",
    "Capacity": 250,
    "Manager": "Jesus Ador",
    "Contact": "",
    "Lat": 13.65285913,
    "Long": 123.2509496
  },
  {
    "Barangay": "Pacol",
    "Evacuation_Name": "Pacol Barangay Hall",
    "Capacity": 95,
    "Manager": "Ruben S. Limbo",
    "Contact": "",
    "Lat": 13.65928592,
    "Long": 123.2500506
  },
  {
    "Barangay": "Pacol",
    "Evacuation_Name": "Pacol Elementary School",
    "Capacity": 250,
    "Manager": "Eduardo P. Reniva",
    "Contact": 9184397862,
    "Lat": 13.65139706,
    "Long": 123.2321917
  },
  {
    "Barangay": "Panicuason",
    "Evacuation_Name": "Panicuason Barangay Hall",
    "Capacity": 65,
    "Manager": "Janella V. De Lima",
    "Contact": 9811898215,
    "Lat": 13.66330453,
    "Long": 123.3178463
  },
  {
    "Barangay": "Panicuason",
    "Evacuation_Name": "Panicuason Elementary School",
    "Capacity": 200,
    "Manager": "Gemma Glefonea",
    "Contact": 9504590995,
    "Lat": 13.66373689,
    "Long": 123.3184509
  },
  {
    "Barangay": "Panicuason",
    "Evacuation_Name": "Educare Center 1",
    "Capacity": 15,
    "Manager": "Lilibeth D. Ramos",
    "Contact": 9682911371,
    "Lat": 13.65149084,
    "Long": 123.2327073
  },
  {
    "Barangay": "Panicuason",
    "Evacuation_Name": "Sk Office",
    "Capacity": 60,
    "Manager": "Gemma Glefonea",
    "Contact": 9504590995,
    "Lat": 13.66342348,
    "Long": 123.3177269
  },
  {
    "Barangay": "Penafrancia",
    "Evacuation_Name": "Peñafrancia Parish",
    "Capacity": "1,000",
    "Manager": "Joel T. Tresvalles",
    "Contact": 9998353465,
    "Lat": 13.63437367,
    "Long": 123.1953915
  },
  {
    "Barangay": "Penafrancia",
    "Evacuation_Name": "Camarines Sur National High School Annex",
    "Capacity": "3,000",
    "Manager": "Levi P. Eres Jr.",
    "Contact": 9187951493,
    "Lat": 13.63390754,
    "Long": 123.1925831
  },
  {
    "Barangay": "Sabang",
    "Evacuation_Name": "Naga City People's Mall",
    "Capacity": 500,
    "Manager": "Maria Crestina S. Mendoza",
    "Contact": 9674181751,
    "Lat": 13.62064354,
    "Long": 123.1836593
  },
  {
    "Barangay": "Sabang",
    "Evacuation_Name": "Sabang Educare Compound",
    "Capacity": 200,
    "Manager": "John Niño J. Realda",
    "Contact": 9914914175,
    "Lat": 13.62036952,
    "Long": 123.1780491
  },
  {
    "Barangay": "San Isidro",
    "Evacuation_Name": "San Isidro Barangay Hall",
    "Capacity": 148,
    "Manager": "Angelica B. Moreno",
    "Contact": 9282851092,
    "Lat": 13.63277652,
    "Long": 123.2699278
  },
  {
    "Barangay": "San Isidro",
    "Evacuation_Name": "San Isidro Elementary School",
    "Capacity": 200,
    "Manager": "Annabella C. Felin",
    "Contact": 9120496492,
    "Lat": 13.63240675,
    "Long": 123.2690365
  },
  {
    "Barangay": "San Isidro",
    "Evacuation_Name": "San Isidro National High School",
    "Capacity": 350,
    "Manager": "Melecio Jornales",
    "Contact": 9633578089,
    "Lat": 13.6324088,
    "Long": 123.2681397
  },
  {
    "Barangay": "San Felipe",
    "Evacuation_Name": "San Felipe Barangay Hall",
    "Capacity": 50,
    "Manager": "Teresita R. Orate",
    "Contact": 9557294701,
    "Lat": 13.63753132,
    "Long": 123.2020159
  },
  {
    "Barangay": "San Felipe",
    "Evacuation_Name": "Rosario V. Maramba Elementary School",
    "Capacity": 75,
    "Manager": "",
    "Contact": "",
    "Lat": 13.64093434,
    "Long": 123.2039508
  },
  {
    "Barangay": "Sta. Cruz",
    "Evacuation_Name": "Sta. Cruz Elementary School",
    "Capacity": 100,
    "Manager": "Maria Carla A. Gomez",
    "Contact": 9177124206,
    "Lat": 13.6262655,
    "Long": 123.1819938
  },
  {
    "Barangay": "Sta. Cruz",
    "Evacuation_Name": "Sta. Cruz High School",
    "Capacity": 100,
    "Manager": "Ernesto R. Badong Jr.",
    "Contact": 9150770469,
    "Lat": 13.62903293,
    "Long": 123.180429
  },
  {
    "Barangay": "Tabuco",
    "Evacuation_Name": "Tabuco Barangay Hall",
    "Capacity": 50,
    "Manager": "Elisa B. Carmona",
    "Contact": 9301907714,
    "Lat": 13.61779714,
    "Long": 123.1835408
  },
  {
    "Barangay": "Tabuco",
    "Evacuation_Name": "Tabuco Central School",
    "Capacity": 200,
    "Manager": "Jeffrey R. Basanta",
    "Contact": 9205686752,
    "Lat": 13.61765449,
    "Long": 123.1836574
  },
  {
    "Barangay": "Tinago",
    "Evacuation_Name": "Tinago High School",
    "Capacity": 200,
    "Manager": "Israel V. Aton",
    "Contact": "881-51-47",
    "Lat": 13.62557407,
    "Long": 123.1914797
  },
  {
    "Barangay": "Triangulo",
    "Evacuation_Name": "Jmr Coliseum",
    "Capacity": 500,
    "Manager": "Diana F. Colcuera",
    "Contact": 9631778260,
    "Lat": 13.62017779,
    "Long": 123.1882364
  },
  {
    "Barangay": "Triangulo",
    "Evacuation_Name": "Jose Rizal Elementary School",
    "Capacity": 100,
    "Manager": "Cristy Morillo",
    "Contact": "",
    "Lat": 13.61944673,
    "Long": 123.1958904
  },
  {
    "Barangay": "Triangulo",
    "Evacuation_Name": "Triangulo Elementary School",
    "Capacity": 250,
    "Manager": "Rebecca Riva R. Lumacad",
    "Contact": "",
    "Lat": 13.61652928,
    "Long": 123.1904228
  }
]

export default evacData;