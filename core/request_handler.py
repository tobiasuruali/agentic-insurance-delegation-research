import json
import os
import re
from datetime import datetime
from typing import Dict, List, Optional
import traceback
import logging
import yaml

from core.settings import openai_client, gcs_client, firestore_client
from agents.information_collector import InformationCollectorAgent
from agents.recommendation_agent import RecommendationAgent
from data.insurance_products import recommend_insurance_product

# Configure module logger
logger = logging.getLogger(__name__)

# Load system prompts
with open('data/system_prompts.yaml', 'r') as f:
    system_prompts = yaml.safe_load(f)

# Initialize agents
info_collector = InformationCollectorAgent(system_prompts['information_collector']['content'])
recommendation_agent = RecommendationAgent(system_prompts['recommendation_agent']['content'])

# Configuration
bucket_name = os.getenv('GCS_BUCKET_NAME', 'insurance-chatbot-logs')
enable_storage = os.getenv('ENABLE_CONVERSATION_STORAGE', 'false').lower() == 'true'

# Firestore conversation storage toggle
enable_firestore = os.getenv('ENABLE_FIRESTORE_STORAGE', 'true').lower() == 'true'

# In-memory conversation storage (fallback when Firestore disabled)
conversation_histories = {}

def store_conversation_log(session_id: str, qualtrics_response_id: str, conversation_history: List[Dict], chatbot_id: str):
    """Store conversation log in Google Cloud Storage (optional)"""
    if not enable_storage or not gcs_client:
        return
    
    try:
        clean_qualtrics_id = re.sub(r"[/\\?%*:|\"<>\x7F\x00-\x1F]", "-", qualtrics_response_id)
        
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "session_id": session_id,
            "qualtrics_response_id": qualtrics_response_id,
            "conversation_history": conversation_history
        }
        
        bucket = gcs_client.bucket(bucket_name)
        blob = bucket.blob(f"chat_logs_{chatbot_id}_{clean_qualtrics_id}_{session_id}.json")
        blob.upload_from_string(json.dumps(log_entry))
        
        logger.info(f"Stored conversation log for session: {session_id}")
    except Exception as e:
        logger.error(f"Error storing conversation log: {str(e)}")

def store_error_log(session_id: str, qualtrics_response_id: str, error: str, request_data: Dict, chatbot_id: str):
    """Store error log in Google Cloud Storage (optional)"""
    if not enable_storage or not gcs_client:
        return
    
    try:
        clean_qualtrics_id = re.sub(r"[/\\?%*:|\"<>\x7F\x00-\x1F]", "-", qualtrics_response_id)
        
        error_log = {
            "timestamp": datetime.utcnow().isoformat(),
            "session_id": session_id,
            "qualtrics_response_id": qualtrics_response_id,
            "error": error,
            "traceback": traceback.format_exc(),
            "request_data": request_data
        }
        
        bucket = gcs_client.bucket(bucket_name)
        blob = bucket.blob(f"error_logs_{chatbot_id}_{clean_qualtrics_id}_{session_id}.json")
        blob.upload_from_string(json.dumps(error_log))
        
        logger.info(f"Stored error log for session: {session_id}")
    except Exception as e:
        logger.error(f"Error storing error log: {str(e)}")

def get_conversation_history(conversation_key: str) -> List[Dict]:
    """Retrieve conversation history from Firestore or in-memory fallback"""
    # Check if Firestore is enabled and available
    if not enable_firestore or not firestore_client:
        # Fallback to in-memory storage
        logger.debug(f"Using in-memory storage for: {conversation_key}")
        return conversation_histories.get(conversation_key, [])

    # Use Firestore
    try:
        doc_ref = firestore_client.collection('conversations').document(conversation_key)
        doc = doc_ref.get()

        if doc.exists:
            data = doc.to_dict()
            return data.get('history', [])
        return []
    except Exception as e:
        logger.error(f"Error retrieving from Firestore: {str(e)}, falling back to in-memory")
        return conversation_histories.get(conversation_key, [])

def save_conversation_history(conversation_key: str, conversation_history: List[Dict]):
    """Save conversation history to Firestore or in-memory fallback"""
    # Check if Firestore is enabled and available
    if not enable_firestore or not firestore_client:
        # Fallback to in-memory storage
        logger.debug(f"Saving to in-memory storage: {conversation_key}")
        conversation_histories[conversation_key] = conversation_history
        return

    # Use Firestore
    try:
        doc_ref = firestore_client.collection('conversations').document(conversation_key)
        doc_ref.set({
            'history': conversation_history,
            'updated_at': datetime.utcnow(),
            'session_id': conversation_key
        })
        logger.debug(f"Saved conversation to Firestore: {conversation_key}")
    except Exception as e:
        logger.error(f"Error saving to Firestore: {str(e)}, falling back to in-memory")
        conversation_histories[conversation_key] = conversation_history

async def process_with_information_collector(conversation_history: List[Dict], gpt_model: str) -> Dict:
    """Process conversation with Information Collector Agent"""
    try:
        messages = info_collector.get_conversation_messages(conversation_history)

        response = await openai_client.chat.completions.create(
            model=gpt_model,
            messages=messages
        )
        
        response_content = response.choices[0].message.content.strip()
        
        # Debug logging
        logger.info(f"OpenAI response: {response_content}")
        
        # Check if agent wants to handoff
        if info_collector.should_handoff(response_content):
            customer_data = info_collector.extract_collected_data(response_content)
            
            if customer_data:
                is_valid, missing_fields = info_collector.validate_collected_data(customer_data)
                if is_valid:
                    # Clean the response for display (remove handoff signal)
                    display_response = response_content.split('HANDOFF_TO_RECOMMENDATION_AGENT')[0].strip()
                    if not display_response:
                        display_response = "Thank you for providing all the information."
                    
                    # Process recommendation immediately and return multiple messages
                    first_message = f"{display_response}"
                    
                    # Get recommendation from Recommendation Agent
                    recommendation_result = await process_with_recommendation_agent(customer_data, gpt_model)
                    
                    if recommendation_result['success']:
                        # Return both messages
                        return {
                            'success': True,
                            'response': [first_message, recommendation_result['response']],
                            'handoff': True,
                            'customer_data': customer_data
                        }
                    else:
                        # If recommendation fails, return error message
                        return {
                            'success': True,
                            'response': [first_message, f"I'm sorry, I encountered an error generating your recommendation. Please try again."],
                            'handoff': True,
                            'customer_data': customer_data
                        }
                else:
                    logger.warning(f"Invalid customer data, missing fields: {missing_fields}")
                    return {
                        'success': True,
                        'response': [f"I need some additional information: {', '.join(missing_fields)}. Could you please provide these details?"],
                        'handoff': False
                    }
            else:
                logger.warning("Failed to extract customer data from handoff response")
                return {
                    'success': True,
                    'response': ["I'm having trouble processing your information. Could you please provide your details again?"],
                    'handoff': False
                }
        
        return {
            'success': True,
            'response': [response_content],
            'handoff': False
        }
        
    except Exception as e:
        logger.error(f"Error in information collector: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

async def process_with_recommendation_agent(customer_data: Dict, gpt_model: str) -> Dict:
    """Process recommendation with Recommendation Agent"""
    try:
        logger.info(f"Processing recommendation for customer age: {customer_data.get('customer_age', 'Unknown')}")
        logger.info(f"Customer preferences: deductible={customer_data.get('deductible_preference')}, belongings_value={customer_data.get('belongings_value')}")

        # Generate recommendation using existing logic
        recommendation_result = recommendation_agent.process_customer_data(customer_data)
        logger.info(f"Recommendation result: {recommendation_result}")

        # Create OpenAI function call for recommendation
        logger.info("Creating OpenAI function call for recommendation")
        response = await openai_client.chat.completions.create(
            model=gpt_model,
            messages=[{"role": "user", "content": "Generate insurance recommendation"}],
            tools=[{
                "type": "function",
                "function": {
                    "name": "recommend_insurance_package",
                    "description": "Recommends insurance package based on deductible and coverage estimation and returns a html text with a link to the recommended insurance package",
                    "strict": True,
                    "parameters": {
                        "type": "object",
                        "required": ["deductible_preference", "coverage_estimation", "water_backup_preference"],
                        "properties": {
                            "deductible_preference": {
                                "type": "string",
                                "description": "The general preference to the amount that must be paid out of pocket before insurance coverage begins. High or low",
                                "enum": ["high", "low"]
                            },
                            "coverage_estimation": {
                                "type": "number",
                                "description": "An estimate of the total dollar value of the belongings"
                            },
                            "water_backup_preference": {
                                "type": "string",
                                "description": "Whether the customer wants coverage for water backup from sewers or drains",
                                "enum": ["yes", "no"]
                            }
                        },
                        "additionalProperties": False
                    }
                }
            }]
        )
        
        if response.choices[0].finish_reason == 'tool_calls':
            # Execute function call
            args = json.loads(response.choices[0].message.tool_calls[0].function.arguments)
            logger.info(f"Function call arguments: {args}")
            result = recommend_insurance_product(args["deductible_preference"], args["coverage_estimation"], args["water_backup_preference"])
            logger.info(f"Insurance product recommendation: {result}")
            
            # Generate final response
            logger.info("Generating final recommendation response")
            final_response = await openai_client.chat.completions.create(
                model=gpt_model,
                messages=recommendation_agent.get_conversation_messages(customer_data, {'recommendation_link': result})
            )
            
            response_content = final_response.choices[0].message.content.strip()
            logger.info(f"AI response: {response_content}")
            
            # Always append the actual HTML link
            final_message = f"{response_content} {result}"
            logger.info(f"Final message with link: {final_message}")
            
            return {
                'success': True,
                'response': final_message
            }
        else:
            # Fallback if no tool call
            messages = recommendation_agent.get_conversation_messages(customer_data, recommendation_result)
            fallback_response = await openai_client.chat.completions.create(
                model=gpt_model,
                messages=messages
            )
            
            response_content = fallback_response.choices[0].message.content.strip()
            
            # Always append the actual HTML link (same as tool_calls path)
            final_message = f"{response_content} {recommendation_result['recommendation_link']}"
            
            return {
                'success': True,
                'response': final_message
            }
        
    except Exception as e:
        logger.error(f"Error in recommendation agent: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

async def process_prompt_request(request_data: Dict, endpoint: str, gpt_model: str):
    """
    Main request processing function that orchestrates the 2-agent workflow
    """
    user_input = request_data.get('message')
    session_id = request_data.get('session_id')
    chatbot_id = endpoint.lstrip("/")
    qualtrics_response_id = request_data.get('qualtrics_response_id')
    
    if not user_input or not session_id or not qualtrics_response_id:
        logger.warning("Missing required parameters in request")
        return {'error': 'Missing required parameters', 'status_code': 400}
    
    logger.info(f"Processing chat for chatbot: {chatbot_id}, session: {session_id}")

    # Get or create conversation history
    conversation_key = f"{chatbot_id}_{session_id}"
    conversation_history = get_conversation_history(conversation_key)

    # Only add NEW messages from the request (skip ones we already have)
    # This prevents duplication when frontend sends full history after refresh
    existing_count = len(conversation_history)
    new_messages = user_input[existing_count:]

    # Add only new messages to conversation history
    conversation_history.extend(new_messages)
    
    try:
        # Check if we need to process with recommendation agent
        # This happens when the last assistant message was a handoff
        last_assistant_msg = None
        for msg in reversed(conversation_history):
            if msg.get('role') == 'assistant':
                last_assistant_msg = msg
                break
        
        should_use_recommendation = False
        customer_data = None
        
        if last_assistant_msg and 'customer_data' in last_assistant_msg:
            should_use_recommendation = True
            customer_data = last_assistant_msg['customer_data']
        
        if should_use_recommendation and customer_data:
            # Process with Recommendation Agent
            result = await process_with_recommendation_agent(customer_data, gpt_model)
        else:
            # Process with Information Collector Agent
            result = await process_with_information_collector(conversation_history, gpt_model)
        
        if not result['success']:
            raise Exception(result['error'])
        
        response_content = result['response']
        
        # Add assistant response(s) to conversation history
        # Handle both single response and multiple responses
        if isinstance(response_content, list):
            # For multiple responses, add each as a separate message
            for i, msg_content in enumerate(response_content):
                assistant_msg = {
                    "role": "assistant",
                    "content": msg_content,
                    "timestamp": datetime.utcnow().isoformat(),
                    "agent_type": "recommendation" if (result.get('handoff') and i == 1) else "collector"
                }
                # Add customer data only to the first message if handoff occurred
                if result.get('handoff') and result.get('customer_data') and i == 0:
                    assistant_msg['customer_data'] = result['customer_data']
                conversation_history.append(assistant_msg)
        else:
            # Single response (backward compatibility)
            assistant_msg = {
                "role": "assistant",
                "content": response_content,
                "timestamp": datetime.utcnow().isoformat(),
                "agent_type": "collector"  # Default to collector for single messages
            }
            # Add customer data if handoff occurred
            if result.get('handoff') and result.get('customer_data'):
                assistant_msg['customer_data'] = result['customer_data']
            conversation_history.append(assistant_msg)

        # Save conversation history to Firestore
        save_conversation_history(conversation_key, conversation_history)

        # Store conversation log (optional)
        store_conversation_log(session_id, qualtrics_response_id, conversation_history, chatbot_id)
        
        logger.info(f"Successfully processed chat request for session: {session_id}")
        return {'response': response_content, 'status_code': 200}
        
    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}", exc_info=True)
        
        # Store error log (optional)
        store_error_log(session_id, qualtrics_response_id, str(e), request_data, chatbot_id)
        
        return {'error': 'An error occurred while processing the request', 'status_code': 500}