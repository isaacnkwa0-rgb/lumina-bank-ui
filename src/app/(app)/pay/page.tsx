"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { accountsApi, transfersApi, authApi, type Account } from "@/lib/api";
import { useLanguage, type TranslationKey } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowLeft, Search, ChevronRight, CheckCircle2, X,
  Zap, Wifi, Phone, Droplets, Home, ShieldCheck,
  Landmark, Music, Play, ShoppingBag, Car, GraduationCap,
  Receipt, Globe, Check,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

type Plan = {
  name: string;
  amount: number;
  badge?: string;
  detail?: string;
};

type Biller = {
  id: string;
  name: string;
  logo: string;
  domain?: string;
  accountNumber: string;
  bankCode: string;
  description: string;
  plans?: Plan[];
  quickAmounts?: number[];
};

type Category = {
  id: string;
  labelKey: TranslationKey;
  icon: React.ElementType;
  color: string;
  bg: string;
  countries: string[];
  billers: Biller[];
};

// ── Biller logo (real favicon with emoji fallback) ────────────────────────────

function BillerLogo({ biller, size = 32 }: { biller: Biller; size?: number }) {
  const [failed, setFailed] = useState(false);
  if (biller.domain && !failed) {
    return (
      <img
        src={`https://www.google.com/s2/favicons?domain=${biller.domain}&sz=64`}
        alt={biller.name}
        width={size}
        height={size}
        style={{ width: size, height: size, objectFit: "contain", borderRadius: 4 }}
        onError={() => setFailed(true)}
      />
    );
  }
  return <span style={{ fontSize: size * 0.8, lineHeight: 1 }}>{biller.logo}</span>;
}

// ── Biller data ────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  {
    id: "energy",
    labelKey: "pay.energy" as TranslationKey,
    icon: Zap,
    color: "text-amber-600",
    bg: "bg-amber-50",
    countries: ["🇬🇧", "🇺🇸", "🇨🇦", "🇦🇺"],
    billers: [
      {
        id: "bg", name: "British Gas", logo: "🔥", domain: "britishgas.co.uk", accountNumber: "20008001", bankCode: "BGUK",
        description: "UK · Gas & electricity",
        quickAmounts: [60, 80, 100, 120, 150, 200],
      },
      {
        id: "eon", name: "E.ON", logo: "⚡", domain: "eonenergy.com", accountNumber: "20008002", bankCode: "EONK",
        description: "UK · Electricity",
        quickAmounts: [50, 75, 100, 125, 150, 180],
      },
      {
        id: "edf", name: "EDF Energy", logo: "⚛️", domain: "edfenergy.com", accountNumber: "20008003", bankCode: "EDFK",
        description: "UK · Electricity & gas",
        quickAmounts: [60, 80, 100, 130, 160, 200],
      },
      {
        id: "octo", name: "Octopus Energy", logo: "🐙", domain: "octopus.energy", accountNumber: "20008004", bankCode: "OCTK",
        description: "UK · Green energy",
        quickAmounts: [50, 75, 100, 125, 150, 200],
      },
      {
        id: "ovo", name: "OVO Energy", logo: "🌱", domain: "ovoenergy.com", accountNumber: "20008005", bankCode: "OVOK",
        description: "UK · Renewable energy",
        quickAmounts: [55, 80, 100, 130, 160, 200],
      },
      {
        id: "pge", name: "PG&E", logo: "🔌", domain: "pge.com", accountNumber: "30008001", bankCode: "PGEU",
        description: "USA · California utility",
        quickAmounts: [80, 100, 130, 160, 200, 250],
      },
      {
        id: "duke", name: "Duke Energy", logo: "⚡", domain: "duke-energy.com", accountNumber: "30008002", bankCode: "DUKU",
        description: "USA · Southeast & Midwest",
        quickAmounts: [70, 90, 120, 150, 180, 220],
      },
      {
        id: "agl", name: "AGL Energy", logo: "⚡", domain: "agl.com.au", accountNumber: "50008001", bankCode: "AGLA",
        description: "Australia · Electricity & gas",
        quickAmounts: [90, 120, 150, 180, 220, 260],
      },
      {
        id: "orig", name: "Origin Energy", logo: "🌟", domain: "originenergy.com.au", accountNumber: "50008002", bankCode: "ORIA",
        description: "Australia · Energy",
        quickAmounts: [85, 110, 140, 170, 210, 250],
      },
    ],
  },
  {
    id: "water",
    labelKey: "pay.water" as TranslationKey,
    icon: Droplets,
    color: "text-blue-600",
    bg: "bg-blue-50",
    countries: ["🇬🇧", "🇦🇺"],
    billers: [
      {
        id: "thw", name: "Thames Water", logo: "💧", domain: "thameswater.co.uk", accountNumber: "20009001", bankCode: "THWK",
        description: "UK · London & South East",
        quickAmounts: [30, 40, 50, 60, 75, 90],
      },
      {
        id: "angw", name: "Anglian Water", logo: "🌊", domain: "anglianwater.co.uk", accountNumber: "20009002", bankCode: "ANGK",
        description: "UK · East of England",
        quickAmounts: [25, 35, 45, 55, 70, 85],
      },
      {
        id: "sevw", name: "Severn Trent", logo: "💦", domain: "severntrent.com", accountNumber: "20009003", bankCode: "SEVK",
        description: "UK · Midlands & Wales",
        quickAmounts: [25, 35, 45, 55, 70, 85],
      },
      {
        id: "ykw", name: "Yorkshire Water", logo: "🏞️", domain: "yorkshirewater.com", accountNumber: "20009004", bankCode: "YRKK",
        description: "UK · Yorkshire",
        quickAmounts: [28, 38, 48, 58, 72, 88],
      },
      {
        id: "syw", name: "Sydney Water", logo: "🦘", domain: "sydneywater.com.au", accountNumber: "50009001", bankCode: "SYDA",
        description: "Australia · Sydney metro",
        quickAmounts: [60, 80, 100, 130, 160, 200],
      },
    ],
  },
  {
    id: "broadband",
    labelKey: "pay.internet" as TranslationKey,
    icon: Wifi,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    countries: ["🇬🇧", "🇺🇸", "🇨🇦", "🇦🇺"],
    billers: [
      {
        id: "bt", name: "BT", logo: "📡", domain: "bt.com", accountNumber: "20010001", bankCode: "BTTK",
        description: "UK · Broadband & TV",
        plans: [
          { name: "Full Fibre 50",  amount: 23.99, detail: "50 Mb/s average download"  },
          { name: "Full Fibre 100", amount: 27.99, detail: "100 Mb/s average download", badge: "Popular" },
          { name: "Full Fibre 500", amount: 34.99, detail: "500 Mb/s average download" },
          { name: "Full Fibre 900", amount: 44.99, detail: "900 Mb/s average download" },
        ],
      },
      {
        id: "sky", name: "Sky", logo: "🛰️", domain: "sky.com", accountNumber: "20010002", bankCode: "SKYK",
        description: "UK · TV & broadband",
        plans: [
          { name: "Sky Superfast",   amount: 25.00, detail: "59 Mb/s broadband"         },
          { name: "Sky Ultrafast",   amount: 30.00, detail: "145 Mb/s broadband", badge: "Popular" },
          { name: "Sky Ultrafast+",  amount: 36.00, detail: "500 Mb/s broadband"        },
          { name: "Sky TV + Ultra",  amount: 52.00, detail: "TV, sports & 500 Mb/s"     },
        ],
      },
      {
        id: "virgin", name: "Virgin Media", logo: "📺", domain: "virginmedia.com", accountNumber: "20010003", bankCode: "VIRK",
        description: "UK · TV, broadband & phone",
        plans: [
          { name: "M125 Fibre",  amount: 27.00, detail: "132 Mb/s broadband"      },
          { name: "M250 Fibre",  amount: 30.00, detail: "264 Mb/s broadband", badge: "Popular" },
          { name: "M500 Fibre",  amount: 37.00, detail: "516 Mb/s broadband"      },
          { name: "Gig1 Fibre",  amount: 62.00, detail: "1,140 Mb/s broadband"    },
        ],
      },
      {
        id: "talk", name: "TalkTalk", logo: "💬", domain: "talktalk.co.uk", accountNumber: "20010004", bankCode: "TALK",
        description: "UK · Broadband",
        plans: [
          { name: "Fast Broadband",    amount: 22.95, detail: "11 Mb/s average"         },
          { name: "Fibre 65",          amount: 25.95, detail: "67 Mb/s average", badge: "Popular" },
          { name: "Fibre 150",         amount: 27.95, detail: "152 Mb/s average"        },
          { name: "Full Fibre 500",    amount: 32.95, detail: "500 Mb/s average"        },
        ],
      },
      {
        id: "comcast", name: "Comcast Xfinity", logo: "📺", domain: "xfinity.com", accountNumber: "30010001", bankCode: "COMU",
        description: "USA · Cable & internet",
        plans: [
          { name: "Connect",         amount: 30.00, detail: "75 Mb/s internet"          },
          { name: "Fast",            amount: 55.00, detail: "400 Mb/s internet", badge: "Popular" },
          { name: "Gigabit",         amount: 80.00, detail: "1,000 Mb/s internet"       },
          { name: "Gigabit Pro",     amount: 120.00, detail: "6,000 Mb/s internet"      },
        ],
      },
      {
        id: "rogers", name: "Rogers", logo: "📡", domain: "rogers.com", accountNumber: "40010001", bankCode: "ROGC",
        description: "Canada · Internet & TV",
        plans: [
          { name: "Ignite 75u",   amount: 49.99, detail: "75 Mb/s download"        },
          { name: "Ignite 500u",  amount: 69.99, detail: "500 Mb/s download", badge: "Popular" },
          { name: "Ignite 1.5G",  amount: 89.99, detail: "1.5 Gb/s download"       },
        ],
      },
      {
        id: "telstra", name: "Telstra", logo: "📡", domain: "telstra.com.au", accountNumber: "50010001", bankCode: "TELA",
        description: "Australia · Internet & phone",
        plans: [
          { name: "Basic",      amount: 59.00, detail: "25/5 Mb/s NBN"            },
          { name: "Standard",   amount: 75.00, detail: "50/20 Mb/s NBN", badge: "Popular" },
          { name: "Premium",    amount: 95.00, detail: "100/20 Mb/s NBN"          },
          { name: "Ultra Fast", amount: 110.00, detail: "250/25 Mb/s NBN"         },
        ],
      },
    ],
  },
  {
    id: "mobile",
    labelKey: "pay.mobile" as TranslationKey,
    icon: Phone,
    color: "text-green-600",
    bg: "bg-green-50",
    countries: ["🇬🇧", "🇺🇸", "🇨🇦", "🇦🇺"],
    billers: [
      {
        id: "ee", name: "EE", logo: "📱", domain: "ee.co.uk", accountNumber: "20011001", bankCode: "EEUK",
        description: "UK · Mobile & broadband",
        plans: [
          { name: "5GB SIM Only",        amount: 12.00, detail: "5G · Unlimited calls & texts"          },
          { name: "25GB SIM Only",       amount: 18.00, detail: "5G · Unlimited calls & texts"          },
          { name: "100GB SIM Only",      amount: 25.00, detail: "5G · Unlimited calls & texts", badge: "Popular" },
          { name: "Unlimited SIM Only",  amount: 35.00, detail: "5G · Truly unlimited data"            },
        ],
      },
      {
        id: "o2", name: "O2", logo: "🔵", domain: "o2.co.uk", accountNumber: "20011002", bankCode: "O2UK",
        description: "UK · Mobile",
        plans: [
          { name: "5GB",          amount: 8.00,  detail: "5G · Unlimited calls & texts"          },
          { name: "20GB",         amount: 15.00, detail: "5G · Unlimited calls & texts"          },
          { name: "100GB",        amount: 22.00, detail: "5G · Unlimited calls & texts", badge: "Popular" },
          { name: "Unlimited",    amount: 35.00, detail: "5G · Unlimited data"                  },
        ],
      },
      {
        id: "voda", name: "Vodafone", logo: "🔴", domain: "vodafone.co.uk", accountNumber: "20011003", bankCode: "VODK",
        description: "UK · Mobile",
        plans: [
          { name: "5GB Essentials",     amount: 9.00,  detail: "4G/5G SIM Only"                  },
          { name: "25GB Essentials",    amount: 16.00, detail: "4G/5G SIM Only"                  },
          { name: "100GB Essentials",   amount: 23.00, detail: "4G/5G SIM Only", badge: "Popular" },
          { name: "Unlimited Lite",     amount: 27.00, detail: "5G · 1–2 Mb/s data speed"        },
          { name: "Unlimited Pro",      amount: 32.00, detail: "5G · Full speed unlimited"        },
        ],
      },
      {
        id: "three", name: "Three", logo: "3️⃣", domain: "three.co.uk", accountNumber: "20011004", bankCode: "THRK",
        description: "UK · Mobile",
        plans: [
          { name: "5GB",           amount: 8.00,  detail: "5G · Unlimited calls & texts"          },
          { name: "12GB",          amount: 14.00, detail: "5G · Unlimited calls & texts"          },
          { name: "Unlimited",     amount: 20.00, detail: "5G · Unlimited data", badge: "Popular" },
          { name: "Unlimited Max", amount: 30.00, detail: "5G · Priority network"                },
        ],
      },
      {
        id: "giff", name: "giffgaff", logo: "🟡", domain: "giffgaff.com", accountNumber: "20011005", bankCode: "GIFK",
        description: "UK · SIM-only mobile",
        plans: [
          { name: "1GB Goodybag",  amount: 6.00,  detail: "1GB data + unlimited calls & texts"   },
          { name: "5GB Goodybag",  amount: 10.00, detail: "5GB data + unlimited calls & texts"   },
          { name: "15GB Goodybag", amount: 15.00, detail: "15GB data", badge: "Popular"          },
          { name: "25GB Goodybag", amount: 20.00, detail: "25GB data"                           },
          { name: "Unlimited",     amount: 25.00, detail: "Unlimited data + 5G"                 },
        ],
      },
      {
        id: "tmob", name: "T-Mobile", logo: "📲", domain: "t-mobile.com", accountNumber: "30011001", bankCode: "TMBU",
        description: "USA · Mobile",
        plans: [
          { name: "Essentials",    amount: 30.00, detail: "50GB premium data"                   },
          { name: "Go5G",          amount: 47.50, detail: "100GB premium 5G data", badge: "Popular" },
          { name: "Go5G Plus",     amount: 57.50, detail: "Unlimited premium 5G"               },
          { name: "Go5G Next",     amount: 67.50, detail: "Unlimited 5G + yearly upgrade"      },
        ],
      },
      {
        id: "vzw", name: "Verizon", logo: "✅", domain: "verizon.com", accountNumber: "30011002", bankCode: "VZWU",
        description: "USA · Mobile",
        plans: [
          { name: "Welcome Unlimited", amount: 30.00, detail: "5G unlimited"                    },
          { name: "5G Start",          amount: 40.00, detail: "5G unlimited + 30GB premium"     },
          { name: "5G Play More",      amount: 50.00, detail: "5G + Disney+ & Hulu", badge: "Popular" },
          { name: "5G Get More",       amount: 60.00, detail: "5G + all streaming perks"        },
        ],
      },
      {
        id: "bell", name: "Bell", logo: "🔔", domain: "bell.ca", accountNumber: "40011001", bankCode: "BELC",
        description: "Canada · Mobile",
        plans: [
          { name: "15GB",       amount: 49.99, detail: "5G · 15GB data"                       },
          { name: "50GB",       amount: 65.00, detail: "5G · 50GB data", badge: "Popular"     },
          { name: "Unlimited",  amount: 85.00, detail: "5G · Unlimited data"                 },
        ],
      },
      {
        id: "telus", name: "Telus", logo: "🟢", domain: "telus.com", accountNumber: "40011002", bankCode: "TELC",
        description: "Canada · Mobile",
        plans: [
          { name: "15GB",       amount: 49.99, detail: "5G · 15GB data"                       },
          { name: "40GB",       amount: 60.00, detail: "5G · 40GB data", badge: "Popular"     },
          { name: "Unlimited",  amount: 80.00, detail: "5G · Unlimited data"                 },
        ],
      },
    ],
  },
  {
    id: "council",
    labelKey: "pay.council" as TranslationKey,
    icon: Home,
    color: "text-slate-600",
    bg: "bg-slate-50",
    countries: ["🇬🇧"],
    billers: [
      {
        id: "wcc", name: "Westminster City Council", logo: "🏛️", domain: "westminster.gov.uk", accountNumber: "20012001", bankCode: "WCCK",
        description: "UK · Westminster",
        plans: [
          { name: "Band A", amount: 100.00, detail: "Up to £40,000 property value"  },
          { name: "Band B", amount: 116.67, detail: "£40,001–£52,000"              },
          { name: "Band C", amount: 133.33, detail: "£52,001–£68,000"              },
          { name: "Band D", amount: 150.00, detail: "£68,001–£88,000", badge: "Average" },
          { name: "Band E", amount: 183.33, detail: "£88,001–£120,000"             },
          { name: "Band F", amount: 216.67, detail: "£120,001–£160,000"            },
          { name: "Band G", amount: 250.00, detail: "£160,001–£320,000"            },
          { name: "Band H", amount: 300.00, detail: "Over £320,000"               },
        ],
      },
      {
        id: "bcc", name: "Birmingham City Council", logo: "🏙️", domain: "birmingham.gov.uk", accountNumber: "20012002", bankCode: "BCCK",
        description: "UK · Birmingham",
        plans: [
          { name: "Band A", amount: 112.00, detail: "Lowest band"          },
          { name: "Band B", amount: 130.67, detail: "£40,001–£52,000"     },
          { name: "Band C", amount: 149.33, detail: "£52,001–£68,000"     },
          { name: "Band D", amount: 168.00, detail: "Average band", badge: "Average" },
          { name: "Band E", amount: 205.33, detail: "£88,001–£120,000"    },
          { name: "Band F", amount: 242.67, detail: "£120,001–£160,000"   },
          { name: "Band G", amount: 280.00, detail: "£160,001–£320,000"   },
          { name: "Band H", amount: 336.00, detail: "Over £320,000"      },
        ],
      },
      {
        id: "mcc", name: "Manchester City Council", logo: "🐝", domain: "manchester.gov.uk", accountNumber: "20012003", bankCode: "MCCK",
        description: "UK · Manchester",
        plans: [
          { name: "Band A", amount: 108.00, detail: "Lowest band"          },
          { name: "Band B", amount: 126.00, detail: "£40,001–£52,000"     },
          { name: "Band C", amount: 144.00, detail: "£52,001–£68,000"     },
          { name: "Band D", amount: 162.00, detail: "Average band", badge: "Average" },
          { name: "Band E", amount: 198.00, detail: "£88,001–£120,000"    },
          { name: "Band F", amount: 234.00, detail: "£120,001–£160,000"   },
          { name: "Band G", amount: 270.00, detail: "£160,001–£320,000"   },
          { name: "Band H", amount: 324.00, detail: "Over £320,000"      },
        ],
      },
      {
        id: "lcc", name: "Leeds City Council", logo: "🦉", domain: "leeds.gov.uk", accountNumber: "20012004", bankCode: "LCCK",
        description: "UK · Leeds",
        plans: [
          { name: "Band A", amount: 105.00, detail: "Lowest band"   },
          { name: "Band B", amount: 122.50, detail: "Band B"        },
          { name: "Band C", amount: 140.00, detail: "Band C"        },
          { name: "Band D", amount: 157.50, detail: "Band D", badge: "Average" },
          { name: "Band E", amount: 192.50, detail: "Band E"        },
          { name: "Band F", amount: 227.50, detail: "Band F"        },
          { name: "Band G", amount: 262.50, detail: "Band G"        },
          { name: "Band H", amount: 315.00, detail: "Highest band"  },
        ],
      },
    ],
  },
  {
    id: "tax",
    labelKey: "pay.tax" as TranslationKey,
    icon: Landmark,
    color: "text-red-600",
    bg: "bg-red-50",
    countries: ["🇬🇧", "🇺🇸", "🇨🇦", "🇦🇺"],
    billers: [
      {
        id: "tvlic", name: "TV Licence", logo: "📺", domain: "tvlicensing.co.uk", accountNumber: "20013005", bankCode: "TVLK",
        description: "UK · BBC TV Licence",
        plans: [
          { name: "Colour (monthly)",     amount: 14.13, detail: "£169.50/year · Pay monthly", badge: "Popular" },
          { name: "Colour (quarterly)",   amount: 42.38, detail: "£169.50/year · Pay quarterly"               },
          { name: "Colour (annual)",      amount: 169.50, detail: "Full year payment — save vs monthly"        },
          { name: "Black & White",        amount: 53.50, detail: "Annual · Black & white TV only"             },
        ],
      },
      {
        id: "hmrc_sa", name: "HMRC – Self Assessment", logo: "🏛️", domain: "hmrc.gov.uk", accountNumber: "20013001", bankCode: "HMRK",
        description: "UK · Income tax return",
        quickAmounts: [200, 500, 1000, 1500, 2000, 3000],
      },
      {
        id: "hmrc_vat", name: "HMRC – VAT", logo: "🏛️", domain: "hmrc.gov.uk", accountNumber: "20013002", bankCode: "HMRK",
        description: "UK · VAT payments",
        quickAmounts: [500, 1000, 2000, 5000, 10000, 20000],
      },
      {
        id: "hmrc_ct", name: "HMRC – Corporation Tax", logo: "🏛️", domain: "hmrc.gov.uk", accountNumber: "20013003", bankCode: "HMRK",
        description: "UK · Company tax",
        quickAmounts: [500, 1000, 2500, 5000, 10000, 25000],
      },
      {
        id: "hmrc_ni", name: "HMRC – National Insurance", logo: "🏛️", domain: "hmrc.gov.uk", accountNumber: "20013004", bankCode: "HMRK",
        description: "UK · NI contributions",
        plans: [
          { name: "Class 2 (weekly)",  amount: 3.45,  detail: "Self-employed · £3.45/week"           },
          { name: "Class 2 (monthly)", amount: 14.93, detail: "Self-employed · ~£179.40/year", badge: "Popular" },
          { name: "Class 3 (monthly)", amount: 69.02, detail: "Voluntary · £17.45/week gap filling"  },
        ],
      },
      {
        id: "irs", name: "IRS – Federal Tax", logo: "🦅", domain: "irs.gov", accountNumber: "30013001", bankCode: "IRSU",
        description: "USA · Federal income tax",
        quickAmounts: [250, 500, 1000, 2500, 5000, 10000],
      },
      {
        id: "cra", name: "Canada Revenue Agency", logo: "🍁", domain: "canada.ca", accountNumber: "40013001", bankCode: "CRAC",
        description: "Canada · Federal tax",
        quickAmounts: [200, 500, 1000, 2000, 5000, 10000],
      },
      {
        id: "ato", name: "Australian Tax Office", logo: "🦘", domain: "ato.gov.au", accountNumber: "50013001", bankCode: "ATOA",
        description: "Australia · Federal tax",
        quickAmounts: [300, 600, 1200, 2500, 5000, 10000],
      },
    ],
  },
  {
    id: "insurance",
    labelKey: "pay.insurance" as TranslationKey,
    icon: ShieldCheck,
    color: "text-teal-600",
    bg: "bg-teal-50",
    countries: ["🇬🇧", "🇺🇸"],
    billers: [
      {
        id: "aviva", name: "Aviva", logo: "🛡️", domain: "aviva.co.uk", accountNumber: "20014001", bankCode: "AVVK",
        description: "UK · Home, life & car",
        plans: [
          { name: "Home – Basic",     amount: 18.50, detail: "Buildings & contents cover"          },
          { name: "Home – Standard",  amount: 26.99, detail: "Buildings, contents + extras", badge: "Popular" },
          { name: "Home – Premium",   amount: 38.99, detail: "Enhanced cover + accidental damage"  },
          { name: "Life – Basic",     amount: 12.00, detail: "Level term life cover"               },
          { name: "Car – Third Party",amount: 35.00, detail: "Minimum legal cover"                 },
          { name: "Car – Comprehensive", amount: 55.00, detail: "Full car insurance"               },
        ],
      },
      {
        id: "axa", name: "AXA", logo: "🔷", domain: "axa.co.uk", accountNumber: "20014002", bankCode: "AXAK",
        description: "UK · Multi-line insurance",
        plans: [
          { name: "Home Essential",   amount: 16.99, detail: "Contents only"                       },
          { name: "Home Plus",        amount: 29.99, detail: "Buildings & contents", badge: "Popular" },
          { name: "Business – SME",   amount: 45.00, detail: "Public liability + contents"         },
          { name: "Travel Annual",    amount: 15.00, detail: "Annual multi-trip travel cover"      },
        ],
      },
      {
        id: "geico", name: "GEICO", logo: "🦎", domain: "geico.com", accountNumber: "30014001", bankCode: "GEIU",
        description: "USA · Auto insurance",
        plans: [
          { name: "Minimum Coverage", amount: 45.00, detail: "State minimum liability"             },
          { name: "Standard",         amount: 95.00, detail: "Liability + collision", badge: "Popular" },
          { name: "Full Coverage",    amount: 145.00, detail: "Comprehensive protection"          },
        ],
      },
      {
        id: "statefm", name: "State Farm", logo: "🏡", domain: "statefarm.com", accountNumber: "30014002", bankCode: "STFU",
        description: "USA · Home & auto",
        plans: [
          { name: "Renters Basic",     amount: 15.00, detail: "Personal property + liability"      },
          { name: "Home Standard",     amount: 120.00, detail: "Dwelling, property & liability", badge: "Popular" },
          { name: "Home Premium",      amount: 180.00, detail: "Enhanced home coverage"           },
        ],
      },
    ],
  },
  {
    id: "streaming",
    labelKey: "pay.streaming" as TranslationKey,
    icon: Play,
    color: "text-pink-600",
    bg: "bg-pink-50",
    countries: ["🌍"],
    billers: [
      {
        id: "netflix", name: "Netflix", logo: "🎬", domain: "netflix.com", accountNumber: "90015001", bankCode: "NETG",
        description: "Global · Video streaming",
        plans: [
          { name: "Standard with Ads", amount: 4.99,  detail: "1080p · 2 screens · ads supported"   },
          { name: "Standard",          amount: 10.99, detail: "1080p · 2 screens · no ads", badge: "Popular" },
          { name: "Premium",           amount: 17.99, detail: "4K + HDR · 4 screens · no ads"       },
        ],
      },
      {
        id: "disney", name: "Disney+", logo: "✨", domain: "disneyplus.com", accountNumber: "90015002", bankCode: "DISG",
        description: "Global · Disney, Marvel, Star Wars",
        plans: [
          { name: "Standard with Ads", amount: 4.99,  detail: "1080p · ads supported"               },
          { name: "Standard",          amount: 7.99,  detail: "1080p · no ads", badge: "Popular"    },
          { name: "Premium",           amount: 11.99, detail: "4K + HDR · no ads · downloads"       },
        ],
      },
      {
        id: "amazon", name: "Amazon Prime Video", logo: "📦", domain: "amazon.co.uk", accountNumber: "90015003", bankCode: "AMZG",
        description: "Global · Prime video & shopping",
        plans: [
          { name: "Prime Video",  amount: 5.99,  detail: "Video only · ads supported"               },
          { name: "Prime",        amount: 8.99,  detail: "Video + free delivery + music", badge: "Popular" },
          { name: "Prime Annual", amount: 7.92,  detail: "£95/year · best value"                    },
        ],
      },
      {
        id: "appletv", name: "Apple TV+", logo: "🍎", domain: "apple.com", accountNumber: "90015004", bankCode: "APLG",
        description: "Global · Apple originals",
        plans: [
          { name: "Individual", amount: 8.99,  detail: "All Apple Originals · 1 screen"             },
          { name: "Family",     amount: 8.99,  detail: "Shared with up to 5 people", badge: "Best Value" },
        ],
      },
      {
        id: "nowtv", name: "NOW TV", logo: "🎭", domain: "nowtv.com", accountNumber: "90015006", bankCode: "NOWG",
        description: "UK · Sky streaming",
        plans: [
          { name: "Entertainment", amount: 9.99,  detail: "Sky Atlantic, Comedy, Drama"              },
          { name: "Cinema",        amount: 9.99,  detail: "New release movies"                      },
          { name: "Sports",        amount: 14.99, detail: "Premier League, F1 & more", badge: "Popular" },
          { name: "Hayu",          amount: 4.99,  detail: "Reality TV shows"                        },
          { name: "Entertainment + Cinema", amount: 16.98, detail: "TV + movies bundle"             },
        ],
      },
      {
        id: "hulu", name: "Hulu", logo: "🟢", domain: "hulu.com", accountNumber: "90015005", bankCode: "HLUG",
        description: "USA · TV & movies",
        plans: [
          { name: "With Ads",       amount: 7.99,  detail: "Unlimited entertainment with ads"       },
          { name: "No Ads",         amount: 17.99, detail: "Ad-free streaming", badge: "Popular"    },
          { name: "Hulu + Live TV", amount: 82.99, detail: "Live TV + 85+ channels + no ads"       },
        ],
      },
      {
        id: "itvx", name: "ITVX Premium", logo: "📺", domain: "itv.com", accountNumber: "90015007", bankCode: "ITVG",
        description: "UK · ITV Premium",
        plans: [
          { name: "Monthly",  amount: 3.99,  detail: "Ad-free + BritBox content", badge: "Popular" },
          { name: "Annual",   amount: 39.99, detail: "£39.99/year · 2 months free"                },
        ],
      },
    ],
  },
  {
    id: "music",
    labelKey: "pay.music" as TranslationKey,
    icon: Music,
    color: "text-purple-600",
    bg: "bg-purple-50",
    countries: ["🌍"],
    billers: [
      {
        id: "spotify", name: "Spotify", logo: "🎵", domain: "spotify.com", accountNumber: "90016001", bankCode: "SPOG",
        description: "Global · Music streaming",
        plans: [
          { name: "Student",    amount: 6.99,  detail: "50% off · verify with UNiDAYS"             },
          { name: "Individual", amount: 11.99, detail: "1 account · all features", badge: "Popular" },
          { name: "Duo",        amount: 15.99, detail: "2 accounts · couples plan"                 },
          { name: "Family",     amount: 19.99, detail: "Up to 6 accounts"                          },
        ],
      },
      {
        id: "applemus", name: "Apple Music", logo: "🎶", domain: "apple.com", accountNumber: "90016002", bankCode: "APLG",
        description: "Global · Music streaming",
        plans: [
          { name: "Student",    amount: 5.99,  detail: "50% off · verify eligibility"              },
          { name: "Individual", amount: 11.99, detail: "1 account · Dolby Atmos", badge: "Popular" },
          { name: "Family",     amount: 17.99, detail: "Up to 6 family members"                   },
          { name: "Voice",      amount: 4.99,  detail: "Siri-only access"                         },
        ],
      },
      {
        id: "ytmus", name: "YouTube Music", logo: "▶️", domain: "music.youtube.com", accountNumber: "90016003", bankCode: "YTMG",
        description: "Global · Music & video",
        plans: [
          { name: "Student",           amount: 5.99,  detail: "50% off · ad-free music"           },
          { name: "Individual",        amount: 10.99, detail: "Ad-free + background play", badge: "Popular" },
          { name: "Family",            amount: 16.99, detail: "Up to 5 family members"            },
          { name: "YouTube Premium",   amount: 13.99, detail: "Music + ad-free YouTube"           },
        ],
      },
      {
        id: "tidal", name: "Tidal", logo: "🌊", domain: "tidal.com", accountNumber: "90016004", bankCode: "TIDG",
        description: "Global · HiFi music",
        plans: [
          { name: "Student",     amount: 5.49,  detail: "50% off Individual"                      },
          { name: "Individual",  amount: 10.99, detail: "HiFi lossless quality", badge: "Popular" },
          { name: "Family",      amount: 16.99, detail: "Up to 6 accounts"                       },
          { name: "HiFi Plus",   amount: 19.99, detail: "Master Quality + Dolby Atmos"           },
        ],
      },
      {
        id: "deezer", name: "Deezer", logo: "🎼", domain: "deezer.com", accountNumber: "90016005", bankCode: "DEEG",
        description: "Global · Music streaming",
        plans: [
          { name: "Student",    amount: 5.99,  detail: "50% off · ad-free"                        },
          { name: "Individual", amount: 10.99, detail: "Ad-free + offline", badge: "Popular"      },
          { name: "Family",     amount: 17.99, detail: "Up to 6 accounts"                        },
        ],
      },
    ],
  },
  {
    id: "shopping",
    labelKey: "pay.shopping" as TranslationKey,
    icon: ShoppingBag,
    color: "text-orange-600",
    bg: "bg-orange-50",
    countries: ["🌍"],
    billers: [
      {
        id: "klarna", name: "Klarna", logo: "💳", domain: "klarna.com", accountNumber: "90017004", bankCode: "KLNG",
        description: "Global · Buy now pay later",
        quickAmounts: [25, 50, 100, 150, 200, 300],
      },
      {
        id: "clearpay", name: "Clearpay", logo: "✅", domain: "clearpay.co.uk", accountNumber: "90017005", bankCode: "CLPG",
        description: "UK · Buy now pay later",
        quickAmounts: [25, 50, 75, 100, 150, 200],
      },
    ],
  },
  {
    id: "transport",
    labelKey: "pay.transport" as TranslationKey,
    icon: Car,
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    countries: ["🇬🇧", "🇺🇸", "🌍"],
    billers: [
      {
        id: "tfl", name: "Transport for London", logo: "🚇", domain: "tfl.gov.uk", accountNumber: "20018001", bankCode: "TFLK",
        description: "UK · Oyster top-up",
        plans: [
          { name: "Daily cap Z1–2",      amount: 8.10,  detail: "Peak daily cap · Zones 1–2"        },
          { name: "Weekly cap Z1–2",     amount: 40.70, detail: "7-day cap · Zones 1–2", badge: "Popular" },
          { name: "Travelcard Z1–2 mo",  amount: 178.10, detail: "Monthly Travelcard · Zones 1–2"  },
          { name: "Top-up £10",          amount: 10.00, detail: "Oyster card top-up"               },
          { name: "Top-up £20",          amount: 20.00, detail: "Oyster card top-up"               },
          { name: "Top-up £50",          amount: 50.00, detail: "Oyster card top-up"               },
        ],
      },
      {
        id: "dvla", name: "DVLA – Vehicle Tax", logo: "🚗", domain: "dvla.gov.uk", accountNumber: "20018002", bankCode: "DVLK",
        description: "UK · Car tax (VED)",
        plans: [
          { name: "Zero Emission",           amount: 0,    detail: "Electric vehicles · Free"                    },
          { name: "Up to 1000cc",            amount: 20.00, detail: "Monthly · Petrol/diesel"                   },
          { name: "1001–1549cc",             amount: 18.42, detail: "Monthly · £221/year"                       },
          { name: "Over 1549cc",             amount: 27.75, detail: "Monthly · £333/year", badge: "Common"      },
          { name: "Premium rate (1st year)", amount: 51.42, detail: "Monthly · £617 for first year"            },
        ],
      },
      {
        id: "dart", name: "Dart Charge", logo: "🌉", domain: "dartcharge.co.uk", accountNumber: "20018003", bankCode: "DARK",
        description: "UK · Dartford Crossing",
        plans: [
          { name: "Car (peak)",      amount: 2.50,  detail: "06:00–22:00 · per crossing"            },
          { name: "Car (off-peak)",  amount: 2.50,  detail: "22:00–06:00 · same rate"               },
          { name: "HGV",             amount: 6.00,  detail: "Heavy goods vehicle · per crossing"    },
          { name: "Top-up £10",      amount: 10.00, detail: "Pre-pay account top-up"               },
          { name: "Top-up £20",      amount: 20.00, detail: "Pre-pay account top-up", badge: "Popular" },
        ],
      },
      {
        id: "ezpass", name: "E-ZPass", logo: "🛣️", domain: "e-zpass.com", accountNumber: "30018001", bankCode: "EZPU",
        description: "USA · Toll roads",
        quickAmounts: [25, 50, 100, 200],
      },
    ],
  },
  {
    id: "education",
    labelKey: "pay.education" as TranslationKey,
    icon: GraduationCap,
    color: "text-violet-600",
    bg: "bg-violet-50",
    countries: ["🇬🇧", "🌍"],
    billers: [
      {
        id: "slc", name: "Student Loans Company", logo: "🎓", domain: "slc.co.uk", accountNumber: "20019001", bankCode: "SLCK",
        description: "UK · Student loan repayment",
        quickAmounts: [50, 100, 150, 200, 300, 500],
      },
      {
        id: "coursera", name: "Coursera", logo: "📚", domain: "coursera.org", accountNumber: "90019001", bankCode: "CORG",
        description: "Global · Online learning",
        plans: [
          { name: "Coursera Plus Monthly", amount: 49.99, detail: "Access 7,000+ courses", badge: "Popular" },
          { name: "Coursera Plus Annual",  amount: 33.25, detail: "£399/year · 33% saving"               },
        ],
      },
      {
        id: "udemy", name: "Udemy", logo: "📖", domain: "udemy.com", accountNumber: "90019002", bankCode: "UDEG",
        description: "Global · Online courses",
        plans: [
          { name: "Personal Plan Monthly", amount: 16.58, detail: "Access top courses monthly"           },
          { name: "Personal Plan Annual",  amount: 9.17,  detail: "£110/year · best value", badge: "Popular" },
        ],
      },
    ],
  },
];

const COUNTRY_FILTERS = [
  { code: "ALL", label: "All",       flag: "🌍" },
  { code: "🇬🇧",  label: "UK",        flag: "🇬🇧" },
  { code: "🇺🇸",  label: "USA",       flag: "🇺🇸" },
  { code: "🇨🇦",  label: "Canada",    flag: "🇨🇦" },
  { code: "🇦🇺",  label: "Australia", flag: "🇦🇺" },
  { code: "🌍",   label: "Global",    flag: "🌐" },
];

// ── OTP code input ────────────────────────────────────────────────────────────

function OtpCodeInput({ onConfirm, onCancel, isLoading }: {
  onConfirm: (code: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [code, setCode] = useState("");
  return (
    <>
      <input
        type="tel" inputMode="numeric" maxLength={6} autoFocus
        value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        placeholder="000000"
        className="w-full text-center text-2xl font-bold tracking-[0.3em] border border-[#E0E0E0] rounded-xl px-4 py-3 outline-none focus:border-[#DB0011] mb-4"
      />
      <div className="flex gap-2">
        <button type="button" onClick={onCancel}
          className="flex-1 py-3 rounded-xl border border-[#E0E0E0] text-sm font-semibold text-[#767676]">Cancel</button>
        <button type="button" onClick={() => code.length === 6 && onConfirm(code)}
          disabled={code.length !== 6 || isLoading}
          className="flex-1 py-3 rounded-xl bg-[#DB0011] text-white text-sm font-bold disabled:opacity-50">
          {isLoading ? "Verifying…" : "Confirm"}
        </button>
      </div>
    </>
  );
}

// ── Payment modal ──────────────────────────────────────────────────────────────

function PaymentModal({
  biller,
  accounts,
  onClose,
  onSuccess,
}: {
  biller: Biller;
  accounts: Account[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { t } = useLanguage();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(
    biller.plans?.[1] ?? biller.plans?.[0] ?? null
  );
  const [customAmount, setCustomAmount] = useState("");
  const [billerRef, setBillerRef]       = useState("");
  const [note, setNote]                 = useState("");
  const [fromAccountId, setFromAccountId] = useState(
    accounts.find((a) => a.isDefault)?.id ?? accounts[0]?.id ?? ""
  );
  const [submitting, setSubmitting]     = useState(false);
  const [error, setError]               = useState("");
  const [otpStep, setOtpStep]           = useState<{ description: string; maskedEmail: string } | null>(null);
  const [otpLoading, setOtpLoading]     = useState(false);

  const amount = selectedPlan
    ? selectedPlan.amount
    : parseFloat(customAmount) || 0;

  const selectedAccount = accounts.find((a) => a.id === fromAccountId);

  async function handlePay() {
    setError("");
    if (amount <= 0) { setError("Select a plan or enter an amount."); return; }
    if (!billerRef.trim()) { setError("Enter your account or reference number with this biller."); return; }

    const description = note.trim()
      ? `${billerRef.trim()} - ${note.trim()}`
      : billerRef.trim();

    setSubmitting(true);
    try {
      const r = await authApi.requestTransferOtp();
      setOtpStep({ description, maskedEmail: r.data.data.maskedEmail });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      setError(msg || "Failed to send OTP. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function executePay(otp: string) {
    if (!otpStep) return;
    setOtpLoading(true);
    try {
      await transfersApi.domestic({
        fromAccountId,
        toAccountNumber: biller.accountNumber,
        toBankCode: biller.bankCode,
        toAccountName: biller.name,
        amount,
        description: otpStep.description,
        transferOtp: otp,
      });
      setOtpStep(null);
      onSuccess();
    } catch (err: unknown) {
      setOtpStep(null);
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Payment failed. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  }

  return (
    <>
    {otpStep && (
      <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mx-auto mb-4">
            <ShieldCheck size={22} className="text-[#DB0011]" />
          </div>
          <h3 className="text-base font-bold text-[#333] text-center mb-1">Security verification</h3>
          <p className="text-xs text-[#767676] text-center mb-5 leading-relaxed">
            Enter the 6-digit code sent to<br />
            <span className="font-semibold text-[#333]">{otpStep.maskedEmail}</span>
          </p>
          <OtpCodeInput onConfirm={executePay} onCancel={() => setOtpStep(null)} isLoading={otpLoading} />
        </div>
      </div>
    )}
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-auto lg:max-w-none bg-white rounded-t-3xl shadow-xl max-h-[90vh] flex flex-col">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="h-1 w-10 rounded-full bg-[#E0E0E0]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#F5F5F5] flex-shrink-0">
          <div className="flex items-center gap-3">
            <BillerLogo biller={biller} size={28} />
            <div>
              <p className="text-sm font-bold text-[#333]">{biller.name}</p>
              <p className="text-xs text-[#AAAAAA]">{biller.description}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#F5F5F5]">
            <X size={18} className="text-[#767676]" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {/* Plans */}
          {biller.plans && biller.plans.length > 0 && (
            <div>
              <p className="text-xs font-bold text-[#AAAAAA] uppercase tracking-widest mb-2">{t("pay.selectPlan")}</p>
              <div className="space-y-2">
                {biller.plans.map((plan) => {
                  const isSelected = selectedPlan?.name === plan.name;
                  return (
                    <button
                      key={plan.name}
                      onClick={() => { setSelectedPlan(plan); setCustomAmount(""); }}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? "border-[#DB0011] bg-red-50"
                          : "border-[#E8E8E8] hover:border-[#CCCCCC]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected ? "border-[#DB0011] bg-[#DB0011]" : "border-[#CCCCCC]"
                        }`}>
                          {isSelected && <Check size={11} className="text-white" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-bold ${isSelected ? "text-[#DB0011]" : "text-[#333]"}`}>
                              {plan.name}
                            </p>
                            {plan.badge && (
                              <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                {plan.badge}
                              </span>
                            )}
                          </div>
                          {plan.detail && (
                            <p className="text-xs text-[#AAAAAA] mt-0.5">{plan.detail}</p>
                          )}
                        </div>
                      </div>
                      <p className={`text-base font-bold flex-shrink-0 ml-2 ${isSelected ? "text-[#DB0011]" : "text-[#333]"}`}>
                        {plan.amount === 0 ? "Free" : `£${plan.amount.toFixed(2)}`}
                      </p>
                    </button>
                  );
                })}
              </div>
              {/* Custom amount option */}
              <button
                onClick={() => setSelectedPlan(null)}
                className={`w-full mt-2 flex items-center gap-2.5 p-3.5 rounded-xl border-2 transition-all ${
                  !selectedPlan
                    ? "border-[#DB0011] bg-red-50"
                    : "border-[#E8E8E8] hover:border-[#CCCCCC]"
                }`}
              >
                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  !selectedPlan ? "border-[#DB0011] bg-[#DB0011]" : "border-[#CCCCCC]"
                }`}>
                  {!selectedPlan && <Check size={11} className="text-white" />}
                </div>
                <p className={`text-sm font-bold ${!selectedPlan ? "text-[#DB0011]" : "text-[#555]"}`}>
                  {t("pay.enterAmount")}
                </p>
              </button>
            </div>
          )}

          {/* Quick amounts (for variable billers) */}
          {biller.quickAmounts && !biller.plans && (
            <div>
              <p className="text-xs font-bold text-[#AAAAAA] uppercase tracking-widest mb-2">{t("pay.quickSelect")}</p>
              <div className="grid grid-cols-3 gap-2">
                {biller.quickAmounts.map((qa) => {
                  const isSelected = !selectedPlan && parseFloat(customAmount) === qa;
                  return (
                    <button
                      key={qa}
                      onClick={() => { setCustomAmount(String(qa)); setSelectedPlan(null); }}
                      className={`py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                        isSelected
                          ? "border-[#DB0011] bg-red-50 text-[#DB0011]"
                          : "border-[#E8E8E8] text-[#555] hover:border-[#CCCCCC]"
                      }`}
                    >
                      £{qa}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom amount input */}
          {(!biller.plans || !selectedPlan) && (
            <div>
              <label className="block text-xs font-semibold text-[#555] mb-1.5">
                {biller.plans ? t("pay.customAmount") : t("pay.amount")}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#767676] font-semibold">£</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={customAmount}
                  onChange={(e) => { setCustomAmount(e.target.value); setSelectedPlan(null); }}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 border border-[#E3E3E3] rounded-xl text-sm text-[#333] focus:outline-none focus:border-[#DB0011] focus:ring-1 focus:ring-[#DB0011]/20"
                />
              </div>
            </div>
          )}

          {/* Biller reference (customer account number with biller) */}
          <div>
            <label className="block text-xs font-semibold text-[#555] mb-1">
              {t("pay.ref")} – {biller.name}
              <span className="text-[#DB0011] ml-0.5">*</span>
            </label>
            <p className="text-[10px] text-[#AAAAAA] mb-1.5">
              Account number, customer ID or policy number assigned by {biller.name}
            </p>
            <input
              type="text"
              value={billerRef}
              onChange={(e) => setBillerRef(e.target.value)}
              placeholder="e.g. 123456789"
              className="w-full px-4 py-3 border border-[#E3E3E3] rounded-xl text-sm text-[#333] focus:outline-none focus:border-[#DB0011] focus:ring-1 focus:ring-[#DB0011]/20 font-mono tracking-wide"
            />
          </div>

          {/* Optional payment note */}
          <div>
            <label className="block text-xs font-semibold text-[#555] mb-1.5">
              Payment note
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. January bill"
              className="w-full px-4 py-3 border border-[#E3E3E3] rounded-xl text-sm text-[#333] focus:outline-none focus:border-[#DB0011] focus:ring-1 focus:ring-[#DB0011]/20"
            />
          </div>

          {/* From account */}
          <div>
            <label className="block text-xs font-semibold text-[#555] mb-1.5">{t("pay.payFrom")}</label>
            <select
              value={fromAccountId}
              onChange={(e) => setFromAccountId(e.target.value)}
              className="w-full px-4 py-3 border border-[#E3E3E3] rounded-xl text-sm text-[#333] focus:outline-none focus:border-[#DB0011] bg-white"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.type} · {acc.accountNumber} ({formatCurrency(Number(acc.availableBalance), acc.currency)})
                </option>
              ))}
            </select>
          </div>

          {/* Summary */}
          {amount > 0 && selectedAccount && (
            <div className="bg-[#F8F8F8] rounded-xl p-3.5 text-sm">
              {selectedPlan && (
                <div className="flex justify-between mb-1">
                  <span className="text-[#767676]">{t("pay.plan")}</span>
                  <span className="font-semibold text-[#333]">{selectedPlan.name}</span>
                </div>
              )}
              <div className="flex justify-between mb-1">
                <span className="text-[#767676]">{t("pay.payingTo")}</span>
                <span className="font-semibold text-[#333]">{biller.name}</span>
              </div>
              {billerRef && (
                <div className="flex justify-between mb-1">
                  <span className="text-[#767676]">{t("pay.ref")}</span>
                  <span className="font-semibold text-[#333] font-mono">{billerRef}</span>
                </div>
              )}
              <div className="flex justify-between mb-1">
                <span className="text-[#767676]">{t("pay.amount")}</span>
                <span className="font-bold text-[#DB0011]">{formatCurrency(amount, selectedAccount.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#767676]">{t("pay.from")}</span>
                <span className="font-semibold text-[#333]">{selectedAccount.type} ···{selectedAccount.accountNumber.slice(-4)}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-sm text-[#DB0011]">{error}</p>
            </div>
          )}

          <button
            onClick={handlePay}
            disabled={submitting || amount <= 0}
            className="w-full py-4 rounded-xl bg-[#DB0011] text-white font-bold text-sm hover:bg-[#b0000d] transition-colors disabled:opacity-50"
          >
            {submitting ? "Processing…" : `${t("pay.amount")} ${amount > 0 ? formatCurrency(amount) : ""}`}
          </button>
        </div>
      </div>
    </div>
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PayPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [accounts, setAccounts]                 = useState<Account[]>([]);
  const [search, setSearch]                     = useState("");
  const [countryFilter, setCountryFilter]       = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedBiller, setSelectedBiller]     = useState<Biller | null>(null);
  const [success, setSuccess]                   = useState(false);

  useEffect(() => {
    accountsApi.list().then((res) => setAccounts(res.data.data ?? []));
  }, []);

  const filteredCategories = CATEGORIES.filter((cat) => {
    const matchesCountry =
      countryFilter === "ALL" ||
      cat.countries.includes(countryFilter) ||
      (countryFilter === "🌍" && cat.countries.includes("🌍"));
    const matchesSearch =
      !search ||
      t(cat.labelKey).toLowerCase().includes(search.toLowerCase()) ||
      cat.billers.some((b) => b.name.toLowerCase().includes(search.toLowerCase()));
    return matchesCountry && matchesSearch;
  });

  const visibleBillers = selectedCategory
    ? selectedCategory.billers.filter(
        (b) =>
          !search ||
          b.name.toLowerCase().includes(search.toLowerCase()) ||
          b.description.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  if (success && selectedBiller) {
    return (
      <div className="max-w-lg mx-auto lg:max-w-none px-4 py-12 flex flex-col items-center text-center">
        <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <CheckCircle2 size={40} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-[#333] mb-2">{t("pay.success")}</h2>
        <p className="text-[#767676] text-sm mb-8">
          <span className="font-semibold text-[#333]">{selectedBiller.name}</span>. {t("pay.successDesc")}
        </p>
        <div className="flex gap-3 w-full">
          <button
            onClick={() => { setSuccess(false); setSelectedBiller(null); }}
            className="flex-1 py-3.5 rounded-xl border-2 border-[#E3E3E3] text-sm font-bold text-[#555] hover:border-[#CCCCCC]"
          >
            {t("pay.payAnother")}
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="flex-1 py-3.5 rounded-xl bg-[#DB0011] text-white text-sm font-bold hover:bg-[#b0000d]"
          >
            {t("pay.done")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto lg:max-w-none pb-10">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#DB0011] to-[#8B000A] px-4 pt-5 pb-10 text-white">
        {selectedCategory ? (
          <button
            onClick={() => { setSelectedCategory(null); setSearch(""); }}
            className="flex items-center gap-1 text-white/70 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft size={16} />
            {t("pay.back")}
          </button>
        ) : (
          <div className="flex items-center gap-2 mb-4">
            <Receipt size={18} className="text-white/80" />
            <h1 className="text-lg font-bold">{t("pay.title")}</h1>
          </div>
        )}
        {selectedCategory ? (
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl ${selectedCategory.bg} flex items-center justify-center`}>
              <selectedCategory.icon size={20} className={selectedCategory.color} />
            </div>
            <div>
              <h1 className="text-xl font-bold">{t(selectedCategory.labelKey)}</h1>
              <p className="text-white/60 text-xs">{selectedCategory.billers.length} providers · select to pay</p>
            </div>
          </div>
        ) : (
          <p className="text-white/60 text-sm">{t("pay.subtitle")}</p>
        )}
      </div>

      <div className="px-4 -mt-5 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#AAAAAA]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={selectedCategory ? `Search ${t(selectedCategory.labelKey)} providers…` : "Search billers or categories…"}
            className="w-full pl-9 pr-4 py-3 bg-white border border-[#E3E3E3] rounded-xl text-sm text-[#333] focus:outline-none focus:border-[#DB0011] shadow-sm"
          />
        </div>

        {/* Country filter */}
        {!selectedCategory && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {COUNTRY_FILTERS.map((f) => (
              <button
                key={f.code}
                onClick={() => setCountryFilter(f.code)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                  countryFilter === f.code
                    ? "border-[#DB0011] bg-red-50 text-[#DB0011]"
                    : "border-[#E8E8E8] text-[#555] bg-white hover:border-[#CCCCCC]"
                }`}
              >
                <span>{f.flag}</span>
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* Category grid */}
        {!selectedCategory && (
          <div className="grid grid-cols-3 gap-3">
            {filteredCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat); setSearch(""); }}
                  className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm p-4 flex flex-col items-center gap-2.5 hover:border-[#DB0011]/30 hover:shadow-md transition-all"
                >
                  <div className={`h-11 w-11 rounded-xl ${cat.bg} flex items-center justify-center`}>
                    <Icon size={20} className={cat.color} />
                  </div>
                  <p className="text-xs font-bold text-[#333] text-center leading-tight">{t(cat.labelKey)}</p>
                  <div className="flex flex-wrap justify-center gap-0.5">
                    {cat.countries.slice(0, 4).map((c) => (
                      <span key={c} className="text-[10px]">{c}</span>
                    ))}
                  </div>
                </button>
              );
            })}
            {filteredCategories.length === 0 && (
              <div className="col-span-3 py-10 text-center text-[#AAAAAA] text-sm">
                {t("pay.noResults")} &ldquo;{search}&rdquo;
              </div>
            )}
          </div>
        )}

        {/* Biller list */}
        {selectedCategory && (
          <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm overflow-hidden">
            {visibleBillers.length === 0 ? (
              <p className="text-center text-[#AAAAAA] text-sm py-8">{t("pay.noProviders")}</p>
            ) : (
              visibleBillers.map((biller, i) => (
                <button
                  key={biller.id}
                  onClick={() => setSelectedBiller(biller)}
                  className={`w-full flex items-center justify-between px-5 py-4 hover:bg-[#FAFAFA] transition-colors ${
                    i < visibleBillers.length - 1 ? "border-b border-[#F5F5F5]" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 flex items-center justify-center flex-shrink-0">
                      <BillerLogo biller={biller} size={28} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-[#333]">{biller.name}</p>
                      <p className="text-xs text-[#AAAAAA]">{biller.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {biller.plans && (
                      <span className="text-[10px] text-[#AAAAAA]">
                        from £{Math.min(...biller.plans.filter(p => p.amount > 0).map(p => p.amount)).toFixed(2)}
                      </span>
                    )}
                    <ChevronRight size={16} className="text-[#CCCCCC]" />
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {/* Other payment options */}
        {!selectedCategory && !search && (
          <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-[#F5F5F5]">
              <p className="text-xs font-bold text-[#AAAAAA] uppercase tracking-widest">{t("pay.otherOptions")}</p>
            </div>
            {[
              { label: t("pay.bankTransfer"),     desc: t("pay.bankTransferDesc"),      icon: Landmark, href: "/transfer", color: "text-blue-600",   bg: "bg-blue-50"   },
              { label: t("pay.internationalPay"), desc: t("pay.internationalPayDesc"),  icon: Globe,    href: "/transfer", color: "text-purple-600", bg: "bg-purple-50" },
            ].map(({ label, desc, icon: Icon, href, color, bg }) => (
              <button
                key={label}
                onClick={() => router.push(href)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#FAFAFA] border-b border-[#F5F5F5] last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-xl ${bg} flex items-center justify-center`}>
                    <Icon size={16} className={color} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-[#333]">{label}</p>
                    <p className="text-xs text-[#AAAAAA]">{desc}</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-[#CCCCCC]" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Payment modal */}
      {selectedBiller && accounts.length > 0 && !success && (
        <PaymentModal
          biller={selectedBiller}
          accounts={accounts}
          onClose={() => setSelectedBiller(null)}
          onSuccess={() => setSuccess(true)}
        />
      )}
    </div>
  );
}
