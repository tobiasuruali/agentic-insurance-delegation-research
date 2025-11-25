import json
import re
import logging
from typing import Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

class InformationCollectorAgent:
    """
    Information Collector Agent: Handles conversation flow and collects user information
    for insurance recommendations.
    """
    
    def __init__(self, system_prompt: str):
        self.system_prompt = system_prompt
        self.required_fields = [
            'customer_age', 'deductible_preference', 'belongings_value',
            'water_backup_preference', 'residence_type', 'household_size',
            'pets', 'zip_code', 'previous_claims'
        ]
    
    def should_handoff(self, response: str) -> bool:
        """Check if the agent wants to handoff to recommendation agent"""
        return 'HANDOFF_TO_RECOMMENDATION_AGENT' in response.upper()
    
    def extract_collected_data(self, response: str) -> Optional[Dict]:
        """Extract the JSON data from the handoff response"""
        try:
            # Find the JSON object after HANDOFF_TO_RECOMMENDATION_AGENT (case-insensitive)
            handoff_pattern = re.compile(r'HANDOFF_TO_RECOMMENDATION_AGENT', re.IGNORECASE)
            match = handoff_pattern.search(response)
            if not match:
                return None

            handoff_index = match.start()
            
            json_start = response.find('{', handoff_index)
            if json_start == -1:
                return None
            
            # Find the matching closing brace
            brace_count = 0
            json_end = json_start
            for i, char in enumerate(response[json_start:], json_start):
                if char == '{':
                    brace_count += 1
                elif char == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        json_end = i + 1
                        break
            
            json_str = response[json_start:json_end]
            return json.loads(json_str)
        
        except (json.JSONDecodeError, ValueError) as e:
            print(f"Error parsing JSON from response: {e}")
            return None
    
    def validate_collected_data(self, data: Dict) -> Tuple[bool, List[str]]:
        """Validate that all required fields are present and valid"""
        missing_fields = []
        
        for field in self.required_fields:
            if field not in data or data[field] is None or data[field] == "":
                missing_fields.append(field)
        
        # Additional validation
        # if 'customer_age' in data:
        #     try:
        #         age_value = float(data['customer_age'])
        #         if age_value <= 0:
        #             raise ValueError
        #     except (ValueError, TypeError):
        #         missing_fields.append('customer_age (must be a positive number)')

        if 'deductible_preference' in data:
            if data['deductible_preference'] not in ['high', 'low']:
                missing_fields.append('deductible_preference (must be high or low)')
        
        if 'water_backup_preference' in data:
            if data['water_backup_preference'] not in ['yes', 'no']:
                missing_fields.append('water_backup_preference (must be yes or no)')
        
        if 'belongings_value' in data:
            try:
                float(data['belongings_value'])
            except (ValueError, TypeError):
                missing_fields.append('belongings_value (must be a number)')
        
        return len(missing_fields) == 0, missing_fields
    
    def get_conversation_messages(self, conversation_history: List[Dict]) -> List[Dict]:
        """Format conversation history for OpenAI API"""
        messages = [{"role": "system", "content": self.system_prompt}]
        
        for msg in conversation_history:
            if msg['role'] in ['user', 'assistant']:
                messages.append({
                    "role": msg['role'],
                    "content": msg['content']
                })
        
        # Add logging to debug the message format
        logger.info(f"Formatted {len(messages)} messages for OpenAI API")
        for i, msg in enumerate(messages):
            logger.info(f"OpenAI Message {i}: role={msg['role']}, content_length={len(msg['content'])}")
        
        return messages