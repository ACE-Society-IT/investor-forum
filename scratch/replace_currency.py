import os
import re

ROOT_DIR = r"c:\Users\kingm\Downloads\Projects\Investor Forum"

files_to_process = [
    r"components\AdminCommandCenter.jsx",
    r"components\StudentDashboard.jsx",
    r"components\ProjectorLeaderboard.jsx",
    r"components\dashboard\DashboardHeader.jsx",
    r"components\dashboard\DashboardSidebar.jsx",
    r"components\dashboard\LeaderboardView.jsx",
    r"components\dashboard\OverviewView.jsx",
    r"components\dashboard\PortfolioView.jsx",
    r"components\dashboard\RulesView.jsx",
    r"components\dashboard\StockDetailModal.jsx",
    r"components\dashboard\TeamManagementView.jsx",
    r"components\dashboard\TradingChart.jsx",
    r"components\dashboard\TradingFloorView.jsx",
    r"components\landingPage\Hero.jsx",
    r"components\landingPage\MarketSection.jsx",
    r"components\landingPage\RulesSection.jsx",
    r"components\landingPage\TimelineSection.jsx"
]

def replace_currency_in_content(content):
    # 1. Replace explicit '$ USD' or '($ USD)' -> '(PKR)'
    content = re.sub(r'\(\$\s*USD\)', '(PKR)', content)
    content = re.sub(r'\$\s*USD', 'PKR', content)
    content = content.replace('?????? USD', '?????? PKR')
    
    # 2. In labels/descriptions: '$100,000' -> 'PKR 100,000'
    content = content.replace('$100,000.00 USD', 'PKR 100,000.00')
    content = content.replace('$100,000', 'PKR 100,000')
    
    # 3. Currency prefixes in JSX expressions:
    # `>${` -> `>PKR ${` or `>PKR `
    # e.g. `>${Number(` -> `>PKR ${Number(`
    # e.g. `>${currentPrice` -> `>PKR ${currentPrice`
    # e.g. `>${stock.price}` -> `>PKR ${stock.price}`
    # e.g. `>${team.cash` -> `>PKR ${team.cash`
    # e.g. `>${top1.netWorth` -> `>PKR ${top1.netWorth`
    # e.g. `>${pointPrice` -> `>PKR ${pointPrice`
    
    # Replace `>${` where it precedes a currency expression
    content = re.sub(r'>\s*\$\s*\{Number\(', '>PKR ${Number(', content)
    content = re.sub(r'>\s*\$\s*\{currentPrice', '>PKR ${currentPrice', content)
    content = re.sub(r'>\s*\$\s*\{stock\.price', '>PKR ${stock.price', content)
    content = re.sub(r'>\s*\$\s*\{team\.', '>PKR ${team.', content)
    content = re.sub(r'>\s*\$\s*\{top(\d)\.netWorth', r'>PKR ${top\1.netWorth', content)
    content = re.sub(r'>\s*\$\s*\{pointPrice', '>PKR ${pointPrice', content)
    content = re.sub(r'>\s*\$\s*\{item\.stock\?\.price', '>PKR ${item.stock?.price', content)
    content = re.sub(r'>\s*\$\s*\{item\.marketValue', '>PKR ${item.marketValue', content)
    content = re.sub(r'>\s*\$\s*\{totalNetWorth', '>PKR ${totalNetWorth', content)
    content = re.sub(r'>\s*\$\s*\{teamCash', '>PKR ${teamCash', content)
    content = re.sub(r'>\s*\$\s*\{totalPortfolioValue', '>PKR ${totalPortfolioValue', content)
    content = re.sub(r'>\s*\$\s*\{selectedTeamDetail\.', '>PKR ${selectedTeamDetail.', content)
    content = re.sub(r'>\s*\$\s*\{activeTeamObj\?', '>PKR ${activeTeamObj?', content)
    content = re.sub(r'>\s*\$\s*\{h\.currentPrice', '>PKR ${h.currentPrice', content)
    content = re.sub(r'>\s*\$\s*\{h\.marketValue', '>PKR ${h.marketValue', content)

    # In template strings like title={`$${Number...}`} -> title={`PKR ${Number...}`}
    content = re.sub(r'`\$\$\{Number\(', '`PKR ${Number(', content)
    content = re.sub(r'tickFormatter=\{\(val\)\s*=>\s*`\$\{val', 'tickFormatter={(val) => `PKR ${val', content)
    content = re.sub(r'tickFormatter=\{\(val\)\s*=>\s*`\$\$\{val', 'tickFormatter={(val) => `PKR ${val', content)

    # `+${Math.abs(team.netPnL)}` or `+${team.pnl}` -> `+PKR ${...}`
    content = re.sub(r'\{isPositive\s*\?\s*"\+"\s*:\s*""\}\$\{Math\.abs', '{isPositive ? "+PKR " : "-PKR "}${Math.abs', content)
    content = re.sub(r'\{selectedTeamDetail\.netPnL\s*>=\s*0\s*\?\s*"\+"\s*:\s*""\}\$\{selectedTeamDetail\.netPnL', '{selectedTeamDetail.netPnL >= 0 ? "+PKR " : "-PKR "}${Math.abs(selectedTeamDetail.netPnL)', content)
    
    # Direct JSX text like `${currentPrice.toFixed(2)}` in spans
    # e.g. <span className="...">>${currentPrice.toFixed(2)}</span>
    content = re.sub(r'>\s*\$\s*\{([a-zA-Z0-9_\.]+\.toFixed\(2\))\s*\}', r'>PKR {\1}', content)

    # In ticker items / landing page:
    # `${stock.price}`
    content = re.sub(r'<span className="[^"]*tnum[^"]*">\$\{stock\.price\}</span>', lambda m: m.group(0).replace('${stock.price}', 'PKR {stock.price}'), content)
    
    return content

for rel_path in files_to_process:
    full_path = os.path.join(ROOT_DIR, rel_path)
    if os.path.exists(full_path):
        with open(full_path, "r", encoding="utf-8") as f:
            original = f.read()
        updated = replace_currency_in_content(original)
        if original != updated:
            with open(full_path, "w", encoding="utf-8") as f:
                f.write(updated)
            print(f"Updated currency in: {rel_path}")
        else:
            print(f"No changes needed in: {rel_path}")
    else:
        print(f"File not found: {rel_path}")

print("Currency replacement complete.")
