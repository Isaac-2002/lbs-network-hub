## Tasks

### 1. Consent Page: Replace Checkmarks with Circle Selectors

Replace the checkmark UI in the consent page with the same circle selector style used in the "your networking goal" section. This will provide consistent visual feedback for selected options.

**Apply to:** Both student and alumni consent pages

### 2. Industry Selection: Hierarchical Structure with Sub-Sectors

**Requirements:**
- Display 4 primary industries: **Finance**, **Consulting**, **Tech**, **Diversified**
- When a primary industry is clicked, reveal its sub-sectors (if applicable)
- Consulting has no sub-sectors and should be directly selectable
- **Database storage:** Save to `target_industries` column in `profiles` table
- **Format:** `Primary: Sub-sector 1, Sub-sector 2`
  - Example: `Finance: Asset Management, Private Equity`
  - Example: `Consulting` (no sub-sectors)

**Industry Hierarchy:**

### **Finance**
- Asset Management
- Commodity Trading
- Family Offices
- Hedge Funds
- Impact Investing
- Investment Banking
- Private Equity
- Private Wealth Management
- Real Estate
- Retail / Commercial Banking
- Sovereign Wealth Funds

### **Consulting**
*(No sub-sectors - directly selectable)*

### **Tech**
- ClimateTech
- FinTech
- HealthTech
- Technology, Media & Telecoms
- Venture Capital

### **Diversified**
- Climate and Sustainability
- Consumer Goods
- Energy
- Healthcare
- Industrials
- Retail & Luxury
- Social Impact