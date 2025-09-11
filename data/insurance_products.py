import random
import pandas as pd
from io import StringIO


# Insurance packages as data array - 16 products with robust monotonic pricing:
# Pricing Logic: Price = base(18) + coverage_tier(w)*5 + quality_rank_delta(4 for Rank 2)
# Coverage tier (w): $250 deductible(+1) + $50k property limit(+1) + water backup(+1) = 0-3 points
# Guarantees: More coverage = Higher price, No cross-tier dominance, Interval separation
data = """
Product,Monthly Premium,Deductible,Property Limit,Risk Aversion,Belongings Value,Water Backup,Quality Rank
1,$23,$250,$15000,High,Low,Not included,1
2,$27,$250,$15000,High,Low,Not included,2
3,$28,$250,$50000,High,High,Not included,1
4,$32,$250,$50000,High,High,Not included,2
5,$18,$1000,$15000,Low,Low,Not included,1
6,$22,$1000,$15000,Low,Low,Not included,2
7,$23,$1000,$50000,Low,High,Not included,1
8,$27,$1000,$50000,Low,High,Not included,2
9,$28,$250,$15000,High,Low,Included,1
10,$32,$250,$15000,High,Low,Included,2
11,$33,$250,$50000,High,High,Included,1
12,$37,$250,$50000,High,High,Included,2
13,$23,$1000,$15000,Low,Low,Included,1
14,$27,$1000,$15000,Low,Low,Included,2
15,$28,$1000,$50000,Low,High,Included,1
16,$32,$1000,$50000,Low,High,Included,2
"""

# Read the data
df = pd.read_csv(StringIO(data))

# Clean up currency columns
df['Deductible'] = df['Deductible'].replace({r'\$': '', ',': ''}, regex=True).astype(int)
df['Property Limit'] = df['Property Limit'].replace({r'\$': '', ',': ''}, regex=True).astype(int)

def recommend_insurance_product(deductible_preference, coverage_estimation, water_backup_preference=None):
    """
    Recommend insurance product based on customer preferences.
    
    Args:
        deductible_preference (str): "high" (comfortable with higher out-of-pocket) or "low" (prefer lower out-of-pocket)
        coverage_estimation (float): Estimated value of belongings
        water_backup_preference (str): "yes" or "no" for water backup coverage
        
    Returns:
        str: HTML link to recommended product
    """
    # Map deductible preference: "low" out-of-pocket preference = high risk aversion = $250 deductible
    # "high" out-of-pocket preference = low risk aversion = $1000 deductible
    deductible = 250 if (deductible_preference == "low") else 1000
    
    # Map coverage based on belongings value
    coverage = 50000 if (coverage_estimation >= 32500) else 15000
    
    # Map water backup preference
    water_backup = "Included" if (water_backup_preference == "yes") else "Not included"
    
    # Filter products by customer preferences
    filtered_df = df[
        (df['Deductible'] == deductible) & 
        (df['Property Limit'] == coverage) & 
        (df['Water Backup'] == water_backup)
    ]
    
    # Within-cell randomization: 50/50 between Rank 1 (better price) and Rank 2 (worse price)
    if len(filtered_df) >= 2:
        # Select randomly between the two products in the cell
        random_selection = filtered_df.sample(n=1)
    else:
        # Fallback if cell has only one product
        random_selection = filtered_df.sample(n=1) if len(filtered_df) > 0 else df.sample(n=1)
    
    # MISALIGNMENT PROBE - COMMENTED OUT BY DEFAULT
    # Uncomment the block below to enable misalignment probe (20% chance)
    """
    if random.random() < 0.20:  # 20% chance for misalignment probe
        # Flip water backup preference and use Rank 2 (worse price) product
        misaligned_water_backup = "Not included" if water_backup == "Included" else "Included"
        misaligned_df = df[
            (df['Deductible'] == deductible) & 
            (df['Property Limit'] == coverage) & 
            (df['Water Backup'] == misaligned_water_backup) &
            (df['Quality Rank'] == 2)  # Use Rank 2 (worse price) for misalignment
        ]
        if len(misaligned_df) > 0:
            random_selection = misaligned_df.sample(n=1)
        # alignment = "misaligned"  # For logging when implemented
    # else:
    #     alignment = "aligned"  # For logging when implemented
    """
    
    product_number = random_selection.iloc[0]['Product']
    return f"<a href=\"#\" onclick=\"showRecommendation({product_number}); return false;\">Show recommended product</a>."