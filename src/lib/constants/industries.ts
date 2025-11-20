export interface IndustryHierarchy {
  name: string;
  subSectors?: string[];
}

export const INDUSTRIES: IndustryHierarchy[] = [
  {
    name: "Finance",
    subSectors: [
      "Asset Management",
      "Commodity Trading",
      "Family Offices",
      "Hedge Funds",
      "Impact Investing",
      "Investment Banking",
      "Private Equity",
      "Private Wealth Management",
      "Real Estate",
      "Retail / Commercial Banking",
      "Sovereign Wealth Funds",
    ],
  },
  {
    name: "Consulting",
  },
  {
    name: "Tech",
    subSectors: [
      "ClimateTech",
      "FinTech",
      "HealthTech",
      "Technology, Media & Telecoms",
      "Venture Capital",
    ],
  },
  {
    name: "Diversified",
    subSectors: [
      "Climate and Sustainability",
      "Consumer Goods",
      "Energy",
      "Healthcare",
      "Industrials",
      "Retail & Luxury",
      "Social Impact",
    ],
  },
];

/**
 * Format selected industries for database storage
 * @param selectedIndustries Map of primary industry to selected sub-sectors
 * @returns Array of formatted strings like "Finance: Asset Management, Private Equity"
 */
export const formatIndustriesForStorage = (
  selectedIndustries: Record<string, string[]>
): string[] => {
  return Object.entries(selectedIndustries)
    .filter(([_, subSectors]) => subSectors.length > 0)
    .map(([primary, subSectors]) => {
      if (subSectors.length === 0) {
        return primary;
      }
      return `${primary}: ${subSectors.join(", ")}`;
    });
};

/**
 * Parse stored industries back into the hierarchical format
 * @param storedIndustries Array of formatted strings from database
 * @returns Map of primary industry to selected sub-sectors
 */
export const parseStoredIndustries = (
  storedIndustries: string[]
): Record<string, string[]> => {
  const result: Record<string, string[]> = {};

  for (const item of storedIndustries) {
    if (item.includes(":")) {
      const [primary, subSectorsStr] = item.split(":");
      result[primary.trim()] = subSectorsStr
        .split(",")
        .map((s) => s.trim());
    } else {
      result[item.trim()] = [];
    }
  }

  return result;
};
