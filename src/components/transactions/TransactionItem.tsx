import Link from "next/link";
import { type Transaction } from "@/lib/api";
import { formatCurrency, formatRelativeDate } from "@/lib/utils";
import {
  ShoppingBag, Coffee, Utensils, Car, Home, Zap, Heart,
  Plane, Gamepad2, ArrowLeftRight, CreditCard, Banknote,
  Globe, Minus, RotateCcw, TrendingUp, BarChart2,
  ArrowUpRight, ArrowDownLeft, MoreHorizontal,
} from "lucide-react";

interface TransactionItemProps {
  transaction: Transaction;
  showDate?: boolean;
}

const categoryConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  // Consumer categories
  SHOPPING:      { icon: ShoppingBag,    color: "text-purple-600",  bg: "bg-purple-100"  },
  FOOD:          { icon: Utensils,       color: "text-orange-600",  bg: "bg-orange-100"  },
  COFFEE:        { icon: Coffee,         color: "text-amber-700",   bg: "bg-amber-100"   },
  TRANSPORT:     { icon: Car,            color: "text-blue-600",    bg: "bg-blue-100"    },
  HOUSING:       { icon: Home,           color: "text-teal-600",    bg: "bg-teal-100"    },
  UTILITIES:     { icon: Zap,            color: "text-yellow-600",  bg: "bg-yellow-100"  },
  HEALTH:        { icon: Heart,          color: "text-rose-500",    bg: "bg-rose-100"    },
  TRAVEL:        { icon: Plane,          color: "text-sky-600",     bg: "bg-sky-100"     },
  ENTERTAINMENT: { icon: Gamepad2,       color: "text-indigo-600",  bg: "bg-indigo-100"  },
  // Backend categories
  CARD_PAYMENT:  { icon: CreditCard,     color: "text-violet-600",  bg: "bg-violet-100"  },
  TRANSFER:      { icon: ArrowLeftRight, color: "text-blue-600",    bg: "bg-blue-100"    },
  PAYMENT:       { icon: CreditCard,     color: "text-violet-600",  bg: "bg-violet-100"  },
  SALARY:        { icon: Banknote,       color: "text-green-600",   bg: "bg-green-100"   },
  INCOME:        { icon: Banknote,       color: "text-green-600",   bg: "bg-green-100"   },
  DEPOSIT:       { icon: ArrowDownLeft,  color: "text-green-600",   bg: "bg-green-100"   },
  WITHDRAWAL:    { icon: ArrowUpRight,   color: "text-rose-600",    bg: "bg-rose-100"    },
  REFUND:        { icon: RotateCcw,      color: "text-teal-600",    bg: "bg-teal-100"    },
  FX:            { icon: Globe,          color: "text-blue-600",    bg: "bg-blue-100"    },
  FEE:           { icon: Minus,          color: "text-[#767676]",   bg: "bg-[#F0F0F0]"  },
  INTEREST:      { icon: TrendingUp,     color: "text-emerald-600", bg: "bg-emerald-100" },
  INVESTMENT:    { icon: BarChart2,      color: "text-sky-600",     bg: "bg-sky-100"     },
  OTHER:         { icon: MoreHorizontal, color: "text-[#767676]",   bg: "bg-[#F0F0F0]"  },
};

function getCategoryConfig(category: string) {
  return categoryConfig[category?.toUpperCase()] ?? categoryConfig["OTHER"];
}

export function TransactionItem({ transaction, showDate = false }: TransactionItemProps) {
  const { icon: Icon, color, bg } = getCategoryConfig(transaction.category);
  const isDebit = transaction.type === "DEBIT";

  return (
    <Link href={`/transactions/${transaction.id}`} className="flex items-center gap-3 py-3.5 px-4 border-b border-[#F0F0F0] last:border-0 hover:bg-[#FAFAFA] active:bg-[#F5F5F5] transition-colors">
      {/* Category icon with direction badge */}
      <div className="relative flex-shrink-0">
        <div className={`h-10 w-10 rounded-full ${bg} flex items-center justify-center`}>
          <Icon size={18} className={color} />
        </div>
        {/* Direction badge — bottom-right of icon circle */}
        <div className={`absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white flex items-center justify-center ${
          isDebit ? "bg-[#DB0011]" : "bg-green-500"
        }`}>
          {isDebit
            ? <ArrowUpRight size={9} className="text-white" />
            : <ArrowDownLeft size={9} className="text-white" />}
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#333333] truncate">
          {transaction.merchantName || transaction.counterpartyName || transaction.description}
        </p>
        <p className="text-xs text-[#AAAAAA] mt-0.5 truncate">
          {showDate
            ? formatRelativeDate(transaction.createdAt)
            : (transaction.merchantName || transaction.counterpartyName)
              ? transaction.description
              : null}
        </p>
      </div>

      {/* Amount + balance */}
      <div className="flex-shrink-0 text-right">
        <p className={`text-sm font-bold ${isDebit ? "text-[#DB0011]" : "text-green-600"}`}>
          {isDebit ? "−" : "+"}
          {formatCurrency(Number(transaction.amount), transaction.currency)}
        </p>
        <p className="text-[10px] text-[#BBBBBB] mt-0.5">
          Bal. {formatCurrency(Number(transaction.balanceAfter), transaction.currency)}
        </p>
      </div>
    </Link>
  );
}
