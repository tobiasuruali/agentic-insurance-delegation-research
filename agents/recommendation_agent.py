import json
from typing import Dict, List
from data.insurance_products import recommend_insurance_product

class RecommendationAgent:
    """
    Recommendation Agent: Processes user data and generates insurance recommendations
    """
    
    def __init__(self, system_prompt: str):
        self.system_prompt = system_prompt
    
    def process_customer_data(self, customer_data: Dict) -> Dict:
        """
        Process customer data and generate recommendation
        
        Args:
            customer_data (Dict): Customer information collected by Information Collector Agent
            
        Returns:
            Dict: Recommendation result with HTML link
        """
        # Extract key parameters for recommendation
        deductible_preference = customer_data.get('deductible_preference', 'low')
        belongings_value = float(customer_data.get('belongings_value', 0))
        water_backup_preference = customer_data.get('water_backup_preference', 'no')
        
        # Generate recommendation using updated logic
        recommendation_link = recommend_insurance_product(
            deductible_preference, 
            belongings_value,
            water_backup_preference
        )
        
        return {
            'recommendation_link': recommendation_link,
            'customer_data': customer_data
        }
    
    def get_conversation_messages(self, customer_data: Dict, recommendation_result: Dict) -> List[Dict]:
        """
        Format messages for OpenAI API to generate personalized response
        
        Args:
            customer_data (Dict): Customer information
            recommendation_result (Dict): Recommendation result
            
        Returns:
            List[Dict]: Messages for OpenAI API
        """
        # Create a user message with customer data and recommendation
        user_message = f"""
        Customer Information:
        - Deductible Preference: {customer_data.get('deductible_preference', 'N/A')}
        - Belongings Value: ${customer_data.get('belongings_value', 0)}
        - Water Backup Preference: {customer_data.get('water_backup_preference', 'N/A')}
        - Residence Type: {customer_data.get('residence_type', 'N/A')}
        - Household Size: {customer_data.get('household_size', 'N/A')}
        - Pets: {customer_data.get('pets', 'None')}
        - Zip Code: {customer_data.get('zip_code', 'N/A')}
        - Previous Claims: {customer_data.get('previous_claims', 'N/A')}
        - Age: {customer_data.get('customer_age', 'N/A')}
        
        Recommended Product Link: {recommendation_result['recommendation_link']}

        Please provide a personalized response to the customer based on this information. Do NOT include the link in your response, it will be added automatically.
        """
        
        messages = [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": user_message}
        ]
        
        return messages
    
    def create_function_call_response(self, customer_data: Dict) -> Dict:
        """
        Create a function call response for OpenAI API
        
        Args:
            customer_data (Dict): Customer information
            
        Returns:
            Dict: Function call response structure
        """
        return {
            "role": "assistant",
            "content": None,
            "tool_calls": [{
                "id": "call_recommend_insurance",
                "type": "function",
                "function": {
                    "name": "recommend_insurance_package",
                    "arguments": json.dumps({
                        "deductible_preference": customer_data.get('deductible_preference', 'low'),
                        "coverage_estimation": float(customer_data.get('belongings_value', 0)),
                        "water_backup_preference": customer_data.get('water_backup_preference', 'no')
                    })
                }
            }]
        }