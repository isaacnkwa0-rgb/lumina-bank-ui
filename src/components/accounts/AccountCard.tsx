import Link from "next/link";
import { type Account } from "@/lib/api";
import { formatCurrency, maskAccountNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

interface AccountCardProps {
  account: Account;
  compact?: boolean;
}

const accountTypeLabels: Record<string, string> = {
  CURRENT: "Current Account",
  SAVINGS: "Savings Account",
  BUSINESS: "Business Account",
  ISA: "Cash ISA",
  CREDIT: "Credit Account",
};

const accountTypeColors: Record<string, string> = {
  CURRENT: "bg-[#DB0011]",
  SAVINGS: "bg-blue-600",
  BUSINESS: "bg-gray-700",
  ISA: "bg-green-600",
  CREDIT: "bg-purple-600",
};

export function AccountCard({ account, compact = false }: AccountCardProps) {
  const label = accountTypeLabels[account.type] || account.type;
  const gradientColor = accountTypeColors[account.type] || "bg-[#DB0011]";

  if (compact) {
    return (
      <Link href={`/accounts/${account.id}`} className="block">
        <div className={`${gradientColor} rounded-sm p-4 text-white min-w-[200px] mr-3`}>
          <p className="text-xs font-medium opacity-80 mb-3">{label}</p>
          <p className="text-xl font-bold mb-1">
            {formatCurrency(Number(account.balance), account.currency)}
          </p>
          <p className="text-xs opacity-70">{maskAccountNumber(account.accountNumber)}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/accounts/${account.id}`} className="block">
      <div className="bg-white border border-[#E3E3E3] rounded-sm p-4 hover:border-[#DB0011] transition-colors">
        <div className="flex items-start justify-between mb-4">
          <div>
            <Badge
              className={`${gradientColor} text-white border-0 mb-2`}
            >
              {label}
            </Badge>
            <p className="text-xs text-[#767676]">
              {maskAccountNumber(account.accountNumber)}
            </p>
          </div>
          <span className="text-[#DB0011] text-xl font-bold">›</span>
        </div>

        <div>
          <p className="text-2xl font-bold text-[#333333]">
            {formatCurrency(Number(account.balance), account.currency)}
          </p>
          <p className="text-xs text-[#767676] mt-1">
            Available: {formatCurrency(Number(account.availableBalance), account.currency)}
          </p>
        </div>
      </div>
    </Link>
  );
}
