// O'zbekiston viloyatlari va tumanlar ro'yxati

export interface District {
  name: string;
}

export interface Region {
  name: string;
  districts: string[];
}

export const REGIONS: Region[] = [
  {
    name: "Toshkent shahri",
    districts: [
      "Bektemir tumani", "Chilonzor tumani", "Hamza tumani", "Mirobod tumani",
      "Mirzo Ulug'bek tumani", "Oʻrtacha tumani", "Sergeli tumani", "Shayxontohur tumani",
      "Uchtepa tumani", "Yakkasaroy tumani", "Yunusobod tumani", "Yashnobod tumani"
    ]
  },
  {
    name: "Toshkent viloyati",
    districts: [
      "Angren shahri", "Bekabad shahri", "Bo'stonliq tumani", "Bо'ka tumani",
      "Chinoz tumani", "Qibray tumani", "Ohangaron tumani", "Oʻrtachirchiq tumani",
      "Parkent tumani", "Piskent tumani", "Quyi Chirchiq tumani", "Yuqori Chirchiq tumani",
      "Zangiota tumani", "Yangiyoʻl tumani"
    ]
  },
  {
    name: "Samarqand viloyati",
    districts: [
      "Bulung'ur tumani", "Ishtixon tumani", "Jomboy tumani", "Kattaqo'rg'on shahri",
      "Narpay tumani", "Nurobod tumani", "Oqdaryo tumani", "Payariq tumani",
      "Pastdarg'om tumani", "Paxtachi tumani", "Samarqand shahri", "Toyloq tumani",
      "Urgut tumani"
    ]
  },
  {
    name: "Buxoro viloyati",
    districts: [
      "Buxoro shahri", "G'ijduvon tumani", "Jondor tumani", "Kogon shahri",
      "Qorakol tumani", "Qorovulbozor tumani", "Peshku tumani", "Romitan tumani",
      "Shofirkon tumani", "Vobkent tumani"
    ]
  },
  {
    name: "Farg'ona viloyati",
    districts: [
      "Beshariq tumani", "Bog'dod tumani", "Buvayda tumani", "Dang'ara tumani",
      "Farg'ona shahri", "Furqat tumani", "Hamza tumani", "Kosonsoy tumani",
      "Marg'ilon shahri", "Oltiariq tumani", "Qo'qon shahri", "Quva tumani",
      "Rishton tumani", "So'x tumani", "Toshloq tumani", "Uchko'prik tumani",
      "Yozyovon tumani"
    ]
  },
  {
    name: "Andijon viloyati",
    districts: [
      "Altinko'l tumani", "Andijon shahri", "Asaka tumani", "Baliqchi tumani",
      "Bo'z tumani", "Buloqboshi tumani", "Jalaquduq tumani", "Izboskan tumani",
      "Xo'jaobod tumani", "Qo'rg'ontepa tumani", "Marhamat tumani", "Paxtaobod tumani",
      "Shahrixon tumani", "Ulug'nor tumani"
    ]
  },
  {
    name: "Namangan viloyati",
    districts: [
      "Chortoq tumani", "Chust tumani", "Davlatobod tumani", "Kosonsoy tumani",
      "Mingbuloq tumani", "Namangan shahri", "Norin tumani", "Pop tumani",
      "To'raqo'rg'on tumani", "Uychi tumani", "Yangiqo'rg'on tumani"
    ]
  },
  {
    name: "Navoiy viloyati",
    districts: [
      "Karmana tumani", "Konimex tumani", "Navbahor tumani", "Navoiy shahri",
      "Nurota tumani", "Qiziltepa tumani", "Tomdi tumani", "Uchquduq tumani",
      "Xatirchi tumani", "Zarafshon shahri"
    ]
  },
  {
    name: "Qashqadaryo viloyati",
    districts: [
      "Chiroqchi tumani", "Dehqonobod tumani", "G'uzor tumani", "Kasbi tumani",
      "Kitob tumani", "Koson tumani", "Mirishkor tumani", "Muborak tumani",
      "Nishon tumani", "Qarshi shahri", "Shahrisabz shahri", "Shahrisabz tumani",
      "Yakkabog' tumani"
    ]
  },
  {
    name: "Surxondaryo viloyati",
    districts: [
      "Angor tumani", "Bandixon tumani", "Boysun tumani", "Denov tumani",
      "Jarqoʻrg'on tumani", "Muzrabot tumani", "Oltinsoy tumani", "Qiziriq tumani",
      "Qumqo'rg'on tumani", "Sariosiyo tumani", "Sherobod tumani", "Sho'rchi tumani",
      "Termiz shahri", "Uzun tumani"
    ]
  },
  {
    name: "Jizzax viloyati",
    districts: [
      "Arnasoy tumani", "Baxmal tumani", "Do'stlik tumani", "Forish tumani",
      "G'allaorol tumani", "Jizzax shahri", "Mirzacho'l tumani", "Paxtakor tumani",
      "Sharof Rashidov tumani", "Yangiobod tumani", "Zafarobod tumani", "Zomin tumani"
    ]
  },
  {
    name: "Sirdaryo viloyati",
    districts: [
      "Boyovut tumani", "Guliston shahri", "Hovos tumani", "Mirzaobod tumani",
      "Oqoltin tumani", "Sardoba tumani", "Sayxunobod tumani", "Shirin shahri",
      "Xavast tumani"
    ]
  },
  {
    name: "Xorazm viloyati",
    districts: [
      "Bog'ot tumani", "Gurlan tumani", "Hazorasp tumani", "Khiva shahri",
      "Qo'shko'pir tumani", "Shovot tumani", "Tuproqqal'a tumani", "Urganch shahri",
      "Xazorasp tumani", "Yangiariq tumani", "Yangibozor tumani"
    ]
  },
  {
    name: "Qoraqalpog'iston Respublikasi",
    districts: [
      "Amudaryo tumani", "Beruniy tumani", "Bo'zatov tumani", "Chimboy tumani",
      "Ellikkala tumani", "Kegeyli tumani", "Mo'ynoq tumani", "Nukus shahri",
      "Qanliko'l tumani", "Qo'ng'irot tumani", "Shumanay tumani", "Taxtako'pir tumani",
      "To'rtko'l tumani", "Xo'jayli tumani"
    ]
  }
];

/** Shahar+tuman formatlash: "Buxoro viloyati, G'ijduvon tumani" */
export function formatLocation(region: string, district: string): string {
  if (region && district) return `${region}, ${district}`;
  if (region) return region;
  return '';
}

/** Viloyat nomidan district'larini olish */
export function getDistricts(regionName: string): string[] {
  return REGIONS.find(r => r.name === regionName)?.districts || [];
}
