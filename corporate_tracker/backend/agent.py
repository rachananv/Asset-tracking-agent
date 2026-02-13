import os
import google.generativeai as genai
from dotenv import load_dotenv
from tools import TOOLS
import json

load_dotenv()

class AssetAgent:
    def __init__(self):
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            print("WARNING: GOOGLE_API_KEY not found in environment")
        
        genai.configure(api_key=api_key)
        
        # Define the system instruction
        system_instruction = """
        You are the Corporate Assets Tracker Assistant. 
        Your goal is to help users manage corporate assets efficiently.
        You can list assets, find specific ones, assign them to employees, update statuses, and remove them.
        
        Always confirm the action taken and provide a clear, human-readable summary of the result.
        If a user asks for information you don't have, use the search tools.
        """
        
        self.model = genai.GenerativeModel(
            model_name='gemini-flash-latest',
            tools=TOOLS,
            system_instruction=system_instruction
        )
        self.chat_sessions = {}

    def get_chat_session(self, session_id: str):
        if session_id not in self.chat_sessions:
            self.chat_sessions[session_id] = self.model.start_chat(enable_automatic_function_calling=True)
        return self.chat_sessions[session_id]

    def process_message(self, session_id: str, message: str):
        chat = self.get_chat_session(session_id)
        response = chat.send_message(message)
        
        # Extract function call info
        tools_called = []
        response_text = ""
        
        try:
            response_text = response.text
        except ValueError:
            # Handle case where response only contains function calls
            response_text = "Processing your request..."

        for part in response.candidates[0].content.parts:
            if part.function_call:
                tools_called.append({
                    "name": part.function_call.name,
                    "args": dict(part.function_call.args)
                })
        
        return {
            "response": response_text,
            "tools_called": tools_called
        }

agent = AssetAgent()
