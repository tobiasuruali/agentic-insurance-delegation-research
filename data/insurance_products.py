import random
import pandas as pd
from io import StringIO


# Insurance packages as data array:
data = """
Product,Monthly Premium,Deductible,Coverage,Risk Aversion,Belongings Value,Quality Rank
1,$15,$250,$15000,Low,Low,A1
2,$35,$250,$15000,Low,Low,A2
3,$15,$250,$50000,Low,High,B1
4,$35,$250,$50000,Low,High,B2
5,$15,$1000,$15000,High,Low,C1
6,$35,$1000,$15000,High,Low,C2
7,$15,$1000,$50000,High,High,D1
8,$35,$1000,$50000,High,High,D2
"""

# Read the data
df = pd.read_csv(StringIO(data))

# Clean up currency columns
df['Deductible'] = df['Deductible'].replace({'\$': '', ',': ''}, regex=True).astype(int)
df['Coverage'] = df['Coverage'].replace({'\$': '', ',': ''}, regex=True).astype(int)

def recommend_insurance_product(deductible_preference, coverage_estimation):
    """
    Recommend insurance product based on deductible preference and coverage estimation.
    
    Args:
        deductible_preference (str): "high" or "low"
        coverage_estimation (float): Estimated value of belongings
        
    Returns:
        str: HTML link to recommended product
    """
    deductible = 1000 if (deductible_preference == "high") else 250
    coverage = 50000 if (coverage_estimation >= 32500) else 15000
    filtered_df = df[(df['Deductible'] == deductible) & (df['Coverage'] == coverage)]
    random_selection = filtered_df.sample(n=1)
    product_number = random_selection.iloc[0]['Product']
    return f"<a href=\"#\" onclick=\"showRecommendation({product_number}); return false;\">Show recommended product</a>."